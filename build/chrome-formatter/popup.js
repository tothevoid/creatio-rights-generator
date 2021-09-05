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

/***/ "../../formatter/common.js":
/*!*********************************!*\
  !*** ../../formatter/common.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getHeaderRows": () => (/* binding */ getHeaderRows),
/* harmony export */   "getSchemaVariableName": () => (/* binding */ getSchemaVariableName)
/* harmony export */ });
const getHeaderRows = (tableCaption, rightsResult) => {
    const header = `\"${tableCaption}\"`;
    const roles = rightsResult.map(right => formatRole(right.SysAdminUnitId, right.UnitName));
    return ["/*", header, ...roles, "*/"];
}

const getSchemaVariableName = () =>
    "rightsSchemaUId"

const formatRole = (roleId, roleName) => {
    return `'${roleId}' - ${roleName}`
}

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
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "../../formatter/common.js");


const generateScript = (tableCaption, schemaUId, rights) => {
    const headerRows = (0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getHeaderRows)(tableCaption, rights);
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
        `@${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()}`
    ]
    const formattedValues = `\tVALUES (${values.join(", ")})`;
    return [insert, formattedValues];
}

const getDeleteRows = () => {
    const deleteStatement = "DELETE FROM [SysEntitySchemaOperationRight]";
    const filter = `\tWHERE [SubjectSchemaUId] = @${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()}`;
    return [deleteStatement, filter];
}

const getSchemaVariable = (schemaUId) => 
    `DECLARE @${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()} uniqueidentifier = '${schemaUId}';`

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
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "../../formatter/common.js");


const generateScript = (tableCaption, schemaUId, rights) => {
    const headerRows = (0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getHeaderRows)(tableCaption, rights);
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
        `@${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()}`
    ]
    const formattedValues = `\t(${values.join(", ")})`;
    return formattedValues;
}

const getDeleteRows = () =>
    `\tDELETE FROM "SysEntitySchemaOperationRight" WHERE "SubjectSchemaUId" = ${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()}`;

