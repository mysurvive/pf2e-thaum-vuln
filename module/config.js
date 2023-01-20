import { exploitVulnerability } from "./exploit-vulnerability.js"

Hooks.on(
	"init",
	() => {
		game.pf2eThaumVuln = {
			exploitVulnerability
		};
	}
);