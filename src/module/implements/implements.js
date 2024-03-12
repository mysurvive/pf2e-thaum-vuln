import { checkImplements, checkFeatValidity } from "./helpers";
import { parseHTML } from "../utils/utils.js";

class ManagedImplement {
  constructor(featSlug, a, imp) {
    this.counter =
      featSlug === "first-implement-and-esoterica"
        ? "First"
        : featSlug === "second-implement"
        ? "Second"
        : featSlug === "third-implement"
        ? "Third"
        : undefined;
    this.name = imp.name;
    this.adept = false;
    this.paragon = false;
    this.intensify = false;
    this.uuid =
      a.getFlag("pf2e-thaum-vuln", "selectedImplements")[imp.slug]?.uuid ??
      undefined;
    this.slug = imp.slug;
  }
}

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

  for (const key of Object.keys(selectedImplements)) {
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

  const imps = {};

  const firstImplement =
    (await createManagedImplement("first-implement-and-esoterica", a)) ??
    undefined;
  const secondImplement =
    (await createManagedImplement("second-implement", a)) ?? undefined;
  const thirdImplement =
    (await createManagedImplement("third-implement", a)) ?? undefined;

  if (firstImplement) {
    imps[firstImplement.name] = firstImplement.data;
  }
  if (secondImplement) {
    imps[secondImplement.name] = secondImplement.data;
  }
  if (thirdImplement) {
    imps[thirdImplement.name] = thirdImplement.data;
  }

  for (let key of Object.keys(imps)) {
    if (a.items.some((i) => i.slug === "intensify-vulnerability")) {
      imps[key].intensify = true;
    }
    if (a.items.some((i) => i.slug === "implement-adept")) {
      if (
        imps[key].name.toLowerCase() ===
        (
          await fromUuid(
            a.uuid +
              ".Item." +
              a.items.find((i) => i.slug === "implement-adept").rules[0]
                .selection
          )
        ).name.toLowerCase()
      ) {
        imps[key].adept = true;
      }
    }
    if (a.items.some((i) => i.slug === "second-adept")) {
      if (
        imps[key].name.toLowerCase() ===
        (
          await fromUuid(
            a.uuid +
              ".Item." +
              a.items.find((i) => i.slug === "second-adept").rules[0].selection
          )
        ).name.toLowerCase()
      ) {
        imps[key].adept = true;
      }
    }
    if (a.items.some((i) => i.slug === "implement-paragon")) {
      if (
        imps[key].name.toLowerCase() ===
        (
          await fromUuid(
            a.uuid +
              ".Item." +
              a.items.find((i) => i.slug === "implement-paragon").rules[0]
                .selection
          )
        ).name.toLowerCase()
      ) {
        imps[key].paragon = true;
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

            for (const key of Object.keys(imps)) {
              imps[key].uuid = implementUuids[key];
            }

            const impDelta = [];
            for (const i of Object.keys(origin)) {
              const changed =
                origin[i]?.uuid != implementUuids[i] ? true : false;
              const name = origin[i]?.name ?? imps[i]?.name;
              impDelta.push({ name, changed });
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
  let uuidCollection = {};
  const itemUuids = $(dgEndContent).find(".item-content-wrapper");
  $(itemUuids).each(function () {
    if ($(this).attr("item-uuid") !== undefined) {
      uuidCollection[$(this).attr("item-slug")] = $(this).attr("item-uuid");
    }
  });
  return uuidCollection;
}

function getImplementFlavor(imps, a) {
  let impFlavor = {};
  for (const imp of Object.keys(imps)) {
    const implementFeat = a.items.find((i) => i.name === imps[imp].name);
    impFlavor = {
      ...impFlavor,
      [imps[imp].name]: {
        flavor: implementFeat.description,
      },
    };
    if (imps[imp].adept === true) {
      impFlavor[imps[imp].name] = {
        ...impFlavor[imps[imp].name],
      };
    }
    if (imps[imp].paragon === true) {
      impFlavor[imps[imp].name] = {
        ...impFlavor[imps[imp].name],
      };
    }
    if (imps[imp].intensify === true) {
      impFlavor[imps[imp].name] = {
        ...impFlavor[imps[imp].name],
      };
    }
  }

  return impFlavor;
}

async function createManagedImplement(featSlug, a) {
  if (a.items.some((i) => i.slug === featSlug)) {
    const implement = a.items.find((i) => i.slug === featSlug);
    const imp = await fromUuid(
      `${a.uuid}.Item.${
        implement.rules.find((r) => r.key === "GrantItem").grantedId
      }`
    );
    return { name: imp.slug, data: new ManagedImplement(featSlug, a, imp) };
  }
}

export async function clearImplements(event) {
  const a = event.data.actor;
  Hooks.callAll("deleteImplementEffects", a);
  await a.unsetFlag("pf2e-thaum-vuln", "selectedImplements");
}
