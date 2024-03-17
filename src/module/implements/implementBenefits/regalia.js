const newRegaliaRules = [
  {
    key: "FlatModifier",
    selector: ["deception", "diplomacy", "intimidation"],
    value: 1,
    type: "circumstance",
    label: "Regalia Implement Initiate",
    predicate: [],
    hideIfDisabled: true,
  },
  {
    key: "Aura",
    radius: 500,
    effects: [
      { affects: "allies", events: ["enter"], uuid: "Item.7lf9PJMMidflGW3F" },
    ],
    traits: ["visual"],
    label: "Regalia Follow The Expert Bonus",
    predicate: ["action:follow-the-expert"],
    slug: "regalia-follow-the-expert-bonus",
    appearance: {
      border: null,
      highlight: { alpha: 0, color: "#000000" },
    },
  },
  {
    key: "Aura",
    radius: 15,
    effects: [
      {
        affects: "allies",
        events: ["enter"],
        uuid: "Item.KHgPNbkHnU20zPHG",
      },
    ],
    traits: ["emotion", "mental", "visual"],
    slug: "regalia-aura",
  },
  {
    key: "FlatModifier",
    selector: ["deception", "diplomacy", "intimidation"],
    value: 2,
    type: "circumstance",
    label: "Regalia Implement Adept",
    predicate: ["adept:regalia"],
    hideIfDisabled: true,
  },
];

async function createEffectOnImplement(imps, a) {
  const regalia = await fromUuid(imps["regalia"].uuid);
  const oldRegalia = a.items.find((i) =>
    i.system.rules.find((r) => r.label === "Regalia Implement Initiate")
  );

  deleteOldRegaliaEffect(oldRegalia);

  const regaliaRules = regalia.system.rules;
  for (const rule of newRegaliaRules) {
    regaliaRules.push(rule);
  }

  console.log(regaliaRules);
  regalia.update({ _id: regalia._id, "system.rules": regaliaRules });
}

async function deleteOldRegaliaEffect(oldRegalia) {
  if (!oldRegalia) return;

  const oldRegaliaObj = oldRegalia.toObject();

  for (const r in oldRegaliaObj.system.rules) {
    if (
      oldRegaliaObj.system.rules[r].label === "Regalia Implement Initiate" ||
      oldRegaliaObj.system.rules[r].label ===
        "Regalia Follow The Expert Bonus" ||
      oldRegaliaObj.system.rules[r].label === "Regalia Implement Adept" ||
      oldRegaliaObj.system.rules[r].slug === "regalia-aura"
    ) {
      delete oldRegaliaObj.system.rules[r];
    }
  }

  const rules = oldRegaliaObj.system.rules.filter((r) => {
    return r !== undefined;
  });

  await oldRegalia.update({ _id: oldRegalia._id, "system.rules": rules });
}

function regaliaIntensify() {}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["regalia"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Regalia")
    )?.changed
  ) {
    createEffectOnImplement(imps, a);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  const oldRegalia = a.items.find((i) =>
    i.system.rules.find((r) => r.label === "Regalia Implement Initiate")
  );

  deleteOldRegaliaEffect(oldRegalia);
});

export { regaliaIntensify };
