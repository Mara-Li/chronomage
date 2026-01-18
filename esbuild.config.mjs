// esbuild.config.mjs
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";
import { build } from "esbuild";
import { fixImportsPlugin, writeFilePlugin } from "esbuild-fix-imports-plugin";
import { glob } from "glob";

dotenv.config({ quiet: true });

rmSync("./dist", { force: true, recursive: true });

const isProd = process.env.NODE_ENV === "production";

const entryPoints = await glob("src/**/*.ts", {
	ignore: ["src/**/*.d.ts"],
});

await build({
	bundle: false,
	define: {
		"process.env.NODE_ENV": `"${process.env.NODE_ENV || "development"}"`,
	},
	entryPoints,
	format: "esm",
	minify: false,
	outbase: "src",
	outdir: "dist/src",
	platform: "node",
	plugins: [fixImportsPlugin(), writeFilePlugin()],
	pure: isProd ? ["console.log", "console.debug", "console.info", "console.warn"] : [],
	sourcemap: !isProd,
	sourceRoot: "src",
	target: "esnext",
	tsconfig: "./tsconfig.json",
	write: false,
	minifySyntax: isProd,
	minifyWhitespace: false,
	minifyIdentifiers: false,
});

copyFileSync("package.json", "dist/package.json");

mkdirSync("dist/src/localization/locales", { recursive: true });
const localeFiles = await glob("src/localization/locales/*.json", {
	windowsPathsNoEscape: true,
});
for (const file of localeFiles) {
	const destFile = path.normalize(file.replace("src", "dist/src"));
	//fix path for windows
	copyFileSync(file, destFile);
	console.log(`Copy: ${file} -> ${destFile}`);
}

console.log(
	`✅ Build ${isProd ? "production" : "development"} done ${isProd ? " (without logging)" : ""}`
);
