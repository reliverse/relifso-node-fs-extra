import { stringify } from "jsonfile/utils";

import { outputFile } from "~/libs/core/core-impl/lib/output-file";

export default async function outputJson(file, data, options = {}) {
  const str = stringify(data, options);

  await outputFile(file, str, options);
}
