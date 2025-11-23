#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process, { arch, env, exit, platform } from "node:process";

const require = createRequire(import.meta.url);

const SCOPE = "@pobammer-ts";
const BINARY_NAME = "oxfmt-native";

function getPackageName(): string {
	switch (platform) {
		case "win32":
			return `${SCOPE}/${BINARY_NAME}-win32-${arch}-msvc`;

		case "darwin":
			return `${SCOPE}/${BINARY_NAME}-darwin-${arch}`;

		case "linux":
			return `${SCOPE}/${BINARY_NAME}-linux-${arch}-gnu`;

		case "aix":
		case "android":
		case "freebsd":
		case "haiku":
		case "openbsd":
		case "sunos":
		case "cygwin":
		case "netbsd":
			console.error(`Unsupported platform: ${platform}-${arch}`);
			process.exit(1);
	}
}

function getBinaryPath(packageName: string): string {
	try {
		const manifestPath = require.resolve(`${packageName}/package.json`);
		const packageRoot = dirname(manifestPath);
		const extension = platform === "win32" ? ".exe" : "";
		return join(packageRoot, `${BINARY_NAME}${extension}`);
	} catch {
		console.error(`\u001B[31m[Error]\u001B[0m Could not locate binary package: ${packageName}`);
		console.error("This usually happens if optionalDependencies failed to install.");
		console.error("Check your npm/bun logs for installation errors.");
		exit(1);
	}
}

const packageName = getPackageName();
const binaryPath = getBinaryPath(packageName);

const result = spawnSync(binaryPath, process.argv.slice(2), {
	env,
	stdio: "inherit",
});

process.exit(result.status ?? 1);
