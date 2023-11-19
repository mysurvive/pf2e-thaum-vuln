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
        { or: ["target:distance:20", "target-in-lantern-bright-light"] },
        { nor: ["adept:lantern"] },
      ],
      slug: "lantern-per-initiate",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge",
      type: "status",
      value: 1,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:20", "target-in-lantern-bright-light"] },
        { nor: ["adept:lantern"] },
      ],
      slug: "lantern-rk-initiate",
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
        { or: ["target:distance:30", "target-in-lantern-bright-light"] },
        "adept:lantern",
        { nor: ["paragon:lantern"] },
      ],
      slug: "lantern-per-adept",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge",
      type: "status",
      value: 1,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:30", "target-in-lantern-bright-light"] },
        "adept:lantern",
        { nor: ["paragon:lantern"] },
      ],
      slug: "lantern-rk-adept",
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
        { or: ["target:distance:40", "target-in-lantern-bright-light"] },
        "paragon:lantern",
      ],
      slug: "lantern-per-paragon",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge",
      type: "status",
      value: 1,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:40", "target-in-lantern-bright-light"] },
        "paragon:lantern",
      ],
      slug: "lantern-rk-paragon",
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
        { or: ["target:distance:20", "target-in-lantern-bright-light"] },
        "adept:lantern",
        "self:effect:intensify-vulnerability-lantern",
        { nor: ["paragon:lantern"] },
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-per-intensify-initiate",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge (Intensify)",
      type: "status",
      value: 2,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:20", "target-in-lantern-bright-light"] },
        "adept:lantern",
        "self:effect:intensify-vulnerability-lantern",
        { nor: ["paragon:lantern"] },
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-rk-intensify-initiate",
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
        { or: ["target:distance:30", "target-in-lantern-bright-light"] },
        "adept:lantern",
        "self:effect:intensify-vulnerability-lantern",
        { nor: ["paragon:lantern"] },
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-per-intensify-adept",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge (Intensify)",
      type: "status",
      value: 2,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:30", "target-in-lantern-bright-light"] },
        "adept:lantern",
        "self:effect:intensify-vulnerability-lantern",
        { nor: ["paragon:lantern"] },
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-rk-intensify-adept",
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
        { or: ["target:distance:40", "target-in-lantern-bright-light"] },
        "paragon:lantern",
        "self:effect:intensify-vulnerability-lantern",
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-per-intensify-paragon",
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      label: "Lantern Bright Light Recall Knowledge (Intensify)",
      type: "status",
      value: 2,
      predicate: [
        "lantern-implement-lit",
        { or: ["target:distance:40", "target-in-lantern-bright-light"] },
        "paragon:lantern",
        "self:effect:intensify-vulnerability-lantern",
        {
          or: [
            "target:mark:personal-antithesis",
            "target:mark:mortal-weakness",
            "target:mark:breached-defenses",
          ],
        },
      ],
      slug: "lantern-rk-intensify-paragon",
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
        "Lantern Bright Light Perception (Intensify)"
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
  console.log("createImplementEffect hook called");
  if (
    game.user.id === userID &&
    imps.find((i) => i.name === "Lantern")?.uuid &&
    impDelta.find((i) => i.name === "Lantern")?.changed
  ) {
    createEffectOnImplement(imps, a);
  }
});
