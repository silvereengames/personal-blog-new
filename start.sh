#!/bin/bash
curl -fsSL https://bun.sh/install | bash
git pull
bun install
bun index.js