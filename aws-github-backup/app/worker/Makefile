:PHONY build
build:
	docker build -t github-backup-worker .

:PHONY run
run:
	docker run --name worker --rm -it -e GITHUB_OWNER=mseninc -e GITHUB_TOKEN=$$GITHUB_TOKEN github-backup-worker
