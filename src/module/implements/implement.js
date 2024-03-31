class Implement {
  #rules;

  constructor(slug, actor, rules, implementItem) {
    this.slug = slug;
    this.actor = actor;
    if (rules) this.#rules = rules;
    this.implementItem = implementItem;
  }

  intensifyImplement() {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-exploitVuln.notifications.warn.intensifyImplement.invalid"
      )
    );
  }

  async createEffectsOnItem(item) {
    console.log("createEffectsOnItem");
    const implement = await fromUuid(item);

    if (this.implementItem) this.deleteEffectsOnItem();

    const implementRules = implement.system?.rules ?? [];
    for (const rule of this.#rules) {
      implementRules.push(rule);
    }

    implement.update({ _id: implement._id, "system.rules": implementRules });
    this.implementItem = implement.uuid;
  }

  async deleteEffectsOnItem() {
    console.log("deleteEffectsOnItem");
    //if (!this.implementItem) return;

    const oldImplement = await fromUuid(this.implementItem);
    const oldImplementObj = oldImplement.toObject();

    for (const i in oldImplementObj.system.rules) {
      for (const r in this.#rules) {
        if (oldImplementObj.system.rules[i].label == this.#rules[r].label) {
          console.log(
            "deleting match: ",
            oldImplementObj.system.rules[i],
            this.#rules[r]
          );
          delete oldImplementObj.system.rules[i];
        }
      }
    }
    console.log("made it out");
    const newRules = oldImplementObj.system.rules.filter((r) => {
      return r !== undefined && r !== null;
    });

    console.log(newRules);

    await oldImplement.update({
      _id: oldImplement._id,
      "system.rules": newRules,
    });
  }
}

export { Implement };
