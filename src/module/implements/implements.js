import { implementData } from ".";

export async function manageImplements() {
  const a = canvas.tokens.controlled[0].actor;
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

  const passImps = { implements: imps };
  const dg = await new Dialog({
    title: "Manage Implemenets",
    content: await renderTemplate(
      "modules/pf2e-thaum-vuln/templates/manageImplements.hbs",
      passImps
    ),
    buttons: {
      complete: {
        label: "Confirm Changes",
        callback: () => {},
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
      dd.bind(document.getElementById(`Second`));
      dd.bind(document.getElementById(`Third`));
    },
  });

  //dg._dragDrop.bind(dg.content);
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

  //clears the children in case there is something in there
  $(newDropFieldContent).empty();

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

  const implementFlavor = $(
    '<span style="overflow:scroll; padding:10px;"></span>'
  );
  $(implementFlavor).append(
    `<p>${implementData[$(dropFieldText).attr("implement-type")].flavor}</p>`
  );
  $(implementFlavor).append("<h3>Initiate Benefit</h3>");
  $(implementFlavor).append(
    `<p>${
      implementData[$(dropFieldText).attr("implement-type")].benefits.initiate
    }</p>`
  );
  if ($(dropFieldText).attr("is-adept") === "true") {
    $(implementFlavor).append("<h3>Adept Benefit</h3>");
    $(implementFlavor).append(
      `<p>${
        implementData[$(dropFieldText).attr("implement-type")].benefits.adept
      }</p>`
    );
  }
  if ($(dropFieldText).attr("is-paragon") === "true") {
    $(implementFlavor).append("<h3>Paragon Benefit</h3>");
    $(implementFlavor).append(
      `<p>${
        implementData[$(dropFieldText).attr("implement-type")].benefits.paragon
      }</p>`
    );
  }
  if ($(dropFieldText).attr("can-intensify") === "true") {
    $(implementFlavor).append("<h3>Intensify Vulnerability</h3>");
    $(implementFlavor).append(
      `<p>${
        implementData[$(dropFieldText).attr("implement-type")].intensify
      }</p>`
    );
  }

  $(implementFlavor).appendTo($(newDropFieldContent));

  $(newDropFieldContent).appendTo($(dropFieldText));
  console.log("event data", event);
  console.log("dropData data", chosenItem);
  console.log("the chosen one", $(dropFieldText).attr("implement-type"));
}
