import { ensuredir } from "@reliverse/relifso";
import { exec } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";

import { pathExists } from "~/impl/node/path-exists.js";
import { remove } from "~/impl/node/remove.js";

export const execAsync = promisify(exec);

export async function setHiddenAttributeOnWindows(folderPath: string): Promise<void> {
  if (process.platform === "win32") {
    try {
      if (await pathExists(folderPath)) {
        const isAlreadyHidden = await isHidden(folderPath);
        if (!isAlreadyHidden) {
          await execAsync(`attrib +h "${folderPath}"`);
        }
      }
    } catch (error) {
      console.warn("Failed to set hidden attribute:", String(error));
    }
  }
}

export async function isHidden(filePath: string): Promise<boolean> {
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
