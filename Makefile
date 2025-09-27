# Makefile
.PHONY: all dev test build docker-build docker-run format lint test-multibaas test-coverage

all: format lint test build

dev:
	air

test:
	go test ./... -v

build:
	CGO_ENABLED=0 GOOS=linux go build -o ./bin/deploychain ./main.go

docker-build:
	docker build -t ranckosolutionsinc/deploychain:latest .

docker-run:
	docker run -d -p 18080:18080 --env-file .env ranckosolutionsinc/deploychain:latest

format:
	go fmt ./...

lint:
	golangci-lint run

test-multibaas:
	go run main.go test-multibaas

test-coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html

