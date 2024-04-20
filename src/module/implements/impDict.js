import { Tome } from "./implementBenefits/tome";
import { Amulet } from "./implementBenefits/amulet";
import { Lantern } from "./implementBenefits/lantern";
import { Implement } from "./implement";
import { Weapon } from "./implementBenefits/weapon";

const impDict = new Map([
  ["tome", Tome],
  ["amulet", Amulet],
  ["lantern", Lantern],
  ["weapon", Weapon],
]);

function constructChildImplement(implement, actor, item) {
  const childImp = impDict.get(implement.toLowerCase()) ?? Implement;
  return new childImp(actor, item);
}

export { constructChildImplement };
