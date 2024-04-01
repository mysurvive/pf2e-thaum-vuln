import { Tome } from "./implementBenefits/tome";
import { Amulet } from "./implementBenefits/amulet";
import { Implement } from "./implement";

const impDict = new Map([
  ["Tome", Tome],
  ["Amulet", Amulet],
]);

function constructChildImplement(implement, actor, item) {
  const childImp = impDict.get(implement) ?? Implement;
  return new childImp(actor, item);
}

export { constructChildImplement };
