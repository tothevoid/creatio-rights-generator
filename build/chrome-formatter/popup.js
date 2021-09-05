/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./popup/popup.css":
/*!*************************!*\
  !*** ./popup/popup.css ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "../../formatter/constants/constants.js":
/*!**********************************************!*\
  !*** ../../formatter/constants/constants.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const sqlFormat = {
    MSSQL: 0,
    PostgreSQL: 1
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sqlFormat);

/***/ }),

/***/ "../../formatter/formatter.js":
/*!************************************!*\
  !*** ../../formatter/formatter.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants/constants.js */ "../../formatter/constants/constants.js");
/* harmony import */ var _mssqlFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mssqlFormatter.js */ "../../formatter/mssqlFormatter.js");
/* harmony import */ var _postgreFormatter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./postgreFormatter.js */ "../../formatter/postgreFormatter.js");




const getFormatter = (format) => {
    switch (format){
        case (_constants_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"].MSSQL):
            return _mssqlFormatter_js__WEBPACK_IMPORTED_MODULE_1__["default"];
        case (_constants_constants_js__WEBPACK_IMPORTED_MODULE_0__["default"].PostgreSQL):
            return _postgreFormatter_js__WEBPACK_IMPORTED_MODULE_2__["default"];
        default:
            throw new Error("Invalid format passed");
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getFormatter);

/***/ }),

/***/ "../../formatter/mssqlFormatter.js":
/*!*****************************************!*\
  !*** ../../formatter/mssqlFormatter.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const generateScript = (tableCaption, schemaUId, rights) => {
    const headerRows = getHeaderRows(tableCaption, rights);
    const scriptRows = getScriptRows(rights, schemaUId);
    return [...headerRows, "", ...scriptRows].join("\n");
}

const getHeaderRows = (tableCaption, rightsResult) => {
    const header = `Настройка прав доступа по операциям на объект \"${tableCaption}\"`;
    const roles = rightsResult.map(right => formatRole(right.SysAdminUnitId, right.UnitName));
    return ["/*", header, ...roles, "*/"];
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

const formatRole = (roleId, roleName) => {
    return `'${roleId}' - ${roleName}`
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
        `@${getSchmeaVariableName()}`
    ]
    const formattedValues = `\tVALUES (${values.join(", ")})`;
    return [insert, formattedValues];
}

const getDeleteRows = () => {
    const deleteStatement = "DELETE FROM [SysEntitySchemaOperationRight]";
    const filter = `\tWHERE [SubjectSchemaUId] = @${getSchmeaVariableName()}`;
    return [deleteStatement, filter];
}

const getSchemaVariable = (schemaUId) => 
    `DECLARE @${getSchmeaVariableName()} uniqueidentifier = '${schemaUId}';`

const getSchmeaVariableName = () =>
    "rightsSchemaUId"

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (generateScript);

/***/ }),

/***/ "../../formatter/postgreFormatter.js":
/*!*******************************************!*\
  !*** ../../formatter/postgreFormatter.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const generateScript = (tableCaption, schemaUId, rights) => {
    const headerRows = getHeaderRows(tableCaption, rights);
    const scriptRows = getScriptRows(rights, schemaUId);
    return [...headerRows, "", ...scriptRows].join("\n");
}

const getHeaderRows = (tableCaption, rightsResult) => {
    const header = `Настройка прав доступа по операциям на объект \"${tableCaption}\"`;
    const roles = rightsResult.map(right => formatRole(right.SysAdminUnitId, right.UnitName));
    return ["/*", header, ...roles, "*/"];
}

const getScriptRows = (rightsResult, schemaUId) => {
    const schemaVariable = getSchemaVariable(schemaUId);
    const deleteRows = getDeleteRows();

    const unitVariables = [];
    const insertRows = [];

    insertRows.push(formatInsertStatement());
    rightsResult.forEach((right, ix) => {
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

const formatRole = (roleId, roleName) => {
    return `'${roleId}' - ${roleName}`
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
        `@${getSchmeaVariableName()}`
    ]
    const formattedValues = `\t(${values.join(", ")})`;
    return formattedValues;
}

const getDeleteRows = () =>
    `\tDELETE FROM "SysEntitySchemaOperationRight" WHERE "SubjectSchemaUId" = ${getSchmeaVariableName()}`;

const getSchemaVariable = (schemaUId) => 
    `\t${getSchmeaVariableName()} uuid = '${schemaUId}';`

const getSchmeaVariableName = () =>
    "rightsSchemaUId"

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (generateScript);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./popup/popup.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./popup.css */ "./popup/popup.css");
/* harmony import */ var _formatter_formatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../formatter/formatter.js */ "../../formatter/formatter.js");



