import { ESOTERIC_WARDEN_EFFECT_UUID } from "../utils/index.js";
import { createEffectData } from "../utils/helpers.js";
import { sharedWardingDialog } from "./sharedWarding.js";

async function createEsotericWarden(rollDOS, EWPredicate, sa, t) {
  const hasSharedWarding = sa.items.some((i) => i.slug === "shared-warding");

  const EWEffect = await createEffectData(ESOTERIC_WARDEN_EFFECT_UUID);
  const bonus = rollDOS === 3 ? 2 : rollDOS === 2 ? 1 : 0;
  EWEffect.system.rules[0].value = bonus;
  EWEffect.system.rules[1].value = bonus;

  //makes sure a player can't use Esoteric Warden on the same creature twice
  if (!sa.getFlag("pf2e-thaum-vuln", "EWImmuneTargs")?.includes(t.actor.uuid)) {
    await sa.createEmbeddedDocuments("Item", [EWEffect]);

    if (hasSharedWarding) {
      sharedWardingDialog(EWEffect);
    }
  }

  let EWImmuneTargs = new Array();
  EWImmuneTargs = EWImmuneTargs.concat(
    sa.getFlag("pf2e-thaum-vuln", "EWImmuneTargs")
  );
  if (!EWImmuneTargs.some((i) => i === t.actor.uuid)) {
    EWImmuneTargs.push(t.actor.uuid);
  }

  await sa.setFlag("pf2e-thaum-vuln", "EWImmuneTargs", EWImmuneTargs);
}

//removes the corresponding option from Esoteric Warden. If the thaum is targeted with
//a strike, they lose the AC bonus. If they are targeted with a save, they lose the save
//bonus
async function removeEWOption(EWEffect, t, choice) {
  const tKey = EWEffect._id;
  const EWRule1 = EWEffect.system.rules[0];
  const EWRule2 = EWEffect.system.rules[1];
  let updates = {
    _id: tKey,
    system: {
      rules: [
        {
          key: EWRule1.key,
          selector: EWRule1.selector,
          value: EWRule1.value,
          type: EWRule1.type,
          slug: EWRule1.slug,
          predicate: EWRule1.predicate,
        },
        {
          key: EWRule2.key,
          selector: EWRule2.selector,
          value: EWRule2.value,
          type: EWRule2.type,
          slug: EWRule2.slug,
          predicate: EWRule2.predicate,
        },
      ],
    },
  };
  if (choice === "ac" && EWEffect.system.rules[0].value != 0) {
    updates.system.rules[0].value = 0;
  } else if (choice === "save" && EWEffect.system.rules[1].value != 0) {
    updates.system.rules[1].value = 0;
  }
  if (
    updates.system.rules[0].value === 0 &&
    updates.system.rules[1].value === 0
  ) {
    EWEffect.delete();
  } else {
    if (t.actor) {
      t = t.actor;
    }

    await t.updateEmbeddedDocuments("Item", [updates]);
  }
}

export { removeEWOption, createEsotericWarden };
