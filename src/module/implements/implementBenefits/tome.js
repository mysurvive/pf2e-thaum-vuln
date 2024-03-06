import {
  INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID,
  TOME_IMPLEMENT_BENEFIT_EFFECT_UUID,
} from "../../utils";
import { manageImplements } from "../implements";

async function createTomeDialog(actor) {
  const classNameArray = actor?.class?.name.split(" ") ?? [];
  if (
    classNameArray.includes(game.i18n.localize("PF2E.TraitThaumaturge")) &&
    actor
      .getFlag("pf2e-thaum-vuln", "selectedImplements")
      .some(
        (i) =>
          i.name ===
          game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
      )
  ) {
    if (
      actor
        .getFlag("pf2e-thaum-vuln", "selectedImplements")
        .find(
          (i) =>
            i.name ===
            game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
        ).uuid
    ) {
      const tome = await fromUuid(
        actor
          .getFlag("pf2e-thaum-vuln", "selectedImplements")
          .find(
            (i) =>
              i.name ===
              game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
          ).uuid
      );

      new Dialog(
        {
          title: "Tome Implement Daily Preparation",
          content: () =>
            `<p>Would you like to change your Tome Implement skills?</p>`,
          buttons: {
            yes: {
              label: game.i18n.localize("pf2e-thaum-vuln.dialog.yes"),
              callback: () => {
                constructEffect(actor, tome);
              },
            },
            no: {
              label: game.i18n.localize("pf2e-thaum-vuln.dialog.no"),
              callback: () => {},
            },
          },
          default: "yes",
        },
        actor,
        tome
      ).render(true);
    } else {
      manageImplements(actor);
      return ui.notifications.warn(
        "No Tome implement has been managed. Opening Implement Management sheet."
      );
    }
  }
}

