/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./background.js ***!
  \***********************/
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
          		callback({caption: object.caption, rights: mappedRights, schemaUId: schemaUId});
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
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLElBQUk7QUFDakI7QUFDQSw4QkFBOEIscUJBQXFCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixvRUFBb0U7QUFDMUY7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uL2JhY2tncm91bmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxyXG4gICAgKHJlcXVlc3QsIHNlbmRlciwgY2FsbGJhY2spID0+IHtcclxuICAgICAgICBnZXRTY2hlbWFSaWdodHMocmVxdWVzdC51cmwsIHJlcXVlc3Quc2NoZW1hVUlkLCByZXF1ZXN0LnRva2VuLCBjYWxsYmFjayk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbik7XHJcblxyXG5jb25zdCBnZXRTY2hlbWFSaWdodHMgPSAodXJsLCBzY2hlbWFVSWQsIHRva2VuLCBjYWxsYmFjaykgPT4ge1xyXG4gICAgZmV0Y2goYCR7dXJsfS8wL1NlcnZpY2VNb2RlbC9SaWdodE1hbmFnZW1lbnRTZXJ2aWNlLnN2Yy9HZXRBZG1pbmlzdHJhdGVkT2JqZWN0YCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLCBcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7c2NoZW1hVUlkOiBzY2hlbWFVSWR9KSwgXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICBcIkJQTUNTUkZcIjogdG9rZW5cclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0aWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmFkbWluaXN0cmF0ZWRPYmplY3Qpe1xyXG4gICAgICAgIFx0Y29uc3Qgb2JqZWN0ID0gcmVzcG9uc2UuYWRtaW5pc3RyYXRlZE9iamVjdDtcclxuICAgICAgICBcdGNvbnN0IHJpZ2h0cyA9IG9iamVjdC5lbnRpdHlTY2hlbWFPcGVyYXRpb25zUmlnaHRzO1xyXG4gICAgICAgIFx0aWYgKHJpZ2h0cyAmJiByaWdodHMubGVuZ3RoICE9PSAwKXtcclxuICAgICAgICBcdFx0Y29uc3QgbWFwcGVkUmlnaHRzID0gcmlnaHRzLm1hcChyaWdodCA9PiBtYXBSaWdodChyaWdodCkpXHJcbiAgICAgICAgICBcdFx0Y2FsbGJhY2soe2NhcHRpb246IG9iamVjdC5jYXB0aW9uLCByaWdodHM6IG1hcHBlZFJpZ2h0cywgc2NoZW1hVUlkOiBzY2hlbWFVSWR9KTtcclxuICAgICAgICBcdH1cclxuICAgICAgXHR9XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgbWFwUmlnaHQgPSAocmlnaHQpID0+IHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0U3lzQWRtaW5Vbml0SWQ6IHJpZ2h0LnN5c0FkbWluVW5pdC5pZCxcclxuXHRcdFVuaXROYW1lOiByaWdodC5zeXNBZG1pblVuaXQubmFtZSxcclxuXHRcdENhblJlYWQ6IHJpZ2h0LmNhblJlYWQsXHJcblx0XHRDYW5BcHBlbmQ6IHJpZ2h0LmNhbkFwcGVuZCxcclxuXHRcdENhbkVkaXQ6IHJpZ2h0LmNhbkVkaXQsXHJcblx0XHRDYW5EZWxldGU6IHJpZ2h0LmNhbkRlbGV0ZSxcclxuXHRcdFBvc2l0aW9uOiByaWdodC5wb3NpdGlvblxyXG5cdH1cclxufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==