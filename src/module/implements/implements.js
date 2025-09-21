import { checkImplements, checkFeatValidity } from "./helpers";
import { parseHTML } from "../utils/utils.js";

export async function manageImplements(event) {
  const a = event?.data.actor ?? event;
  if (checkFeatValidity(a) === false) {
    return ui.notifications.error(
      "There was an error managing implements. Press f12 to check the console for details."
    );
  }

  // Ensure actor flag is up-to-date w.r.t. implement class features and inventory
  // If it changes, actor.attributes.implements should refresh
  await checkImplements(a);

  const passImps = {};
  for (const imp of Object.values(a.attributes.implements)) {
    passImps[imp.slug] = {
      counter: ["First", "Second", "Third"][imp.counter - 1] ?? "Unknown",
      name: imp.name,
      slug: imp.slug,
      uuid: imp.item?.uuid,
      image: imp.item?.img,
      trueName: imp.item?.name,
      flavor: new Handlebars.SafeString(imp.baseFeat?.description), // This doesn't work for dedication
    };
  }

  const dg = new Dialog(
    {
      title: game.i18n.localize(
        "pf2e-thaum-vuln.manageImplements.dialog.header"
      ),
      content: parseHTML(
        await foundry.applications.handlebars.renderTemplate(
          "modules/pf2e-thaum-vuln/templates/manageImplements.hbs",
          { implements: passImps }
        )
      ),
      buttons: {
        complete: {
          label: game.i18n.localize(
            "pf2e-thaum-vuln.manageImplements.dialog.confirmButton"
          ),
          callback: async (dgEndContent) => {
            const imps =
              a.getFlag("pf2e-thaum-vuln", "selectedImplements") ?? {};

            const impDelta = {};
            for (const [slug, uuid] of Object.entries(
              confirmImplements(dgEndContent)
            )) {
              const changed = imps[slug]?.uuid !== uuid;
              if (changed) {
                (imps[slug] ??= {}).uuid = uuid;
              }
              console.log(`${slug} changed: ${changed}`);
              impDelta[slug] = changed;
            }

            await a.setFlag("pf2e-thaum-vuln", "selectedImplements", imps);

            //refreshes the sheet so the implement items appear
            a.sheet._render(true);
            Hooks.call("createImplementEffects", a, impDelta, imps);
          },
        },
        cancel: {
          label: game.i18n.localize(
            "pf2e-thaum-vuln.manageImplements.dialog.cancelButton"
          ),
          callback: () => {
            return;
          },
        },
      },
      default: "complete",
      render: (html) => {
        const dd = new foundry.applications.ux.DragDrop.implementation({
          dropSelector: ".dropbox",
          callbacks: { drop: handleDrop },
        });
        dd.bind(html[0]);
      },
      close: () => {},
    },
    a
  );
  dg.render(true, { width: "auto" });
}

async function handleDrop(event) {
  //borrowed from the PF2e actor sheet
  var _a;
  const dataString =
      null === (_a = event.dataTransfer) || void 0 === _a
        ? void 0
        : _a.getData("text/plain"),
    dropData = (() => {
      try {
        return JSON.parse(null != dataString ? dataString : "");
      } catch (_a) {
        return null;
      }
    })();

  //creates an object from the uuid of the item dropped
  const chosenItem = await fromUuid(dropData.uuid);

  // Should check if it's an inventory item on the correct actor

  // gets the span for the item, which is inside the drop area div somewhere
  const itemSpan = event.currentTarget.querySelector("[data-item-uuid]");

  itemSpan.dataset.itemUuid = dropData.uuid;
  itemSpan.querySelector("img").src = chosenItem.img;
  itemSpan.querySelector("#implementLabel").textContent = chosenItem.name;
}

function confirmImplements(dgEndContent) {
  let uuidCollection = {};
  const itemUuids = $(dgEndContent).find(".item-content-wrapper");
  itemUuids.each(function () {
    if (this.dataset.itemUuid !== undefined && this.dataset.itemUuid !== "") {
      uuidCollection[this.dataset.implementSlug] = this.dataset.itemUuid;
    }
  });
  return uuidCollection;
}

export async function clearImplements(event) {
  const a = event.data.actor;
  await Hooks.callAll("deleteImplementEffects", a);
  // Refresh flags, but clear all item choices
  await checkImplements(a, { clear: true });
}