const formatScriptBtn = document.getElementById("format-btn");

chrome.storage.sync.get("dbType", async (result) => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const dbTypeInput = document.getElementById("db-type");
	if (typeof(result?.dbType) === "number"){
		dbTypeInput.value = result.dbType;
	} else {
		chrome.storage.sync.set({dbType: 0});
	}

	dbTypeInput.addEventListener("change", (event) => {
		const value = event.target?.value || 0;
		chrome.storage.sync.set({dbType: parseInt(value)});
	})

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: getCreatioServerParameters
	}, updateSQLText);
})

const updateSQLText = (parameters) => {
	if (parameters && parameters[0] && parameters[0]?.result)
	{
		const {isCorrectUrl, url} = parameters[0]?.result;

		if (parameters[0].result?.isCorrectUrl){
			const placeholder = document.getElementById("placeholder");
			if (placeholder){
				placeholder.remove();
			}
		}
	
		chrome.storage.sync.get("script", async (result) => {
			if (result?.script?.url === url){
				updateOutput(result.script.text);
			}
		});
	}
}

formatScriptBtn.addEventListener("click", async () => {
	formatScriptBtn.disabled = true;
  	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
    	function: getCreatioServerParameters
	}, sendFormatMessage);
});

const sendFormatMessage = (injectionResults) => {
	if (injectionResults && injectionResults.length !== 0){
		const injectionResult = injectionResults[0];
		if (injectionResult && injectionResult.result?.token && 
			injectionResult.result?.schemaUId && 
			injectionResult.result?.url){
			const parameters = {
				token: injectionResult.result.token,
				url: injectionResult.result.url,  
				schemaUId: injectionResult.result.schemaUId
			}
			chrome.runtime.sendMessage(parameters, processFormattedScript);
		}
	}
}

const processFormattedScript = async (response) => {
	formatScriptBtn.disabled = false;
	if (response && response.caption && response.rights && 
		response.rights.length !== 0 && response.schemaUId){
		chrome.storage.sync.set({schemaUId: response.schemaUId});
		const dbType = document.getElementById("db-type")?.value || 0;
		const scriptFormatter = (0,_formatter_formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"])(parseInt(dbType));
		const sqlScript = scriptFormatter(response.caption, response.schemaUId, response.rights);
		updateOutput(sqlScript);
		chrome.storage.sync.set({script: {url: response.url, text: sqlScript}});
		
		const isBind = document.getElementById("bind-checkbox").checked;
		if (isBind){
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: getCreatioServerParameters
			}, bindToPackage);
		}
	}
}

const getCreatioServerParameters = () => {
	if (document?.cookie && window?.location?.href && location?.origin){
		const cookies = document.cookie.split("=");
		const urlParts = window.location.href.split("/");
		const isCorrectUrl = urlParts && urlParts.length > 2 && 
			urlParts[urlParts.length - 2] === "AdministratedObjects";
		if (cookies && cookies.length >= 1 && urlParts && urlParts.length !== 0){
			const token = cookies[1];
			const schemaUId = urlParts[urlParts.length - 1];
			const url = location.origin;
			return {url, token, schemaUId, isCorrectUrl}
		}
	}
	return null;
}

const bindToPackage = async (injectionResults) => {
	chrome.storage.sync.get("schemaUId", (result) => {
		if (injectionResults && injectionResults.length !== 0){
			const injectionResult = injectionResults[0];
			const outputElement = document.getElementById("output");
			if (injectionResult.result?.token &&
				injectionResult.result?.url && outputElement && 
				outputElement.textContent){
				fetch(`${injectionResult.result.url}/0/rest/RightsScriptGeneratorService/GenerateScript`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"BPMCSRF": injectionResult.result.token
					},
					body: JSON.stringify({
						script: outputElement.textContent,
						schemaUId: result.schemaUId
					})
					}
				).then(res => res.json())
				.then(res => {
					if (res?.GenerateScriptResult?.IsSuccessful && res?.GenerateScriptResult?.ScriptUrl){
						chrome.tabs.create({ url: res.GenerateScriptResult.ScriptUrl })
					}
				});
			}
		}
	});
}

