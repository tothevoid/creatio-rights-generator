import { getHeaderRows, getSchemaVariableName } from "./common.js"

const generateScript = (tableCaption, schemaUId, rights) => {
    const headerRows = getHeaderRows(tableCaption, rights);
    const scriptRows = getScriptRows(rights, schemaUId);
    return [...headerRows, "", ...scriptRows].join("\n");
}

const getScriptRows = (rightsResult, schemaUId) => {
    const schemaVariable = getSchemaVariable(schemaUId);
    const deleteRows = getDeleteRows();

    const unitVariables = [];
    const insertRows = [];

    rightsResult.forEach((right, ix) => {
        const variableName = getVariableName(right.UnitName);
        unitVariables.push(getVariableDeclareStatement(variableName, right.SysAdminUnitId));
        insertRows.push(...formatRightInsert(variableName, right.CanRead, 
            right.CanAppend, right.CanEdit, right.CanDelete, right.Position));

        if (ix !== rightsResult.length - 1){
            insertRows.push("");
        }
    });

    return [
        ...unitVariables, 
        "",
        schemaVariable,
        "",
        ...deleteRows,
        "",
        ...insertRows
    ];
}

const getVariableName = (sysAdminUnitName) => {
    const clearedVariable = sysAdminUnitName.replace(/\s/g, "");
    return `${clearedVariable.charAt(0).toLowerCase()}${clearedVariable.slice(1)}Id`;
}

const getVariableDeclareStatement = (variableName, adminUnitId) => 
    `DECLARE @${variableName} uniqueidentifier = '${adminUnitId}';`

const formatRightInsert = (adminUnitVariable, canRead, canAppend, canEdit, canDelete, position) => {
    const insert = "INSERT INTO SysEntitySchemaOperationRight (SysAdminUnitId, CanRead, CanAppend, CanEdit, CanDelete, Position, SubjectSchemaUId)";
    
    const values = [
        `@${adminUnitVariable}`,
        +canRead,
        +canAppend,
        +canEdit,
        +canDelete,
        position,
        `@${getSchemaVariableName()}`
    ]
    const formattedValues = `\tVALUES (${values.join(", ")})`;
    return [insert, formattedValues];
}

const getDeleteRows = () => {
    const deleteStatement = "DELETE FROM [SysEntitySchemaOperationRight]";
    const filter = `\tWHERE [SubjectSchemaUId] = @${getSchemaVariableName()}`;
    return [deleteStatement, filter];
}

const getSchemaVariable = (schemaUId) => 
    `DECLARE @${getSchemaVariableName()} uniqueidentifier = '${schemaUId}';`

export default generateScript;