# syntax=docker/dockerfile:experimental

# ---- Base Node ----
FROM node:14-alpine AS base
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm config set ignore-scripts true
WORKDIR /data
RUN mkdir -p /home/node/.npm
RUN chown -R node:node /data && chown -R node:node /home/node/.npm
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --global --no-audit npm
COPY --chown=node:node package.json package-lock.json ./

FROM base as dependencies-update
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --global --no-audit npm-check-updates
RUN ncu -u
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --force --no-audit

FROM base AS dependencies
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
    npm install --force --no-audit

# ---- Test/Cover ----
FROM dependencies AS test
USER node
COPY --chown=node:node wait /wait
COPY --chown=node:node . ./
CMD ["sh", "-c", "/wait && npm run coverage"]