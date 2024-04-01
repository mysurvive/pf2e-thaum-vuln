class Implement {
  constructor(slug, actor, rules, implementItem) {
    this.slug = slug;
    this.actor = actor;
    if (rules) this.rules = rules;
    this.implementItem = implementItem;
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

    if (this.implementItem) this.deleteEffectsOnItem();

    const implementRules = implement.system?.rules ?? [];
    for (const rule of this.rules) {
      implementRules.push(rule);
    }

    implement.update({ _id: implement._id, "system.rules": implementRules });
    this.implementItem = implement.uuid;
  }

  async deleteEffectsOnItem() {
    const oldImplement = await fromUuid(this.implementItem);
    const oldImplementObj = oldImplement.toObject();

    for (const i in oldImplementObj.system.rules) {
      for (const r in this.rules) {
        if (oldImplementObj.system.rules[i]?.label == this.rules[r]?.label) {
          delete oldImplementObj.system.rules[i];
        }
      }
    }
    const newRules = oldImplementObj.system.rules.filter((r) => {
      return r !== undefined && r !== null;
    });

    await oldImplement.update({
      _id: oldImplement._id,
      "system.rules": newRules,
    });
  }
}

export { Implement };
