package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func decoded(t *testing.T, value *string) string {
	t.Helper()
	if value == nil {
		t.Fatal("output missing")
	}
	data, err := base64.StdEncoding.DecodeString(*value)
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}

func request(script string) *Request {
	return &Request{
		Files:          map[string]string{".run.sh": script, "input.txt": "hello\n"},
		Env:            map[string]string{"SK_GREETING": "hi"},
		TimeoutSeconds: 10,
		Outputs:        []string{".out", ".missing"},
	}
}

func TestRunWritesFilesRunsTheScriptAndReadsOutputs(t *testing.T) {
	res := run(context.Background(), request(`cd "$SK_DIR"; cat input.txt > .out; echo "$SK_GREETING $HOME" >> .out`), nil)

	if res.Error != "" {
		t.Fatal(res.Error)
	}
	if got := decoded(t, res.Outputs[".out"]); got != "hello\nhi /tmp\n" {
		t.Fatalf("got %q", got)
	}
	if res.Outputs[".missing"] != nil {
		t.Fatal("a file the script didn't write should be null")
	}
}

func TestRunKeepsTheAgentsSecretsFromTheProgram(t *testing.T) {
	os.Setenv("RUNNER_AGENT_SECRET", "s3cret")
	defer os.Unsetenv("RUNNER_AGENT_SECRET")

	res := run(context.Background(), request(`cd "$SK_DIR"; env > .out`), nil)

	if strings.Contains(decoded(t, res.Outputs[".out"]), "s3cret") {
		t.Fatal("the secret reached the program")
	}
}

func TestRunEndsAProgramPastTheDeadline(t *testing.T) {
	req := request(`sleep 30 & sleep 30; cd "$SK_DIR"; echo late > .out`)
	req.TimeoutSeconds = 1
	started := time.Now()

	res := run(context.Background(), req, nil)

	if time.Since(started) > 5*time.Second {
		t.Fatal("the deadline didn't end the run")
	}
	if res.Outputs[".out"] != nil {
		t.Fatal("the script shouldn't have finished")
	}
}

func TestRunRejectsBadRequests(t *testing.T) {
	cases := map[string]*Request{
		"no script":      {Files: map[string]string{"a": "b"}, TimeoutSeconds: 1},
		"path in a name": {Files: map[string]string{".run.sh": "", "../x": ""}, TimeoutSeconds: 1},
		"bad output":     {Files: map[string]string{".run.sh": ""}, Outputs: []string{"a/b"}, TimeoutSeconds: 1},
		"no timeout":     {Files: map[string]string{".run.sh": ""}},
		"bad env":        {Files: map[string]string{".run.sh": ""}, Env: map[string]string{"A=B": "c"}, TimeoutSeconds: 1},
	}
	for name, req := range cases {
		if res := run(context.Background(), req, nil); res.Error == "" {
			t.Errorf("%s: expected an error", name)
		}
	}
}

func TestOnceReadsARequestAndWritesTheResponse(t *testing.T) {
	body, _ := json.Marshal(request(`cd "$SK_DIR"; echo once > .out`))
	var out bytes.Buffer

	if code := once(bytes.NewReader(body), &out); code != 0 {
		t.Fatalf("exit %d", code)
	}
	var res Response
	json.Unmarshal(out.Bytes(), &res)
	if decoded(t, res.Outputs[".out"]) != "once\n" {
		t.Fatalf("got %+v", res)
	}
}

func TestAuthorized(t *testing.T) {
	r := httptest.NewRequest(http.MethodPost, "/run", nil)
	if !authorized(r, "") {
		t.Fatal("an empty secret allows everything")
	}
	if authorized(r, "s") {
		t.Fatal("a missing token must be refused")
	}
	r.Header.Set("Authorization", "Bearer s")
	if !authorized(r, "s") {
		t.Fatal("the right token must be allowed")
	}
}

func TestDockerArgsLockTheContainerDown(t *testing.T) {
	args := strings.Join(dockerArgs("name", "image:tag", "runsc", 256000), " ")
	for _, want := range []string{"--network none", "--read-only", "--user 65534:65534", "--cap-drop ALL", "--memory 256000k", "--pids-limit 256", "--runtime runsc", "--pull never"} {
		if !strings.Contains(args, want) {
			t.Errorf("missing %q in %s", want, args)
		}
	}
	if !strings.HasSuffix(args, "image:tag once") {
		t.Errorf("should run the image's agent once: %s", args)
	}
	if strings.Contains(strings.Join(dockerArgs("n", "i", "", 0), " "), "--runtime") {
		t.Error("no runtime flag unless asked")
	}
}

func TestServeRunsOnceThenRefuses(t *testing.T) {
	handler := serveHandler("s", 1)
	body, _ := json.Marshal(request(`cd "$SK_DIR"; echo served > .out`))
	post := func(token string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodPost, "/run/java", bytes.NewReader(body))
		r.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)
		return w
	}

	if w := post("wrong"); w.Code != http.StatusUnauthorized {
		t.Fatalf("got %d without the secret", w.Code)
	}
	first := post("s")
	if first.Code != http.StatusOK || !strings.Contains(first.Body.String(), base64.StdEncoding.EncodeToString([]byte("served\n"))) {
		t.Fatalf("first run: %d %s", first.Code, first.Body.String())
	}
	if w := post("s"); w.Code != http.StatusConflict {
		t.Fatalf("a second run got %d", w.Code)
	}

	health := httptest.NewRecorder()
	handler.ServeHTTP(health, httptest.NewRequest(http.MethodGet, "/ping", nil))
	if health.Code != http.StatusOK {
		t.Fatal("health checks must pass")
	}
}
