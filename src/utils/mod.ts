import fs from "fs-extra";
import { dirname, join } from "pathe";
import { fileURLToPath } from "node:url";

/**
 * Ensures that the directory exists. If the directory structure does not exist, it is created.
 */
export async function ensuredir(dirPath: string) {
  return await fs.ensureDir(dirPath);
}

/**
 * Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
 */
export async function remove(path: string) {
  return await fs.remove(path);
}

export function getExtensionFromPath(filePath: string) {
  return filePath.split(".").pop();
}

export function getFilenameFromPath(filePath: string) {
  return filePath.split("/").pop();
}

export function getCurrentDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}

export function getRootDirname(
  importMetaUrl: string,
  doubleDotsRepeat: number,
) {
  const currentDirname = getCurrentDirname(importMetaUrl);
  const backPath = "../".repeat(doubleDotsRepeat);

  return join(currentDirname, backPath);
}

export async function removeFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error("⛔ Could not read the file...", {
      cause: error,
    });
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}

export async function directoryExists(directoryPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(directoryPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function getFoldersInDirectory(directory: string): string[] {
  return fs
    .readdirSync(directory, {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}
