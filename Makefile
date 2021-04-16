export COMPOSE_DOCKER_CLI_BUILD = 1
export DOCKER_BUILDKIT = 1

.PHONY: test
test:
	docker-compose build --pull
	docker-compose run test

.PHONY: clean
clean:
	docker-compose down