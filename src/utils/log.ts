// debug mode flag
const DEBUG_MODE = true;

// end-user logging
// export const logger = (msg: string | (() => string), debugOnly = false) => {
//   if (!debugOnly || DEBUG_MODE) {
//     const message = typeof msg === "function" ? msg() : msg;
//     console.log(`\x1b[2m${message}\x1b[0m`);
//   }
// };

// internal logging (all usage will be removed from final build by @reliverse/dler)
export const logInternal = (msg: string | (() => string)) => {
  if (DEBUG_MODE) {
    const message = typeof msg === "function" ? msg() : msg;
    console.log(`\x1b[36;2m${message}\x1b[0m`);
  }
};
