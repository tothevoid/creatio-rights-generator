chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        setPageBackgroundColor(request.url, request.schemaUId, request.token, sendResponse);
        return true;
    }
);

const setPageBackgroundColor = async (url, schemaUId, token, callback) => {
    fetch(`${url}/0/ServiceModel/RightManagementService.svc/GetAdministratedObject`, {
        method: 'POST', 
        body: JSON.stringify({schemaUId: schemaUId}), 
        headers: {
            'Content-Type': 'application/json',
            "BPMCSRF": token
        }
    }).then(res => res.json())
    .then(async (res) => {
      if (res && res.administratedObject){
        const response = res.administratedObject;
        const rights = response.entitySchemaOperationsRights;
        if (rights && rights.length !== 0){;
          const mappedRights = rights.map(right => {
            return {
              SysAdminUnitId: right.sysAdminUnit.id,
              UnitName: right.sysAdminUnit.name,
              CanRead: right.canRead,
              CanAppend: right.canAppend,
              CanEdit: right.canEdit,
              CanDelete: right.canDelete,
              Position: right.position
            }
          })
          callback({caption: response.caption, rights: mappedRights});
        }
      }
    });
}