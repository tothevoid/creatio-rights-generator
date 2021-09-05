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

    insertRows.push(formatInsertStatement());
    rightsResult.forEach((right) => {
        const variableName = getVariableName(right.UnitName);
        unitVariables.push(getVariableDeclareStatement(variableName, right.SysAdminUnitId));
        insertRows.push(formatInsert(variableName, right.CanRead, 
            right.CanAppend, right.CanEdit, right.CanDelete, right.Position));
    });

    return [
        "DO $$",
        "DECLARE",
        ...unitVariables, 
        "",
        schemaVariable,
        "BEGIN",
        deleteRows,
        "",
        ...insertRows,
        "END;",
        "$$"
    ];
}

const getVariableName = (sysAdminUnitName) => {
    const clearedVariable = sysAdminUnitName.replace(/\s/g, "");
    return `${clearedVariable.charAt(0).toLowerCase()}${clearedVariable.slice(1)}Id`;
}

const getVariableDeclareStatement = (variableName, adminUnitId) => 
    `\t${variableName} uuid = '${adminUnitId}';`;

const formatInsertStatement = () => {
    const insert = `\tINSERT INTO "SysEntitySchemaOperationRight" ("SysAdminUnitId", "CanRead", "CanAppend", "CanEdit", "CanDelete", "Position", "SubjectSchemaUId") VALUES`;
    return insert;
}

const formatInsert = (adminUnitVariable, canRead, canAppend, canEdit, canDelete, position) => {
    const values = [
        `${adminUnitVariable}`,
        +canRead,
        +canAppend,
        +canEdit,
        +canDelete,
        position,
        `@${getSchemaVariableName()}`
    ]
    const formattedValues = `\t(${values.join(", ")})`;
    return formattedValues;
}

const getDeleteRows = () =>
    `\tDELETE FROM "SysEntitySchemaOperationRight" WHERE "SubjectSchemaUId" = ${getSchemaVariableName()}`;

const getSchemaVariable = (schemaUId) => 
    `\t${getSchemaVariableName()} uuid = '${schemaUId}';`

export default generateScript;