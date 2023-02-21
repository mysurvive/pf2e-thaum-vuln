import { exploitVuln, forceEVTarget } from "./exploit-vulnerability.js";

Hooks.on("init", () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    forceEVTarget,
  };
  libWrapper.register(
    "pf2e-thaum-vuln",
    "game.pf2e.actions.restForTheNight",
    function (wrapper, ...args) {
      const a = args[0].actors[0];
      a.unsetFlag("pf2e-thaum-vuln", "EWImmuneTargs");
      wrapper(args);
    },
    "WRAPPER"
  );
});
