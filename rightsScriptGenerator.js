const sql = require("mssql");
const scriptFormatter = require("./scriptFormatter");
const requests = require("./requests");
const fs = require("fs");
const util = require('util');

const generate = async (dbConfig, schemaUId, filePath) => {
    await sql.connect(dbConfig);
    const rightsRequest = requests.getOperationRightsRequest(schemaUId);
    const tableRequest = requests.getTableCaption(schemaUId, "1A778E3F-0A8E-E111-84A3-00155D054C03");
    
    const rightsResult = await sql.query(rightsRequest);
    const captionResult = await sql.query(tableRequest);

    const caption = (captionResult && captionResult.recordset) ?
		captionResult.recordset[0]: 
		null;

    if (rightsResult && rightsResult.rowsAffected){
    	const rights = rightsResult.recordset;
    	const headerRows = scriptFormatter.getHeaderRows(caption, rights);
    	const scriptRows = scriptFormatter.getScriptRows(rights, schemaUId);
		const script = [...headerRows, "", ...scriptRows].join("\n");

    	const writeScript = util.promisify(fs.writeFile);
    	await writeScript(filePath, script);
		console.log("Successfully generated")
    }
}

module.exports = {
    generate
}