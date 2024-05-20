import { extractPack } from "@foundryvtt/foundryvtt-cli";
import yargs from "yargs";
import fs from "fs";
//eslint-disable-next-line
const argv = yargs(process.argv.slice(2));
const args = argv
  .option("logWarnings", {
    describe: "Turns on logging out warnings about extracted data.",
    type: "boolean",
    default: true,
  })
  .example([
    [
      "npm run extractPacks thaumaturge-effects  # extract only thaumaturge effects, from packs in dist/",
    ],
    ["npm run extractPacks all     # as above, but extract everything"],
  ])
  .help(false)
  .version(false)
  .parseSync();

const distPackPath = "./dist/packs";
const packDb =
  args._.includes("all") || args._.length === 0
    ? fs.readdirSync(distPackPath)
    : args._;

const options = {
  log: args.logWarnings,
  transformName: (e) => {
    const name =
      e.name
        .toLowerCase()
        .replace(/\(|\)|'|(?: -)/gm, "")
        .replace(/(?:: )|:| /gm, " ")
        .replace(/ /gm, "-") + ".json";
    return name;
  },
};

for (const db of packDb) {
  const dbSource = `${distPackPath}/${db}`;
  const extractDest = `./src/packs/${db}`;
  await fs.promises.rm(extractDest, { recursive: true, force: true });
  await extractPack(dbSource, extractDest, options);
}
