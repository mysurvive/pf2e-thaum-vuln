import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import * as Vite from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
const packageJSON = require("./package.json");

const EN_JSON = JSON.parse(
  fs.readFileSync("./static/languages/en.json", { encoding: "utf-8" })
);

// Modeled after pf2e's vite config

const config = Vite.defineConfig(({ command, mode }) => {
  const buildMode = mode === "production" ? "production" : "development";
  const outDir = "dist";

  const plugins = [];

  if (buildMode === "production") {
    plugins.push(
      {
        name: "minify",
        renderChunk: {
          order: "post",
          async handler(code, chunk) {
            return chunk.fileName.endsWith(".mjs")
              ? esbuild.transform(code, {
                  keepNames: true,
                  minifyIdentifiers: false,
                  minifySyntax: true,
                  minifyWhitespace: true,
                  sourcemap: true,
                })
              : code;
          },
        },
      },
      ...viteStaticCopy({
        targets: [{ src: "README.md", dest: "." }],
      })
    );
  } else {
    plugins.push({
      name: "touch-vendor-mjs",
      apply: "build",
      writeBundle: {
        async handler() {
          fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"));
        },
      },
    });
  }

  const reEscape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  return {
    base: command === "build" ? "./" : "/modules/pf2e-thaum-vuln/",
    publicDir: "static",
    define: {
      BUILD_MODE: JSON.stringify(buildMode),
      EN_JSON: JSON.stringify(EN_JSON),
      fu: "foundry.utils",
    },
    esbuild: { keepNames: true },
    build: {
      outDir,
      emptyOutDir: false,
      minify: false,
      sourcemap: true,
      lib: {
        name: "pf2e-thaum-vuln",
        entry: "src/module/exploit-vulnerability.js",
        formats: ["es"],
        fileName: "pf2e-thaum-vuln",
      },
      rolldownOptions: {
        external: new RegExp(["(?:", reEscape(".webp"), ")$"].join("")),
        output: {
          assetFileNames: "styles/pf2e-thaum-vuln.css",
          chunkFileNames: "[name].mjs",
          entryFileNames: "pf2e-thaum-vuln.mjs",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return buildMode === "production"
                ? Object.keys(packageJSON.dependencies)
                : [];
            }
          },
        },
        watch: { buildDelay: 100 },
      },
      target: "es2022",
    },
    server: {
      port: 30000,
      open: "/game",
      proxy: {
        "^(?!/modules/pf2e-thaum-vuln/)": "http://localhost:30000/",
        "/socket.io": {
          target: "ws://localhost:30000",
          ws: true,
        },
      },
    },
    plugins,
    css: {
      devSourcemap: buildMode === "development",
    },
  };
});

export default config;
