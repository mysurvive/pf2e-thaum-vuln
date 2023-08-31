import { TOME_IMPLEMENT_BENEFIT_EFFECT_UUID } from "../../utils";
import { manageImplements } from "../implements";

Hooks.on("pf2e.restForTheNight", (actor) => {
  createTomeDialog(actor);
});

async function createTomeDialog(actor) {
  if (
    actor?.class.name === "Thaumaturge" &&
    actor
      .getFlag("pf2e-thaum-vuln", "selectedImplements")
      .some((i) => i.name === "Tome")
  ) {
    if (
      actor
        .getFlag("pf2e-thaum-vuln", "selectedImplements")
        .find((i) => i.name === "Tome").uuid
    ) {
      const tome = await fromUuid(
        actor
          .getFlag("pf2e-thaum-vuln", "selectedImplements")
          .find((i) => i.name === "Tome").uuid
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

async function constructEffect(actor, tome) {
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
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["paragon:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeFirstSkill}",
      value: 4,
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      predicate: ["paragon:tome"],
      path: "{item|flags.pf2e.rulesSelections.effectTomeSecondSkill}",
      value: 4,
    }
  );

  actor.createEmbeddedDocuments("Item", [effect]);
}

Hooks.on("createItem", (item) => {
  fixAddProficiencyForLore(item);
});

Hooks.on("deleteItem", (item) => {
  fixDeleteProficiencyForLore(item);
});

async function fixAddProficiencyForLore(item) {
  if (!item.slug === "effect-tome-implement") return;

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
