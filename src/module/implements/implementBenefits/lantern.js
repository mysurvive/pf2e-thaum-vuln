import { INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID } from "../../utils";

async function createEffectOnImplement(imps, a) {
  const lantern = await fromUuid(imps.find((i) => i.name === "Lantern").uuid);
  const oldLantern = a.items.find((i) =>
    i.system.rules.find((r) => r.label === "Lantern Implement Light")
  );

  deleteOldLanternEffect(oldLantern);

  const lanternRules = lantern.system.rules;
  lanternRules.push(
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
        { not: ["check:type:initiative"] },
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
        { not: ["check:type:initiative"] },
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
    }
  );

  lantern.update({ _id: lantern._id, "system.rules": lanternRules });
}

async function deleteOldLanternEffect(oldLantern) {
  if (!oldLantern) return;

  const oldLanternObj = oldLantern.toObject();

  for (const r in oldLanternObj.system.rules) {
    if (
      oldLanternObj.system.rules[r].label ===
        "Lantern Bright Light Recall Knowledge" ||
      oldLanternObj.system.rules[r].label ===
        "Lantern Bright Light Perception" ||
      oldLanternObj.system.rules[r].label === "Lantern Implement Lit" ||
      oldLanternObj.system.rules[r].label === "Lantern Implement Light" ||
      oldLanternObj.system.rules[r].label ===
        "Target Within Lantern Bright Light" ||
      oldLanternObj.system.rules[r].label ===
        "Lantern Bright Light Recall Knowledge (Intensify)" ||
      oldLanternObj.system.rules[r].label ===
        "Lantern Bright Light Perception (Intensify)" ||
      oldLanternObj.system.rules[r].label === "Bright Light Indicator"
    ) {
      delete oldLanternObj.system.rules[r];
    }
  }

  const rules = oldLanternObj.system.rules.filter((r) => {
    return r !== undefined;
  });

  await oldLantern.update({
    _id: oldLantern._id,
    "system.rules": rules,
  });
}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps.find((i) => i.name === "Lantern")?.uuid &&
    impDelta.find((i) => i.name === "Lantern")?.changed
  ) {
    createEffectOnImplement(imps, a);
  }
});
export async function lanternIntensify() {
  const classNameArray = game.user?.character?.class?.name.split(" ") ?? [];
  if (
    !classNameArray.includes(game.i18n.localize("PF2E.TraitThaumaturge")) &&
    !game.user.isGM
  )
    return;

  const a = game.user?.character ?? canvas.tokens.controlled[0].actor;

  const lanternIntensifyEffect = (
    await fromUuid(INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID)
  ).toObject();

  await a.createEmbeddedDocuments("Item", [lanternIntensifyEffect]);
}
