import { createCustomInstanceHookName } from "./create-custom-instance-hook-name";

describe("createCustomInstanceHookName", () => {
  it("should return the correct custom instance hook name with a single-word name and type", () => {
    const hookName = createCustomInstanceHookName("myInstance", "counter");
    expect(hookName).toBe("useMyInstanceCounter");
  });

  it("should return the correct custom instance hook name with multi-word name and type", () => {
    const hookName = createCustomInstanceHookName(
      "myGreatInstance",
      "fancyCounter"
    );
    expect(hookName).toBe("useMyGreatInstanceFancyCounter");
  });

  it("should return the correct custom instance hook name with mixed-case name and type", () => {
    const hookName = createCustomInstanceHookName(
      "MyMixedCaseInstance",
      "fancyMixedCaseCounter"
    );
    expect(hookName).toBe("useMyMixedCaseInstanceFancyMixedCaseCounter");
  });

  it("should return the correct custom instance hook name with special characters in name and type", () => {
    const hookName = createCustomInstanceHookName(
      "my-instance",
      "fancy_counter"
    );
    expect(hookName).toBe("useMyInstanceFancyCounter");
  });
});