async function constructEffect(actor) {
  const effect = (
    await fromUuid(TOME_IMPLEMENT_BENEFIT_EFFECT_UUID)
  ).toObject();

  const currentTomeEffect = actor.items.find(
    (i) => i.slug === "effect-tome-implement"
  );
  if (currentTomeEffect) currentTomeEffect.delete();

  const skills = [];
  for (const skill in actor.system.skills) {
    skills.push({
      label: actor.system.skills[skill].label,
      value: `system.skills.${skill}.rank`,
    });
  }

  //thanks to AporieTM for tossing me this set of rule elements and saving me time

  effect.system.rules.push(
    {
      adjustName: true,
      choices: skills,
      flag: "effectTomeFirstSkill",
      key: "ChoiceSet",
      predicate: [{ and: ["class:thaumaturge", "feature:tome"] }],
      prompt: "First Skill Proficiency",
      rollOption: "self:implement:tome:firstSkill",
    },
    {
      adjustName: true,
      choices: skills,
      flag: "effectTomeSecondSkill",
      key: "ChoiceSet",
      predicate: [{ and: ["class:thaumaturge", "feature:tome"] }],
      prompt: "Second Skill Proficiency",
      rollOption: "self:implement:tome:secondSkill",
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["feature:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeFirstSkill}",
      value: {
        brackets: [
          {
            start: 1,
            end: 2,
            value: 1,
          },
          {
            start: 3,
            end: 20,
            value: 2,
          },
        ],
      },
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["feature:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeSecondSkill}",
      value: {
        brackets: [
          {
            start: 1,
            end: 4,
            value: 1,
          },
          {
            start: 5,
            end: 20,
            value: 2,
          },
        ],
      },
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["adept:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeFirstSkill}",
      value: 3,
      priority: 50,
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["adept:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeSecondSkill}",
      value: {
        brackets: [
          {
            start: 1,
            end: 8,
            value: 2,
          },
          {
            start: 9,
            end: 20,
            value: 3,
          },
        ],
      },
      priority: 50,
    },
    {
      key: "ActiveEffectLike",
      mode: "override",
      predicate: ["paragon:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeFirstSkill}",
      value: 4,
    },
    {
      key: "ActiveEffectLike",
      mode: "override",
      predicate: ["paragon:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeSecondSkill}",
      value: 4,
    }
  );

  actor.createEmbeddedDocuments("Item", [effect]);
}

async function fixAddProficiencyForLore(item) {
  const a = item.parent;
  const selections = [
    item.rules[0].selection ? item.rules[0].selection.split(".")[2] : undefined,
    item.rules[1].selection ? item.rules[1].selection.split(".")[2] : undefined,
  ];

  const proficiencyRank = a.rollOptions.all["paragon:tome"]
    ? [4]
    : a.rollOptions.all["adept:tome"] && a.level >= 9
    ? [3]
    : a.rollOptions.all["adept:tome"]
    ? [2, 3]
    : a.level >= 5
    ? [2]
    : a.level >= 3
    ? [1, 2]
    : undefined;

  for (const selection of selections) {
    if (a.system.skills[selection]?.lore && selection) {
      const loreItem = a.items.find(
        (i) => game.pf2e.system.sluggify(i.name) === selection
      );

      const selectionProficiency =
        proficiencyRank?.length != 1
          ? proficiencyRank[selections.indexOf(selection)]
          : proficiencyRank[0];

      item.setFlag(
        "pf2e-thaum-vuln",
        "originalProficiency",
        loreItem.system.proficient.value
      );

      await loreItem.update({
        _id: loreItem._id,
        "system.proficient.value": selectionProficiency,
      });
    }
  }
}

async function fixDeleteProficiencyForLore(item) {
  if (!item.slug === "effect-tome-implement") return;
  const a = item.parent;
  const selections = [
    item.rules[0].selection ? item.rules[0].selection.split(".")[2] : undefined,
    item.rules[1].selection ? item.rules[1].selection.split(".")[2] : undefined,
  ];
  const originalProficiency = item.getFlag(
    "pf2e-thaum-vuln",
    "originalProficiency"
  );

  for (const selection of selections) {
    if (a.system.skills[selection]?.lore && selection) {
      const loreItem = a.items.find(
        (i) => game.pf2e.system.sluggify(i.name) === selection
      );

      await loreItem.update({
        _id: loreItem._id,
        "system.proficient.value": originalProficiency,
      });
    }
  }
}

async function createEffectOnImplement(imps, a) {
  const tome = await fromUuid(
    imps.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
    ).uuid
  );
  const oldTome = a.items.find((i) =>
    i.system.rules.find((r) => r.label === "Tome Implement Recall Knowledge")
  );

  deleteOldTomeEffect(oldTome);

  const tomeRules = tome.system.rules;
  tomeRules.push(
    {
      key: "FlatModifier",
      selector: "skill-check",
      value: 1,
      type: "circumstance",
      label: "Tome Implement Recall Knowledge",
      predicate: ["action:recall-knowledge"],
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "skill-check",
      value: 2,
      type: "circumstance",
      label: "Tome Implement Paragon Recall Knowledge",
      predicate: ["action:recall-knowledge", "paragon:tome"],
      hideIfDisabled: true,
    },
    {
      key: "FlatModifier",
      selector: "attack-roll",
      value: 1,
      type: "circumstance",
      label: "Tome Implement Adept RK Success",
      predicate: ["thaumaturge:tome:rk:success", "adept:tome"],
      hideIfDisabled: true,
    },
    {
      key: "RollOption",
      domain: "all",
      label: "Tome Implement Adept Benefit RK Success",
      option: "thaumaturge:tome:rk:success",
      toggleable: true,
      predicate: ["adept:tome"],
    },
    {
      key: "FlatModifier",
      selector: "initiative",
      value: 3,
      predicate: [
        {
          or: ["lore-esoteric", "esoteric-lore", "esoteric"],
        },
      ],
      type: "circumstance",
      label: "Tome Paragon Esoteric Lore Initiative",
      hideIfDisabled: true,
    }
  );
  tome.update({ _id: tome._id, "system.rules": tomeRules });
}

async function deleteOldTomeEffect(oldTome) {
  if (!oldTome) return;

  const oldTomeObj = oldTome.toObject();

  for (const r in oldTomeObj.system.rules) {
    if (
      oldTomeObj.system.rules[r].label === "Tome Implement Recall Knowledge" ||
      oldTomeObj.system.rules[r].label ===
        "Tome Implement Paragon Recall Knowledge" ||
      oldTomeObj.system.rules[r].label === "Tome Implement Adept RK Success" ||
      oldTomeObj.system.rules[r].label ===
        "Tome Implement Adept Benefit RK Success" ||
      oldTomeObj.system.rules[r].label ===
        "Tome Paragon Esoteric Lore Initiative"
    ) {
      delete oldTomeObj.system.rules[r];
    }
  }

  const rules = oldTomeObj.system.rules.filter((r) => {
    return r !== undefined;
  });

  await oldTome.update({
    _id: oldTome._id,
    "system.rules": rules,
  });
}

export async function tomeIntensify() {
  const classNameArray = game.user?.character?.class?.name.split(" ") ?? [];
  if (
    !classNameArray.includes(game.i18n.localize("PF2E.TraitThaumaturge")) &&
    !game.user.isGM
  )
    return;

  const a = game.user?.character ?? canvas.tokens.controlled[0].actor;

  const tomeIntensifyEffect = (
    await fromUuid(INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID)
  ).toObject();

  const flatRoll = await new Roll("1d20").roll({ async: true });
  flatRoll.toMessage({
    flavor:
      "<strong>Intensify Vulnerability: Tome.</strong><br>Your tome's power not only reads a creature's present but even records its future actions. When you use Intensify Vulnerability, roll a d20 and set the result aside. At any time until the start of your next turn, you can use the d20 result you set aside for an attack roll to Strike the target of your Exploit Vulnerability, instead of rolling a new d20; this is a fortune effect.",
  });

  tomeIntensifyEffect.flags["pf2e-thaum-vuln"].tomeRollValue = flatRoll.result;

  await a.createEmbeddedDocuments("Item", [tomeIntensifyEffect]);
}

Hooks.on("pf2e.restForTheNight", (actor) => {
  if (!game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome"))
    createTomeDialog(actor);
});

Hooks.on("createItem", (item, _b, userID) => {
  if (
    game.user.id === userID &&
    item.slug === "effect-tome-implement" &&
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")
  ) {
    fixAddProficiencyForLore(item);
  }
});

Hooks.on("deleteItem", (item, _b, userID) => {
  if (
    game.user.id === userID &&
    item.slug === "effect-tome-implement" &&
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")
  ) {
    fixDeleteProficiencyForLore(item);
  }
});

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
    )?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
    )?.changed &&
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")
  ) {
    constructEffect(a);
    createEffectOnImplement(imps, a);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  const oldTome = a.items.find((i) =>
    i.system.rules.find((r) => r.label === "Tome Implement Recall Knowledge")
  );

  deleteOldTomeEffect(oldTome);
});
