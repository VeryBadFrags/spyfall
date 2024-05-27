# 🕵️ Spyfall

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE.txt)
[![Netlify Status](https://api.netlify.com/api/v1/badges/9533fa3b-785d-4ddb-ab13-366089f5d10b/deploy-status)](https://app.netlify.com/sites/heuristic-bartik-850df8/deploys)

A multiplayer social deduction game inspired by [Spyfall](https://hwint.ru/portfolio-item/spyfall/).

- [▶️ Play the game](https://spy.verybadfrags.com)

![Game screenshot](docs/spyfall-example-01.png)

## Stack

🛠️ Built with [Node](https://nodejs.org/en),
[React](https://react.dev),
[Bootstrap](https://getbootstrap.com),
[Typescript](https://www.typescriptlang.org),
and [socket.io](https://socket.io).

- [🧑‍🎨 Client code](https://github.com/VeryBadFrags/spyfall-client)
- [🤖 Server code](https://github.com/VeryBadFrags/spyfall-server)

## Local setup

### Get submodules

```sh
git submodule init
git submodule update
```

### Run server & client in parallel

```sh
make -j2
```
