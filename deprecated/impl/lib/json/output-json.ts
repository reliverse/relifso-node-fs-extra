import { outputFile } from "deprecated/impl/lib/output-file/index.js";
import { stringify } from "jsonfile/utils.js";

export default async function outputJson(file, data, options = {}) {
  const str = stringify(data, options);

  await outputFile(file, str, options);
}
