/**Migration to remove added REs from feats */
const oldLanternRules = [
  {
    key: "TokenLight",
    label: "Lantern Implement Light",
    predicate: ["lantern-implement-lit", { nor: ["adept:lantern"] }],
    value: {
      alpha: 0.45,
      animation: {
        intensity: 1,
        speed: 2,
        type: "flame",
      },
      attenuation: 0.4,
      bright: 20,
      color: "#ffae3d",
      dim: 40,
      shadows: 0.2,
    },
  },
  {
    key: "Aura",
    label: "Bright Light Indicator",
    radius: 20,
    predicate: ["lantern-implement-lit", { nor: ["adept:lantern"] }],
  },
  {
    key: "TokenLight",
    label: "Lantern Implement Light",
    predicate: [
      "lantern-implement-lit",
      "adept:lantern",
      { nor: ["paragon:lantern"] },
    ],
    value: {
      alpha: 0.45,
      animation: {
        intensity: 1,
        speed: 2,
        type: "flame",
      },
      attenuation: 0.4,
      bright: 30,
      color: "#ffae3d",
      dim: 60,
      shadows: 0.2,
    },
  },
  {
    key: "Aura",
    label: "Bright Light Indicator",
    radius: 30,
    predicate: [
      "lantern-implement-lit",
      "adept:lantern",
      { nor: ["paragon:lantern"] },
    ],
  },
  {
    key: "TokenLight",
    label: "Lantern Implement Light",
    predicate: ["lantern-implement-lit", "paragon:lantern"],
    value: {
      alpha: 0.45,
      animation: {
        intensity: 1,
        speed: 2,
        type: "flame",
      },
      attenuation: 0.4,
      bright: 40,
      color: "#ffae3d",
      dim: 80,
      shadows: 0.2,
    },
  },
  {
    key: "Aura",
    label: "Bright Light Indicator",
    radius: 40,
    predicate: ["lantern-implement-lit", "paragon:lantern"],
  },
  {
    domain: "all",
    key: "RollOption",
    label: "Lantern Implement Lit",
    option: "lantern-implement-lit",
    toggleable: true,
  },
  {
    domain: "all",
    key: "RollOption",
    label: "Target Within Lantern Bright Light",
    option: "target-in-lantern-bright-light",
    toggleable: true,
    predicate: ["lantern-implement-lit"],
    hideIfDisabled: true,
  },
  {
    key: "FlatModifier",
    selector: "perception",
    label: "Lantern Bright Light Perception",
    type: "status",
    value: 1,
    predicate: [
      "lantern-implement-lit",
      "target-in-lantern-bright-light",
      { not: "check:type:initiative" },
    ],
    slug: "lantern-per",
    hideIfDisabled: true,
  },
  {
    key: "FlatModifier",
    selector: "all",
    label: "Lantern Bright Light Recall Knowledge",
    type: "status",
    value: 1,
    predicate: [
      "lantern-implement-lit",
      "target-in-lantern-bright-light",
      "action:recall-knowledge",
      { nor: ["adept:lantern"] },
    ],
    slug: "lantern-rk",
    hideIfDisabled: true,
  },
  {
    key: "FlatModifier",
    selector: "perception",
    label: "Lantern Bright Light Perception (Intensify)",
    type: "status",
    value: 2,
    predicate: [
      "lantern-implement-lit",
      "target-in-lantern-bright-light",
      "self:effect:lantern-intensify-vulnerability",
      { not: "check:type:initiative" },
    ],
    slug: "lantern-per-intensify",
    hideIfDisabled: true,
  },
  {
    key: "FlatModifier",
    selector: "all",
    label: "Lantern Bright Light Recall Knowledge (Intensify)",
    type: "status",
    value: 2,
    predicate: [
      "lantern-implement-lit",
      "target-in-lantern-bright-light",
      "self:effect:lantern-intensify-vulnerability",
      "action:recall-knowledge",
    ],
    slug: "lantern-rk-intensify",
    hideIfDisabled: true,
  },
];

Hooks.on("ready", async () => {
  if (
    !game.settings.get("pf2e-thaum-vuln", "0150migration") &&
    game.user.isGM
  ) {
    ui.notifications.info("Migrating PF2e Exploit Vulnerability 0.15.0 data.");
    await async function () {
      //Remove rule elements from feats
      const feats = game.actors
        .map((a) => {
          if (a.type === "character") {
            const labels = ["Implement Rank Adept", "Implement Rank Paragon"];
            const k = a.itemTypes.feat
              .flatMap((f) => {
                const labeledFeat = [];
                if (
                  f.rules.some(
                    (r) => r.key === "RollOption" && labels.includes(r.label)
                  )
                )
                  labeledFeat.push(f);
                return labeledFeat;
              })
              .filter((featArray) => featArray.length != 0);
            return k;
          }
        })
        .filter((c) => c != undefined && c.length != 0)
        .flat();

      for (const feat of feats) {
        const newRules = feat.rules.filter(
          (r) =>
            r.label != "Implement Rank Adept" &&
            r.label != "Implement Rank Paragon"
        );

        await feat.update({
          _id: feat._id,
          "system.rules": newRules,
        });
      }

      //Migrate Lantern items to new rule elements
      const lanternCharacters = game.actors.filter(
        (a) => a.system.attributes.implements?.lantern
      );
      const lanterns = lanternCharacters.map((l) => {
        return l.system.attributes.implements.lantern;
      });

      for (const lantern of lanterns) {
        const ruleLabels = new Set(oldLanternRules.map((r) => r.label));
        const newRules = lantern.item.system.rules.filter(
          (r) => !ruleLabels.has(r.label)
        );
        await lantern.update({ _id: lantern._id, "system.rules": newRules });
        await lantern.createEffectsOnItem(lantern.item.uuid);
      }

      ui.notifications.info(
        "Finished migrating PF2e Exploit Vulnerability 0.15.0 data."
      );
      game.settings.set("pf2e-thaum-vuln", "0150migration", true);
    };
  }
});
