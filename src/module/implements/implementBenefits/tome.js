import {
  INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID,
  TOME_IMPLEMENT_BENEFIT_EFFECT_UUID,
  TOME_ADEPT_RK_EFFECT_UUID,
} from "../../utils";
import { createEffectData } from "../../utils/helpers";
import { getImplement } from "../helpers";
import { Implement } from "../implement";

class Tome extends Implement {
  constructor(actor, implementItem) {
    const tomeRules = [
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
        predicate: ["adept:tome", "target:mark:tome-adept-rk-success"],
        hideIfDisabled: true,
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
      },
    ];

    super(actor, implementItem, tomeRules, "tome");
  }

  async createDailyPreparationDialog() {
    const tome = this.item;
    if (tome) {
      new Dialog(
        {
          title: "Tome Implement Daily Preparation",
          content: () =>
            `<p>Would you like to change your Tome Implement skills?</p>`,
          buttons: {
            yes: {
              label: game.i18n.localize("pf2e-thaum-vuln.dialog.yes"),
              callback: () => {
                this.dailyPreparation();
              },
            },
            no: {
              label: game.i18n.localize("pf2e-thaum-vuln.dialog.no"),
              callback: () => {},
            },
          },
          default: "yes",
        },
        this.actor,
        tome
      ).render(true);
    } else {
      return ui.notifications.warn("No Tome implement has been managed.");
    }
  }

  async dailyPreparation() {
    const effect = await createEffectData(TOME_IMPLEMENT_BENEFIT_EFFECT_UUID, {
      actor: this.actor.uuid,
    });

    const currentTomeEffect = this.actor.items.find(
      (i) => i.slug === "effect-tome-implement"
    );
    if (currentTomeEffect) currentTomeEffect.delete();

    const skills = [];
    for (const skill in this.actor.system.skills) {
      skills.push({
        label: this.actor.system.skills[skill].label,
        value: `system.skills.${skill}.rank`,
      });
    }

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

    this.actor.createEmbeddedDocuments("Item", [effect]);
  }

  async fixAddProficiencyForLore(item) {
    const a = this.actor;
    const selections = [
      item.rules[0].selection
        ? item.rules[0].selection.split(".")[2]
        : undefined,
      item.rules[1].selection
        ? item.rules[1].selection.split(".")[2]
        : undefined,
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

  async fixDeleteProficiencyForLore(item) {
    if (!item.slug === "effect-tome-implement") return;
    const a = this.actor;
    const selections = [
      item.rules[0].selection
        ? item.rules[0].selection.split(".")[2]
        : undefined,
      item.rules[1].selection
        ? item.rules[1].selection.split(".")[2]
        : undefined,
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

  async tomeRKResult(sa, targ, degreeOfSuccess) {
    // Must have target of RK check to apply mark to, and be tome adept
    if (!getImplement(sa, "tome")?.adept) return;

    // Check for an active encounter.  RK rolls are exploration mode too.
    if (!game.combats.active?.started) return;

    const oldEffect = sa.itemTypes.effect.find(
      (e) => e.flags.core?.sourceId === TOME_ADEPT_RK_EFFECT_UUID
    );
    if (oldEffect) {
      // Already used RK this turn? Use an unexpired effect to tell us.
      if (!oldEffect.isExpired) return;
      await oldEffect.delete();
    }

    // Get RK Effect's TokenMark RE and inject the target's UUID
    let effect = await createEffectData(TOME_ADEPT_RK_EFFECT_UUID, {
      actor: this.actor.uuid,
    });
    (effect.flags.core ??= {}).sourceId = TOME_ADEPT_RK_EFFECT_UUID;
    effect.name += ` (${targ.name})`;
    let re = effect.system.rules.find(
      (r) => r.key === "TokenMark" && r.slug === "tome-adept-rk-success"
    );
    if (!re) {
      console.log(
        "Unable to find TokenMark RE on Tome Adept RK Success Effect?!"
      );
      return;
    }
    re.uuid = targ.uuid;
    if (degreeOfSuccess < 2) {
      re.slug = "tome-adept-rk-failure";
      effect.name += " (failure)";
    } else {
      effect.name += " (success)";
    }
    await sa.createEmbeddedDocuments("Item", [effect]);
  }

  async intensifyImplement() {
    const a = game.user?.character ?? canvas.tokens.controlled[0].actor;
    if (
      !a.itemTypes.feat.some((i) => i.slug === "intensify-vulnerability") ||
      !getImplement(a, "tome")
    )
      return;

    const tomeIntensifyEffect = await createEffectData(
      INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID,
      { actor: this.actor.uuid }
    );

    const flatRoll = await new Roll("1d20").roll({ async: true });
    flatRoll.toMessage({
      flavor:
        "<strong>Intensify Vulnerability: Tome.</strong><br>Your tome's power not only reads a creature's present but even records its future actions. When you use Intensify Vulnerability, roll a d20 and set the result aside. At any time until the start of your next turn, you can use the d20 result you set aside for an attack roll to Strike the target of your Exploit Vulnerability, instead of rolling a new d20; this is a fortune effect.",
    });

    tomeIntensifyEffect.flags["pf2e-thaum-vuln"].tomeRollValue =
      flatRoll.result;

    tomeIntensifyEffect.name += ` [${flatRoll.result}]`;

    await a.createEmbeddedDocuments("Item", [tomeIntensifyEffect]);
  }
}

Hooks.on("RKResult", (actor, targetDoc, degreeOfSuccess) => {
  if (actor && targetDoc && getImplement(actor, "tome")) {
    const _tome = actor.attributes.implements["tome"];
    _tome.tomeRKResult(actor, targetDoc, degreeOfSuccess);
  }
});

Hooks.on("pf2e.restForTheNight", (actor) => {
  if (
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome") &&
    getImplement(actor, "tome")
  ) {
    const tome = getImplement(actor, "tome");
    tome.createDailyPreparationDialog(actor);
  }
});

Hooks.on("createItem", (item, _b, userID) => {
  if (
    game.user.id === userID &&
    item.slug === "effect-tome-implement" &&
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")
  ) {
    const actor = item.parent;
    const _tome = actor.attributes.implements["tome"];
    _tome.fixAddProficiencyForLore(item);
  }
});

Hooks.on("deleteItem", (item, _b, userID) => {
  if (
    game.user.id === userID &&
    item.slug === "effect-tome-implement" &&
    !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")
  ) {
    const actor = item.parent;
    const _tome = actor.attributes.implements["tome"];
    _tome.fixDeleteProficiencyForLore(item);
  }
});

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["tome"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Tome")
    )?.changed
  ) {
    const tome = getImplement(a, "tome");
    tome.createEffectsOnItem(imps["tome"].uuid);

    if (!game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome")) {
      tome.dailyPreparation();
    }
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  const tome = getImplement(a, "tome");
  if (tome?.item) {
    tome.deleteEffectsOnItem();
  }
});

Hooks.on("preCreateChatMessage", (message) => {
  if (
    game.ready &&
    message.flags.pf2e?.context?.type === "attack-roll" &&
    message.flags.pf2e?.context?.options?.some(
      (o) => o === "target:mark:tome-adept-rk-success"
    )
  ) {
    message.actor.itemTypes.effect
      .find((i) => i.sourceId === TOME_ADEPT_RK_EFFECT_UUID)
      ?.delete();
  }
});

export { Tome };
