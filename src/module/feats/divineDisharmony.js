// Create a new action for Divine Disharmony

Hooks.once("init", () => {
  const climb = game.pf2e.actions.get("climb");
  const SingleCheckAction = Object.getPrototypeOf(climb).constructor;
  const SingleCheckActionVariant = Object.getPrototypeOf(
    game.pf2e.actions.get("climb").toActionVariant()
  ).constructor;

  class DivineDisharmonyActionVariant extends SingleCheckActionVariant {
    get statistic() {
      return ""; // Default to highest modifier, rather than 1st in list of allowed modifiers
    }

    checkContext(opts, data) {
      if (!data.slug) {
        // Get highest modifier if none was specified
        const highest = super.statistic
          .map((slug) => {
            const statistic = opts.actor.getStatistic(slug);
            const rollOptions = opts.buildContext({
              actor: opts.actor,
              rollOptions: [
                ...data.rollOptions,
                `action:divine-disharmony:${statistic.slug}`,
              ],
              target: opts.target,
            }).rollOptions;
            return new game.pf2e.StatisticModifier(
              statistic.slug,
              statistic.modifiers.concat(data.modifiers ?? []),
              rollOptions
            );
          })
          .reduce((highest, current) =>
            current.totalModifier > highest.totalModifier ? current : highest
          );
        data.slug = highest.slug;
      }

      return super.checkContext(opts, {
        ...data,
        rollOptions: [
          ...data.rollOptions,
          `action:divine-disharmony:${data.slug}`,
        ],
      });
    }
  }

  class DivineDisharmonyAction extends SingleCheckAction {
    constructor() {
      super({
        cost: 1,
        description: "pf2e-thaum-vuln.divineDisharmony.flavor",
        name: "pf2e-thaum-vuln.divineDisharmony.name",
        img: "systems/pf2e/icons/equipment/treasure/art-objects/major-art-object/solidified-moment-of-time.webp",
        notes: [
          {
            outcome: ["criticalSuccess"],
            text: "pf2e-thaum-vuln.divineDisharmony.degreeOfSuccess.criticalSuccess",
          },
          {
            outcome: ["success"],
            text: "pf2e-thaum-vuln.divineDisharmony.degreeOfSuccess.success",
          },
        ],
        rollOptions: ["action:divine-disharmony"],
        slug: "divine-disharmony",
        difficultyClass: "will",
        statistic: ["intimidation", "deception"],
        traits: [
          "divine",
          "enchantment",
          "esoterica",
          "manipulate",
          "thaumaturge",
        ],
      });
    }

    toActionVariant(data) {
      return new DivineDisharmonyActionVariant(this, data);
    }
  }

  const action = new DivineDisharmonyAction();
  game.pf2e.actions.set(action.slug, action);
});
