import { createCustomInstanceActionName } from "./create-custom-instance-action-name";

describe("createCustomInstanceActionName", () => {
  it("should return the correct custom instance action name with a single-word name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "myInstance",
      "count",
      "action"
    );
    expect(actionName).toBe("countMyInstanceAction");
  });

  it("should return the correct custom instance action name with multi-word name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "myGreatInstance",
      "fancyCount",
      "awesomeAction"
    );
    expect(actionName).toBe("fancyCountMyGreatInstanceAwesomeAction");
  });

  it("should return the correct custom instance action name with mixed-case name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "MyMixedCaseInstance",
      "fancyMixedCaseCount",
      "awesomeMixedCaseAction"
    );
    expect(actionName).toBe(
      "fancyMixedCaseCountMyMixedCaseInstanceAwesomeMixedCaseAction"
    );
  });

  it("should return the correct custom instance action name with special characters in name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "my-instance",
      "fancy_count",
      "awesome_action"
    );
    expect(actionName).toBe("fancyCountMyInstanceAwesomeAction");
  });

  it("should return the correct custom instance action name with no suffix provided", () => {
    const actionName = createCustomInstanceActionName("myInstance", "count");
    expect(actionName).toBe("countMyInstance");
  });
});
