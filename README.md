# 🕵️ Spyfall

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE.txt)
[![Latest release](https://img.shields.io/github/v/release/VeryBadFrags/spyfall)](https://github.com/VeryBadFrags/spyfall/releases/latest)
[![Validate Server](https://github.com/VeryBadFrags/spyfall/actions/workflows/validate-server.yml/badge.svg?branch=main)](https://github.com/VeryBadFrags/spyfall/actions/workflows/validate-server.yml?query=branch%3Amain)
[![Validate Client](https://github.com/VeryBadFrags/spyfall/actions/workflows/validate-client.yml/badge.svg?branch=main)](https://github.com/VeryBadFrags/spyfall/actions/workflows/validate-client.yml?query=branch%3Amain)
[![Netlify Status](https://api.netlify.com/api/v1/badges/9533fa3b-785d-4ddb-ab13-366089f5d10b/deploy-status)](https://app.netlify.com/sites/heuristic-bartik-850df8/deploys)

A multiplayer social deduction game inspired by [Spyfall](https://hwint.ru/portfolio-item/spyfall/).

- [▶️ Play the game](https://spyfall.verybadfrags.com)

![Game screenshot](docs/spyfall-example-01.png)

## Stack

🛠️ Built with [Node](https://nodejs.org/en),
[React](https://react.dev),
[Bootstrap](https://getbootstrap.com),
[Typescript](https://www.typescriptlang.org),
and [socket.io](https://socket.io).

## Repository layout

This is a [pnpm workspace](https://pnpm.io/workspaces):

- [🧑‍🎨 `packages/client`](packages/client) - the React web app (deployed on Netlify)
- [🤖 `packages/server`](packages/server) - the socket.io server (published as a Docker image)

## Local setup

### With [mise](https://mise.jdx.dev)

```sh
mise install # only required once
mise dev
```

### With [Node](https://nodejs.org)

```sh
corepack enable
pnpm install
pnpm dev # runs the server & client in parallel
```
