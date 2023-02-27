import { exploitVuln, forceEVTarget } from "./exploit-vulnerability.js";

Hooks.on("init", () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    forceEVTarget,
  };

  //game settings
  game.settings.register("pf2e-thaum-vuln", "useEVAutomation", {
    name: "Use Exploit Vulnerability Automation",
    hint: "If true, the module will automatically mark all valid targets for Mortal Weakness, Sympathetic Vulnerabilities, etc. on the current scene. Set to false if you would like to manually update targets using the forceEV macro. You may want to turn this off if you apply the Exploit Vulnerability effects differently than described RAW.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      !value;
    },
  });

  game.settings.register("pf2e-thaum-vuln", "mystifyNumbers", {
    name: "Mystify IWR Values",
    hint: "If true, results in the dialog box when exploiting a vulnerability will not appear - only showing the type of damage.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      !value;
    },
  });
});
