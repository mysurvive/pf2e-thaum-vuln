import { createRKDialog } from "../socket";
function recallEsotericKnowledge() {
  const sa = canvas.tokens.controlled[0].actor;
  const targ = game.user.targets.first();
  const skill =
    sa.skills["esoteric-lore"] ??
    sa.skills["esoteric"] ??
    sa.skills["lore-esoteric"];
  if (!skill) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.exploitVulnerability.noEsotericLoreSkill"
      )
    );
  }
  createRKDialog(sa, targ);
  ui.notifications.info(
    game.i18n.localize(
      "pf2e-thaum-vuln.notifications.info.recallKnowledge.requestSent"
    )
  );
}

export { recallEsotericKnowledge };
