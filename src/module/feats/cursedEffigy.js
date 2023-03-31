import { createEffectOnTarget } from "../socket";
import { CURSED_EFFIGY_UUID } from "../utils/index.js";

async function cursedEffigy() {
  const t = Array.from(game.user.targets);
  const a = canvas.tokens.controlled[0].actor;
  const hasCursedEffigy = a.items.some((i) => i.slug === "cursed-effigy");

  if (t.length != 1) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.cursedEffigy.invalidTarget"
      )
    );
  }
  if (!hasCursedEffigy) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.cursedEffigy.noAbility"
      )
    );
  }
  createEffectOnTarget(a, await fromUuid(CURSED_EFFIGY_UUID), [
    t[0].actor.uuid,
  ]);
}

export { cursedEffigy };
