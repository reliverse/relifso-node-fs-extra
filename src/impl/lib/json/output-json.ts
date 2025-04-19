import { stringify } from "jsonfile/utils.js";

import { outputFile } from "~/impl/lib/output-file/index.js";

export default async function outputJson(file, data, options = {}) {
  const str = stringify(data, options);

  await outputFile(file, str, options);
}
 