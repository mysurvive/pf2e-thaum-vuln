import { exploitVuln } from "./feats/exploit-vulnerability/exploitVulnerability.js";
import { shareWeakness } from "./feats/shareWeakness.js";
import { cursedEffigy } from "./feats/cursedEffigy.js";
import { twinWeakness } from "./feats/twinWeakness.js";
import { forceEVTarget } from "./utils/forceEV.js";
import { recallEsotericKnowledge } from "./actions/recallKnowledge.js";
import { rootToLife } from "./feats/rootToLife.js";
import { intensifyImplement } from "./implements/intensifyImplement.js";
import { constructChildImplement } from "./implements/impDict.js";
import {
  EXPLOIT_VULNERABILITY_DC_UUID,
  EXPLOIT_VULNERABILITY_DC_PWOL_UUID,
} from "./utils/index.js";
import { glimpseVulnerability } from "./feats/glimpseVulnerability.js";
import {
  hasFeat,
  isThaumaturge,
  getEsotericLoreSlugs,
} from "./utils/helpers.js";

Hooks.on("init", async () => {
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
    damageTypes: {
      propLabel: "damageTypes",
      data: CONFIG.PF2E.damageTypes,
    },
  };

  const libwrapperObj = game.modules.find((m) => m.id === "lib-wrapper");
  const socketlibObj = game.modules.find((m) => m.id === "socketlib");

  if (!libwrapperObj || !libwrapperObj.active) {
    ui.notifications.error(
      "Libwrapper is a required dependency, but it is currently not active. Please turn on Libwrapper to use PF2e Exploit Vulnerability."
    );
  }
  if (!socketlibObj || !socketlibObj.active) {
    ui.notifications.error(
      "socketlib is a required dependency, but it is currently not active. Please turn on socketlib to use PF2e Exploit Vulnerability."
    );
  }

  game.pf2eThaumVuln = {
    exploitVuln,
    shareWeakness,
    cursedEffigy,
    twinWeakness,
    forceEVTarget,
    recallEsotericKnowledge,
    rootToLife,
    intensifyImplement,
    glimpseVulnerability,
    ADJUSTMENTS: { ADJUSTMENT_TYPES },
  };

  loadTemplates([
    "modules/pf2e-thaum-vuln/templates/implementPartial.hbs",
    "modules/pf2e-thaum-vuln/templates/amuletsAbeyanceDialog.hbs",
  ]);

  /** Wraps the prepareDerivedData function on actors to add implement classes to the actor. */
  libWrapper.register(
    "pf2e-thaum-vuln",
    "CONFIG.PF2E.Actor.documentClasses.character.prototype.prepareDerivedData",
    function (wrapped, ...args) {
      if (isThaumaturge(this) || hasFeat(this, "thaumaturge-dedication")) {
        const selectedImplements = this.getFlag(
          "pf2e-thaum-vuln",
          "selectedImplements"
        );
        if (
          selectedImplements &&
          Object.keys(selectedImplements)?.length !== 0
        ) {
          const implementClasses = Object.fromEntries(
            Object.entries(selectedImplements).map(([k, imp]) => [
              k,
              constructChildImplement(k, this, imp.uuid),
            ])
          );
          this.attributes.implements = implementClasses;
          // Get options like "self:implement:tome:rank:2"
          for (const implement of Object.values(implementClasses)) {
            implement.rollOptions.forEach(
              (o) => (this.flags.pf2e.rollOptions.all[o] = true)
            );
          }
        }
      }

      const EV = this.itemTypes.feat.find(
        (f) => f.slug === "exploit-vulnerability"
      );
      if (EV) {
        this.rules.push(
          new game.pf2e.RuleElements.builtin.EphemeralEffect(
            {
              key: "EphemeralEffect",
              selectors: getEsotericLoreSlugs(),
              uuid: game.pf2e.settings.variants.pwol.enabled
                ? EXPLOIT_VULNERABILITY_DC_PWOL_UUID
                : EXPLOIT_VULNERABILITY_DC_UUID,
              alterations: [],
            },
            { parent: EV }
          )
        );
      }

      wrapped(...args);
    }
  );

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
  Handlebars.registerHelper("when", function (op1, operator, op2, opts) {
    const operators = {
        eq: function (l, r) {
          return l == r;
        },
        noteq: function (l, r) {
          return l != r;
        },
        gt: function (l, r) {
          return Number(l) > Number(r);
        },
        or: function (l, r) {
          return l || r;
        },
        and: function (l, r) {
          return l && r;
        },
        "%": function (l, r) {
          return l % r === 0;
        },
      },
      result = operators[operator](op1, op2);

    if (result) return opts.fn(this);
    else return opts.inverse(this);
  });

  //game settings
  game.settings.register("pf2e-thaum-vuln", "0150migration", {
    name: "0.15.0 migration",
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

  game.settings.register("pf2e-thaum-vuln", "esotericLoreCustomName", {
    name: game.i18n.format(
      "pf2e-thaum-vuln.settings.esotericLoreCustomName.name"
    ),
    hint: game.i18n.localize(
      "pf2e-thaum-vuln.settings.esotericLoreCustomName.hint"
    ),
    scope: "world",
    config: true,
    type: String,
    default: "",
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

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-amulet", {
    name: game.i18n.format("pf2e-thaum-vuln.settings.moduleHandles.amulet"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-chalice", {
    name: game.i18n.format("pf2e-thaum-vuln.settings.moduleHandles.chalice"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-lantern", {
    name: game.i18n.format("pf2e-thaum-vuln.settings.moduleHandles.lantern"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-regalia", {
    name: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.regalia"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-tome", {
    name: game.i18n.format("pf2e-thaum-vuln.settings.moduleHandles.tome"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "moduleHandles-weapon", {
    name: game.i18n.format("pf2e-thaum-vuln.settings.moduleHandles.weapon"),
    hint: game.i18n.localize("pf2e-thaum-vuln.settings.moduleHandles.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });
});
