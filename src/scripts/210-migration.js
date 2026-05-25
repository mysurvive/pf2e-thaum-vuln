import { isThaumaturge } from "../module/utils/helpers";

export async function migrate210() {
  ui.notifications.info(
    "PF2e Exploit Vulnerability - Migration 2.1.0 - Checking for thaumaturges."
  );
  const thaumaturges = game.actors
    .map((a) => {
      if (isThaumaturge(a)) {
        return a;
      }
    })
    .filter((a) => a != undefined);

  if (thaumaturges.length === 0) {
    ui.notifications.info(
      "PF2e Exploit Vulnerability - Migration 2.1.0 - No Thaumaturges found. Exiting Migration."
    );
    return;
  } else {
    let migrated = 0;
    const progress = ui.notifications.info(
      `PF2e Exploit Vulnerability - Migration 2.1.0 - ${thaumaturges.length} thaumaturges found. Migrating. Do not restart your server during migration.`,
      { progress: true }
    );
    for (const actor of thaumaturges) {
      const selectedImplements = await actor.getFlag(
        "pf2e-thaum-vuln",
        "selectedImplements"
      );
      if (selectedImplements.length !== 0) {
        let newImplements = selectedImplements;
        for (const implement in selectedImplements) {
          progress.update({
            pct: migrated / thaumaturges.length,
            message: `Migrating ${actor.name} - ${implement}`,
          });
          if (!selectedImplements[implement].id) {
            console.log(
              `[PF2e Exploit Vulnerability] - Migration 2.1.0 - Migrating ${implement} on ${actor.name}`
            );
            if (selectedImplements[implement].uuid) {
              console.log(
                `[PF2e Exploit Vulnerability] - Migration 2.1.0 - Migrating ${implement} on ${actor.name}`
              );
              const implementItem = await fromUuid(
                selectedImplements[implement].uuid
              );
              newImplements[implement].id = implementItem.id;
            } else {
              console.warn(
                `[PF2e Exploit Vulnerability] - Migration 2.1.0 - Implement: ${implement} is not managed by PF2e Exploit Vulnerability on actor ${actor.name}`
              );
            }
          } else {
            console.log(
              `[PF2e Exploit Vulnerability] - Migration 2.1.0 - Skipping ${implement} on ${actor.name} - flag already has an id assigned`
            );
          }
        }
        await actor.setFlag(
          "pf2e-thaum-vuln",
          "selectedImplements",
          newImplements
        );
      }
      migrated += 1;
    }
    progress.update({ pct: migrated / thaumaturges.length });
    ui.notifications.clear();
    ui.notifications.success(
      "PF2e Exploit Vulnerability - Migration 2.1.0 - Migration Completed."
    );
  }
  game.settings.set("pf2e-thaum-vuln", "210-migration", true);
}
