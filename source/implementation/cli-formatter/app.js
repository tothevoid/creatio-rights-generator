import { generate } from "./rightsScriptGenerator.js";
import { config } from "./devConfig.js";

import chalk from "chalk"
import { Command } from "commander"

const cli = new Command()
	.version('1.0.0')
	.description('Creatio rights scripts generator')

cli.argument('<schema>', 'Schema UId')
	.option('-o, --output <value>', 'Output file path')
	.option('--db <db>', 'Target DB')
	.description('Generates script and saves it into file')
	.action((schemaUId, options) => {
		if (schemaUId){
			const outputPath = options.output || "./output.sql";
			const db = parseInt(options?.db || 0);
			generate(config, schemaUId, outputPath, db);
			console.log(chalk.green("Script generated"))
		}
		process.exit();
	})

cli.parse(process.argv)