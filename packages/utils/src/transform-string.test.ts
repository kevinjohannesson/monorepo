import { capitalize, uncapitalize } from "./transform-string";

describe("capitalize", () => {
  it("should capitalize the first letter of a single-word string", () => {
    const capitalized = capitalize("user");
    expect(capitalized).toBe("User");
  });

  it("should capitalize the first letter of a multi-word string", () => {
    const capitalized = capitalize("hello world");
    expect(capitalized).toBe("Hello world");
  });

  it("should not change the case of an already capitalized string", () => {
    const capitalized = capitalize("Capitalized");
    expect(capitalized).toBe("Capitalized");
  });

  it("should handle an empty string", () => {
    const capitalized = capitalize("");
    expect(capitalized).toBe("");
  });

  it("should handle strings with special characters", () => {
    const capitalized = capitalize("!special");
    expect(capitalized).toBe("!special");
  });
});

describe("uncapitalize", () => {
  it("should uncapitalize the first letter of a single-word string", () => {
    const uncapitalized = uncapitalize("User");
    expect(uncapitalized).toBe("user");
  });

  it("should uncapitalize the first letter of a multi-word string", () => {
    const uncapitalized = uncapitalize("Hello world");
    expect(uncapitalized).toBe("hello world");
  });

  it("should not change the case of an already uncapitalized string", () => {
    const uncapitalized = uncapitalize("uncapitalized");
    expect(uncapitalized).toBe("uncapitalized");
  });

  it("should handle an empty string", () => {
    const uncapitalized = uncapitalize("");
    expect(uncapitalized).toBe("");
  });

  it("should handle strings with special characters", () => {
    const uncapitalized = uncapitalize("!Special");
    expect(uncapitalized).toBe("!Special");
  });
});
