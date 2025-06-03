import { existsSync, mkdirSync } from "node:fs";
import { stat, mkdir } from "node:fs/promises";

import { writeFileSync } from "./write-file.js";
import { writeFile } from "./write-file.js";

export function createFileSync(file: string, content = "") {
  if (existsSync(file)) {
    return;
  }

  return writeFileSync(file, content);
}

export async function createFile(file: string, content = ""): Promise<void> {
  try {
    await stat(file);
    // File exists, do nothing
    return;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File does not exist, write it
      return writeFile(file, content);
    }
    // Other error, rethrow
    throw error;
  }
}

/**
 * Creates a single directory if it doesn't exist
 * @param dir Path to the directory to create
 */
export async function createDir(dir: string): Promise<void> {
  try {
    await stat(dir);
    // Directory exists, do nothing
    return;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Directory does not exist, create it
      await mkdir(dir, { recursive: true });
    } else {
      // Other error, rethrow
      throw error;
    }
  }
}

/**
 * Creates multiple directories if they don't exist
 * @param dirs Array of directory paths to create
 */
export async function createDirs(dirs: string[]): Promise<void> {
  await Promise.all(dirs.map((dir) => createDir(dir)));
}

/**
 * Creates multiple files with optional content
 * @param files Array of file paths to create
 * @param content Optional content to write to each file
 */
export async function createFiles(files: string[], content = ""): Promise<void> {
  await Promise.all(files.map((file) => createFile(file, content)));
}

/**
 * Synchronous version of createDir
 * @param dir Path to the directory to create
 */
export function createDirSync(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Synchronous version of createDirs
 * @param dirs Array of directory paths to create
 */
export function createDirsSync(dirs: string[]): void {
  for (const dir of dirs) {
    createDirSync(dir);
  }
}

/**
 * Synchronous version of createFiles
 * @param files Array of file paths to create
 * @param content Optional content to write to each file
 */
export function createFilesSync(files: string[], content = ""): void {
  for (const file of files) {
    createFileSync(file, content);
  }
}
