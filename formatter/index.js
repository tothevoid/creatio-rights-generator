const rightsScriptGenerator = require("./rightsScriptGenerator");
const {config} = require("./devConfig");

const filePath = "./script.sql";
const schemaUId = "DC257B41-06E9-468A-9EC2-39D4FCC920AA";

rightsScriptGenerator.generate(config, schemaUId, filePath);