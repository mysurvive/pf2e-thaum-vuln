import { implementData } from ".";
import { checkImplements, checkFeatValidity } from "./helpers";
import { parseHTML } from "../utils/utils.js";

export async function manageImplements(event) {
  const a = event?.data.actor ?? event;
  if (checkFeatValidity(a) === false) {
    return ui.notifications.error(
      "There was an error managing implements. Press f12 to check the console for details."
    );
  }
  checkImplements(a);
  const selectedImplements = a.getFlag("pf2e-thaum-vuln", "selectedImplements");
  let passSelectedImplements = {};

  for (const key of selectedImplements.keys()) {
    if (selectedImplements[key]) {
      const impUuid = selectedImplements[key]?.uuid ?? undefined;
      let imp;
      if (impUuid) imp = await fromUuid(impUuid);
      const impImgPath = imp?.img ?? undefined;
      const impTrueName = imp?.name ?? undefined;
      passSelectedImplements = {
        ...passSelectedImplements,
        [selectedImplements[key].name]: {
          image: impImgPath,
          trueName: impTrueName,
        },
      };
    }
  }

  const imps = [];
  if (a.items.some((i) => i.slug === "first-implement-and-esoterica")) {
    const firstImplement = a.items.find(
      (i) => i.slug === "first-implement-and-esoterica"
    );
    const imp = await fromUuid(
      `${a.uuid}.Item.${firstImplement.rules[1].grantedId}`
    );
    imps.push({
      counter: "First",
      name: imp.name,
      adept: false,
      paragon: false,
      intensify: false,
      uuid:
        a.getFlag("pf2e-thaum-vuln", "selectedImplements")[0]?.uuid ??
        undefined,
    });
  }
  if (a.items.some((i) => i.slug === "second-implement")) {
    const secondImplement = a.items.find((i) => i.slug === "second-implement");
    const imp = await fromUuid(
      `${a.uuid}.Item.${secondImplement.rules[1].grantedId}`
    );
    imps.push({
      counter: "Second",
      name: imp.name,
      adept: false,
      paragon: false,
      intensify: false,
      uuid:
        a.getFlag("pf2e-thaum-vuln", "selectedImplements")[1]?.uuid ??
        undefined,
    });
  }
  if (a.items.some((i) => i.slug === "third-implement")) {
    const thirdImplement = a.items.find((i) => i.slug === "third-implement");
    const imp = await fromUuid(
      `${a.uuid}.Item.${thirdImplement.rules[1].grantedId}`
    );
    imps.push({
      counter: "Third",
      name: imp.name,
      adept: false,
      paragon: false,
      intensify: false,
      uuid:
        a.getFlag("pf2e-thaum-vuln", "selectedImplements")[2]?.uuid ??
        undefined,
    });
  }

  for (let imp of imps) {
    if (a.items.some((i) => i.slug === "intensify-vulnerability")) {
      imp.intensify = true;
    }
    if (a.items.some((i) => i.slug === "implement-adept")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "implement-adept").rules[0].selection
      ) {
        imp.adept = true;
      }
    }
    if (a.items.some((i) => i.slug === "second-adept")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "second-adept").rules[0].selection
      ) {
        imp.adept = true;
      }
    }
    if (a.items.some((i) => i.slug === "implement-paragon")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "implement-paragon").rules[0].selection
      ) {
        imp.paragon = true;
      }
    }
  }

  const impFlavor = getImplementFlavor(imps, a);

  let implementUuids;
  const passImps = {
    implements: imps,
    impFlavor: impFlavor,
    selectedImplements: passSelectedImplements,
  };

  const dg = new Dialog(
    {
      title: "Manage Implemenets",
      content: parseHTML(
        await renderTemplate(
          "modules/pf2e-thaum-vuln/templates/manageImplements.hbs",
          passImps
        )
      ),
      buttons: {
        complete: {
          label: "Confirm Changes",
          callback: (dgEndContent) => {
            const origin = a.getFlag("pf2e-thaum-vuln", "selectedImplements");

            implementUuids = confirmImplements(dgEndContent);

            for (const key of imps.keys()) {
              imps[key].uuid = implementUuids[key];
            }

            const impDelta = [];
            for (const i of origin.keys()) {
              const changed =
                origin[i]?.uuid != implementUuids[i] ? true : false;
              impDelta.push({ name: origin[i]?.name, changed: changed });
            }

            a.setFlag("pf2e-thaum-vuln", "selectedImplements", imps);

            //refreshes the sheet so the implement items appear
            a.sheet._render(true);
            Hooks.callAll(
              "createImplementEffects",
              game.user.id,
              a,
              impDelta,
              imps
            );
          },
        },
        cancel: {
          label: "Cancel Changes",
          callback: () => {
            return;
          },
        },
      },
      default: "complete",
      render: () => {
        const dd = new DragDrop({
          dragSelector: ".item",
          dropSelector: ".dropbox, .item-content-wrapper",
          callbacks: { drop: handleDrop },
        });
        dd.bind(document.getElementById(`First`));
        if (document.getElementById(`Second`))
          dd.bind(document.getElementById(`Second`));
        if (document.getElementById(`Third`))
          dd.bind(document.getElementById(`Third`));
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
  const dropFieldText = $(event.currentTarget);
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

  //gets the area where we will create the information
  const newDropFieldContent = $(
    document.getElementById(`${$(dropFieldText).attr("id")}-drop-item-content`)
  );

  $(newDropFieldContent).attr("item-uuid", dropData.uuid);

  //adds the image of the item to the area
  $(dropFieldText).find("img").attr("src", chosenItem.img);

  //creates another span that will hold the name of the item
  $(dropFieldText).find("#implementLabel").text(chosenItem.name);

  return chosenItem;
}

function confirmImplements(dgEndContent) {
  let uuidCollection = new Array();
  const itemUuids = $(dgEndContent).find(".item-content-wrapper");
  $(itemUuids).each(function () {
    if ($(this).attr("item-uuid") !== undefined)
      uuidCollection.push($(this).attr("item-uuid"));
  });
  return uuidCollection;
}

function getImplementFlavor(imps, a) {
  let impFlavor = {};
  for (const imp of imps) {
    const implementFeat = a.items.find((i) => i.name === imp.name);
    impFlavor = {
      ...impFlavor,
      [imp.name]: {
        flavor: implementFeat.description,
      },
    };
    if (imp.adept === true) {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
      };
    }
    if (imp.paragon === true) {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
      };
    }
    if (imp.intensify === true) {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
      };
    }
  }

  return impFlavor;
}

export async function clearImplements(event) {
  const a = event.data.actor;
  await a.unsetFlag("pf2e-thaum-vuln", "selectedImplements");
}
