import { getSVTargets } from "../feats/sympatheticVulnerabilities";
import {
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
} from ".";
import { BDGreatestBypassableResistance } from "../utils";
import { createEffectOnTarget, ubiquitousWeakness } from "../socket";
import { getIWR } from "../utils";
import { createEsotericWarden } from "../feats/esotericWarden";

function getMWTargets(t) {
  let targs = new Array();
  for (let token of canvas.tokens.objects.children) {
    if (token?.actor?.name === t.actor.name) {
      targs.push(token.actor.uuid);
    }
  }
  return targs;
}

//Creates the passed effect document on the actor
async function createEffectOnActor(sa, t, effect, rollDOS) {
  let eff = effect.toObject();
  let evMode;
  let EWPredicate;
  let effRuleSlug;
  let effPredicate;
  let effSlug;
  const useEVAutomation = game.settings.get(
    "pf2e-thaum-vuln",
    "useEVAutomation"
  );
  const hasEsotericWarden = sa.items.some((i) => i.slug === "esoteric-warden");
  const hasUbiquitousWeakness = sa.items.some(
    (i) => i.slug === "ubiquitous-weakness"
  );
  const hasSympatheticVulnerabilities = sa.items.some(
    (i) => i.slug === "sympathetic-vulnerabilities"
  );
  let evTargets = new Array();
  if (eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    EWPredicate = "mortal-weakness-target";
    if (getIWR(t).weaknesses.length === 0) {
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.mortalWeakness.noWeakness"
        )
      );
    }
    if (useEVAutomation) {
      evTargets = getMWTargets(t);
      if (hasSympatheticVulnerabilities) {
        evTargets = evTargets.concat(getSVTargets(t, eff));
      }
    }
    effPredicate = `target:effect:Mortal Weakness Target ${sa.name}`.slugify();
    effRuleSlug = "mortal-weakness-effect-magical";
    effSlug = "exploit-mortal-weakness";

    evMode = "mortal-weakness";
  } else if (eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
    if (hasSympatheticVulnerabilities && useEVAutomation) {
      evTargets = evTargets.concat(getSVTargets(t, eff));
    }
    EWPredicate = "personal-antithesis-target";
    effPredicate =
      `target:effect:Personal Antithesis Target ${sa.name}`.slugify();
    effRuleSlug = "personal-antithesis-effect-magical";
    evMode = "personal-antithesis";

    //breached defenses logic. It mostly works.... there are a few weird cases where it doesn't work such as when the highest
    //resistance that can be bypassed is a combination of two traits (see adamantine golem's resistance bypass from vorpal-adamantine)
    //or if the trait that bypasses it is not in the system/on my list
  } else if (eff.flags.core.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) {
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

    evMode = "breached-defenses";
    effPredicate = [
      `target:effect:Breached Defenses Target ${sa.name}`.slugify(),
    ];
    effRuleSlug = "breached-defenses-bypass";
    const bypassable = BDGreatestBypassableResistance(t);

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
    ).predicate = `target:effect:Breached Defenses Target ${sa.name}`.slugify();
    await sa.setFlag("pf2e-thaum-vuln", "EVValue", exception?.exception);
  }

  if (hasEsotericWarden && rollDOS > 1) {
    createEsotericWarden(rollDOS, EWPredicate, sa, t);
  }

  eff.slug = effSlug;
  eff.system.rules.find((rules) => rules.slug === effRuleSlug).predicate =
    effPredicate;
  if (!evTargets.includes(t.actor.uuid)) {
    evTargets.push(t.actor.uuid);
  }
  //makes sure we don't have duplicates in the target array
  evTargets = [...new Set(evTargets)];
  createEffectOnTarget(sa, t, effect, evTargets);

  await sa.setFlag("pf2e-thaum-vuln", "activeEV", true);
  await sa.setFlag("pf2e-thaum-vuln", "EVTargetID", evTargets);
  await sa.setFlag("pf2e-thaum-vuln", "EVMode", `${evMode}`);

  await sa.createEmbeddedDocuments("Item", [eff]);
  if (hasUbiquitousWeakness && evMode === "mortal-weakness") {
    let dg = new Dialog({
      title: game.i18n.localize("pf2e-thaum-vuln.ubiquitousWeakness.name"),
      content: () =>
        `<p>${game.i18n.localize(
          "pf2e-thaum-vuln.ubiquitousWeakness.flavor"
        )} <br><br>${game.i18n.localize(
          "pf2e-thaum-vuln.ubiquitousWeakness.prompt"
        )} </p>`,
      buttons: {
        yes: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.yes"),
          callback: () => {
            ubiquitousWeakness(eff);
          },
        },
        no: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.no"),
          callback: () => {
            return;
          },
        },
      },
      default: "yes",
      render: () => {},
      close: () => {},
    });
    await dg.render(true);
  }
}

export { getMWTargets, createEffectOnActor };
