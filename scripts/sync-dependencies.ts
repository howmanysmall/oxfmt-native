#!/usr/bin/env bun

import { join } from "node:path";
import { type } from "arktype";

const isPackageJson = type({
	optionalDependencies: "Record<string, string>",
	version: "string.semver",
})
	.readonly()
	.and(type("Record<string, unknown>").readonly());

const bunFile = Bun.file(join(process.cwd(), "package.json"));
const packageJson = await bunFile.json().then(isPackageJson.assert);

for (const key of Object.keys(packageJson.optionalDependencies)) {
	if (key.startsWith("@pobammer-ts/oxfmt-native-")) packageJson.optionalDependencies[key] = packageJson.version;
}

await bunFile.write(`${JSON.stringify(packageJson, undefined, "\t")}\n`);

console.log("[sync-deps] Applying Biome formatting...");
const { exitCode } = await Bun.$`bun x --bun biome check --write --unsafe package.json`.quiet();

if (exitCode !== 0) {
	console.error("Biome failed to format package.json. Aborting release.");
	process.exit(1);
}

await Bun.$`git add package.json`;
