import { stringify } from "jsonfile/utils";

import { outputFileSync } from "~/libs/core/core-impl/lib/output-file";

export default function outputJsonSync(file, data, options) {
  const str = stringify(data, options);

  outputFileSync(file, str, options);
}
