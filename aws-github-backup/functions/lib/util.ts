import crypto from "crypto";

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

/**
 * Compute hash digest
 * @param plainText plain text to hash
 * @param algorithm hash algorithm
 * @returns hash digest
 */
export function computeHashDigest(
  plainText: string,
  algorithm: "md5" | "sha256" = "md5"
): string {
  return crypto.createHash(algorithm).update(plainText).digest("hex");
}

/**
 * Step Functions の子ステートマシンにつけるタスク ID を生成する
 * (80 文字以内)
 * @param param0 owner と repo
 * @returns タスク ID
 */
export function makeRepoTaskId({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}): string {
  const MAX_LENGTH = 80;
  const prefix = `${owner}_${repo}`;
  const hashBase = `${prefix}_${new Date().toISOString()}`;
  const hash = computeHashDigest(hashBase).substring(0, 16);
  return `${hash}_${prefix}`.substring(0, MAX_LENGTH);
}
