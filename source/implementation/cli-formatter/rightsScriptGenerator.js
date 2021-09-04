import sql from "mssql"
import fs from "fs"
import util from "util"

import getFormatter from "../../formatter/formatter.js"
import { getOperationRightsRequest, getTableCaption } from "./requests.js"

export const generate = async (dbConfig, schemaUId, filePath, format) => {
    await sql.connect(dbConfig);
    const rightsRequest = getOperationRightsRequest(schemaUId);
    const tableRequest = getTableCaption(schemaUId, "1A778E3F-0A8E-E111-84A3-00155D054C03");
    
    const rightsResult = await sql.query(rightsRequest);
    const captionResult = await sql.query(tableRequest);

    const caption = (captionResult && captionResult.recordset) ?
		captionResult.recordset[0]: 
		null;

	const tableCaption = (caption.Caption) ? 
		caption.Caption : 
		caption.DefaultCaption;

    if (rightsResult && rightsResult.rowsAffected){
    	const rights = rightsResult.recordset;
		const formatter = getFormatter(format);
    	const script = formatter(tableCaption, schemaUId, rights);

    	const writeScript = util.promisify(fs.writeFile);
    	await writeScript(filePath, script);
		console.log("Successfully generated")
    }
}