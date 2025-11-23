#!/usr/bin/env bash

bun build --production --target=node --outfile=./bin.js ./bin.ts
chmod +x ./bin.js
