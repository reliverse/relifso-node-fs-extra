import { ensuredir } from "@reliverse/relifso";
import { exec } from "node:child_process";
import { statSync, lstatSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { stat, lstat } from "node:fs/promises";
import { promisify } from "node:util";

import { pathExists } from "~/impl/path-exists.js";
import { remove } from "~/impl/remove.js";

import { readFile, readFileSync } from "./read-file.js";

export async function readText(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = "utf8",
): Promise<string> {
  const effectiveOptions =
    typeof options === "string" ? { encoding: options } : { ...options, encoding: options.encoding || "utf8" };
  return readFile(filePath, effectiveOptions) as Promise<string>;
}

export function readTextSync(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = "utf8",
): string {
  const effectiveOptions =
    typeof options === "string" ? { encoding: options } : { ...options, encoding: options.encoding || "utf8" };
  return readFileSync(filePath, effectiveOptions) as string;
}

export async function readLines(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = { encoding: "utf8" },
) {
  const effectiveOptions = typeof options === "string" ? { encoding: options } : options;
  const contentBuffer = await readFile(filePath, { ...effectiveOptions, encoding: null });
  return contentBuffer.toString().split(/\r?\n/);
}

export function readLinesSync(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = { encoding: "utf8" },
) {
  const effectiveOptions = typeof options === "string" ? { encoding: options } : options;
  const contentBuffer = readFileSync(filePath, { ...effectiveOptions, encoding: null }) as unknown as Buffer;
  return contentBuffer.toString().split(/\r?\n/);
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
}

export function isDirectorySync(filePath: string): boolean {
  try {
    const stats = statSync(filePath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
}

export async function isSymlink(filePath: string): Promise<boolean> {
  try {
    const stats = await lstat(filePath);
    return stats.isSymbolicLink();
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export function isSymlinkSync(filePath: string): boolean {
  try {
    const stats = lstatSync(filePath);
    return stats.isSymbolicLink();
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export const execAsync = promisify(exec);

export async function setHiddenAttribute(folderPath: string): Promise<void> {
  if (process.platform === "win32") {
    try {
      if (await pathExists(folderPath)) {
        const isAlreadyHidden = await isHiddenAttribute(folderPath);
        if (!isAlreadyHidden) {
          await execAsync(`attrib +h "${folderPath}"`);
        }
      }
    } catch (error) {
      console.warn("Failed to set hidden attribute:", String(error));
    }
  }
}

export async function isHiddenAttribute(filePath: string): Promise<boolean> {
  if (process.platform === "win32") {
    const attributes = await execAsync(`attrib "${filePath}"`);
    return attributes.stdout.includes("H");
  }
  return false;
}

/**
 * Checks if a directory is empty
 * @param directory Path to the directory
 * @returns Boolean indicating if the directory is empty
 */
export async function isDirectoryEmpty(directory: string): Promise<boolean> {
  try {
    const files = await readdir(directory);
    return files.length === 0;
  } catch (_error) {
    // If there's an error reading the directory, assume it's not empty
    return false;
  }
}

/**
 * Removes the specified directory if it exists and then ensures it exists.
 * @param dir - The directory to remove and ensure.
 */
export async function rmEnsureDir(dir: string): Promise<void> {
  try {
    if (await pathExists(dir)) {
      await remove(dir);
    }
    await ensuredir(dir);
  } catch (error) {
    console.error(`Error while removing/ensuring directory ${dir}: ${error}`);
    throw error;
  }
}
