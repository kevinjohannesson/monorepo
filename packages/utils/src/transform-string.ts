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
  const [firstLetter, rest] = str;
  return `${firstLetter.toUpperCase()}${rest || ""}` as Capitalize<T>;
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
  const [firstLetter, rest] = str;
  return `${firstLetter.toLowerCase()}${rest || ""}` as Capitalize<T>;
}
