/**
 * Make a key for a given type and id
 * @param type Type of the key
 * @param id ID of the key
 * @returns Key
 */
export function makeKey(type: string, id: string | number): string {
  if (!type) {
    throw new Error("type is required");
  }
  if (!id) {
    throw new Error("id is required");
  }
  const padded = `${id}`.padStart(8, "0");
  return `${type}.${padded}`;
}

/**
 * Mask a string
 * @param str String to mask
 * @param maskChar Mask character
 * @param revealLength Length of the string to reveal
 * @returns Masked string
 */
export function maskString(
  str: string,
  maskChar: string = "*",
  revealLength: number = 4
): string {
  if (!str) {
    return "";
  }
  if (str.length <= revealLength) {
    return str;
  }
  return `${str.substring(0, revealLength)}${maskChar.repeat(
    str.length - revealLength
  )}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = units[i < 5 ? i : 4];
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${unit}`;
}
