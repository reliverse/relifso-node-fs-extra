import { outputFileSync } from "deprecated/impl/lib/output-file/index.js";
import { stringify } from "jsonfile/utils.js";

export default function outputJsonSync(file, data, options) {
  const str = stringify(data, options);

  outputFileSync(file, str, options);
}
