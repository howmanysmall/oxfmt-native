#!/usr/bin/env bun

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { author, repository, version } from "../package.json";

const [operatingSystem, architecture, libc] = Bun.argv.slice(2);

if (operatingSystem === undefined || operatingSystem === "") {
	console.error("Error: Missing operating system argument.");
	process.exit(1);
}
if (architecture === undefined || architecture === "") {
	console.error("Error: Missing architecture argument.");
	process.exit(1);
}

const platformSuffix =
	libc === undefined ? `${operatingSystem}-${architecture}` : `${operatingSystem}-${architecture}-${libc}`;
const packageName = `@pobammer-ts/oxfmt-native-${platformSuffix}`;
const binaryName = operatingSystem === "win32" ? "oxfmt-native.exe" : "oxfmt-native";

const destinationDirectory = join(process.cwd(), "npm", platformSuffix);
await mkdir(destinationDirectory, { recursive: true });

await Bun.write(
	join(destinationDirectory, "package.json"),
	JSON.stringify(
		{
			author: author,
			cpu: [architecture],
			description: `Native binary for ${packageName}`,
			files: [binaryName],
			libc: libc === undefined ? undefined : [libc],
			license: "MIT", // Verify this matches your root project
			main: binaryName,
			name: packageName,
			os: [operatingSystem],
			repository: repository,
			version: version,
		},
		// oxlint-disable-next-line no-null
		null,
		"\t",
	),
);
console.log(`Generated manifest for ${packageName} at ${destinationDirectory}`);
