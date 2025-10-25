// esbuild.config.mjs
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import * as path from "node:path";
import { build } from "esbuild";
import { glob } from "glob";

rmSync("dist", { recursive: true, force: true });

const isProd = process.env.NODE_ENV === "production";

// Trouve tous les fichiers .ts dans src/ (transpilation pure)
const entryPoints = await glob("src/**/*.ts", {
	ignore: ["src/**/*.d.ts"], // Ignore les fichiers de déclaration
});

await build({
	entryPoints,
	outdir: "dist/src",
	bundle: false, // Pas de bundling, juste de la transpilation
	platform: "node",
	target: "node20",
	format: "cjs",
	sourcemap: !isProd,
	minify: isProd,
	drop: isProd ? ["console"] : [],
	define: {
		"process.env.NODE_ENV": `"${process.env.NODE_ENV || "development"}"`,
	},
	// Préserve la structure des dossiers
	outbase: "src",
	sourceRoot: "src",
});

// Copier package.json dans dist/
copyFileSync("package.json", "dist/package.json");

// Copier les fichiers de locales
mkdirSync("dist/src/localization/locales", { recursive: true });
const localeFiles = await glob("src/localization/locales/*.json", {
	windowsPathsNoEscape: true,
});
for (const file of localeFiles) {
	const destFile = path.normalize(file.replace("src", "dist/src"));
	//fix path for windows
	copyFileSync(file, destFile);
	console.log(`Copie: ${file} -> ${destFile}`);
}

console.log(
	`✅ Build ${isProd ? "production" : "development"} terminé${isProd ? " (sans console)" : ""}`
);
