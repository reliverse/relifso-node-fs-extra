import { fromPromise } from "universalify";

import { rm, rmSync, type PathLike } from "@/impl/fs/index.js";

/**
 * Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
 *
 * @example
 * import * as fs from 'fs-extra'
 *
 * // remove file
 * // With a callback:
 * fs.remove('/tmp/myfile', err => {
 *   if (err) return console.error(err)
 *   console.log('success!')
 * })
 *
 * fs.remove('/home/jprichardson', err => {
 *   if (err) return console.error(err)
 *   console.log('success!') // I just deleted my entire HOME directory.
 * })
 *
 * // With Promises:
 * fs.remove('/tmp/myfile')
 *   .then(() => {
 *     console.log('success!')
 *   })
 *   .catch(err => {
 *     console.error(err)
 *   })
 *
 * // With async/await:
 * async function asyncAwait () {
 *   try {
 *     await fs.remove('/tmp/myfile')
 *     console.log('success!')
 *   } catch (err) {
 *     console.error(err)
 *   }
 * }
 *
 * asyncAwait()
 */
export const remove = fromPromise(function remove(path: PathLike) {
  return rm(path, { recursive: true, force: true });
});

/**
 * Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
 *
 * @example
 * import * as fs from 'fs-extra'
 *
 * // remove file
 * fs.removeSync('/tmp/myfile')
 *
 * fs.removeSync('/home/jprichardson') // I just deleted my entire HOME directory.
 */
export function removeSync(path: PathLike) {
  rmSync(path, { recursive: true, force: true });
}
