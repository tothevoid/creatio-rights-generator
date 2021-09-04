export const getOperationRightsRequest = (schemaUId) => {
    const select = "select SysAdminUnitId, CanRead, CanAppend, CanEdit, CanDelete, Position, SysAdminUnit.Name as UnitName from SysEntitySchemaOperationRight";
    const join = "join SysAdminUnit on SysAdminUnit.Id = SysEntitySchemaOperationRight.SysAdminUnitId";
    const filter = `where SubjectSchemaUId = '${schemaUId}'`;
    const order = "order by Position";
    return convertToRequest([select, join, filter, order]);
}

export const getTableCaption = (schemaUId, cultureId) => {
    var select = "select SysSchemaLcz.Caption, SysSchema.Name as DefaultCaption from SysSchemaLcz";
    var join = "join SysSchema on SysSchema.Id = SysSchemaLcz.RecordId"
    var filter = `where SysSchema.UId = '${schemaUId}' and SysSchemaLcz.SysCultureId = '${cultureId}'`
    return convertToRequest([select, join, filter]);
}

const convertToRequest = (parts) => 
    parts.join(" ");
