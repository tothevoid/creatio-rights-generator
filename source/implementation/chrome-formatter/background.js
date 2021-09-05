chrome.runtime.onMessage.addListener(
    (request, sender, callback) => {
        getSchemaRights(request.url, request.schemaUId, request.token, callback);
        return true;
    }
);

const getSchemaRights = (url, schemaUId, token, callback) => {
    fetch(`${url}/0/ServiceModel/RightManagementService.svc/GetAdministratedObject`, {
        method: 'POST', 
        body: JSON.stringify({schemaUId: schemaUId}), 
        headers: {
            'Content-Type': 'application/json',
            "BPMCSRF": token
        }
    }).then(response => response.json())
    .then((response) => {
		if (response && response.administratedObject){
        	const object = response.administratedObject;
        	const rights = object.entitySchemaOperationsRights;
        	if (rights && rights.length !== 0){
        		const mappedRights = rights.map(right => mapRight(right))
          		callback({caption: object.caption, rights: mappedRights, schemaUId: schemaUId, url: url});
        	}
      	}
    });
}

const mapRight = (right) => {
	return {
		SysAdminUnitId: right.sysAdminUnit.id,
		UnitName: right.sysAdminUnit.name,
		CanRead: right.canRead,
		CanAppend: right.canAppend,
		CanEdit: right.canEdit,
		CanDelete: right.canDelete,
		Position: right.position
	}
}