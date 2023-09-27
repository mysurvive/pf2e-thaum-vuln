import { exploitVuln } from "./feats/exploit-vulnerability/exploitVulnerability.js";
import { shareWeakness } from "./feats/shareWeakness.js";
import { cursedEffigy } from "./feats/cursedEffigy.js";
import { twinWeakness } from "./feats/twinWeakness.js";
import { forceEVTarget } from "./utils/forceEV.js";
import { recallEsotericKnowledge } from "./actions/recallKnowledge.js";
import { amuletIntensify } from "./implements/implementBenefits/amulet.js";
import { tomeIntensify } from "./implements/implementBenefits/tome.js";

Hooks.on("init", async () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    shareWeakness,
    cursedEffigy,
    twinWeakness,
    forceEVTarget,
    recallEsotericKnowledge,
    amuletIntensify,
    tomeIntensify,
  };

  loadTemplates([
    "modules/pf2e-thaum-vuln/templates/implementPartial.hbs",
    "modules/pf2e-thaum-vuln/templates/implementSelectedPartial.hbs",
    "modules/pf2e-thaum-vuln/templates/amuletsAbeyanceDialog.hbs",
  ]);
  Handlebars.registerHelper("element", (object, element, selection) => {
    if (object[element] === undefined) return undefined;
    if (object[element][selection] === undefined) return undefined;
    return new Handlebars.SafeString(object[element][selection]);
  });

  //game settings
  game.settings.register("pf2e-thaum-vuln", "useEVAutomation", {
    name: game.i18n.localize("pf2e-thaum-vuln.settings.EVAutomation.name"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.EVAutomation.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "mystifyNumbers", {
    name: game.i18n.localize("pf2e-thaum-vuln.settings.mystifyNumbers.name"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.mystifyNumbers.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "esotericLoreModifier", {
    name: game.i18n.localize(
      "pf2e-thaum-vuln.settings.esotericLoreModifier.name"
    ),
    hint: game.i18n.localize(
      "pf2e-thaum-vuln.settings.esotericLoreModifier.hint"
    ),
    scope: "world",
    config: true,
    type: Number,
    default: 0,
  });

  game.settings.register("pf2e-thaum-vuln", "enforceHeldImplement", {
    name: "Enforce Held Implement",
    hint: "Enforces the rule that an implement must be held to use Exploit Vulnerability.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "dailiesHandlesTome", {
    name: "PF2e Dailies Handles Tome",
    hint: "Allow PF2e Dailies to handle daily Tome implement skill choices. (https://github.com/reonZ/pf2e-dailies)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet", {
    name: "PF2e Reaction Checker Handles Amulet",
    hint: "Allow PF2e Reaction Checker to handle Amulet's Abeyance. (https://github.com/reyzor1991/foundry-vtt-pf2e-reaction/)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });
});
