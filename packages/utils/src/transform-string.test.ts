import {
  capitalize,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toScreamingSnakeCase,
  toSnakeCase,
  uncapitalize,
} from "./transform-string";

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

describe("String to pascal case", () => {
  it("should handle space-separated lowercase words", () => {
    expect(toPascalCase("foo bar")).toEqual("FooBar");
  });
  it("should handle space-separated mixed case words", () => {
    expect(toPascalCase("Foo Bar")).toEqual("FooBar");
  });
  it("should handle camelCase string", () => {
    expect(toPascalCase("fooBar")).toEqual("FooBar");
  });
  it("should preserve existing PascalCase string", () => {
    expect(toPascalCase("FooBar")).toEqual("FooBar");
  });
  it("should handle dash-separated words with leading and trailing dashes", () => {
    expect(toPascalCase("--foo-bar--")).toEqual("FooBar");
  });
  it("should handle underscore-separated uppercase words with leading and trailing underscores", () => {
    expect(toPascalCase("__FOO_BAR__")).toEqual("FooBar");
  });
  it("should handle string with special characters and numbers", () => {
    expect(toPascalCase("!--foo-¿?-bar--121-**%")).toEqual("FooBar121");
  });
  it("should handle sentence with spaces", () => {
    expect(toPascalCase("Here i am")).toEqual("HereIAm");
  });
  it("should handle space-separated uppercase words", () => {
    expect(toPascalCase("FOO BAR")).toEqual("FooBar");
  });
});

describe("String to camelCase", () => {
  it("should handle space-separated lowercase words", () => {
    expect(toCamelCase("foo bar")).toEqual("fooBar");
  });
  it("should handle space-separated mixed case words", () => {
    expect(toCamelCase("Foo Bar")).toEqual("fooBar");
  });
  it("should preserve existing camelCase string", () => {
    expect(toCamelCase("fooBar")).toEqual("fooBar");
  });
  it("should handle PascalCase string", () => {
    expect(toCamelCase("FooBar")).toEqual("fooBar");
  });
  it("should handle dash-separated words with leading and trailing dashes", () => {
    expect(toCamelCase("--foo-bar--")).toEqual("fooBar");
  });
  it("should handle underscore-separated uppercase words with leading and trailing underscores", () => {
    expect(toCamelCase("__FOO_BAR__")).toEqual("fooBar");
  });
  it("should handle string with special characters and numbers", () => {
    expect(toCamelCase("!--foo-¿?-bar--121-**%")).toEqual("fooBar121");
  });
  it("should handle sentence with spaces", () => {
    expect(toCamelCase("Here i am")).toEqual("hereIAm");
  });
  it("should handle space-separated uppercase words", () => {
    expect(toCamelCase("FOO BAR")).toEqual("fooBar");
  });
});

describe("String to snake_case", () => {
  it("should handle space-separated lowercase words", () => {
    expect(toSnakeCase("foo bar")).toEqual("foo_bar");
  });
  it("should handle space-separated mixed case words", () => {
    expect(toSnakeCase("Foo Bar")).toEqual("foo_bar");
  });
  it("should handle camelCase string", () => {
    expect(toSnakeCase("fooBar")).toEqual("foo_bar");
  });
  it("should handle PascalCase string", () => {
    expect(toSnakeCase("FooBar")).toEqual("foo_bar");
  });
  it("should handle dash-separated words with leading and trailing dashes", () => {
    expect(toSnakeCase("--foo-bar--")).toEqual("foo_bar");
  });
  it("should handle underscore-separated uppercase words with leading and trailing underscores", () => {
    expect(toSnakeCase("__FOO_BAR__")).toEqual("foo_bar");
  });
  it("should handle string with special characters and numbers", () => {
    expect(toSnakeCase("!--foo-¿?-bar--121-**%")).toEqual("foo_bar_121");
  });
  it("should handle sentence with spaces", () => {
    expect(toSnakeCase("Here i am")).toEqual("here_i_am");
  });
  it("should handle space-separated uppercase words", () => {
    expect(toSnakeCase("FOO BAR")).toEqual("foo_bar");
  });
});

describe("String to SCREAMING_SNAKE_CASE", () => {
  it("should handle space-separated lowercase words", () => {
    expect(toScreamingSnakeCase("foo bar")).toEqual("FOO_BAR");
  });
  it("should handle space-separated mixed case words", () => {
    expect(toScreamingSnakeCase("Foo Bar")).toEqual("FOO_BAR");
  });
  it("should handle camelCase string", () => {
    expect(toScreamingSnakeCase("fooBar")).toEqual("FOO_BAR");
  });
  it("should handle PascalCase string", () => {
    expect(toScreamingSnakeCase("FooBar")).toEqual("FOO_BAR");
  });
  it("should handle dash-separated words with leading and trailing dashes", () => {
    expect(toScreamingSnakeCase("--foo-bar--")).toEqual("FOO_BAR");
  });
  it("should handle underscore-separated uppercase words with leading and trailing underscores", () => {
    expect(toScreamingSnakeCase("__FOO_BAR__")).toEqual("FOO_BAR");
  });
  it("should handle string with special characters and numbers", () => {
    expect(toScreamingSnakeCase("!--foo-¿?-bar--121-**%")).toEqual(
      "FOO_BAR_121"
    );
  });
  it("should handle sentence with spaces", () => {
    expect(toScreamingSnakeCase("Here i am")).toEqual("HERE_I_AM");
  });
  it("should handle space-separated uppercase words", () => {
    expect(toScreamingSnakeCase("FOO BAR")).toEqual("FOO_BAR");
  });
});

describe("String to kebab-case", () => {
  it("should handle space-separated lowercase words", () => {
    expect(toKebabCase("foo bar")).toEqual("foo-bar");
  });
  it("should handle space-separated mixed case words", () => {
    expect(toKebabCase("Foo Bar")).toEqual("foo-bar");
  });
  it("should handle camelCase string", () => {
    expect(toKebabCase("fooBar")).toEqual("foo-bar");
  });
  it("should handle PascalCase string", () => {
    expect(toKebabCase("FooBar")).toEqual("foo-bar");
  });
  it("should handle dash-separated words with leading and trailing dashes", () => {
    expect(toKebabCase("--foo-bar--")).toEqual("foo-bar");
  });
  it("should handle underscore-separated uppercase words with leading and trailing underscores", () => {
    expect(toKebabCase("__FOO_BAR__")).toEqual("foo-bar");
  });
  it("should handle string with special characters and numbers", () => {
    expect(toKebabCase("!--foo-¿?-bar--121-**%")).toEqual("foo-bar-121");
  });
  it("should handle sentence with spaces", () => {
    expect(toKebabCase("Here i am")).toEqual("here-i-am");
  });
  it("should handle space-separated uppercase words", () => {
    expect(toKebabCase("FOO BAR")).toEqual("foo-bar");
  });
});
