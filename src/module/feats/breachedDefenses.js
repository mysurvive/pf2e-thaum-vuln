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
  if (!exception)
    return ui.notifications.error(`Don't know how to bypass ${bypassable}`);

  const bypassRule = eff.system.rules.find(
    (rule) => rule.slug === "breached-defenses-bypass"
  );
  bypassRule.value = exception.exception;
  bypassRule.property = exception.property;
  await sa.setFlag("pf2e-thaum-vuln", "EVValue", exception.exception);

  return {
    exception: exception,
  };
}

export { createBreachedDefenses };
