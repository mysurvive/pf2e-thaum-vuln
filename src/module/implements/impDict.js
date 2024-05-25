import { Tome } from "./implementBenefits/tome";
import { Amulet } from "./implementBenefits/amulet";
import { Lantern } from "./implementBenefits/lantern";
import { Implement } from "./implement";
import { Regalia } from "./implementBenefits/regalia";
import { Weapon } from "./implementBenefits/weapon";
import { Chalice } from "./implementBenefits/chalice";
import { Bell } from "./implementBenefits/bell";

const impDict = new Map([
  ["tome", Tome],
  ["amulet", Amulet],
  ["lantern", Lantern],
  ["regalia", Regalia],
  ["weapon", Weapon],
  ["chalice", Chalice],
  ["bell", Bell],
]);

function constructChildImplement(implement, actor, item) {
  const childImp = impDict.get(implement.toLowerCase()) ?? Implement;
  return new childImp(actor, item, [], implement.toLowerCase());
}

export { constructChildImplement };
