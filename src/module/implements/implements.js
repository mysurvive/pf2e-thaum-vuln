import { implementData } from ".";
import { createImpEffect, deleteImpEffect } from "./helpers";
import { parseHTML } from "../utils/utils.js";

export async function manageImplements(event) {
  const a = event.data.actor;
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
      adept: "false",
      paragon: "false",
      intensify: "false",
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
      adept: "false",
      paragon: "false",
      intensify: "false",
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
      adept: "false",
      paragon: "false",
      intensify: "false",
      uuid:
        a.getFlag("pf2e-thaum-vuln", "selectedImplements")[2]?.uuid ??
        undefined,
    });
  }

  for (let imp of imps) {
    if (a.items.some((i) => i.slug === "intensify-vulnerability")) {
      imp.intensify = "true";
    }
    if (a.items.some((i) => i.slug === "implement-adept")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "implement-adept").rules[0].selection
      ) {
        imp.adept = "true";
      }
    }
    if (a.items.some((i) => i.slug === "second-adept")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "second-adept").rules[0].selection
      ) {
        imp.adept = "true";
      }
    }
    if (a.items.some((i) => i.slug === "implement-paragon")) {
      if (
        imp.name.toLowerCase() ===
        a.items.find((i) => i.slug === "implement-paragon").rules[0].selection
      ) {
        imp.paragon = "true";
      }
    }
  }

  const impFlavor = getImplementFlavor(imps);

  let implementUuids;
  const passImps = {
    implements: imps,
    impFlavor: impFlavor,
    selectedImplements: passSelectedImplements,
  };
  const dg = await new Dialog({
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
        callback: async (dgEndContent) => {
          implementUuids = confirmImplements(dgEndContent);
          if (a.getFlag("pf2e-thaum-vuln", "selectedImplements")) {
            await deleteImpEffect(
              a.getFlag("pf2e-thaum-vuln", "selectedImplements")
            );
          }
          for (const key of imps.keys()) {
            imps[key].uuid = implementUuids[key];
          }
          await createImpEffect(imps);
          a.setFlag("pf2e-thaum-vuln", "selectedImplements", imps);

          //refreshes the sheet so the implement items appear
          a.sheet._render(true);
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
  });

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

  const implementDataMatch = implementData.find(
    (n) =>
      game.i18n.localize(n.translatedName) ==
      $(dropFieldText).attr("implement-type")
  );

  //clears the children in case there is something in there
  $(newDropFieldContent).empty();

  $(newDropFieldContent).attr("item-uuid", dropData.uuid);

  //adds the image of the item to the area
  $(newDropFieldContent).append(
    $(
      `<img src="${chosenItem.img}" style="flex-basis: 100px; flex-shrink: 0;">`
    )
  );

  //creates another span that will hold the name of the item
  const itemLabelBox = $(
    '<span style="flex-basis: 200px; flex-shrink: 0; padding: 10px; text-align: center;"></span>'
  );
  $(itemLabelBox).text(chosenItem.name);
  $(itemLabelBox).appendTo(newDropFieldContent);

  //creates another span that will hold the description of the implement

  let implementFlavor = $(
    '<span style="overflow:scroll; padding:10px;"></span>'
  );

  $(implementFlavor).append(`<p>${implementDataMatch.flavor}</p>`);
  $(implementFlavor).append("<h3>Initiate Benefit</h3>");
  $(implementFlavor).append(`<p>${implementDataMatch.benefits.initiate}</p>`);
  if ($(dropFieldText).attr("is-adept") === "true") {
    $(implementFlavor).append("<h3>Adept Benefit</h3>");
    $(implementFlavor).append(`<p>${implementDataMatch.benefits.adept}</p>`);
  }
  if ($(dropFieldText).attr("is-paragon") === "true") {
    $(implementFlavor).append("<h3>Paragon Benefit</h3>");
    $(implementFlavor).append(`<p>${implementDataMatch.benefits.paragon}</p>`);
  }
  if ($(dropFieldText).attr("can-intensify") === "true") {
    $(implementFlavor).append("<h3>Intensify Vulnerability</h3>");
    $(implementFlavor).append(`<p>${implementDataMatch.intensify}</p>`);
  }

  $(implementFlavor).html(parseHTML($(implementFlavor).html()));
  $(implementFlavor).appendTo($(newDropFieldContent));

  $(newDropFieldContent).appendTo($(dropFieldText));

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

function getImplementFlavor(imps) {
  let impFlavor = {};
  for (const imp of imps) {
    const implementDataMatch = implementData.find(
      (n) => game.i18n.localize(n.translatedName) == imp.name
    );
    impFlavor = {
      ...impFlavor,
      [imp.name]: {
        flavor: implementDataMatch.flavor,
        initiate: implementDataMatch.benefits.initiate,
      },
    };
    if (imp.adept === "true") {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
        adept: implementDataMatch.benefits.adept,
      };
    }
    if (imp.paragon === "true") {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
        paragon: implementDataMatch.benefits.paragon,
      };
    }
    if (imp.intensify === "true") {
      impFlavor[imp.name] = {
        ...impFlavor[imp.name],
        intensify: implementDataMatch.intensify,
      };
    }
  }

  return impFlavor;
}

export async function clearImplements(event) {
  const a = event.data.actor;
  await a.unsetFlag("pf2e-thaum-vuln", "selectedImplements");
}
