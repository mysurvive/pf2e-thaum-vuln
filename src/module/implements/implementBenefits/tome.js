import {
  INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID,
  TOME_IMPLEMENT_BENEFIT_EFFECT_UUID,
  TOME_ADEPT_RK_EFFECT_UUID,
} from "../../utils";
import { createEffectData, hasFeat, isThaumaturge } from "../../utils/helpers";
import { getImplement } from "../helpers";
import { Implement } from "../implement";
import { RKCallback } from "../../socket";

class Tome extends Implement {
  static slug = "tome";
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID;

  constructor(actor, implementItem) {
    const tomeRules = [
      {
        key: "FlatModifier",
        selector: "skill-check",
        value: 1,
        type: "circumstance",
        label: "pf2e-thaum-vuln.implements.tome.ruleElements.recallKnowledge",
        predicate: [
          { or: ["class:thaumaturge", "feat:implement-initiate"] },
          "action:recall-knowledge",
        ],
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "skill-check",
        value: 2,
        type: "circumstance",
        label:
          "pf2e-thaum-vuln.implements.tome.ruleElements.recallKnowledgeParagon",
        predicate: ["action:recall-knowledge", "paragon:tome"],
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "attack-roll",
        value: 1,
        type: "circumstance",
        label:
          "pf2e-thaum-vuln.implements.tome.ruleElements.recallKnowledgeAdeptSuccess",
        predicate: [
          { or: ["adept:tome", "paragon:tome"] },
          "target:mark:tome-adept-rk-success",
        ],
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "initiative",
        value: 3,
        predicate: [
          "paragon:tome",
          {
            or: ["lore-esoteric", "esoteric-lore", "esoteric"],
          },
        ],
        type: "circumstance",
        label:
          "pf2e-thaum-vuln.implements.tome.ruleElements.esotericLoreInitiative",
        hideIfDisabled: true,
      },
    ];

    super(actor, implementItem, tomeRules, "tome");
  }

  async createEffectsOnItem(item) {
    await super.createEffectsOnItem(item);
    if (
      !game.settings.get("pf2e-thaum-vuln", "dailiesHandlesTome") &&
      (isThaumaturge(this.actor) || hasFeat(this.actor, "implement-initiate"))
    ) {
      this.dailyPreparation();
    }
  }

  async createDailyPreparationDialog() {
    if (
      !isThaumaturge(this.actor) &&
      !hasFeat(this.actor, "implement-initiate")
    )
      return;
    const tome = this.item;
    if (tome) {
      new Dialog(
        {
          title: game.i18n.localize(
            "pf2e-thaum-vuln.implements.tome.dailyPreparationDialog.title"
          ),
          content: () =>
            `<p>${game.i18n.localize(
              "pf2e-thaum-vuln.implements.tome.dailyPreparationDialog.prompt"
            )}</p>`,
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
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.implements.tome.dailyPreparationDialog.warningNoTome"
        )
      );
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
        predicate: [
          { or: ["class:thaumaturge", "feat:implement-initiate"] },
          "feature:tome",
        ],
        prompt:
          "pf2e-thaum-vuln.implements.tome.ruleElements.dailyPreparationFirstSkill",
      },
      {
        adjustName: true,
        choices: skills,
        flag: "effectTomeSecondSkill",
        key: "ChoiceSet",
        predicate: [
          { or: ["class:thaumaturge", "feat:implement-initiate"] },
          "feature:tome",
        ],
        prompt:
          "pf2e-thaum-vuln.implements.tome.ruleElements.dailyPreparationSecondSkill",
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
        phase: "beforeDerived",
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
        phase: "beforeDerived",
      },
      {
        key: "ActiveEffectLike",
        mode: "override",
        predicate: ["paragon:tome"],
        path: "{item|flags.pf2e.rulesSelections.effectTomeFirstSkill}",
        value: 4,
        phase: "beforeDerived",
      },
      {
        key: "ActiveEffectLike",
        mode: "override",
        predicate: ["paragon:tome"],
        path: "{item|flags.pf2e.rulesSelections.effectTomeSecondSkill}",
        value: 4,
        phase: "beforeDerived",
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
    if (this.paragon) {
      effect.system.duration.expiry = "turn-start";
      effect.system.duration.value = 1;
    }
    await sa.createEmbeddedDocuments("Item", [effect]);
  }

  async intensifyImplement() {
    const tomeIntensifyEffect = await createEffectData(
      Tome.intensifyEffectUuid
    );

    // Base class does this, but it would _after_ we do the roll.
    if (!this.item?.isHeld)
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.intensifyImplement.notHeld"
        )
      );

    const flatRoll = await new Roll("1d20").roll({ async: true });
    flatRoll.toMessage({
      flavor: game.i18n.localize(
        "pf2e-thaum-vuln.implements.tome.intensifyFlavor"
      ),
    });

    tomeIntensifyEffect.flags["pf2e-thaum-vuln"].tomeRollValue =
      flatRoll.result;

    tomeIntensifyEffect.name += ` [${flatRoll.result}]`;
    await super.intensifyImplement(tomeIntensifyEffect);
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

Hooks.on("createImplementEffects", Tome.createImplementEffectsHook.bind(Tome));

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

// If this is a RK result for a tome adept add a message flag so a
// renderChatMessage hook will know to add buttons.
Hooks.once("ready", () => {
  // This is inside ready so it runs after the preCreateChatMessage hook that adds message flags
  Hooks.on("preCreateChatMessage", (message) => {
    if (
      message.isRoll &&
      message.actor &&
      getImplement(message.actor, "tome")?.adept &&
      game.combats.active?.started &&
      (message.target?.token ||
        message.getFlag("pf2e-thaum-vuln", "targets")?.length === 1) &&
      message
        .getFlag("pf2e", "context.options")
        ?.includes("action:recall-knowledge")
    ) {
      message.updateSource({ "flags.pf2e-thaum-vuln.tomeAdeptRK": true });
    }
  });
});

Hooks.on("renderChatMessage", (message, html) => {
  const RKButtonText = `<hr><p>${game.i18n.localize(
    "pf2e-thaum-vuln.implements.tome.applyRecallKnowledgeResultButton"
  )}:</p>
<div class="message-buttons">
  <button type="button" class="success tome-adept-rk" data-outcome="success">${game.i18n.localize(
    "PF2E.Check.Result.Degree.Check.success"
  )}</button>
  <button type="button" class="failure tome-adept-rk" data-outcome="failure">${game.i18n.localize(
    "PF2E.Check.Result.Degree.Check.failure"
  )}</button>
</div>`;

  if (message.getFlag("pf2e-thaum-vuln", "tomeAdeptRK")) {
    const target =
      message.target?.token?.uuid ??
      message.getFlag("pf2e-thaum-vuln", "targets")?.[0].tokenUuid;
    if (target) {
      html.find("div.message-content").append(RKButtonText);
      html.find("button.tome-adept-rk")?.on("click", (event) => {
        const degreeOfSuccess =
          event.target.dataset.outcome == "success" ? 2 : 1;
        RKCallback(message.author.id, message.actor.uuid, target, {
          degreeOfSuccess,
        });
        return false;
      });
    }
  }
});

export { Tome };
