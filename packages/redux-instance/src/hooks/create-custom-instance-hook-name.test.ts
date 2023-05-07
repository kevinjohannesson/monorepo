import { createCustomInstanceHookFactoryName } from "./create-custom-instance-hook-name";

describe("createCustomInstanceHookName", () => {
  it("should return the correct custom instance hook name with a single-word name and type", () => {
    const hookName = createCustomInstanceHookFactoryName(
      "myComponent",
      "counter"
    );
    expect(hookName).toBe("useMyComponentInstanceCounterFactory");
  });

  it("should return the correct custom instance hook name with multi-word name and type", () => {
    const hookName = createCustomInstanceHookFactoryName(
      "myGreatComponent",
      "fancyCounter"
    );
    expect(hookName).toBe("useMyGreatComponentInstanceFancyCounterFactory");
  });

  it("should return the correct custom instance hook name with mixed-case name and type", () => {
    const hookName = createCustomInstanceHookFactoryName(
      "MyMixedCaseComponent",
      "fancyMixedCaseCounter"
    );
    expect(hookName).toBe(
      "useMyMixedCaseComponentInstanceFancyMixedCaseCounterFactory"
    );
  });

  it("should return the correct custom instance hook name with special characters in name and type", () => {
    const hookName = createCustomInstanceHookFactoryName(
      "my-component",
      "fancy_counter"
    );
    expect(hookName).toBe("useMyComponentInstanceFancyCounterFactory");
  });
});
