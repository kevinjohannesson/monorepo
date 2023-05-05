import { createCustomInstanceSelectorName } from "./create-custom-instance-selector-name";

describe("createCustomInstanceSelectorName", () => {
  it("should return the correct custom instance selector name with a single-word name and type", () => {
    const selectorName = createCustomInstanceSelectorName(
      "myInstance",
      "someValue"
    );
    expect(selectorName).toBe("selectMyInstanceSomeValue");
  });

  it("should return the correct custom instance selector name with multi-word name and type", () => {
    const selectorName = createCustomInstanceSelectorName(
      "myGreatInstance",
      "someAwesomeValue"
    );
    expect(selectorName).toBe("selectMyGreatInstanceSomeAwesomeValue");
  });

  it("should return the correct custom instance selector name with mixed-case name and type", () => {
    const selectorName = createCustomInstanceSelectorName(
      "MyMixedCaseInstance",
      "someMixedCaseValue"
    );
    expect(selectorName).toBe("selectMyMixedCaseInstanceSomeMixedCaseValue");
  });

  it("should return the correct custom instance selector name with special characters in name and type", () => {
    const selectorName = createCustomInstanceSelectorName(
      "my-instance",
      "some_value"
    );
    expect(selectorName).toBe("selectMyInstanceSomeValue");
  });
});
