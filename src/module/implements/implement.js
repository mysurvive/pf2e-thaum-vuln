class Implement {
  #actor;
  #baseFeat;
  #rules;

  constructor(actor, itemUuid, rules, slug) {
    this.slug = slug;
    this.#actor = actor;
    this.#rules = rules ? rules : [];
    //TODO: .split()ting the uuid seems like the best thing to do until the flags can be changed
    //to ids from uuids and a migration script is written.
    this.itemId = itemUuid?.split(".")[3] ?? undefined;
    this.#baseFeat = this.actor.itemTypes.feat.find((i) => i.slug === slug);
    this.adept = this.actor.itemTypes.feat.find(
      (i) =>
        (i.slug === "implement-adept" || i.slug === "second-adept") &&
        i.rules.some(
          (r) => r.selection !== undefined && r.selection === this.baseFeat?._id
        )
    )
      ? true
      : false;
    this.paragon = this.actor.itemTypes.feat
      .find((i) => i.slug === "implement-paragon")
      ?.rules.some(
        (r) => r.selection !== undefined && r.selection === this.baseFeat?._id
      )
      ? true
      : false;
    this.intensify = this.actor.itemTypes.feat.some(
      (i) => i.slug === "intensify-vulnerability"
    )
      ? true
      : false;
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

  // 1/2/3 = initiate, adept, paragon.  Maybe archetype = 0?
  get rank() {
    return this.paragon ? 3 : this.adept ? 2 : 1;
  }

  get rollOptions() {
    return [`self:implement:${this.slug}:rank:${this.rank}`];
  }

  intensifyImplement() {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.intensifyImplement.invalid"
      )
    );
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
}

export { Implement };
