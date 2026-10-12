# RRQuilts developer commands. Host needs only Docker, make, and git.
# Container targets run in the `build` image as the host user with the repo mounted at /app.

.DEFAULT_GOAL := help
SHELL := /bin/bash

IMAGE      := rrquilts-build
SERVE_IMG  := rrquilts-serve
RRQ_BASE  ?= /RRQuilts/
PORT      ?= 9000
SERVE_PORT ?= 8080
# First host address, for opening the servers from other computers on the network (Linux).
LAN_IP    := $(shell hostname -I 2>/dev/null | cut -d' ' -f1)
# npm cache lives outside the repo so dev-server file watching never sees it.
NPM_CACHE ?= $(HOME)/.cache/rrquilts-npm
POLL      ?=

# Pre-steps run before the git action; append targets to extend.
COMMIT_PRE ?= check
export MSG
PUSH_PRE   ?= ensure-clean build ensure-docs-clean

TTY := $(shell [ -t 0 ] && echo -it)
# Quoted: the checkout path may contain spaces.
RUN = docker run --rm $(TTY) -u $$(id -u):$$(id -g) \
	-e HOME=/tmp -e npm_config_cache=/npm-cache -v "$(NPM_CACHE)":/npm-cache \
	-e RRQ_BASE="$(RRQ_BASE)" -e RRQ_POLL="$(POLL)" \
	-v "$(CURDIR)":/app -w /app $(1) $(IMAGE)

.PHONY: help image install dev build test lint format check serve clean commit push ensure-clean ensure-docs-clean

help: ## List targets
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

image:
	@mkdir -p "$(NPM_CACHE)"
	@docker build -q --target build -t $(IMAGE) . >/dev/null

node_modules/.package-lock.json: package-lock.json src-pwa/package-lock.json | image
	$(RUN) sh -c 'npm ci && npm ci --prefix src-pwa'

install: image ## Install dependencies (npm ci)
	$(RUN) sh -c 'npm ci && npm ci --prefix src-pwa'

dev: node_modules/.package-lock.json ## Dev server on :9000 with live reload (POLL=1 for polling)
	@echo "Dev server: http://localhost:$(PORT)$(RRQ_BASE)$(if $(LAN_IP), · http://$(LAN_IP):$(PORT)$(RRQ_BASE))"
	$(call RUN,-p $(PORT):9000) npx quasar dev -m pwa --hostname 0.0.0.0 --port 9000

build: node_modules/.package-lock.json ## Production build into docs/
	$(RUN) npx quasar build -m pwa

test: node_modules/.package-lock.json ## Run unit tests
	$(RUN) npm run test:unit:ci

lint: node_modules/.package-lock.json ## Lint and format check
	$(RUN) npm run lint
	$(RUN) npm run format:check

format: node_modules/.package-lock.json ## Auto-format files with Prettier
	$(RUN) npm run format

check: lint test build ## lint -> test -> build (stops at first failure)

serve: ## Serve docs/ with nginx on :8080 under RRQ_BASE
	docker build -q --target serve -t $(SERVE_IMG) . >/dev/null
	@echo "Serving http://localhost:$(SERVE_PORT)$(RRQ_BASE)$(if $(LAN_IP), · http://$(LAN_IP):$(SERVE_PORT)$(RRQ_BASE))"
	docker run --rm $(TTY) -p $(SERVE_PORT):80 -e RRQ_BASE="$(RRQ_BASE)" $(SERVE_IMG)

clean: image ## Remove node_modules, caches, and docs/
	$(RUN) rm -rf node_modules .quasar .cache dist docs

commit: $(COMMIT_PRE) ## Run checks, then commit everything incl. docs/ (MSG="...")
	git add -A
	@# Read MSG from the environment so multi-line messages survive make expansion.
	@if [ -n "$$MSG" ]; then git commit -m "$$MSG"; else git commit; fi

push: $(PUSH_PRE) ## Refuse if dirty or docs/ stale, then push current branch
	git push -u origin HEAD

ensure-clean:
	@git diff --quiet && git diff --cached --quiet && [ -z "$$(git ls-files --others --exclude-standard)" ] \
		|| { echo "Working tree is dirty; commit first (make commit)."; exit 1; }

ensure-docs-clean:
	@[ -z "$$(git status --porcelain -- docs)" ] \
		|| { echo "docs/ is stale vs a fresh build; run make commit."; exit 1; }
