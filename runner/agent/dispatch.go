package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// dispatch serves POST /run/{language} on a Docker host, starting a fresh,
// locked-down container of the language's image for each run. With
// -runtime runsc the containers run under gVisor, which a public server should
// use: plain containers share the host's kernel.
func dispatch(args []string) {
	flags := flag.NewFlagSet("dispatch", flag.ExitOnError)
	addr := flags.String("addr", ":8787", "listen address")
	imagesFile := flags.String("images", "images.json", `JSON object of language to image, e.g. {"java": "skilled-runner-service/java:..."}`)
	containerRuntime := flags.String("runtime", "", "docker runtime for the run containers, e.g. runsc for gVisor")
	concurrency := flags.Int("concurrency", runtime.NumCPU(), "runs at a time")
	flags.Parse(args)

	images := map[string]string{}
	data, err := os.ReadFile(*imagesFile)
	if err != nil {
		log.Fatalf("can't read %s: %v", *imagesFile, err)
	}
	if err := json.Unmarshal(data, &images); err != nil {
		log.Fatalf("can't parse %s: %v", *imagesFile, err)
	}

	secret := os.Getenv("RUNNER_SERVICE_SECRET")
	if secret == "" {
		log.Fatal("RUNNER_SERVICE_SECRET must be set")
	}

	slots := make(chan struct{}, *concurrency)
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			w.Write([]byte("ok"))
			return
		}
		language := strings.TrimPrefix(r.URL.Path, "/run/")
		if r.Method != http.MethodPost || language == r.URL.Path {
			http.NotFound(w, r)
			return
		}
		if !authorized(r, secret) {
			writeJSON(w, http.StatusUnauthorized, Response{Error: "unauthorized"})
			return
		}
		image, ok := images[language]
		if !ok {
			writeJSON(w, http.StatusNotFound, Response{Error: fmt.Sprintf("no image for %q", language)})
			return
		}
		req, ok := decodeRequest(w, r)
		if !ok {
			return
		}

		select {
		case slots <- struct{}{}:
			defer func() { <-slots }()
		case <-r.Context().Done():
			return
		}

		response, err := runInContainer(r.Context(), image, *containerRuntime, req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, Response{Error: err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, response)
	})

	log.Printf("skilled-runner-agent dispatching on %s for %d languages", *addr, len(images))
	log.Fatal(http.ListenAndServe(*addr, mux))
}

// dockerArgs locks the container down the way the app's local Docker backend
// does (src/services/server/runner/backends/docker.ts): no network, a
// read-only filesystem apart from /tmp, nobody, no capabilities, and limits on
// CPU, memory and processes.
func dockerArgs(name, image, containerRuntime string, memoryKb int) []string {
	if memoryKb <= 0 {
		memoryKb = 512000
	}
	memory := strconv.Itoa(memoryKb) + "k"
	args := []string{
		"run", "--rm", "-i",
		"--pull", "never",
		"--name", name,
		"--network", "none",
		"--cpus", "1",
		"--memory", memory,
		"--memory-swap", memory,
		"--pids-limit", "256",
		"--read-only",
		"--tmpfs", "/tmp:rw,exec,size=512m",
		"--user", "65534:65534",
		"--cap-drop", "ALL",
		"--security-opt", "no-new-privileges",
	}
	if containerRuntime != "" {
		args = append(args, "--runtime", containerRuntime)
	}
	return append(args, "--entrypoint", "/usr/local/bin/skilled-runner-agent", image, "once")
}

func runInContainer(ctx context.Context, image, containerRuntime string, req *Request) (Response, error) {
	id := make([]byte, 8)
	rand.Read(id)
	name := "skilled-run-" + hex.EncodeToString(id)

	body, err := json.Marshal(req)
	if err != nil {
		return Response{}, err
	}

	// The agent inside enforces the request's own timeout; this one covers
	// starting the container
	ctx, cancel := context.WithTimeout(ctx, timeoutOf(req)+30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", dockerArgs(name, image, containerRuntime, req.MemoryKb)...)
	cmd.Stdin = bytes.NewReader(body)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()
	if ctx.Err() != nil {
		exec.Command("docker", "rm", "--force", name).Run()
	}

	var response Response
	if err := json.Unmarshal(stdout.Bytes(), &response); err != nil {
		message := strings.TrimSpace(stderr.String())
		if message == "" && runErr != nil {
			message = runErr.Error()
		}
		return Response{}, fmt.Errorf("the run container failed: %s", truncate(message, 500))
	}
	return response, nil
}

func truncate(text string, n int) string {
	if len(text) <= n {
		return text
	}
	return text[:n] + "…"
}
