# syntax=docker/dockerfile:experimental

# ---- Base Node ----
FROM node:16-alpine AS base
WORKDIR /data
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm config set ignore-scripts true && \
    mkdir -p /home/node/.npm && \
    chown -R node:node /data && \
    chown -R node:node /home/node/.npm && \
    chown -R node:node /usr/local/lib/node_modules && \
    chown -R node:node /usr/local/bin
USER node
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --global --no-audit npm
COPY --chown=node:node .npmrc package.json ./

FROM base AS dependencies-update
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --global --no-audit npm-check-updates && \
    ncu -u

FROM base AS dependencies
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --force --no-audit

FROM base AS publish
ARG NPM_TOKEN
RUN npm config set "@involvestecnologia:registry" "https://npm.pkg.github.com"
# RUN npm login --registry=https://npm.pkg.github.com 
RUN npm config set git-tag-version false && \
    npm config set commit-hooks false
COPY --chown=node:node . ./
RUN npm version patch && \
    npm publish

# ---- Lint ----
FROM dependencies AS lint
COPY --chown=node:node . ./
CMD ["node_modules/eslint/bin/eslint.js", "."]

# ---- Test/Cover ----
FROM dependencies AS test
COPY --chown=node:node wait /wait
RUN chmod +x /wait
COPY --chown=node:node . ./
CMD ["sh", "-c", "/wait && npm run coverage"]