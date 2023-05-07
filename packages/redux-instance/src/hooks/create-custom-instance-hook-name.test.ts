import { createCustomInstanceHookName } from "./create-custom-instance-hook-name";

describe("createCustomInstanceHookName", () => {
  it("should return the correct custom instance hook name with a single-word name and type", () => {
    const hookName = createCustomInstanceHookName("myComponent", "counter");
    expect(hookName).toBe("useMyComponentInstanceCounter");
  });

  it("should return the correct custom instance hook name with multi-word name and type", () => {
    const hookName = createCustomInstanceHookName(
      "myGreatComponent",
      "fancyCounter"
    );
    expect(hookName).toBe("useMyGreatComponentInstanceFancyCounter");
  });

  it("should return the correct custom instance hook name with mixed-case name and type", () => {
    const hookName = createCustomInstanceHookName(
      "MyMixedCaseComponent",
      "fancyMixedCaseCounter"
    );
    expect(hookName).toBe(
      "useMyMixedCaseComponentInstanceFancyMixedCaseCounter"
    );
  });

  it("should return the correct custom instance hook name with special characters in name and type", () => {
    const hookName = createCustomInstanceHookName(
      "my-component",
      "fancy_counter"
    );
    expect(hookName).toBe("useMyComponentInstanceFancyCounter");
  });
});
