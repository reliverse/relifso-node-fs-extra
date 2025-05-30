import { sep } from "node:path";

export default function (thePath: string, potentialParent: string) {
  // For inside-directory checking, we want to allow trailing slashes, so normalize.
  thePath = stripTrailingSep(thePath);
  potentialParent = stripTrailingSep(potentialParent);

  // Node treats only Windows as case-insensitive in its path module; we follow those conventions.
  if (process.platform === "win32") {
    thePath = thePath.toLowerCase();
    potentialParent = potentialParent.toLowerCase();
  }

  return (
    thePath.lastIndexOf(potentialParent, 0) === 0 &&
    (thePath[potentialParent.length] === sep || thePath[potentialParent.length] === undefined)
  );
}

function stripTrailingSep(thePath: string) {
  if (thePath[thePath.length - 1] === sep) {
    return thePath.slice(0, -1);
  }
  return thePath;
}
