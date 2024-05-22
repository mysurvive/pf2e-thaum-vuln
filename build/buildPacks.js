import { compilePack } from "@foundryvtt/foundryvtt-cli";
import fs from "fs";

export async function buildModulePacks() {
  const packsJsonPath = "./src/packs";
  const srcPacks = fs.readdirSync(packsJsonPath);

  for (const pack of srcPacks) {
    const packSource = `${packsJsonPath}/${pack}`;
    const packDest = `./dist/packs/${pack}`;
    await compilePack(packSource, packDest, { log: true });
  }
}
