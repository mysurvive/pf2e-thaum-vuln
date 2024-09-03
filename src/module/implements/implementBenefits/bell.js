import { INTENSIFY_VULNERABILITY_BELL_UUID } from "../../utils";
import { Implement } from "../implement";

class Bell extends Implement {
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_BELL_UUID;

  constructor(actor, implementItem) {
    const bellRules = [];
    super(actor, implementItem, bellRules, "bell");
  }
}

export { Bell };
