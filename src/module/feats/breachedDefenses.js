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

  //Fixes silly exceptions like the Adamantine Golem's "vorpal-adamantine" - However,
  //Adamantine Golem still doesn't work properly because Vorpal is a rune, and the
  //exception isn't fully implemented it appears.
  const splitExceptions = bypassable.exceptions.map((x) => {
    return x;
    //typeof x === "string" ? x.split("-").flat() : x;
  });

  //Complex exceptions (such as Magical Silver) are set up very differently from simple exceptions.
  //The exception needs to be coerced a little to be in a usable state.
  const predicate = new Array();
  for (let exception of splitExceptions) {
    if (exception.definition) {
      for (const instance of exception.definition) {
        if (typeof instance === "string") {
          const isplit = instance.split(":");
          predicate.push(isplit[isplit.length - 1]);
        } else {
          for (const subinstance of Object.values(instance).flat()) {
            const ssplit = subinstance.split(":");
            predicate.push(ssplit[ssplit.length - 1]);
          }
        }
      }
    }
  }

  const bypassables = predicate.length != 0 ? predicate : splitExceptions;

  const exception = (() => {
    const exceptionObject = { property: {} };
    for (const exception of bypassables) {
      for (const types in ADJUSTMENT_TYPES) {
        if (ADJUSTMENT_TYPES[types].data[exception]) {
          if (
            exceptionObject.property[ADJUSTMENT_TYPES[types].propLabel] ===
            undefined
          ) {
            exceptionObject.property[ADJUSTMENT_TYPES[types].propLabel] = [];
          }
          exceptionObject.property[ADJUSTMENT_TYPES[types].propLabel].push(
            exception
          );
        }
      }
    }
    return exceptionObject;
  })();

  if (!exception)
    return ui.notifications.error(`Don't know how to bypass ${bypassable}`);

  //We add all of the possible bypassable exceptions as rules. It shouldn't matter which applies
  //as long as the resistance is bypassed.
  for (const type in exception.property) {
    for (const exc of exception.property[type]) {
      const bypassRule = eff.system.rules.find(
        (rule) => rule.slug === `breached-defenses-${type}-${exc}`
      );
      if (!bypassRule) {
        eff.system.rules = [
          ...eff.system.rules,
          {
            definition: [{ or: ["item:type:weapon", "item:trait:unarmed"] }],
            key: "AdjustStrike",
            mode: "add",
            property: type,
            value: exc,
            slug: `breached-defenses-${type}-${exc}`,
            predicate: ["target:mark:exploit-vulnerability"],
          },
        ];
      } else {
        bypassRule.value = exc;
        bypassRule.property = type;
      }
    }
  }

  await sa.setFlag("pf2e-thaum-vuln", "EVValue", exception);

  return {
    exception: exception,
  };
}

export { createBreachedDefenses };
