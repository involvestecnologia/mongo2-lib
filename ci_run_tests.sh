#!/bin/bash

# Note that we don't enable the 'e' option, which would cause the script to
# immediately exit if 'run_tests' failed
set -uo pipefail

# Run the main command we're most interested in
docker-compose build --pull
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose run test

# Capture the exit status
TESTS_EXIT_STATUS=$?

# Run additional commands
docker-compose down

# Exit with the status of the original command
exit $TESTS_EXIT_STATUS