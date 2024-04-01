import { Tome } from "./implementBenefits/tome";
import { Amulet } from "./implementBenefits/amulet";
import { Lantern } from "./implementBenefits/lantern";
import { Implement } from "./implement";

const impDict = new Map([
  ["Tome", Tome],
  ["Amulet", Amulet],
  ["Lantern", Lantern],
]);

function constructChildImplement(implement, actor, item) {
  const childImp = impDict.get(implement) ?? Implement;
  return new childImp(actor, item);
}

export { constructChildImplement };
