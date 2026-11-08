# Go 1.27, with the standard library compiled ahead of time.
#
# Go ships the standard library as source, so a cold `go build` compiles the
# runtime, os, fmt and everything else a program imports before the program
# itself: 3-4 s of CPU and up to 320 MB on every run, since each run starts in
# a fresh container. Building std here fills a build cache that every run
# reads, so a run compiles only main.go (about 0.1 s and 50 MB).
#
# Runs are read-only apart from /tmp and the working folder. go build needs
# no writes to the cache when everything it uses is there: it just doesn't
# cache main.go, and skips the cache's upkeep (marking entries used, trimming).
# CGO_ENABLED=0 so builds never need a C compiler; the cache is only used
# with the same settings it was built with.
FROM golang:1.27.2
ENV GOCACHE=/opt/go-build-cache CGO_ENABLED=0
RUN go build std && chmod -R a+rX "$GOCACHE"
