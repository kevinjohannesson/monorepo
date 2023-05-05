import { createCustomInstanceActionName } from "./create-custom-instance-action-name";

describe("createCustomInstanceActionName", () => {
  it("should return the correct custom instance action name with a single-word name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "myInstance",
      "counter",
      "action"
    );
    expect(actionName).toBe("counterMyInstanceAction");
  });

  it("should return the correct custom instance action name with multi-word name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "myGreatInstance",
      "fancyCounter",
      "awesomeAction"
    );
    expect(actionName).toBe("fancyCounterMyGreatInstanceAwesomeAction");
  });

  it("should return the correct custom instance action name with mixed-case name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "MyMixedCaseInstance",
      "fancyMixedCaseCounter",
      "awesomeMixedCaseAction"
    );
    expect(actionName).toBe(
      "fancyMixedCaseCounterMyMixedCaseInstanceAwesomeMixedCaseAction"
    );
  });

  it("should return the correct custom instance action name with special characters in name, type, and suffix", () => {
    const actionName = createCustomInstanceActionName(
      "my-instance",
      "fancy_counter",
      "awesome_action"
    );
    expect(actionName).toBe("fancyCounterMyInstanceAwesomeAction");
  });

  it("should return the correct custom instance action name with no suffix provided", () => {
    const actionName = createCustomInstanceActionName("myInstance", "counter");
    expect(actionName).toBe("counterMyInstance");
  });
});
