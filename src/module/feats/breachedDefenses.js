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
      data: { "ghost-touch": "ghostTouch", vorpal: "vorpal" },
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
    bypassable.exceptions[0] = "ghost-touch";
  }

  const exception = (() => {
    for (const exception of bypassable.exceptions) {
      for (const types in ADJUSTMENT_TYPES) {
        if (ADJUSTMENT_TYPES[types].data[exception]) {
          return {
            property: ADJUSTMENT_TYPES[types].propLabel,
            exception: exception,
          };
        }
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
    exception: exception,
  };
}

export { createBreachedDefenses };
