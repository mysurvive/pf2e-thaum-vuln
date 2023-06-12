async function createBreachedDefenses(sa, eff, bypassable) {
  const ADJUSTMENT_TYPES = {
    materials: {
      propLabel: "materials",
      data: CONFIG.PF2E.preciousMaterials,
    },
    traits: {
      propLabel: "traits",
      data: CONFIG.PF2E.damageTraits,
    },
    "weapon-traits": {
      propLabel: "weapon-traits",
      data: CONFIG.PF2E.weaponTraits,
    },
    "property-runes": {
      propLabel: "property-runes",
      data: CONFIG.PF2E.runes.weapon.property,
    },
  };

  const evMode = "breached-defenses";
  const effPredicate = [
    `target:effect:${game.pf2e.system.sluggify(
      "Breached Defenses Target" + sa.name
    )}`,
  ];
  const effRuleSlug = "breached-defenses-bypass";

  //force ghost touch property rune on things that are immune to it
  if (bypassable.exceptions.includes("ghost-touch")) {
    bypassable.exceptions[0] = "ghostTouch";
  }

  const exception = (() => {
    for (const types in ADJUSTMENT_TYPES) {
      if (
        Object.hasOwn(ADJUSTMENT_TYPES[types].data, bypassable.exceptions[0])
      ) {
        return {
          property: ADJUSTMENT_TYPES[types].propLabel,
          exception: bypassable.exceptions[0],
        };
      }
    }
  })();
  eff.system.rules.find(
    (rules) => rules.slug === "breached-defenses-bypass"
  ).value = exception?.exception;
  eff.system.rules.find(
    (rules) => rules.slug === "breached-defenses-bypass"
  ).property = exception?.property;
  eff.system.rules.find(
    (rules) => rules.slug === "breached-defenses-bypass"
  ).predicate = `target:effect:${game.pf2e.system.sluggify(
    "Breached Defenses Target" + sa.name
  )}`;
  await sa.setFlag("pf2e-thaum-vuln", "EVValue", exception?.exception);

  return {
    evMode: evMode,
    effPredicate: effPredicate,
    effRuleSlug: effRuleSlug,
  };
}

export { createBreachedDefenses };
