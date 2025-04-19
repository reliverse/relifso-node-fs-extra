import { stringify } from "jsonfile/utils.js";

import { outputFileSync } from "~/impl/lib/output-file/index.js";

export default function outputJsonSync(file, data, options) {
  const str = stringify(data, options);

  outputFileSync(file, str, options);
}
