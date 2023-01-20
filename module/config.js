import { exploitVulnerability } from "./explot-vulnerability.js"

Hooks.on(
	"init",
	() => {
		game.pf2eThaumVuln = {
			exploitVulnerability
		};
	}
);