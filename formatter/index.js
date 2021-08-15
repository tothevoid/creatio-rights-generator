import {generate} from "./rightsScriptGenerator.js";
import {config} from "./devConfig.js";

const filePath = "./script.sql";
const schemaUId = "DC257B41-06E9-468A-9EC2-39D4FCC920AA";

generate(config, schemaUId, filePath);