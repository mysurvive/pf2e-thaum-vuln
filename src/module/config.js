import { exploitVuln, forceEVTarget } from "./exploit-vulnerability.js";

Hooks.on("init", () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    forceEVTarget,
  };
});
