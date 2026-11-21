# Build context: repository root
# docker build -f packages/server/Dockerfile .

# Node 24 (Krypton LTS)
FROM node:24-alpine
ENV NODE_ENV=production
EXPOSE 8081
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/
RUN corepack enable && pnpm install --prod --frozen-lockfile --filter spyfall-server

# node-owned so compose watch (dev) can sync files in as the node user
COPY --chown=node:node packages/server packages/server
USER node
WORKDIR /app/packages/server

# Run node directly so it receives SIGTERM from Docker
CMD ["node", "--experimental-transform-types", "src/main.ts"]
