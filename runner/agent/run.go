package main

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"syscall"
	"time"
)

// Request is one program to run: the files to write (the source, its stdin
// and the run script), the script's environment, a deadline, and the files to
// send back. The app builds it (src/services/server/runner/backends), so the
// agent knows nothing about languages: it writes, runs and reads.
type Request struct {
	Files          map[string]string `json:"files"`
	Env            map[string]string `json:"env"`
	TimeoutSeconds int               `json:"timeoutSeconds"`
	Outputs        []string          `json:"outputs"`
	// Memory for the run's container, used only by dispatch mode
	MemoryKb int `json:"memoryKb"`
}

// Response holds each requested output file, base64-encoded, or null when the
// script didn't write it. Error is set when the agent couldn't run the script.
type Response struct {
	Outputs map[string]*string `json:"outputs"`
	Error   string             `json:"error,omitempty"`
}

const (
	maxFiles        = 16
	maxRequestBytes = 8 << 20
	maxTimeout      = 120 * time.Second
	scriptName      = ".run.sh"
	nobody          = 65534
)

var fileName = regexp.MustCompile(`^[A-Za-z0-9_.-]{1,64}$`)

func validate(req *Request) error {
	if len(req.Files) == 0 || len(req.Files) > maxFiles {
		return fmt.Errorf("expected 1 to %d files, got %d", maxFiles, len(req.Files))
	}
	if _, ok := req.Files[scriptName]; !ok {
		return fmt.Errorf("the files must include %s", scriptName)
	}
	total := 0
	for name, content := range req.Files {
		if !fileName.MatchString(name) || name == "." || name == ".." {
			return fmt.Errorf("bad file name %q", name)
		}
		total += len(content)
	}
	if total > maxRequestBytes {
		return fmt.Errorf("the files are too large (%d bytes)", total)
	}
	for _, name := range req.Outputs {
		if !fileName.MatchString(name) || name == "." || name == ".." {
			return fmt.Errorf("bad output name %q", name)
		}
	}
	for key := range req.Env {
		if key == "" || strings.ContainsAny(key, "=\x00") {
			return fmt.Errorf("bad environment variable %q", key)
		}
	}
	if req.TimeoutSeconds <= 0 {
		return errors.New("timeoutSeconds must be positive")
	}
	return nil
}

func timeoutOf(req *Request) time.Duration {
	timeout := time.Duration(req.TimeoutSeconds) * time.Second
	if timeout > maxTimeout {
		return maxTimeout
	}
	return timeout
}

// The script's environment: the image's own (PATH, JAVA_HOME...), less the
// agent's secrets, plus the request's variables
func scriptEnv(dir string, extra map[string]string) []string {
	env := []string{}
	for _, entry := range os.Environ() {
		key := strings.SplitN(entry, "=", 2)[0]
		if strings.HasPrefix(key, "RUNNER_") || key == "HOME" {
			continue
		}
		env = append(env, entry)
	}
	env = append(env, "HOME=/tmp", "SK_DIR="+dir)
	for key, value := range extra {
		env = append(env, key+"="+value)
	}
	return env
}

// run writes the request's files to a fresh folder, runs its script as nobody
// (when the agent is root) in its own process group, and reads back the
// outputs. Everything it made is removed afterwards.
func run(ctx context.Context, req *Request, extraEnv map[string]string) Response {
	if err := validate(req); err != nil {
		return Response{Error: err.Error()}
	}

	dir, err := os.MkdirTemp("", "skilled-run-")
	if err != nil {
		return Response{Error: "can't make a working folder: " + err.Error()}
	}
	defer os.RemoveAll(dir)
	// The script runs as nobody and writes its results here
	if err := os.Chmod(dir, 0o777); err != nil {
		return Response{Error: err.Error()}
	}

	for name, content := range req.Files {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o666); err != nil {
			return Response{Error: "can't write " + name + ": " + err.Error()}
		}
	}

	env := map[string]string{}
	for key, value := range extraEnv {
		env[key] = value
	}
	for key, value := range req.Env {
		env[key] = value
	}

	ctx, cancel := context.WithTimeout(ctx, timeoutOf(req))
	defer cancel()

	cmd := exec.Command("/bin/sh", filepath.Join(dir, scriptName))
	cmd.Dir = dir
	cmd.Env = scriptEnv(dir, env)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	if os.Getuid() == 0 {
		cmd.SysProcAttr.Credential = &syscall.Credential{Uid: nobody, Gid: nobody}
	}

	if err := cmd.Start(); err != nil {
		return Response{Error: "can't start the run script: " + err.Error()}
	}

	done := make(chan error, 1)
	go func() { done <- cmd.Wait() }()

	select {
	case <-done:
	case <-ctx.Done():
		// The script's own timeouts should have ended it; end everything it started
		syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
		<-done
	}
	// Anything the program left running in the background
	syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)

	outputs := map[string]*string{}
	for _, name := range req.Outputs {
		data, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			outputs[name] = nil
			continue
		}
		encoded := base64.StdEncoding.EncodeToString(data)
		outputs[name] = &encoded
	}

	return Response{Outputs: outputs}
}
