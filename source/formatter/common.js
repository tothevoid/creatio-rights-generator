export const getHeaderRows = (tableCaption, rightsResult) => {
    const header = `\"${tableCaption}\"`;
    const roles = rightsResult.map(right => formatRole(right.SysAdminUnitId, right.UnitName));
    return ["/*", header, ...roles, "*/"];
}

export const getSchemaVariableName = () =>
    "rightsSchemaUId"

const formatRole = (roleId, roleName) => {
    return `'${roleId}' - ${roleName}`
}