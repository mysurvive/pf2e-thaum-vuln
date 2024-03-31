import { exploitVuln } from "./feats/exploit-vulnerability/exploitVulnerability.js";
import { shareWeakness } from "./feats/shareWeakness.js";
import { cursedEffigy } from "./feats/cursedEffigy.js";
import { twinWeakness } from "./feats/twinWeakness.js";
import { forceEVTarget } from "./utils/forceEV.js";
import { recallEsotericKnowledge } from "./actions/recallKnowledge.js";
import { amuletIntensify } from "./implements/implementBenefits/amulet.js";
import { intensifyImplement } from "./implements/intensifyImplement.js";
import { rootToLife } from "./feats/rootToLife.js";
import { lanternIntensify } from "./implements/implementBenefits/lantern.js";

Hooks.on("init", async () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    shareWeakness,
    cursedEffigy,
    twinWeakness,
    forceEVTarget,
    recallEsotericKnowledge,
    amuletIntensify,
    rootToLife,
    lanternIntensify,
    intensifyImplement,
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
  Handlebars.registerHelper("ifCond", function (v1, v2, options) {
    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifNCond", function (v1, v2, options) {
    if (v1 !== v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("removeFromArray", function (v1, v2, options) {
    if (v1.includes(v2)) {
      const newArray = v1.splice(v1.indexOf(v2), 1);
      if (v1.length > 0) return options.fn(newArray);
      else return options.inverse(newArray);
    }
    if (v1.length > 0) return options.fn(this);
    else return options.inverse(this);
  });

  //game settings
  game.settings.register("pf2e-thaum-vuln", "0124migration", {
    name: "0.12.4 migration",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

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
    name: game.i18n.localize(
      "pf2e-thaum-vuln.settings.enforceHeldImplement.name"
    ),
    hint: game.i18n.localize(
      "pf2e-thaum-vuln.settings.enforceHeldImplement.hint"
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "dailiesHandlesTome", {
    name: game.i18n.localize(
      "pf2e-thaum-vuln.settings.dailiesHandlesTome.name"
    ),
    hint: game.i18n.localize(
      "pf2e-thaum-vuln.settings.dailiesHandlesTome.hint"
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet", {
    name: game.i18n.localize(
      "pf2e-thaum-vuln.settings.reactionCheckerHandlesAmulet.name"
    ),
    hint: game.i18n.localize(
      "pf2e-thaum-vuln.settings.reactionCheckerHandlesAmulet.hint"
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });
});
