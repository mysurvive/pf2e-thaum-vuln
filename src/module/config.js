import { exploitVuln } from "./feats/exploit-vulnerability/exploitVulnerability.js";
import { shareWeakness } from "./feats/shareWeakness.js";
import { cursedEffigy } from "./feats/cursedEffigy.js";
import { twinWeakness } from "./feats/twinWeakness.js";
import { forceEVTarget } from "./utils/forceEV.js";

Hooks.on("init", async () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    shareWeakness,
    cursedEffigy,
    twinWeakness,
    forceEVTarget,
  };

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
});