const getSchemaVariable = (schemaUId) => 
    `\t${(0,_common_js__WEBPACK_IMPORTED_MODULE_0__.getSchemaVariableName)()} uuid = '${schemaUId}';`

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQyIsInNvdXJjZXMiOlsid2VicGFjazovL3JpZ2h0cy1leHQvLi9wb3B1cC9wb3B1cC5jc3MiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvY29tbW9uLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL2NvbnN0YW50cy9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvZm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL21zc3FsRm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL3Bvc3RncmVGb3JtYXR0ZXIuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3JpZ2h0cy1leHQvLi9wb3B1cC9wb3B1cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCJleHBvcnQgY29uc3QgZ2V0SGVhZGVyUm93cyA9ICh0YWJsZUNhcHRpb24sIHJpZ2h0c1Jlc3VsdCkgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyID0gYFxcXCIke3RhYmxlQ2FwdGlvbn1cXFwiYDtcclxuICAgIGNvbnN0IHJvbGVzID0gcmlnaHRzUmVzdWx0Lm1hcChyaWdodCA9PiBmb3JtYXRSb2xlKHJpZ2h0LlN5c0FkbWluVW5pdElkLCByaWdodC5Vbml0TmFtZSkpO1xyXG4gICAgcmV0dXJuIFtcIi8qXCIsIGhlYWRlciwgLi4ucm9sZXMsIFwiKi9cIl07XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRTY2hlbWFWYXJpYWJsZU5hbWUgPSAoKSA9PlxyXG4gICAgXCJyaWdodHNTY2hlbWFVSWRcIlxyXG5cclxuY29uc3QgZm9ybWF0Um9sZSA9IChyb2xlSWQsIHJvbGVOYW1lKSA9PiB7XHJcbiAgICByZXR1cm4gYCcke3JvbGVJZH0nIC0gJHtyb2xlTmFtZX1gXHJcbn0iLCJjb25zdCBzcWxGb3JtYXQgPSB7XHJcbiAgICBNU1NRTDogMCxcclxuICAgIFBvc3RncmVTUUw6IDFcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgc3FsRm9ybWF0OyIsImltcG9ydCBzcWxDb25zdGFudHMgIGZyb20gXCIuL2NvbnN0YW50cy9jb25zdGFudHMuanNcIlxyXG5pbXBvcnQgbXNzcWxGb3JtYXR0ZXIgZnJvbSBcIi4vbXNzcWxGb3JtYXR0ZXIuanNcIlxyXG5pbXBvcnQgcG9zdGdyZUZvcm1hdHRlciBmcm9tIFwiLi9wb3N0Z3JlRm9ybWF0dGVyLmpzXCJcclxuXHJcbmNvbnN0IGdldEZvcm1hdHRlciA9IChmb3JtYXQpID0+IHtcclxuICAgIHN3aXRjaCAoZm9ybWF0KXtcclxuICAgICAgICBjYXNlIChzcWxDb25zdGFudHMuTVNTUUwpOlxyXG4gICAgICAgICAgICByZXR1cm4gbXNzcWxGb3JtYXR0ZXI7XHJcbiAgICAgICAgY2FzZSAoc3FsQ29uc3RhbnRzLlBvc3RncmVTUUwpOlxyXG4gICAgICAgICAgICByZXR1cm4gcG9zdGdyZUZvcm1hdHRlcjtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdCBwYXNzZWRcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdldEZvcm1hdHRlcjsiLCJpbXBvcnQgeyBnZXRIZWFkZXJSb3dzLCBnZXRTY2hlbWFWYXJpYWJsZU5hbWUgfSBmcm9tIFwiLi9jb21tb24uanNcIlxyXG5cclxuY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICByaWdodHNSZXN1bHQuZm9yRWFjaCgocmlnaHQsIGl4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goLi4uZm9ybWF0UmlnaHRJbnNlcnQodmFyaWFibGVOYW1lLCByaWdodC5DYW5SZWFkLCBcclxuICAgICAgICAgICAgcmlnaHQuQ2FuQXBwZW5kLCByaWdodC5DYW5FZGl0LCByaWdodC5DYW5EZWxldGUsIHJpZ2h0LlBvc2l0aW9uKSk7XHJcblxyXG4gICAgICAgIGlmIChpeCAhPT0gcmlnaHRzUmVzdWx0Lmxlbmd0aCAtIDEpe1xyXG4gICAgICAgICAgICBpbnNlcnRSb3dzLnB1c2goXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAuLi51bml0VmFyaWFibGVzLCBcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIHNjaGVtYVZhcmlhYmxlLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3NcclxuICAgIF07XHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlTmFtZSA9IChzeXNBZG1pblVuaXROYW1lKSA9PiB7XHJcbiAgICBjb25zdCBjbGVhcmVkVmFyaWFibGUgPSBzeXNBZG1pblVuaXROYW1lLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcclxuICAgIHJldHVybiBgJHtjbGVhcmVkVmFyaWFibGUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCl9JHtjbGVhcmVkVmFyaWFibGUuc2xpY2UoMSl9SWRgO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQgPSAodmFyaWFibGVOYW1lLCBhZG1pblVuaXRJZCkgPT4gXHJcbiAgICBgREVDTEFSRSBAJHt2YXJpYWJsZU5hbWV9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHthZG1pblVuaXRJZH0nO2BcclxuXHJcbmNvbnN0IGZvcm1hdFJpZ2h0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IFwiSU5TRVJUIElOVE8gU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHQgKFN5c0FkbWluVW5pdElkLCBDYW5SZWFkLCBDYW5BcHBlbmQsIENhbkVkaXQsIENhbkRlbGV0ZSwgUG9zaXRpb24sIFN1YmplY3RTY2hlbWFVSWQpXCI7XHJcbiAgICBcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgQCR7YWRtaW5Vbml0VmFyaWFibGV9YCxcclxuICAgICAgICArY2FuUmVhZCxcclxuICAgICAgICArY2FuQXBwZW5kLFxyXG4gICAgICAgICtjYW5FZGl0LFxyXG4gICAgICAgICtjYW5EZWxldGUsXHJcbiAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgYEAke2dldFNjaGVtYVZhcmlhYmxlTmFtZSgpfWBcclxuICAgIF1cclxuICAgIGNvbnN0IGZvcm1hdHRlZFZhbHVlcyA9IGBcXHRWQUxVRVMgKCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBbaW5zZXJ0LCBmb3JtYXR0ZWRWYWx1ZXNdO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGVsZXRlU3RhdGVtZW50ID0gXCJERUxFVEUgRlJPTSBbU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRdXCI7XHJcbiAgICBjb25zdCBmaWx0ZXIgPSBgXFx0V0hFUkUgW1N1YmplY3RTY2hlbWFVSWRdID0gQCR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9YDtcclxuICAgIHJldHVybiBbZGVsZXRlU3RhdGVtZW50LCBmaWx0ZXJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYERFQ0xBUkUgQCR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZW5lcmF0ZVNjcmlwdDsiLCJpbXBvcnQgeyBnZXRIZWFkZXJSb3dzLCBnZXRTY2hlbWFWYXJpYWJsZU5hbWUgfSBmcm9tIFwiLi9jb21tb24uanNcIlxyXG5cclxuY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0U3RhdGVtZW50KCkpO1xyXG4gICAgcmlnaHRzUmVzdWx0LmZvckVhY2goKHJpZ2h0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0KHZhcmlhYmxlTmFtZSwgcmlnaHQuQ2FuUmVhZCwgXHJcbiAgICAgICAgICAgIHJpZ2h0LkNhbkFwcGVuZCwgcmlnaHQuQ2FuRWRpdCwgcmlnaHQuQ2FuRGVsZXRlLCByaWdodC5Qb3NpdGlvbikpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBcIkRPICQkXCIsXHJcbiAgICAgICAgXCJERUNMQVJFXCIsXHJcbiAgICAgICAgLi4udW5pdFZhcmlhYmxlcywgXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICBzY2hlbWFWYXJpYWJsZSxcclxuICAgICAgICBcIkJFR0lOXCIsXHJcbiAgICAgICAgZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3MsXHJcbiAgICAgICAgXCJFTkQ7XCIsXHJcbiAgICAgICAgXCIkJFwiXHJcbiAgICBdO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZU5hbWUgPSAoc3lzQWRtaW5Vbml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgY2xlYXJlZFZhcmlhYmxlID0gc3lzQWRtaW5Vbml0TmFtZS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XHJcbiAgICByZXR1cm4gYCR7Y2xlYXJlZFZhcmlhYmxlLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpfSR7Y2xlYXJlZFZhcmlhYmxlLnNsaWNlKDEpfUlkYDtcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50ID0gKHZhcmlhYmxlTmFtZSwgYWRtaW5Vbml0SWQpID0+IFxyXG4gICAgYFxcdCR7dmFyaWFibGVOYW1lfSB1dWlkID0gJyR7YWRtaW5Vbml0SWR9JztgO1xyXG5cclxuY29uc3QgZm9ybWF0SW5zZXJ0U3RhdGVtZW50ID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaW5zZXJ0ID0gYFxcdElOU0VSVCBJTlRPIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiAoXCJTeXNBZG1pblVuaXRJZFwiLCBcIkNhblJlYWRcIiwgXCJDYW5BcHBlbmRcIiwgXCJDYW5FZGl0XCIsIFwiQ2FuRGVsZXRlXCIsIFwiUG9zaXRpb25cIiwgXCJTdWJqZWN0U2NoZW1hVUlkXCIpIFZBTFVFU2A7XHJcbiAgICByZXR1cm4gaW5zZXJ0O1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRJbnNlcnQgPSAoYWRtaW5Vbml0VmFyaWFibGUsIGNhblJlYWQsIGNhbkFwcGVuZCwgY2FuRWRpdCwgY2FuRGVsZXRlLCBwb3NpdGlvbikgPT4ge1xyXG4gICAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgICAgIGAke2FkbWluVW5pdFZhcmlhYmxlfWAsXHJcbiAgICAgICAgK2NhblJlYWQsXHJcbiAgICAgICAgK2NhbkFwcGVuZCxcclxuICAgICAgICArY2FuRWRpdCxcclxuICAgICAgICArY2FuRGVsZXRlLFxyXG4gICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgIGBAJHtnZXRTY2hlbWFWYXJpYWJsZU5hbWUoKX1gXHJcbiAgICBdXHJcbiAgICBjb25zdCBmb3JtYXR0ZWRWYWx1ZXMgPSBgXFx0KCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBmb3JtYXR0ZWRWYWx1ZXM7XHJcbn1cclxuXHJcbmNvbnN0IGdldERlbGV0ZVJvd3MgPSAoKSA9PlxyXG4gICAgYFxcdERFTEVURSBGUk9NIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiBXSEVSRSBcIlN1YmplY3RTY2hlbWFVSWRcIiA9ICR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9YDtcclxuXHJcbmNvbnN0IGdldFNjaGVtYVZhcmlhYmxlID0gKHNjaGVtYVVJZCkgPT4gXHJcbiAgICBgXFx0JHtnZXRTY2hlbWFWYXJpYWJsZU5hbWUoKX0gdXVpZCA9ICcke3NjaGVtYVVJZH0nO2BcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlU2NyaXB0OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiLi9wb3B1cC5jc3NcIjtcclxuaW1wb3J0IGZvcm1hdHRlciBmcm9tIFwiLi4vLi4vLi4vZm9ybWF0dGVyL2Zvcm1hdHRlci5qc1wiXHJcblxyXG5jb25zdCBmb3JtYXRTY3JpcHRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvcm1hdC1idG5cIik7XHJcblxyXG5jaHJvbWUuc3RvcmFnZS5zeW5jLmdldChcImRiVHlwZVwiLCBhc3luYyAocmVzdWx0KSA9PiB7XHJcblx0Y29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcclxuXHRjb25zdCBkYlR5cGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGItdHlwZVwiKTtcclxuXHRpZiAodHlwZW9mKHJlc3VsdD8uZGJUeXBlKSA9PT0gXCJudW1iZXJcIil7XHJcblx0XHRkYlR5cGVJbnB1dC52YWx1ZSA9IHJlc3VsdC5kYlR5cGU7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtkYlR5cGU6IDB9KTtcclxuXHR9XHJcblxyXG5cdGRiVHlwZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XHJcblx0XHRjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldD8udmFsdWUgfHwgMDtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtkYlR5cGU6IHBhcnNlSW50KHZhbHVlKX0pO1xyXG5cdH0pXHJcblxyXG5cdGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcblx0XHR0YXJnZXQ6IHsgdGFiSWQ6IHRhYi5pZCB9LFxyXG5cdFx0ZnVuY3Rpb246IGdldENyZWF0aW9TZXJ2ZXJQYXJhbWV0ZXJzXHJcblx0fSwgdXBkYXRlU1FMVGV4dCk7XHJcbn0pXHJcblxyXG5jb25zdCB1cGRhdGVTUUxUZXh0ID0gKHBhcmFtZXRlcnMpID0+IHtcclxuXHRpZiAocGFyYW1ldGVycyAmJiBwYXJhbWV0ZXJzWzBdICYmIHBhcmFtZXRlcnNbMF0/LnJlc3VsdClcclxuXHR7XHJcblx0XHRjb25zdCB7aXNDb3JyZWN0VXJsLCB1cmx9ID0gcGFyYW1ldGVyc1swXT8ucmVzdWx0O1xyXG5cclxuXHRcdGlmIChwYXJhbWV0ZXJzWzBdLnJlc3VsdD8uaXNDb3JyZWN0VXJsKXtcclxuXHRcdFx0Y29uc3QgcGxhY2Vob2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYWNlaG9sZGVyXCIpO1xyXG5cdFx0XHRpZiAocGxhY2Vob2xkZXIpe1xyXG5cdFx0XHRcdHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHJcblx0XHRjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChcInNjcmlwdFwiLCBhc3luYyAocmVzdWx0KSA9PiB7XHJcblx0XHRcdGlmIChyZXN1bHQ/LnNjcmlwdD8udXJsID09PSB1cmwpe1xyXG5cdFx0XHRcdHVwZGF0ZU91dHB1dChyZXN1bHQuc2NyaXB0LnRleHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbmZvcm1hdFNjcmlwdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xyXG5cdGZvcm1hdFNjcmlwdEJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgXHRjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pO1xyXG5cdGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcblx0XHR0YXJnZXQ6IHsgdGFiSWQ6IHRhYi5pZCB9LFxyXG4gICAgXHRmdW5jdGlvbjogZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnNcclxuXHR9LCBzZW5kRm9ybWF0TWVzc2FnZSk7XHJcbn0pO1xyXG5cclxuY29uc3Qgc2VuZEZvcm1hdE1lc3NhZ2UgPSAoaW5qZWN0aW9uUmVzdWx0cykgPT4ge1xyXG5cdGlmIChpbmplY3Rpb25SZXN1bHRzICYmIGluamVjdGlvblJlc3VsdHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdGNvbnN0IGluamVjdGlvblJlc3VsdCA9IGluamVjdGlvblJlc3VsdHNbMF07XHJcblx0XHRpZiAoaW5qZWN0aW9uUmVzdWx0ICYmIGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnRva2VuICYmIFxyXG5cdFx0XHRpbmplY3Rpb25SZXN1bHQucmVzdWx0Py5zY2hlbWFVSWQgJiYgXHJcblx0XHRcdGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnVybCl7XHJcblx0XHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB7XHJcblx0XHRcdFx0dG9rZW46IGluamVjdGlvblJlc3VsdC5yZXN1bHQudG9rZW4sXHJcblx0XHRcdFx0dXJsOiBpbmplY3Rpb25SZXN1bHQucmVzdWx0LnVybCwgIFxyXG5cdFx0XHRcdHNjaGVtYVVJZDogaW5qZWN0aW9uUmVzdWx0LnJlc3VsdC5zY2hlbWFVSWRcclxuXHRcdFx0fVxyXG5cdFx0XHRjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShwYXJhbWV0ZXJzLCBwcm9jZXNzRm9ybWF0dGVkU2NyaXB0KTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNvbnN0IHByb2Nlc3NGb3JtYXR0ZWRTY3JpcHQgPSBhc3luYyAocmVzcG9uc2UpID0+IHtcclxuXHRmb3JtYXRTY3JpcHRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwdGlvbiAmJiByZXNwb25zZS5yaWdodHMgJiYgXHJcblx0XHRyZXNwb25zZS5yaWdodHMubGVuZ3RoICE9PSAwICYmIHJlc3BvbnNlLnNjaGVtYVVJZCl7XHJcblx0XHRjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7c2NoZW1hVUlkOiByZXNwb25zZS5zY2hlbWFVSWR9KTtcclxuXHRcdGNvbnN0IGRiVHlwZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGItdHlwZVwiKT8udmFsdWUgfHwgMDtcclxuXHRcdGNvbnN0IHNjcmlwdEZvcm1hdHRlciA9IGZvcm1hdHRlcihwYXJzZUludChkYlR5cGUpKTtcclxuXHRcdGNvbnN0IHNxbFNjcmlwdCA9IHNjcmlwdEZvcm1hdHRlcihyZXNwb25zZS5jYXB0aW9uLCByZXNwb25zZS5zY2hlbWFVSWQsIHJlc3BvbnNlLnJpZ2h0cyk7XHJcblx0XHR1cGRhdGVPdXRwdXQoc3FsU2NyaXB0KTtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtzY3JpcHQ6IHt1cmw6IHJlc3BvbnNlLnVybCwgdGV4dDogc3FsU2NyaXB0fX0pO1xyXG5cdFx0XHJcblx0XHRjb25zdCBpc0JpbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJpbmQtY2hlY2tib3hcIikuY2hlY2tlZDtcclxuXHRcdGlmIChpc0JpbmQpe1xyXG5cdFx0XHRjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pO1xyXG5cdFx0XHRjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG5cdFx0XHRcdHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXHJcblx0XHRcdFx0ZnVuY3Rpb246IGdldENyZWF0aW9TZXJ2ZXJQYXJhbWV0ZXJzXHJcblx0XHRcdH0sIGJpbmRUb1BhY2thZ2UpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY29uc3QgZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnMgPSAoKSA9PiB7XHJcblx0aWYgKGRvY3VtZW50Py5jb29raWUgJiYgd2luZG93Py5sb2NhdGlvbj8uaHJlZiAmJiBsb2NhdGlvbj8ub3JpZ2luKXtcclxuXHRcdGNvbnN0IGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoXCI9XCIpO1xyXG5cdFx0Y29uc3QgdXJsUGFydHMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdChcIi9cIik7XHJcblx0XHRjb25zdCBpc0NvcnJlY3RVcmwgPSB1cmxQYXJ0cyAmJiB1cmxQYXJ0cy5sZW5ndGggPiAyICYmIFxyXG5cdFx0XHR1cmxQYXJ0c1t1cmxQYXJ0cy5sZW5ndGggLSAyXSA9PT0gXCJBZG1pbmlzdHJhdGVkT2JqZWN0c1wiO1xyXG5cdFx0aWYgKGNvb2tpZXMgJiYgY29va2llcy5sZW5ndGggPj0gMSAmJiB1cmxQYXJ0cyAmJiB1cmxQYXJ0cy5sZW5ndGggIT09IDApe1xyXG5cdFx0XHRjb25zdCB0b2tlbiA9IGNvb2tpZXNbMV07XHJcblx0XHRcdGNvbnN0IHNjaGVtYVVJZCA9IHVybFBhcnRzW3VybFBhcnRzLmxlbmd0aCAtIDFdO1xyXG5cdFx0XHRjb25zdCB1cmwgPSBsb2NhdGlvbi5vcmlnaW47XHJcblx0XHRcdHJldHVybiB7dXJsLCB0b2tlbiwgc2NoZW1hVUlkLCBpc0NvcnJlY3RVcmx9XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5jb25zdCBiaW5kVG9QYWNrYWdlID0gYXN5bmMgKGluamVjdGlvblJlc3VsdHMpID0+IHtcclxuXHRjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChcInNjaGVtYVVJZFwiLCAocmVzdWx0KSA9PiB7XHJcblx0XHRpZiAoaW5qZWN0aW9uUmVzdWx0cyAmJiBpbmplY3Rpb25SZXN1bHRzLmxlbmd0aCAhPT0gMCl7XHJcblx0XHRcdGNvbnN0IGluamVjdGlvblJlc3VsdCA9IGluamVjdGlvblJlc3VsdHNbMF07XHJcblx0XHRcdGNvbnN0IG91dHB1dEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dHB1dFwiKTtcclxuXHRcdFx0aWYgKGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnRva2VuICYmXHJcblx0XHRcdFx0aW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udXJsICYmIG91dHB1dEVsZW1lbnQgJiYgXHJcblx0XHRcdFx0b3V0cHV0RWxlbWVudC50ZXh0Q29udGVudCl7XHJcblx0XHRcdFx0ZmV0Y2goYCR7aW5qZWN0aW9uUmVzdWx0LnJlc3VsdC51cmx9LzAvcmVzdC9SaWdodHNTY3JpcHRHZW5lcmF0b3JTZXJ2aWNlL0dlbmVyYXRlU2NyaXB0YCwge1xyXG5cdFx0XHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcclxuXHRcdFx0XHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0XHRcdFx0XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcblx0XHRcdFx0XHRcdFwiQlBNQ1NSRlwiOiBpbmplY3Rpb25SZXN1bHQucmVzdWx0LnRva2VuXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRzY3JpcHQ6IG91dHB1dEVsZW1lbnQudGV4dENvbnRlbnQsXHJcblx0XHRcdFx0XHRcdHNjaGVtYVVJZDogcmVzdWx0LnNjaGVtYVVJZFxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXHJcblx0XHRcdFx0LnRoZW4ocmVzID0+IHtcclxuXHRcdFx0XHRcdGlmIChyZXM/LkdlbmVyYXRlU2NyaXB0UmVzdWx0Py5Jc1N1Y2Nlc3NmdWwgJiYgcmVzPy5HZW5lcmF0ZVNjcmlwdFJlc3VsdD8uU2NyaXB0VXJsKXtcclxuXHRcdFx0XHRcdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiByZXMuR2VuZXJhdGVTY3JpcHRSZXN1bHQuU2NyaXB0VXJsIH0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxufVxyXG5cclxuY29uc3QgdXBkYXRlT3V0cHV0ID0gKHNjcmlwdCkgPT4ge1xyXG5cdGNvbnN0IG91dHB1dEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dHB1dFwiKTtcclxuXHRvdXRwdXRFbGVtZW50LnRleHRDb250ZW50ID0gc2NyaXB0O1xyXG5cdGNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wb3B1cC1ib2R5XCIpO1xyXG5cdHBvcHVwLnN0eWxlLndpZHRoID0gXCI2MDBweFwiO1xyXG5cdG91dHB1dEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCIzMDBweFwiO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9