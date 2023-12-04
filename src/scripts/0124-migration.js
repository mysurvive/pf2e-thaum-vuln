Hooks.on("ready", async () => {
  if (!game.settings.get("pf2e-thaum-vuln", "0124migration")) {
    ui.notifications.info("Migrating PF2e Exploit Vulnerability 0.12.4 data.");
    await async function () {
      for (const user of game.users) {
        if (user?.character?.class.name.split(" ").includes(game.i18n.localize("PF2E.TraitThaumaturge"))) {
          const feats = user.character.items.filter((i) => i.type === "feat");
          const implementImprovementSourceIDs = [
            "Compendium.pf2e.classfeatures.Item.Obm4ItMIIr0whYeO",
            "Compendium.pf2e.classfeatures.Item.ZEUxZ4Ta1kDPHiq5",
            "Compendium.pf2e.classfeatures.Item.QEtgbY8N2V4wTbsI",
          ];
          for (const feat of feats) {
            if (implementImprovementSourceIDs.includes(feat.sourceId)) {
              const upgradedImplement = await fromUuid(
                `${feat.parent.uuid}.Item.${
                  feat.rules.find((i) => i.key === "ChoiceSet").selection
                }`
              );
              let impRules = upgradedImplement.system.rules;
              let impRank;
              if (
                upgradedImplement.system.traits.otherTags.includes(
                  "thaumaturge-implement-paragon"
                ) &&
                !upgradedImplement.system.rules.some(
                  (r) => r.label === "Implement Rank Paragon"
                )
              ) {
                impRank = "Paragon";
                impRules.push({
                  key: "RollOption",
                  label: `Implement Rank ${impRank}`,
                  domain: "all",
                  option: `${game.pf2e.system.sluggify(
                    impRank
                  )}:${game.pf2e.system.sluggify(upgradedImplement.name)}`,
                });
                upgradedImplement.update({
                  _id: upgradedImplement._id,
                  "system.rules": impRules,
                });
              } else if (
                upgradedImplement.system.traits.otherTags.includes(
                  "thaumaturge-implement-adept"
                ) &&
                !upgradedImplement.system.rules.some(
                  (r) => r.label === "Implement Rank Adept"
                )
              ) {
                impRank = "Adept";
                impRules.push({
                  key: "RollOption",
                  label: `Implement Rank ${impRank}`,
                  domain: "all",
                  option: `${game.pf2e.system.sluggify(
                    impRank
                  )}:${game.pf2e.system.sluggify(upgradedImplement.name)}`,
                });
                upgradedImplement.update({
                  _id: upgradedImplement._id,
                  "system.rules": impRules,
                });
              }
            }
          }
        }
      }
    };
    ui.notifications.info(
      "PF2e Exploit Vulnerability 0.12.4 migration completed."
    );
  }

  game.settings.set("pf2e-thaum-vuln", "0124migration", true);
});