const updateOutput = (script) => {
	const outputElement = document.getElementById("output");
	outputElement.textContent = script;
	const popup = document.querySelector(".popup-body");
	popup.style.width = "600px";
	outputElement.style.height = "300px";
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TDtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uL3BvcHVwL3BvcHVwLmNzcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9jb25zdGFudHMvY29uc3RhbnRzLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL2Zvcm1hdHRlci5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9tc3NxbEZvcm1hdHRlci5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9wb3N0Z3JlRm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4vcG9wdXAvcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiY29uc3Qgc3FsRm9ybWF0ID0ge1xyXG4gICAgTVNTUUw6IDAsXHJcbiAgICBQb3N0Z3JlU1FMOiAxXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNxbEZvcm1hdDsiLCJpbXBvcnQgc3FsQ29uc3RhbnRzICBmcm9tIFwiLi9jb25zdGFudHMvY29uc3RhbnRzLmpzXCJcclxuaW1wb3J0IG1zc3FsRm9ybWF0dGVyIGZyb20gXCIuL21zc3FsRm9ybWF0dGVyLmpzXCJcclxuaW1wb3J0IHBvc3RncmVGb3JtYXR0ZXIgZnJvbSBcIi4vcG9zdGdyZUZvcm1hdHRlci5qc1wiXHJcblxyXG5jb25zdCBnZXRGb3JtYXR0ZXIgPSAoZm9ybWF0KSA9PiB7XHJcbiAgICBzd2l0Y2ggKGZvcm1hdCl7XHJcbiAgICAgICAgY2FzZSAoc3FsQ29uc3RhbnRzLk1TU1FMKTpcclxuICAgICAgICAgICAgcmV0dXJuIG1zc3FsRm9ybWF0dGVyO1xyXG4gICAgICAgIGNhc2UgKHNxbENvbnN0YW50cy5Qb3N0Z3JlU1FMKTpcclxuICAgICAgICAgICAgcmV0dXJuIHBvc3RncmVGb3JtYXR0ZXI7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXQgcGFzc2VkXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRGb3JtYXR0ZXI7IiwiY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRIZWFkZXJSb3dzID0gKHRhYmxlQ2FwdGlvbiwgcmlnaHRzUmVzdWx0KSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXIgPSBg0J3QsNGB0YLRgNC+0LnQutCwINC/0YDQsNCyINC00L7RgdGC0YPQv9CwINC/0L4g0L7Qv9C10YDQsNGG0LjRj9C8INC90LAg0L7QsdGK0LXQutGCIFxcXCIke3RhYmxlQ2FwdGlvbn1cXFwiYDtcclxuICAgIGNvbnN0IHJvbGVzID0gcmlnaHRzUmVzdWx0Lm1hcChyaWdodCA9PiBmb3JtYXRSb2xlKHJpZ2h0LlN5c0FkbWluVW5pdElkLCByaWdodC5Vbml0TmFtZSkpO1xyXG4gICAgcmV0dXJuIFtcIi8qXCIsIGhlYWRlciwgLi4ucm9sZXMsIFwiKi9cIl07XHJcbn1cclxuXHJcbmNvbnN0IGdldFNjcmlwdFJvd3MgPSAocmlnaHRzUmVzdWx0LCBzY2hlbWFVSWQpID0+IHtcclxuICAgIGNvbnN0IHNjaGVtYVZhcmlhYmxlID0gZ2V0U2NoZW1hVmFyaWFibGUoc2NoZW1hVUlkKTtcclxuICAgIGNvbnN0IGRlbGV0ZVJvd3MgPSBnZXREZWxldGVSb3dzKCk7XHJcblxyXG4gICAgY29uc3QgdW5pdFZhcmlhYmxlcyA9IFtdO1xyXG4gICAgY29uc3QgaW5zZXJ0Um93cyA9IFtdO1xyXG5cclxuICAgIHJpZ2h0c1Jlc3VsdC5mb3JFYWNoKChyaWdodCwgaXgpID0+IHtcclxuICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBnZXRWYXJpYWJsZU5hbWUocmlnaHQuVW5pdE5hbWUpO1xyXG4gICAgICAgIHVuaXRWYXJpYWJsZXMucHVzaChnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQodmFyaWFibGVOYW1lLCByaWdodC5TeXNBZG1pblVuaXRJZCkpO1xyXG4gICAgICAgIGluc2VydFJvd3MucHVzaCguLi5mb3JtYXRSaWdodEluc2VydCh2YXJpYWJsZU5hbWUsIHJpZ2h0LkNhblJlYWQsIFxyXG4gICAgICAgICAgICByaWdodC5DYW5BcHBlbmQsIHJpZ2h0LkNhbkVkaXQsIHJpZ2h0LkNhbkRlbGV0ZSwgcmlnaHQuUG9zaXRpb24pKTtcclxuXHJcbiAgICAgICAgaWYgKGl4ICE9PSByaWdodHNSZXN1bHQubGVuZ3RoIC0gMSl7XHJcbiAgICAgICAgICAgIGluc2VydFJvd3MucHVzaChcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIC4uLnVuaXRWYXJpYWJsZXMsIFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgc2NoZW1hVmFyaWFibGUsXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICAuLi5kZWxldGVSb3dzLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uaW5zZXJ0Um93c1xyXG4gICAgXTtcclxufVxyXG5cclxuY29uc3QgZm9ybWF0Um9sZSA9IChyb2xlSWQsIHJvbGVOYW1lKSA9PiB7XHJcbiAgICByZXR1cm4gYCcke3JvbGVJZH0nIC0gJHtyb2xlTmFtZX1gXHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlTmFtZSA9IChzeXNBZG1pblVuaXROYW1lKSA9PiB7XHJcbiAgICBjb25zdCBjbGVhcmVkVmFyaWFibGUgPSBzeXNBZG1pblVuaXROYW1lLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcclxuICAgIHJldHVybiBgJHtjbGVhcmVkVmFyaWFibGUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCl9JHtjbGVhcmVkVmFyaWFibGUuc2xpY2UoMSl9SWRgO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQgPSAodmFyaWFibGVOYW1lLCBhZG1pblVuaXRJZCkgPT4gXHJcbiAgICBgREVDTEFSRSBAJHt2YXJpYWJsZU5hbWV9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHthZG1pblVuaXRJZH0nO2BcclxuXHJcbmNvbnN0IGZvcm1hdFJpZ2h0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IFwiSU5TRVJUIElOVE8gU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHQgKFN5c0FkbWluVW5pdElkLCBDYW5SZWFkLCBDYW5BcHBlbmQsIENhbkVkaXQsIENhbkRlbGV0ZSwgUG9zaXRpb24sIFN1YmplY3RTY2hlbWFVSWQpXCI7XHJcbiAgICBcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgQCR7YWRtaW5Vbml0VmFyaWFibGV9YCxcclxuICAgICAgICArY2FuUmVhZCxcclxuICAgICAgICArY2FuQXBwZW5kLFxyXG4gICAgICAgICtjYW5FZGl0LFxyXG4gICAgICAgICtjYW5EZWxldGUsXHJcbiAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgYEAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWBcclxuICAgIF1cclxuICAgIGNvbnN0IGZvcm1hdHRlZFZhbHVlcyA9IGBcXHRWQUxVRVMgKCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBbaW5zZXJ0LCBmb3JtYXR0ZWRWYWx1ZXNdO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGVsZXRlU3RhdGVtZW50ID0gXCJERUxFVEUgRlJPTSBbU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRdXCI7XHJcbiAgICBjb25zdCBmaWx0ZXIgPSBgXFx0V0hFUkUgW1N1YmplY3RTY2hlbWFVSWRdID0gQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YDtcclxuICAgIHJldHVybiBbZGVsZXRlU3RhdGVtZW50LCBmaWx0ZXJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYERFQ0xBUkUgQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5jb25zdCBnZXRTY2htZWFWYXJpYWJsZU5hbWUgPSAoKSA9PlxyXG4gICAgXCJyaWdodHNTY2hlbWFVSWRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVTY3JpcHQ7IiwiY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRIZWFkZXJSb3dzID0gKHRhYmxlQ2FwdGlvbiwgcmlnaHRzUmVzdWx0KSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXIgPSBg0J3QsNGB0YLRgNC+0LnQutCwINC/0YDQsNCyINC00L7RgdGC0YPQv9CwINC/0L4g0L7Qv9C10YDQsNGG0LjRj9C8INC90LAg0L7QsdGK0LXQutGCIFxcXCIke3RhYmxlQ2FwdGlvbn1cXFwiYDtcclxuICAgIGNvbnN0IHJvbGVzID0gcmlnaHRzUmVzdWx0Lm1hcChyaWdodCA9PiBmb3JtYXRSb2xlKHJpZ2h0LlN5c0FkbWluVW5pdElkLCByaWdodC5Vbml0TmFtZSkpO1xyXG4gICAgcmV0dXJuIFtcIi8qXCIsIGhlYWRlciwgLi4ucm9sZXMsIFwiKi9cIl07XHJcbn1cclxuXHJcbmNvbnN0IGdldFNjcmlwdFJvd3MgPSAocmlnaHRzUmVzdWx0LCBzY2hlbWFVSWQpID0+IHtcclxuICAgIGNvbnN0IHNjaGVtYVZhcmlhYmxlID0gZ2V0U2NoZW1hVmFyaWFibGUoc2NoZW1hVUlkKTtcclxuICAgIGNvbnN0IGRlbGV0ZVJvd3MgPSBnZXREZWxldGVSb3dzKCk7XHJcblxyXG4gICAgY29uc3QgdW5pdFZhcmlhYmxlcyA9IFtdO1xyXG4gICAgY29uc3QgaW5zZXJ0Um93cyA9IFtdO1xyXG5cclxuICAgIGluc2VydFJvd3MucHVzaChmb3JtYXRJbnNlcnRTdGF0ZW1lbnQoKSk7XHJcbiAgICByaWdodHNSZXN1bHQuZm9yRWFjaCgocmlnaHQsIGl4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0KHZhcmlhYmxlTmFtZSwgcmlnaHQuQ2FuUmVhZCwgXHJcbiAgICAgICAgICAgIHJpZ2h0LkNhbkFwcGVuZCwgcmlnaHQuQ2FuRWRpdCwgcmlnaHQuQ2FuRGVsZXRlLCByaWdodC5Qb3NpdGlvbikpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBcIkRPICQkXCIsXHJcbiAgICAgICAgXCJERUNMQVJFXCIsXHJcbiAgICAgICAgLi4udW5pdFZhcmlhYmxlcywgXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICBzY2hlbWFWYXJpYWJsZSxcclxuICAgICAgICBcIkJFR0lOXCIsXHJcbiAgICAgICAgZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3MsXHJcbiAgICAgICAgXCJFTkQ7XCIsXHJcbiAgICAgICAgXCIkJFwiXHJcbiAgICBdO1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRSb2xlID0gKHJvbGVJZCwgcm9sZU5hbWUpID0+IHtcclxuICAgIHJldHVybiBgJyR7cm9sZUlkfScgLSAke3JvbGVOYW1lfWBcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVOYW1lID0gKHN5c0FkbWluVW5pdE5hbWUpID0+IHtcclxuICAgIGNvbnN0IGNsZWFyZWRWYXJpYWJsZSA9IHN5c0FkbWluVW5pdE5hbWUucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xyXG4gICAgcmV0dXJuIGAke2NsZWFyZWRWYXJpYWJsZS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKX0ke2NsZWFyZWRWYXJpYWJsZS5zbGljZSgxKX1JZGA7XHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlRGVjbGFyZVN0YXRlbWVudCA9ICh2YXJpYWJsZU5hbWUsIGFkbWluVW5pdElkKSA9PiBcclxuICAgIGBcXHQke3ZhcmlhYmxlTmFtZX0gdXVpZCA9ICcke2FkbWluVW5pdElkfSc7YDtcclxuXHJcbmNvbnN0IGZvcm1hdEluc2VydFN0YXRlbWVudCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IGBcXHRJTlNFUlQgSU5UTyBcIlN5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0XCIgKFwiU3lzQWRtaW5Vbml0SWRcIiwgXCJDYW5SZWFkXCIsIFwiQ2FuQXBwZW5kXCIsIFwiQ2FuRWRpdFwiLCBcIkNhbkRlbGV0ZVwiLCBcIlBvc2l0aW9uXCIsIFwiU3ViamVjdFNjaGVtYVVJZFwiKSBWQUxVRVNgO1xyXG4gICAgcmV0dXJuIGluc2VydDtcclxufVxyXG5cclxuY29uc3QgZm9ybWF0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgJHthZG1pblVuaXRWYXJpYWJsZX1gLFxyXG4gICAgICAgICtjYW5SZWFkLFxyXG4gICAgICAgICtjYW5BcHBlbmQsXHJcbiAgICAgICAgK2NhbkVkaXQsXHJcbiAgICAgICAgK2NhbkRlbGV0ZSxcclxuICAgICAgICBwb3NpdGlvbixcclxuICAgICAgICBgQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YFxyXG4gICAgXVxyXG4gICAgY29uc3QgZm9ybWF0dGVkVmFsdWVzID0gYFxcdCgke3ZhbHVlcy5qb2luKFwiLCBcIil9KWA7XHJcbiAgICByZXR1cm4gZm9ybWF0dGVkVmFsdWVzO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT5cclxuICAgIGBcXHRERUxFVEUgRlJPTSBcIlN5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0XCIgV0hFUkUgXCJTdWJqZWN0U2NoZW1hVUlkXCIgPSAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWA7XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYFxcdCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9IHV1aWQgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5jb25zdCBnZXRTY2htZWFWYXJpYWJsZU5hbWUgPSAoKSA9PlxyXG4gICAgXCJyaWdodHNTY2hlbWFVSWRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVTY3JpcHQ7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgXCIuL3BvcHVwLmNzc1wiO1xyXG5pbXBvcnQgZm9ybWF0dGVyIGZyb20gXCIuLi8uLi8uLi9mb3JtYXR0ZXIvZm9ybWF0dGVyLmpzXCJcclxuXHJcbmNvbnN0IGZvcm1hdFNjcmlwdEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybWF0LWJ0blwiKTtcclxuXHJcbmNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwiZGJUeXBlXCIsIGFzeW5jIChyZXN1bHQpID0+IHtcclxuXHRjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pO1xyXG5cdGNvbnN0IGRiVHlwZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkYi10eXBlXCIpO1xyXG5cdGlmICh0eXBlb2YocmVzdWx0Py5kYlR5cGUpID09PSBcIm51bWJlclwiKXtcclxuXHRcdGRiVHlwZUlucHV0LnZhbHVlID0gcmVzdWx0LmRiVHlwZTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Y2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe2RiVHlwZTogMH0pO1xyXG5cdH1cclxuXHJcblx0ZGJUeXBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0Py52YWx1ZSB8fCAwO1xyXG5cdFx0Y2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe2RiVHlwZTogcGFyc2VJbnQodmFsdWUpfSk7XHJcblx0fSlcclxuXHJcblx0Y2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuXHRcdHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXHJcblx0XHRmdW5jdGlvbjogZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnNcclxuXHR9LCB1cGRhdGVTUUxUZXh0KTtcclxufSlcclxuXHJcbmNvbnN0IHVwZGF0ZVNRTFRleHQgPSAocGFyYW1ldGVycykgPT4ge1xyXG5cdGlmIChwYXJhbWV0ZXJzICYmIHBhcmFtZXRlcnNbMF0gJiYgcGFyYW1ldGVyc1swXT8ucmVzdWx0KVxyXG5cdHtcclxuXHRcdGNvbnN0IHtpc0NvcnJlY3RVcmwsIHVybH0gPSBwYXJhbWV0ZXJzWzBdPy5yZXN1bHQ7XHJcblxyXG5cdFx0aWYgKHBhcmFtZXRlcnNbMF0ucmVzdWx0Py5pc0NvcnJlY3RVcmwpe1xyXG5cdFx0XHRjb25zdCBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhY2Vob2xkZXJcIik7XHJcblx0XHRcdGlmIChwbGFjZWhvbGRlcil7XHJcblx0XHRcdFx0cGxhY2Vob2xkZXIucmVtb3ZlKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwic2NyaXB0XCIsIGFzeW5jIChyZXN1bHQpID0+IHtcclxuXHRcdFx0aWYgKHJlc3VsdD8uc2NyaXB0Py51cmwgPT09IHVybCl7XHJcblx0XHRcdFx0dXBkYXRlT3V0cHV0KHJlc3VsdC5zY3JpcHQudGV4dCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuZm9ybWF0U2NyaXB0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcblx0Zm9ybWF0U2NyaXB0QnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICBcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0Y2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuXHRcdHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXHJcbiAgICBcdGZ1bmN0aW9uOiBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVyc1xyXG5cdH0sIHNlbmRGb3JtYXRNZXNzYWdlKTtcclxufSk7XHJcblxyXG5jb25zdCBzZW5kRm9ybWF0TWVzc2FnZSA9IChpbmplY3Rpb25SZXN1bHRzKSA9PiB7XHJcblx0aWYgKGluamVjdGlvblJlc3VsdHMgJiYgaW5qZWN0aW9uUmVzdWx0cy5sZW5ndGggIT09IDApe1xyXG5cdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHQgJiYgaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiYgXHJcblx0XHRcdGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnNjaGVtYVVJZCAmJiBcclxuXHRcdFx0aW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udXJsKXtcclxuXHRcdFx0Y29uc3QgcGFyYW1ldGVycyA9IHtcclxuXHRcdFx0XHR0b2tlbjogaW5qZWN0aW9uUmVzdWx0LnJlc3VsdC50b2tlbixcclxuXHRcdFx0XHR1cmw6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudXJsLCAgXHJcblx0XHRcdFx0c2NoZW1hVUlkOiBpbmplY3Rpb25SZXN1bHQucmVzdWx0LnNjaGVtYVVJZFxyXG5cdFx0XHR9XHJcblx0XHRcdGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHBhcmFtZXRlcnMsIHByb2Nlc3NGb3JtYXR0ZWRTY3JpcHQpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY29uc3QgcHJvY2Vzc0Zvcm1hdHRlZFNjcmlwdCA9IGFzeW5jIChyZXNwb25zZSkgPT4ge1xyXG5cdGZvcm1hdFNjcmlwdEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXB0aW9uICYmIHJlc3BvbnNlLnJpZ2h0cyAmJiBcclxuXHRcdHJlc3BvbnNlLnJpZ2h0cy5sZW5ndGggIT09IDAgJiYgcmVzcG9uc2Uuc2NoZW1hVUlkKXtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtzY2hlbWFVSWQ6IHJlc3BvbnNlLnNjaGVtYVVJZH0pO1xyXG5cdFx0Y29uc3QgZGJUeXBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkYi10eXBlXCIpPy52YWx1ZSB8fCAwO1xyXG5cdFx0Y29uc3Qgc2NyaXB0Rm9ybWF0dGVyID0gZm9ybWF0dGVyKHBhcnNlSW50KGRiVHlwZSkpO1xyXG5cdFx0Y29uc3Qgc3FsU2NyaXB0ID0gc2NyaXB0Rm9ybWF0dGVyKHJlc3BvbnNlLmNhcHRpb24sIHJlc3BvbnNlLnNjaGVtYVVJZCwgcmVzcG9uc2UucmlnaHRzKTtcclxuXHRcdHVwZGF0ZU91dHB1dChzcWxTY3JpcHQpO1xyXG5cdFx0Y2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe3NjcmlwdDoge3VybDogcmVzcG9uc2UudXJsLCB0ZXh0OiBzcWxTY3JpcHR9fSk7XHJcblx0XHRcclxuXHRcdGNvbnN0IGlzQmluZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmluZC1jaGVja2JveFwiKS5jaGVja2VkO1xyXG5cdFx0aWYgKGlzQmluZCl7XHJcblx0XHRcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0XHRcdGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcblx0XHRcdFx0dGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcclxuXHRcdFx0XHRmdW5jdGlvbjogZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnNcclxuXHRcdFx0fSwgYmluZFRvUGFja2FnZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVycyA9ICgpID0+IHtcclxuXHRpZiAoZG9jdW1lbnQ/LmNvb2tpZSAmJiB3aW5kb3c/LmxvY2F0aW9uPy5ocmVmICYmIGxvY2F0aW9uPy5vcmlnaW4pe1xyXG5cdFx0Y29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIj1cIik7XHJcblx0XHRjb25zdCB1cmxQYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFwiL1wiKTtcclxuXHRcdGNvbnN0IGlzQ29ycmVjdFVybCA9IHVybFBhcnRzICYmIHVybFBhcnRzLmxlbmd0aCA+IDIgJiYgXHJcblx0XHRcdHVybFBhcnRzW3VybFBhcnRzLmxlbmd0aCAtIDJdID09PSBcIkFkbWluaXN0cmF0ZWRPYmplY3RzXCI7XHJcblx0XHRpZiAoY29va2llcyAmJiBjb29raWVzLmxlbmd0aCA+PSAxICYmIHVybFBhcnRzICYmIHVybFBhcnRzLmxlbmd0aCAhPT0gMCl7XHJcblx0XHRcdGNvbnN0IHRva2VuID0gY29va2llc1sxXTtcclxuXHRcdFx0Y29uc3Qgc2NoZW1hVUlkID0gdXJsUGFydHNbdXJsUGFydHMubGVuZ3RoIC0gMV07XHJcblx0XHRcdGNvbnN0IHVybCA9IGxvY2F0aW9uLm9yaWdpbjtcclxuXHRcdFx0cmV0dXJuIHt1cmwsIHRva2VuLCBzY2hlbWFVSWQsIGlzQ29ycmVjdFVybH1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmNvbnN0IGJpbmRUb1BhY2thZ2UgPSBhc3luYyAoaW5qZWN0aW9uUmVzdWx0cykgPT4ge1xyXG5cdGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwic2NoZW1hVUlkXCIsIChyZXN1bHQpID0+IHtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHRzICYmIGluamVjdGlvblJlc3VsdHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdFx0Y29uc3Qgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0cHV0XCIpO1xyXG5cdFx0XHRpZiAoaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiZcclxuXHRcdFx0XHRpbmplY3Rpb25SZXN1bHQucmVzdWx0Py51cmwgJiYgb3V0cHV0RWxlbWVudCAmJiBcclxuXHRcdFx0XHRvdXRwdXRFbGVtZW50LnRleHRDb250ZW50KXtcclxuXHRcdFx0XHRmZXRjaChgJHtpbmplY3Rpb25SZXN1bHQucmVzdWx0LnVybH0vMC9yZXN0L1JpZ2h0c1NjcmlwdEdlbmVyYXRvclNlcnZpY2UvR2VuZXJhdGVTY3JpcHRgLCB7XHJcblx0XHRcdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxyXG5cdFx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuXHRcdFx0XHRcdFx0XCJCUE1DU1JGXCI6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudG9rZW5cclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRcdHNjcmlwdDogb3V0cHV0RWxlbWVudC50ZXh0Q29udGVudCxcclxuXHRcdFx0XHRcdFx0c2NoZW1hVUlkOiByZXN1bHQuc2NoZW1hVUlkXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuXHRcdFx0XHQudGhlbihyZXMgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKHJlcz8uR2VuZXJhdGVTY3JpcHRSZXN1bHQ/LklzU3VjY2Vzc2Z1bCAmJiByZXM/LkdlbmVyYXRlU2NyaXB0UmVzdWx0Py5TY3JpcHRVcmwpe1xyXG5cdFx0XHRcdFx0XHRjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IHJlcy5HZW5lcmF0ZVNjcmlwdFJlc3VsdC5TY3JpcHRVcmwgfSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG5jb25zdCB1cGRhdGVPdXRwdXQgPSAoc2NyaXB0KSA9PiB7XHJcblx0Y29uc3Qgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0cHV0XCIpO1xyXG5cdG91dHB1dEVsZW1lbnQudGV4dENvbnRlbnQgPSBzY3JpcHQ7XHJcblx0Y29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBvcHVwLWJvZHlcIik7XHJcblx0cG9wdXAuc3R5bGUud2lkdGggPSBcIjYwMHB4XCI7XHJcblx0b3V0cHV0RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIjMwMHB4XCI7XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=