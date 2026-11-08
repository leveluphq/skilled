// Command skilled-runner-agent runs Skilled.dev lesson programs. It ships in
// every language image (runner/Dockerfile.service) and has three modes:
//
//	serve     HTTP inside a language container: POST /run runs one program.
//	          Cloudflare Containers uses this, one container per run.
//	once      Reads one request on stdin and writes the response to stdout,
//	          for a host that starts a fresh container per run.
//	dispatch  HTTP on a Docker host: POST /run/{language} starts a fresh
//	          container of that language's image in "once" mode, under
//	          gVisor if asked. A VPS uses this.
//
// The app speaks the same API to all of them (docs/runner-service.md), so
// moving from one host to another changes only RUNNER_SERVICE_URL.
package main

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: skilled-runner-agent serve|once|dispatch [flags]")
		os.Exit(2)
	}

	switch os.Args[1] {
	case "serve":
		serve(os.Args[2:])
	case "once":
		os.Exit(once(os.Stdin, os.Stdout))
	case "dispatch":
		dispatch(os.Args[2:])
	default:
		fmt.Fprintf(os.Stderr, "unknown mode %q\n", os.Args[1])
		os.Exit(2)
	}
}

func once(in io.Reader, out io.Writer) int {
	var req Request
	if err := json.NewDecoder(io.LimitReader(in, maxRequestBytes+1<<20)).Decode(&req); err != nil {
		json.NewEncoder(out).Encode(Response{Error: "bad request: " + err.Error()})
		return 1
	}
	// docker run's --pids-limit caps processes here, so no SK_NPROC
	json.NewEncoder(out).Encode(run(context.Background(), &req, nil))
	return 0
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(value)
}

// authorized checks "Authorization: Bearer <secret>" in constant time. An
// empty secret allows everything (the container behind a Worker).
func authorized(r *http.Request, secret string) bool {
	if secret == "" {
		return true
	}
	given := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	return subtle.ConstantTimeCompare([]byte(given), []byte(secret)) == 1
}

func decodeRequest(w http.ResponseWriter, r *http.Request) (*Request, bool) {
	var req Request
	body := http.MaxBytesReader(w, r.Body, maxRequestBytes+1<<20)
	if err := json.NewDecoder(body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, Response{Error: "bad request: " + err.Error()})
		return nil, false
	}
	return &req, true
}

// serveHandler runs programs over HTTP. By default it serves one run and then
// refuses more: on Cloudflare each container is for one run, and nothing the
// program left behind may see the next one.
func serveHandler(secret string, maxRuns int) http.Handler {
	var mu sync.Mutex
	runs := 0

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			// Health checks, including Cloudflare's startup ping
			w.Write([]byte("ok"))
			return
		}
		if r.Method != http.MethodPost || !strings.HasPrefix(r.URL.Path, "/run") {
			http.NotFound(w, r)
			return
		}
		if !authorized(r, secret) {
			writeJSON(w, http.StatusUnauthorized, Response{Error: "unauthorized"})
			return
		}
		req, ok := decodeRequest(w, r)
		if !ok {
			return
		}

		// One run at a time, and no more than maxRuns
		mu.Lock()
		defer mu.Unlock()
		if maxRuns > 0 && runs >= maxRuns {
			writeJSON(w, http.StatusConflict, Response{Error: "this container has already run its program"})
			return
		}
		runs++
		// One run per container (a VM on Cloudflare), so a process limit for
		// nobody covers only this program
		writeJSON(w, http.StatusOK, run(r.Context(), req, map[string]string{"SK_NPROC": "256"}))
	})
}

func serve(args []string) {
	flags := flag.NewFlagSet("serve", flag.ExitOnError)
	addr := flags.String("addr", ":8080", "listen address")
	maxRuns := flags.Int("max-runs", 1, "runs to serve before refusing more (0: no limit, for local testing)")
	flags.Parse(args)

	log.Printf("skilled-runner-agent serving on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, serveHandler(os.Getenv("RUNNER_AGENT_SECRET"), *maxRuns)))
}
