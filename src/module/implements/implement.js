class Implement {
  #rules;

  constructor(slug, actor, rules, implementItem) {
    this.slug = slug;
    this.actor = actor;
    if (rules) this.#rules = rules;
    this.implementItem = implementItem;
  }

  get implementItem() {
    return this.implementItem;
  }

  set implementItem(item) {
    this.implementItem = item;
  }

  intensifyImplement() {}

  createEffectsOnItem(item) {
    const implement = item;

    this.deleteEffectsOnItem();

    const implementRules = implement.system.rules;
    for (const rule in this.#rules) {
      implementRules.push(rule);
    }

    implement.update({ _id: implement._id, "system.rules": implementRules });
    this.implementItem(implement);
  }

  deleteEffectsOnItem() {
    const oldImplement = this.implementItem;

    for (const i in oldImplement.system.rules) {
      for (const r in this.rules) {
        if (oldImplement.system.rules[i] == this.rules[r])
          delete oldImplement.system.rules[i];
      }
    }
  }
}

export { Implement };
