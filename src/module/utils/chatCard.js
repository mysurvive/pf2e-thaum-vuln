import { SupportedActions } from "./index.js";
import { exploitVuln } from "../feats/exploit-vulnerability/exploitVulnerability.js";
import { shareWeakness } from "../feats/shareWeakness.js";
import { cursedEffigy } from "../feats/cursedEffigy.js";
import { twinWeakness } from "../feats/twinWeakness.js";

//Creates the button in the chat tile for actions and feats
async function createChatCardButton(message, html) {
  const actionOrigin = message.flags.pf2e?.origin;

  if (actionOrigin?.type === "action" || actionOrigin?.type === "feat") {
    const user = game.user;
    const speaker = message.actor;
    const action = await fromUuid(actionOrigin.uuid);
    if (SupportedActions.includes(action.slug)) {
      html = html.find(".message-content");
      const contentArea = html.find(".card-content");
      contentArea.append(
        $(
          `<button class='pf2e-ev-feature-btn' ${
            speaker.isOwner || user.isGM ? "" : 'style="visibility:hidden"'
          } title="Use Feature">${game.i18n.format(
            "pf2e-thaum-vuln.chatCard.use",
            { action: action.name }
          )}</button>`
        ).on({
          click: () => {
            executeAction(action);
          },
        })
      );
    }
  }
}

function executeAction(action) {
  switch (action.slug) {
    case "exploit-vulnerability":
      exploitVuln();
      break;
    case "share-weakness":
      shareWeakness();
      break;
    case "cursed-effigy":
      cursedEffigy();
      break;
    case "twin-weakness":
      twinWeakness();
      break;
    default:
      break;
  }
}

export { createChatCardButton };
