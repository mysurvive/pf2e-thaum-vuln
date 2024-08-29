import { getImplement } from "./helpers";
import { createEffectData } from "../utils/helpers";

class Implement {
  #actor;
  #baseFeat;
  #rules;

  // An effect to be added when intensify is used
  static intensifyEffectUuid;

  constructor(actor, itemUuid, rules, slug) {
    this.slug = slug;
    this.#actor = actor;
    this.#rules = rules ? rules : [];
    //TODO: .split()ting the uuid seems like the best thing to do until the flags can be changed
    //to ids from uuids and a migration script is written.
    this.itemId = itemUuid?.split(".")[3] ?? undefined;
    this.#baseFeat = this.actor.itemTypes.feat.find((i) => i.slug === slug);
    this.adept = this.isRank("thaumaturge-implement-adept");
    this.paragon = this.isRank("thaumaturge-implement-paragon");
    this.intensify = this.actor.itemTypes.feat.some(
      (i) => i.slug === "intensify-vulnerability"
    );
    this.intensified = this.actor.itemTypes.effect.some(
      (e) => e.slug === `intensify-vulnerability-${this.slug}`
    );
  }

  get item() {
    return this.actor.inventory.get(this.itemId);
  }

  get actor() {
    return this.#actor;
  }

  get baseFeat() {
    return this.#baseFeat;
  }

  get rules() {
    return this.#rules;
  }

  get name() {
    return this.#baseFeat?.name ?? this.slug;
  }

  // 1,2,3 for 1st through 3rd implement, -1 if unknown how they have the implement
  get counter() {
    const counter = [
      "first-implement-and-esoterica",
      "second-implement",
      "third-implement",
    ].indexOf(this.#baseFeat?.grantedBy?.slug);
    return counter < 0 ? counter : counter + 1;
  }

  // 1/2/3 = initiate, adept, paragon.  Maybe archetype = 0?
  get rank() {
    return this.paragon ? 3 : this.adept ? 2 : 1;
  }

  get rollOptions() {
    const stringRank = this.paragon
      ? "paragon"
      : this.adept
      ? "adept"
      : "initiate";
    return [
      `self:implement:${this.slug}:rank:${this.rank}`,
      `${stringRank}:${this.slug}`,
    ];
  }

  // Sets this.adept and this.paragon. Returns false if there is no feat (such as at level 0)
  isRank(slug) {
    return this.#baseFeat?.system.traits.otherTags.includes(slug) ?? false;
  }

  // If effect is supplied, treat it as effect data to apply, if not, then check
  // if the derived class defined intensifyEffectUuid and apply that effect.
  // Otherwise the implement isn't handled.
  async intensifyImplement(effect = undefined) {
    if (effect === undefined) {
      const effectUuid = this.constructor.intensifyEffectUuid;
      if (effectUuid === undefined)
        return ui.notifications.warn(
          game.i18n.localize(
            "pf2e-thaum-vuln.notifications.warn.intensifyImplement.invalid"
          )
        );
      effect = await createEffectData(effectUuid);
    }

    if (!this.intensify) return;

    if (!this.item?.isHeld)
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.intensifyImplement.notHeld"
        )
      );

    await this.actor.createEmbeddedDocuments("Item", [effect]);
  }

  async createEffectsOnItem(item) {
    const implement = await fromUuid(item);

    if (implement) this.deleteEffectsOnItem();

    const implementRules = implement.system?.rules ?? [];
    for (const rule of this.rules) {
      implementRules.push(rule);
    }

    implement.update({ _id: implement._id, "system.rules": implementRules });
    this.itemId = implement.id;
  }

  async deleteEffectsOnItem() {
    if (this.item) {
      const ruleLabels = new Set(this.rules.map((r) => r.label));
      const newRules = this.item.system.rules.filter(
        (r) => !ruleLabels.has(r.label)
      );
      await this.item.update({ _id: this.item._id, "system.rules": newRules });
    }
  }

  // Can be used as a callback for createImplementEffects
  static createImplementEffectsHook(actor, impsDelta, imps) {
    const slug = this.slug;
    if (imps[slug]?.uuid && impsDelta[slug]) {
      getImplement(actor, slug).createEffectsOnItem(imps[slug].uuid);
    }
  }
}

export { Implement };
