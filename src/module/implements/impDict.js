import { Tome } from "./implementBenefits/tome";
import { Implement } from "./implement";

const impDict = new Map([["Tome", Tome]]);

function constructChildImplement(implement, actor, item) {
  const childImp = impDict.get(implement) ?? Implement;
  console.log(childImp);
  return new childImp(actor, item);
}

export { impDict, constructChildImplement };
