import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { TYPE_COLLECTION_MAP } from "@foundryvtt/foundryvtt-cli/lib/package.mjs";
import fs from "fs";

const COLLECTION_TYPE = new Map(
  Object.entries(TYPE_COLLECTION_MAP).map(([k, v]) => [v, k])
);

export async function buildModulePacks(packageId) {
  const packsJsonPath = "./src/packs";
  const srcPacks = fs.readdirSync(packsJsonPath);

  for (const pack of srcPacks) {
    const packSource = `${packsJsonPath}/${pack}`;
    const packDest = `./dist/packs/${pack}`;
    await compilePack(packSource, packDest, {
      log: true,
      transformEntry: (entry) => {
        const [, collection] = entry._key.split("!");
        const docType = COLLECTION_TYPE.get(collection);

        // Remove obsolte sourceId flags
        if (entry.flags?.core?.sourceId) delete entry.flags.core.sourceId;

        // Add correct compendiumSource (except to folders)
        if (collection !== "folders")
          entry._stats.compendiumSource = `Compendium.${packageId}.${pack}.${docType}.${entry._id}`;

        // Remove any user IDs, they don't work on other servers
        for (const userId of Object.keys(entry.ownership ?? {})) {
          if (userId !== "default") delete entry.ownership[userId];
        }
        if (entry._stats.lastModifiedBy) delete entry._stats.lastModifiedBy;
      },
    });
  }
}
