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



var formatScriptBtn = document.getElementById("format-btn");

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
		const scriptFormatter = (0,_formatter_formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"])(0);
		const sqlScript = scriptFormatter(response.caption, response.schemaUId, response.rights);
		const outputElement = document.getElementById("output");
		outputElement.textContent = sqlScript;
		const popup = document.querySelector(".popup-body");
		popup.style.width = "600px";
		outputElement.style.height = "300px";
		
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
		if (cookies && cookies.length >= 1 && urlParts && urlParts.length !== 0){
			const token = cookies[1];
			const schemaUId = urlParts[urlParts.length - 1];
			const url = location.origin;
			return {url, token, schemaUId}
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
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxtQ0FBbUM7QUFDOUU7QUFDQSxZQUFZLGVBQWU7QUFDM0I7QUFDQSxFQUFFO0FBQ0YsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiw4QkFBOEI7QUFDekQsMEJBQTBCLG1FQUFTO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxtQ0FBbUM7QUFDOUU7QUFDQSxjQUFjLGVBQWU7QUFDN0I7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSwyQkFBMkI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLHlDQUF5QztBQUNwRTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsRUFBRTtBQUNGLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4vcG9wdXAvcG9wdXAuY3NzP2Y2YWYiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvY29uc3RhbnRzL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9mb3JtYXR0ZXIuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvbXNzcWxGb3JtYXR0ZXIuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvcG9zdGdyZUZvcm1hdHRlci5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uL3BvcHVwL3BvcHVwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsImNvbnN0IHNxbEZvcm1hdCA9IHtcclxuICAgIE1TU1FMOiAwLFxyXG4gICAgUG9zdGdyZVNRTDogMVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzcWxGb3JtYXQ7IiwiaW1wb3J0IHNxbENvbnN0YW50cyAgZnJvbSBcIi4vY29uc3RhbnRzL2NvbnN0YW50cy5qc1wiXHJcbmltcG9ydCBtc3NxbEZvcm1hdHRlciBmcm9tIFwiLi9tc3NxbEZvcm1hdHRlci5qc1wiXHJcbmltcG9ydCBwb3N0Z3JlRm9ybWF0dGVyIGZyb20gXCIuL3Bvc3RncmVGb3JtYXR0ZXIuanNcIlxyXG5cclxuY29uc3QgZ2V0Rm9ybWF0dGVyID0gKGZvcm1hdCkgPT4ge1xyXG4gICAgc3dpdGNoIChmb3JtYXQpe1xyXG4gICAgICAgIGNhc2UgKHNxbENvbnN0YW50cy5NU1NRTCk6XHJcbiAgICAgICAgICAgIHJldHVybiBtc3NxbEZvcm1hdHRlcjtcclxuICAgICAgICBjYXNlIChzcWxDb25zdGFudHMuUG9zdGdyZVNRTCk6XHJcbiAgICAgICAgICAgIHJldHVybiBwb3N0Z3JlRm9ybWF0dGVyO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZm9ybWF0IHBhc3NlZFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2V0Rm9ybWF0dGVyOyIsImNvbnN0IGdlbmVyYXRlU2NyaXB0ID0gKHRhYmxlQ2FwdGlvbiwgc2NoZW1hVUlkLCByaWdodHMpID0+IHtcclxuICAgIGNvbnN0IGhlYWRlclJvd3MgPSBnZXRIZWFkZXJSb3dzKHRhYmxlQ2FwdGlvbiwgcmlnaHRzKTtcclxuICAgIGNvbnN0IHNjcmlwdFJvd3MgPSBnZXRTY3JpcHRSb3dzKHJpZ2h0cywgc2NoZW1hVUlkKTtcclxuICAgIHJldHVybiBbLi4uaGVhZGVyUm93cywgXCJcIiwgLi4uc2NyaXB0Um93c10uam9pbihcIlxcblwiKTtcclxufVxyXG5cclxuY29uc3QgZ2V0SGVhZGVyUm93cyA9ICh0YWJsZUNhcHRpb24sIHJpZ2h0c1Jlc3VsdCkgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyID0gYNCd0LDRgdGC0YDQvtC50LrQsCDQv9GA0LDQsiDQtNC+0YHRgtGD0L/QsCDQv9C+INC+0L/QtdGA0LDRhtC40Y/QvCDQvdCwINC+0LHRitC10LrRgiBcXFwiJHt0YWJsZUNhcHRpb259XFxcImA7XHJcbiAgICBjb25zdCByb2xlcyA9IHJpZ2h0c1Jlc3VsdC5tYXAocmlnaHQgPT4gZm9ybWF0Um9sZShyaWdodC5TeXNBZG1pblVuaXRJZCwgcmlnaHQuVW5pdE5hbWUpKTtcclxuICAgIHJldHVybiBbXCIvKlwiLCBoZWFkZXIsIC4uLnJvbGVzLCBcIiovXCJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICByaWdodHNSZXN1bHQuZm9yRWFjaCgocmlnaHQsIGl4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goLi4uZm9ybWF0UmlnaHRJbnNlcnQodmFyaWFibGVOYW1lLCByaWdodC5DYW5SZWFkLCBcclxuICAgICAgICAgICAgcmlnaHQuQ2FuQXBwZW5kLCByaWdodC5DYW5FZGl0LCByaWdodC5DYW5EZWxldGUsIHJpZ2h0LlBvc2l0aW9uKSk7XHJcblxyXG4gICAgICAgIGlmIChpeCAhPT0gcmlnaHRzUmVzdWx0Lmxlbmd0aCAtIDEpe1xyXG4gICAgICAgICAgICBpbnNlcnRSb3dzLnB1c2goXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAuLi51bml0VmFyaWFibGVzLCBcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIHNjaGVtYVZhcmlhYmxlLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3NcclxuICAgIF07XHJcbn1cclxuXHJcbmNvbnN0IGZvcm1hdFJvbGUgPSAocm9sZUlkLCByb2xlTmFtZSkgPT4ge1xyXG4gICAgcmV0dXJuIGAnJHtyb2xlSWR9JyAtICR7cm9sZU5hbWV9YFxyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZU5hbWUgPSAoc3lzQWRtaW5Vbml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgY2xlYXJlZFZhcmlhYmxlID0gc3lzQWRtaW5Vbml0TmFtZS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XHJcbiAgICByZXR1cm4gYCR7Y2xlYXJlZFZhcmlhYmxlLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpfSR7Y2xlYXJlZFZhcmlhYmxlLnNsaWNlKDEpfUlkYDtcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50ID0gKHZhcmlhYmxlTmFtZSwgYWRtaW5Vbml0SWQpID0+IFxyXG4gICAgYERFQ0xBUkUgQCR7dmFyaWFibGVOYW1lfSB1bmlxdWVpZGVudGlmaWVyID0gJyR7YWRtaW5Vbml0SWR9JztgXHJcblxyXG5jb25zdCBmb3JtYXRSaWdodEluc2VydCA9IChhZG1pblVuaXRWYXJpYWJsZSwgY2FuUmVhZCwgY2FuQXBwZW5kLCBjYW5FZGl0LCBjYW5EZWxldGUsIHBvc2l0aW9uKSA9PiB7XHJcbiAgICBjb25zdCBpbnNlcnQgPSBcIklOU0VSVCBJTlRPIFN5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0IChTeXNBZG1pblVuaXRJZCwgQ2FuUmVhZCwgQ2FuQXBwZW5kLCBDYW5FZGl0LCBDYW5EZWxldGUsIFBvc2l0aW9uLCBTdWJqZWN0U2NoZW1hVUlkKVwiO1xyXG4gICAgXHJcbiAgICBjb25zdCB2YWx1ZXMgPSBbXHJcbiAgICAgICAgYEAke2FkbWluVW5pdFZhcmlhYmxlfWAsXHJcbiAgICAgICAgK2NhblJlYWQsXHJcbiAgICAgICAgK2NhbkFwcGVuZCxcclxuICAgICAgICArY2FuRWRpdCxcclxuICAgICAgICArY2FuRGVsZXRlLFxyXG4gICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgIGBAJHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX1gXHJcbiAgICBdXHJcbiAgICBjb25zdCBmb3JtYXR0ZWRWYWx1ZXMgPSBgXFx0VkFMVUVTICgke3ZhbHVlcy5qb2luKFwiLCBcIil9KWA7XHJcbiAgICByZXR1cm4gW2luc2VydCwgZm9ybWF0dGVkVmFsdWVzXTtcclxufVxyXG5cclxuY29uc3QgZ2V0RGVsZXRlUm93cyA9ICgpID0+IHtcclxuICAgIGNvbnN0IGRlbGV0ZVN0YXRlbWVudCA9IFwiREVMRVRFIEZST00gW1N5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0XVwiO1xyXG4gICAgY29uc3QgZmlsdGVyID0gYFxcdFdIRVJFIFtTdWJqZWN0U2NoZW1hVUlkXSA9IEAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWA7XHJcbiAgICByZXR1cm4gW2RlbGV0ZVN0YXRlbWVudCwgZmlsdGVyXTtcclxufVxyXG5cclxuY29uc3QgZ2V0U2NoZW1hVmFyaWFibGUgPSAoc2NoZW1hVUlkKSA9PiBcclxuICAgIGBERUNMQVJFIEAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfSB1bmlxdWVpZGVudGlmaWVyID0gJyR7c2NoZW1hVUlkfSc7YFxyXG5cclxuY29uc3QgZ2V0U2NobWVhVmFyaWFibGVOYW1lID0gKCkgPT5cclxuICAgIFwicmlnaHRzU2NoZW1hVUlkXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlU2NyaXB0OyIsImNvbnN0IGdlbmVyYXRlU2NyaXB0ID0gKHRhYmxlQ2FwdGlvbiwgc2NoZW1hVUlkLCByaWdodHMpID0+IHtcclxuICAgIGNvbnN0IGhlYWRlclJvd3MgPSBnZXRIZWFkZXJSb3dzKHRhYmxlQ2FwdGlvbiwgcmlnaHRzKTtcclxuICAgIGNvbnN0IHNjcmlwdFJvd3MgPSBnZXRTY3JpcHRSb3dzKHJpZ2h0cywgc2NoZW1hVUlkKTtcclxuICAgIHJldHVybiBbLi4uaGVhZGVyUm93cywgXCJcIiwgLi4uc2NyaXB0Um93c10uam9pbihcIlxcblwiKTtcclxufVxyXG5cclxuY29uc3QgZ2V0SGVhZGVyUm93cyA9ICh0YWJsZUNhcHRpb24sIHJpZ2h0c1Jlc3VsdCkgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyID0gYNCd0LDRgdGC0YDQvtC50LrQsCDQv9GA0LDQsiDQtNC+0YHRgtGD0L/QsCDQv9C+INC+0L/QtdGA0LDRhtC40Y/QvCDQvdCwINC+0LHRitC10LrRgiBcXFwiJHt0YWJsZUNhcHRpb259XFxcImA7XHJcbiAgICBjb25zdCByb2xlcyA9IHJpZ2h0c1Jlc3VsdC5tYXAocmlnaHQgPT4gZm9ybWF0Um9sZShyaWdodC5TeXNBZG1pblVuaXRJZCwgcmlnaHQuVW5pdE5hbWUpKTtcclxuICAgIHJldHVybiBbXCIvKlwiLCBoZWFkZXIsIC4uLnJvbGVzLCBcIiovXCJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0U3RhdGVtZW50KCkpO1xyXG4gICAgcmlnaHRzUmVzdWx0LmZvckVhY2goKHJpZ2h0LCBpeCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlTmFtZSA9IGdldFZhcmlhYmxlTmFtZShyaWdodC5Vbml0TmFtZSk7XHJcbiAgICAgICAgdW5pdFZhcmlhYmxlcy5wdXNoKGdldFZhcmlhYmxlRGVjbGFyZVN0YXRlbWVudCh2YXJpYWJsZU5hbWUsIHJpZ2h0LlN5c0FkbWluVW5pdElkKSk7XHJcbiAgICAgICAgaW5zZXJ0Um93cy5wdXNoKGZvcm1hdEluc2VydCh2YXJpYWJsZU5hbWUsIHJpZ2h0LkNhblJlYWQsIFxyXG4gICAgICAgICAgICByaWdodC5DYW5BcHBlbmQsIHJpZ2h0LkNhbkVkaXQsIHJpZ2h0LkNhbkRlbGV0ZSwgcmlnaHQuUG9zaXRpb24pKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgXCJETyAkJFwiLFxyXG4gICAgICAgIFwiREVDTEFSRVwiLFxyXG4gICAgICAgIC4uLnVuaXRWYXJpYWJsZXMsIFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgc2NoZW1hVmFyaWFibGUsXHJcbiAgICAgICAgXCJCRUdJTlwiLFxyXG4gICAgICAgIGRlbGV0ZVJvd3MsXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICAuLi5pbnNlcnRSb3dzLFxyXG4gICAgICAgIFwiRU5EO1wiLFxyXG4gICAgICAgIFwiJCRcIlxyXG4gICAgXTtcclxufVxyXG5cclxuY29uc3QgZm9ybWF0Um9sZSA9IChyb2xlSWQsIHJvbGVOYW1lKSA9PiB7XHJcbiAgICByZXR1cm4gYCcke3JvbGVJZH0nIC0gJHtyb2xlTmFtZX1gXHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlTmFtZSA9IChzeXNBZG1pblVuaXROYW1lKSA9PiB7XHJcbiAgICBjb25zdCBjbGVhcmVkVmFyaWFibGUgPSBzeXNBZG1pblVuaXROYW1lLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcclxuICAgIHJldHVybiBgJHtjbGVhcmVkVmFyaWFibGUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCl9JHtjbGVhcmVkVmFyaWFibGUuc2xpY2UoMSl9SWRgO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQgPSAodmFyaWFibGVOYW1lLCBhZG1pblVuaXRJZCkgPT4gXHJcbiAgICBgXFx0JHt2YXJpYWJsZU5hbWV9IHV1aWQgPSAnJHthZG1pblVuaXRJZH0nO2A7XHJcblxyXG5jb25zdCBmb3JtYXRJbnNlcnRTdGF0ZW1lbnQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBpbnNlcnQgPSBgXFx0SU5TRVJUIElOVE8gXCJTeXNFbnRpdHlTY2hlbWFPcGVyYXRpb25SaWdodFwiIChcIlN5c0FkbWluVW5pdElkXCIsIFwiQ2FuUmVhZFwiLCBcIkNhbkFwcGVuZFwiLCBcIkNhbkVkaXRcIiwgXCJDYW5EZWxldGVcIiwgXCJQb3NpdGlvblwiLCBcIlN1YmplY3RTY2hlbWFVSWRcIikgVkFMVUVTYDtcclxuICAgIHJldHVybiBpbnNlcnQ7XHJcbn1cclxuXHJcbmNvbnN0IGZvcm1hdEluc2VydCA9IChhZG1pblVuaXRWYXJpYWJsZSwgY2FuUmVhZCwgY2FuQXBwZW5kLCBjYW5FZGl0LCBjYW5EZWxldGUsIHBvc2l0aW9uKSA9PiB7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBbXHJcbiAgICAgICAgYCR7YWRtaW5Vbml0VmFyaWFibGV9YCxcclxuICAgICAgICArY2FuUmVhZCxcclxuICAgICAgICArY2FuQXBwZW5kLFxyXG4gICAgICAgICtjYW5FZGl0LFxyXG4gICAgICAgICtjYW5EZWxldGUsXHJcbiAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgYEAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWBcclxuICAgIF1cclxuICAgIGNvbnN0IGZvcm1hdHRlZFZhbHVlcyA9IGBcXHQoJHt2YWx1ZXMuam9pbihcIiwgXCIpfSlgO1xyXG4gICAgcmV0dXJuIGZvcm1hdHRlZFZhbHVlcztcclxufVxyXG5cclxuY29uc3QgZ2V0RGVsZXRlUm93cyA9ICgpID0+XHJcbiAgICBgXFx0REVMRVRFIEZST00gXCJTeXNFbnRpdHlTY2hlbWFPcGVyYXRpb25SaWdodFwiIFdIRVJFIFwiU3ViamVjdFNjaGVtYVVJZFwiID0gJHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX1gO1xyXG5cclxuY29uc3QgZ2V0U2NoZW1hVmFyaWFibGUgPSAoc2NoZW1hVUlkKSA9PiBcclxuICAgIGBcXHQke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfSB1dWlkID0gJyR7c2NoZW1hVUlkfSc7YFxyXG5cclxuY29uc3QgZ2V0U2NobWVhVmFyaWFibGVOYW1lID0gKCkgPT5cclxuICAgIFwicmlnaHRzU2NoZW1hVUlkXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlU2NyaXB0OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiLi9wb3B1cC5jc3NcIjtcclxuaW1wb3J0IGZvcm1hdHRlciBmcm9tIFwiLi4vLi4vLi4vZm9ybWF0dGVyL2Zvcm1hdHRlci5qc1wiXHJcblxyXG52YXIgZm9ybWF0U2NyaXB0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtYXQtYnRuXCIpO1xyXG5cclxuZm9ybWF0U2NyaXB0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcblx0Zm9ybWF0U2NyaXB0QnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICBcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0Y2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuXHRcdHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXHJcbiAgICBcdGZ1bmN0aW9uOiBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVyc1xyXG5cdH0sIHNlbmRGb3JtYXRNZXNzYWdlKTtcclxufSk7XHJcblxyXG5jb25zdCBzZW5kRm9ybWF0TWVzc2FnZSA9IChpbmplY3Rpb25SZXN1bHRzKSA9PiB7XHJcblx0aWYgKGluamVjdGlvblJlc3VsdHMgJiYgaW5qZWN0aW9uUmVzdWx0cy5sZW5ndGggIT09IDApe1xyXG5cdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHQgJiYgaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiYgXHJcblx0XHRcdGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnNjaGVtYVVJZCAmJiBcclxuXHRcdFx0aW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udXJsKXtcclxuXHRcdFx0Y29uc3QgcGFyYW1ldGVycyA9IHtcclxuXHRcdFx0XHR0b2tlbjogaW5qZWN0aW9uUmVzdWx0LnJlc3VsdC50b2tlbixcclxuXHRcdFx0XHR1cmw6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudXJsLCAgXHJcblx0XHRcdFx0c2NoZW1hVUlkOiBpbmplY3Rpb25SZXN1bHQucmVzdWx0LnNjaGVtYVVJZFxyXG5cdFx0XHR9XHJcblx0XHRcdGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHBhcmFtZXRlcnMsIHByb2Nlc3NGb3JtYXR0ZWRTY3JpcHQpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY29uc3QgcHJvY2Vzc0Zvcm1hdHRlZFNjcmlwdCA9IGFzeW5jIChyZXNwb25zZSkgPT4ge1xyXG5cdGZvcm1hdFNjcmlwdEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXB0aW9uICYmIHJlc3BvbnNlLnJpZ2h0cyAmJiBcclxuXHRcdHJlc3BvbnNlLnJpZ2h0cy5sZW5ndGggIT09IDAgJiYgcmVzcG9uc2Uuc2NoZW1hVUlkKXtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtzY2hlbWFVSWQ6IHJlc3BvbnNlLnNjaGVtYVVJZH0pO1xyXG5cdFx0Y29uc3Qgc2NyaXB0Rm9ybWF0dGVyID0gZm9ybWF0dGVyKDApO1xyXG5cdFx0Y29uc3Qgc3FsU2NyaXB0ID0gc2NyaXB0Rm9ybWF0dGVyKHJlc3BvbnNlLmNhcHRpb24sIHJlc3BvbnNlLnNjaGVtYVVJZCwgcmVzcG9uc2UucmlnaHRzKTtcclxuXHRcdGNvbnN0IG91dHB1dEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dHB1dFwiKTtcclxuXHRcdG91dHB1dEVsZW1lbnQudGV4dENvbnRlbnQgPSBzcWxTY3JpcHQ7XHJcblx0XHRjb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucG9wdXAtYm9keVwiKTtcclxuXHRcdHBvcHVwLnN0eWxlLndpZHRoID0gXCI2MDBweFwiO1xyXG5cdFx0b3V0cHV0RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIjMwMHB4XCI7XHJcblx0XHRcclxuXHRcdGNvbnN0IGlzQmluZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmluZC1jaGVja2JveFwiKS5jaGVja2VkO1xyXG5cdFx0aWYgKGlzQmluZCl7XHJcblx0XHRcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0XHRcdGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcblx0XHRcdFx0dGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcclxuXHRcdFx0XHRmdW5jdGlvbjogZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnNcclxuXHRcdFx0fSwgYmluZFRvUGFja2FnZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVycyA9ICgpID0+IHtcclxuXHRpZiAoZG9jdW1lbnQ/LmNvb2tpZSAmJiB3aW5kb3c/LmxvY2F0aW9uPy5ocmVmICYmIGxvY2F0aW9uPy5vcmlnaW4pe1xyXG5cdFx0Y29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIj1cIik7XHJcblx0XHRjb25zdCB1cmxQYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFwiL1wiKTtcclxuXHRcdGlmIChjb29raWVzICYmIGNvb2tpZXMubGVuZ3RoID49IDEgJiYgdXJsUGFydHMgJiYgdXJsUGFydHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdFx0Y29uc3QgdG9rZW4gPSBjb29raWVzWzFdO1xyXG5cdFx0XHRjb25zdCBzY2hlbWFVSWQgPSB1cmxQYXJ0c1t1cmxQYXJ0cy5sZW5ndGggLSAxXTtcclxuXHRcdFx0Y29uc3QgdXJsID0gbG9jYXRpb24ub3JpZ2luO1xyXG5cdFx0XHRyZXR1cm4ge3VybCwgdG9rZW4sIHNjaGVtYVVJZH1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmNvbnN0IGJpbmRUb1BhY2thZ2UgPSBhc3luYyAoaW5qZWN0aW9uUmVzdWx0cykgPT4ge1xyXG5cdGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwic2NoZW1hVUlkXCIsIChyZXN1bHQpID0+IHtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHRzICYmIGluamVjdGlvblJlc3VsdHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdFx0Y29uc3Qgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0cHV0XCIpO1xyXG5cdFx0XHRpZiAoaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiZcclxuXHRcdFx0XHRpbmplY3Rpb25SZXN1bHQucmVzdWx0Py51cmwgJiYgb3V0cHV0RWxlbWVudCAmJiBcclxuXHRcdFx0XHRvdXRwdXRFbGVtZW50LnRleHRDb250ZW50KXtcclxuXHRcdFx0XHRmZXRjaChgJHtpbmplY3Rpb25SZXN1bHQucmVzdWx0LnVybH0vMC9yZXN0L1JpZ2h0c1NjcmlwdEdlbmVyYXRvclNlcnZpY2UvR2VuZXJhdGVTY3JpcHRgLCB7XHJcblx0XHRcdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxyXG5cdFx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuXHRcdFx0XHRcdFx0XCJCUE1DU1JGXCI6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudG9rZW5cclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRcdHNjcmlwdDogb3V0cHV0RWxlbWVudC50ZXh0Q29udGVudCxcclxuXHRcdFx0XHRcdFx0c2NoZW1hVUlkOiByZXN1bHQuc2NoZW1hVUlkXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuXHRcdFx0XHQudGhlbihyZXMgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKHJlcz8uR2VuZXJhdGVTY3JpcHRSZXN1bHQ/LklzU3VjY2Vzc2Z1bCAmJiByZXM/LkdlbmVyYXRlU2NyaXB0UmVzdWx0Py5TY3JpcHRVcmwpe1xyXG5cdFx0XHRcdFx0XHRjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IHJlcy5HZW5lcmF0ZVNjcmlwdFJlc3VsdC5TY3JpcHRVcmwgfSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9