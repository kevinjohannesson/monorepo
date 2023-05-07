/**
 * Capitalizes the first letter of a given string.
 *
 * @param str - The input string to capitalize.
 * @returns A new string with the first letter capitalized.
 *
 * @example
 * capitalize("user"); // "User"
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  if (!str.length) return str as Capitalize<T>;
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

/**
 * Uncapitalizes the first letter of a given string.
 *
 * @param str - The input string to uncapitalize.
 * @returns A new string with the first letter uncapitalized.
 *
 * @example
 * uncapitalize("User"); // "user"
 */
export function uncapitalize<T extends string>(str: T): Capitalize<T> {
  if (!str.length) return str as Capitalize<T>;
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Capitalize<T>;
}

/**
 * Tries to detect words in a string and splita it into segments.
 *
 * @param str - The input string to split.
 * @returns A new string in snake_case.
 */
export function splitByWords<T extends string>(str: T) {
  return (
    str
      // Replace underscores and spaces with dashes
      .replace(/[_\s]+/g, "-")
      // Remove all non-alphanumeric characters except dashes
      .replace(/[^a-zA-Z0-9-]+/g, "")
      // Remove leading and trailing dashes
      .replace(/^-+|-+$/g, "")
      // Remove consecutive dashes
      .replace(/-{2,}/g, "-")
      // Split the string on dashes or positions between uppercase and lowercase letters
      .split(/-|(?<=[a-z])(?=[A-Z])/)
  );
}

/**
 * Tries to convert any string to PascalCase.
 *
 * @param str - The input string to convert.
 * @returns A new string in PascalCase.
 */
export function toPascalCase<T extends string>(str: T) {
  return (
    splitByWords(str)
      // Map over segments and capitalize first letter
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      // Join segments without join-character
      .join("")
  );
}

/**
 * Tries to convert any string to camelCase.
 *
 * @param str - The input string to convert.
 * @returns A new string in camelCase.
 */
export function toCamelCase<T extends string>(str: T) {
  return (
    splitByWords(str)
      // Map over segments, lowercase the first segment and capitalize first letter of every later segment
      .map((s, i) =>
        i === 0
          ? s.toLowerCase()
          : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      )
      // Join segments without join-character
      .join("")
  );
}

/**
 * Tries to convert any string to snake_case.
 *
 * @param str - The input string to convert.
 * @returns A new string in snake_case.
 */
export function toSnakeCase<T extends string>(str: T) {
  return (
    splitByWords(str)
      // Map over segments and lowercase each segment
      .map((s) => s.toLowerCase())
      // Join segments an underscore
      .join("_")
  );
}

/**
 * Tries to convert any string to SCREAMING_SNAKE_CASE.
 *
 * @param str - The input string to convert.
 * @returns A new string in SCREAMING_SNAKE_CASE.
 */
export function toScreamingSnakeCase<T extends string>(str: T) {
  return (
    splitByWords(str)
      // Map over segments and uppercase each segment
      .map((s) => s.toUpperCase())
      // Join segments an underscore
      .join("_")
  );
}

/**
 * Tries to convert any string to kebab-case.
 *
 * @param str - The input string to convert.
 * @returns A new string in kebab-case.
 */
export function toKebabCase<T extends string>(str: T) {
  return (
    splitByWords(str)
      // Map over segments and lowercase each segment
      .map((s) => s.toLowerCase())
      // Join segments a dash
      .join("-")
  );
}
