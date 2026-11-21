# Build context: repository root
# docker build -f packages/client/Dockerfile .
# See https://pnpm.io/docker
FROM node:lts-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/client/package.json packages/client/
COPY packages/protocol/package.json packages/protocol/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter spyfall-client...
COPY packages/client packages/client
COPY packages/protocol packages/protocol
RUN pnpm --filter spyfall-client run build

FROM nginx:stable-alpine-slim
EXPOSE 80
COPY --from=build /app/packages/client/dist/ /usr/share/nginx/html
