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
	chrome.storage.sync.get("script", async (result) => {
		console.log(parameters);
		console.log(result);
		if (result?.script?.url === parameters[0].result?.url){
			updateOutput(result.script.text);
		}
	});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTDRCO0FBQ0o7QUFDSTtBQUNwRDtBQUNBO0FBQ0E7QUFDQSxjQUFjLHFFQUFrQjtBQUNoQyxtQkFBbUIsMERBQWM7QUFDakMsY0FBYywwRUFBdUI7QUFDckMsbUJBQW1CLDREQUFnQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWUsWUFBWTs7Ozs7Ozs7Ozs7Ozs7QUNmM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0UsYUFBYTtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPLE1BQU0sU0FBUztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsd0NBQXdDLEVBQUUseUJBQXlCO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixjQUFjLHNCQUFzQixZQUFZLEVBQUU7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksa0JBQWtCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHdCQUF3QjtBQUNwQztBQUNBLHlDQUF5QyxrQkFBa0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCx3QkFBd0I7QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IseUJBQXlCLHNCQUFzQixVQUFVLEVBQUU7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxjQUFjOzs7Ozs7Ozs7Ozs7OztBQ2pGN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0UsYUFBYTtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTyxNQUFNLFNBQVM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHdDQUF3QyxFQUFFLHlCQUF5QjtBQUNqRjtBQUNBO0FBQ0E7QUFDQSxTQUFTLGNBQWMsVUFBVSxZQUFZLEVBQUU7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsa0JBQWtCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHdCQUF3QjtBQUNwQztBQUNBLGtDQUFrQyxrQkFBa0I7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRkFBZ0Ysd0JBQXdCO0FBQ3hHO0FBQ0E7QUFDQSxTQUFTLHlCQUF5QixVQUFVLFVBQVUsRUFBRTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLGNBQWM7Ozs7OztVQ2xGN0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7QUNOcUI7QUFDa0M7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsbUNBQW1DO0FBQzVFO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCwyQkFBMkIsVUFBVTtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQix3QkFBd0I7QUFDbkQsRUFBRTtBQUNGO0FBQ0E7QUFDQSxZQUFZLGVBQWU7QUFDM0I7QUFDQSxFQUFFO0FBQ0YsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsbUNBQW1DO0FBQzlFO0FBQ0EsWUFBWSxlQUFlO0FBQzNCO0FBQ0EsRUFBRTtBQUNGLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsOEJBQThCO0FBQ3pEO0FBQ0EsMEJBQTBCLG1FQUFTO0FBQ25DO0FBQ0E7QUFDQSwyQkFBMkIsU0FBUyxvQ0FBb0M7QUFDeEU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLG1DQUFtQztBQUM5RTtBQUNBLGNBQWMsZUFBZTtBQUM3QjtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLDJCQUEyQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIseUNBQXlDO0FBQ3BFO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4vcG9wdXAvcG9wdXAuY3NzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL2NvbnN0YW50cy9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvZm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL21zc3FsRm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvLi4vLi4vZm9ybWF0dGVyL3Bvc3RncmVGb3JtYXR0ZXIuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3JpZ2h0cy1leHQvLi9wb3B1cC9wb3B1cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCJjb25zdCBzcWxGb3JtYXQgPSB7XHJcbiAgICBNU1NRTDogMCxcclxuICAgIFBvc3RncmVTUUw6IDFcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgc3FsRm9ybWF0OyIsImltcG9ydCBzcWxDb25zdGFudHMgIGZyb20gXCIuL2NvbnN0YW50cy9jb25zdGFudHMuanNcIlxyXG5pbXBvcnQgbXNzcWxGb3JtYXR0ZXIgZnJvbSBcIi4vbXNzcWxGb3JtYXR0ZXIuanNcIlxyXG5pbXBvcnQgcG9zdGdyZUZvcm1hdHRlciBmcm9tIFwiLi9wb3N0Z3JlRm9ybWF0dGVyLmpzXCJcclxuXHJcbmNvbnN0IGdldEZvcm1hdHRlciA9IChmb3JtYXQpID0+IHtcclxuICAgIHN3aXRjaCAoZm9ybWF0KXtcclxuICAgICAgICBjYXNlIChzcWxDb25zdGFudHMuTVNTUUwpOlxyXG4gICAgICAgICAgICByZXR1cm4gbXNzcWxGb3JtYXR0ZXI7XHJcbiAgICAgICAgY2FzZSAoc3FsQ29uc3RhbnRzLlBvc3RncmVTUUwpOlxyXG4gICAgICAgICAgICByZXR1cm4gcG9zdGdyZUZvcm1hdHRlcjtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdCBwYXNzZWRcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdldEZvcm1hdHRlcjsiLCJjb25zdCBnZW5lcmF0ZVNjcmlwdCA9ICh0YWJsZUNhcHRpb24sIHNjaGVtYVVJZCwgcmlnaHRzKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXJSb3dzID0gZ2V0SGVhZGVyUm93cyh0YWJsZUNhcHRpb24sIHJpZ2h0cyk7XHJcbiAgICBjb25zdCBzY3JpcHRSb3dzID0gZ2V0U2NyaXB0Um93cyhyaWdodHMsIHNjaGVtYVVJZCk7XHJcbiAgICByZXR1cm4gWy4uLmhlYWRlclJvd3MsIFwiXCIsIC4uLnNjcmlwdFJvd3NdLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcbmNvbnN0IGdldEhlYWRlclJvd3MgPSAodGFibGVDYXB0aW9uLCByaWdodHNSZXN1bHQpID0+IHtcclxuICAgIGNvbnN0IGhlYWRlciA9IGDQndCw0YHRgtGA0L7QudC60LAg0L/RgNCw0LIg0LTQvtGB0YLRg9C/0LAg0L/QviDQvtC/0LXRgNCw0YbQuNGP0Lwg0L3QsCDQvtCx0YrQtdC60YIgXFxcIiR7dGFibGVDYXB0aW9ufVxcXCJgO1xyXG4gICAgY29uc3Qgcm9sZXMgPSByaWdodHNSZXN1bHQubWFwKHJpZ2h0ID0+IGZvcm1hdFJvbGUocmlnaHQuU3lzQWRtaW5Vbml0SWQsIHJpZ2h0LlVuaXROYW1lKSk7XHJcbiAgICByZXR1cm4gW1wiLypcIiwgaGVhZGVyLCAuLi5yb2xlcywgXCIqL1wiXTtcclxufVxyXG5cclxuY29uc3QgZ2V0U2NyaXB0Um93cyA9IChyaWdodHNSZXN1bHQsIHNjaGVtYVVJZCkgPT4ge1xyXG4gICAgY29uc3Qgc2NoZW1hVmFyaWFibGUgPSBnZXRTY2hlbWFWYXJpYWJsZShzY2hlbWFVSWQpO1xyXG4gICAgY29uc3QgZGVsZXRlUm93cyA9IGdldERlbGV0ZVJvd3MoKTtcclxuXHJcbiAgICBjb25zdCB1bml0VmFyaWFibGVzID0gW107XHJcbiAgICBjb25zdCBpbnNlcnRSb3dzID0gW107XHJcblxyXG4gICAgcmlnaHRzUmVzdWx0LmZvckVhY2goKHJpZ2h0LCBpeCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlTmFtZSA9IGdldFZhcmlhYmxlTmFtZShyaWdodC5Vbml0TmFtZSk7XHJcbiAgICAgICAgdW5pdFZhcmlhYmxlcy5wdXNoKGdldFZhcmlhYmxlRGVjbGFyZVN0YXRlbWVudCh2YXJpYWJsZU5hbWUsIHJpZ2h0LlN5c0FkbWluVW5pdElkKSk7XHJcbiAgICAgICAgaW5zZXJ0Um93cy5wdXNoKC4uLmZvcm1hdFJpZ2h0SW5zZXJ0KHZhcmlhYmxlTmFtZSwgcmlnaHQuQ2FuUmVhZCwgXHJcbiAgICAgICAgICAgIHJpZ2h0LkNhbkFwcGVuZCwgcmlnaHQuQ2FuRWRpdCwgcmlnaHQuQ2FuRGVsZXRlLCByaWdodC5Qb3NpdGlvbikpO1xyXG5cclxuICAgICAgICBpZiAoaXggIT09IHJpZ2h0c1Jlc3VsdC5sZW5ndGggLSAxKXtcclxuICAgICAgICAgICAgaW5zZXJ0Um93cy5wdXNoKFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgLi4udW5pdFZhcmlhYmxlcywgXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICBzY2hlbWFWYXJpYWJsZSxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmRlbGV0ZVJvd3MsXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICAuLi5pbnNlcnRSb3dzXHJcbiAgICBdO1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRSb2xlID0gKHJvbGVJZCwgcm9sZU5hbWUpID0+IHtcclxuICAgIHJldHVybiBgJyR7cm9sZUlkfScgLSAke3JvbGVOYW1lfWBcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVOYW1lID0gKHN5c0FkbWluVW5pdE5hbWUpID0+IHtcclxuICAgIGNvbnN0IGNsZWFyZWRWYXJpYWJsZSA9IHN5c0FkbWluVW5pdE5hbWUucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xyXG4gICAgcmV0dXJuIGAke2NsZWFyZWRWYXJpYWJsZS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKX0ke2NsZWFyZWRWYXJpYWJsZS5zbGljZSgxKX1JZGA7XHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlRGVjbGFyZVN0YXRlbWVudCA9ICh2YXJpYWJsZU5hbWUsIGFkbWluVW5pdElkKSA9PiBcclxuICAgIGBERUNMQVJFIEAke3ZhcmlhYmxlTmFtZX0gdW5pcXVlaWRlbnRpZmllciA9ICcke2FkbWluVW5pdElkfSc7YFxyXG5cclxuY29uc3QgZm9ybWF0UmlnaHRJbnNlcnQgPSAoYWRtaW5Vbml0VmFyaWFibGUsIGNhblJlYWQsIGNhbkFwcGVuZCwgY2FuRWRpdCwgY2FuRGVsZXRlLCBwb3NpdGlvbikgPT4ge1xyXG4gICAgY29uc3QgaW5zZXJ0ID0gXCJJTlNFUlQgSU5UTyBTeXNFbnRpdHlTY2hlbWFPcGVyYXRpb25SaWdodCAoU3lzQWRtaW5Vbml0SWQsIENhblJlYWQsIENhbkFwcGVuZCwgQ2FuRWRpdCwgQ2FuRGVsZXRlLCBQb3NpdGlvbiwgU3ViamVjdFNjaGVtYVVJZClcIjtcclxuICAgIFxyXG4gICAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgICAgIGBAJHthZG1pblVuaXRWYXJpYWJsZX1gLFxyXG4gICAgICAgICtjYW5SZWFkLFxyXG4gICAgICAgICtjYW5BcHBlbmQsXHJcbiAgICAgICAgK2NhbkVkaXQsXHJcbiAgICAgICAgK2NhbkRlbGV0ZSxcclxuICAgICAgICBwb3NpdGlvbixcclxuICAgICAgICBgQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YFxyXG4gICAgXVxyXG4gICAgY29uc3QgZm9ybWF0dGVkVmFsdWVzID0gYFxcdFZBTFVFUyAoJHt2YWx1ZXMuam9pbihcIiwgXCIpfSlgO1xyXG4gICAgcmV0dXJuIFtpbnNlcnQsIGZvcm1hdHRlZFZhbHVlc107XHJcbn1cclxuXHJcbmNvbnN0IGdldERlbGV0ZVJvd3MgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkZWxldGVTdGF0ZW1lbnQgPSBcIkRFTEVURSBGUk9NIFtTeXNFbnRpdHlTY2hlbWFPcGVyYXRpb25SaWdodF1cIjtcclxuICAgIGNvbnN0IGZpbHRlciA9IGBcXHRXSEVSRSBbU3ViamVjdFNjaGVtYVVJZF0gPSBAJHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX1gO1xyXG4gICAgcmV0dXJuIFtkZWxldGVTdGF0ZW1lbnQsIGZpbHRlcl07XHJcbn1cclxuXHJcbmNvbnN0IGdldFNjaGVtYVZhcmlhYmxlID0gKHNjaGVtYVVJZCkgPT4gXHJcbiAgICBgREVDTEFSRSBAJHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX0gdW5pcXVlaWRlbnRpZmllciA9ICcke3NjaGVtYVVJZH0nO2BcclxuXHJcbmNvbnN0IGdldFNjaG1lYVZhcmlhYmxlTmFtZSA9ICgpID0+XHJcbiAgICBcInJpZ2h0c1NjaGVtYVVJZFwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZW5lcmF0ZVNjcmlwdDsiLCJjb25zdCBnZW5lcmF0ZVNjcmlwdCA9ICh0YWJsZUNhcHRpb24sIHNjaGVtYVVJZCwgcmlnaHRzKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXJSb3dzID0gZ2V0SGVhZGVyUm93cyh0YWJsZUNhcHRpb24sIHJpZ2h0cyk7XHJcbiAgICBjb25zdCBzY3JpcHRSb3dzID0gZ2V0U2NyaXB0Um93cyhyaWdodHMsIHNjaGVtYVVJZCk7XHJcbiAgICByZXR1cm4gWy4uLmhlYWRlclJvd3MsIFwiXCIsIC4uLnNjcmlwdFJvd3NdLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcbmNvbnN0IGdldEhlYWRlclJvd3MgPSAodGFibGVDYXB0aW9uLCByaWdodHNSZXN1bHQpID0+IHtcclxuICAgIGNvbnN0IGhlYWRlciA9IGDQndCw0YHRgtGA0L7QudC60LAg0L/RgNCw0LIg0LTQvtGB0YLRg9C/0LAg0L/QviDQvtC/0LXRgNCw0YbQuNGP0Lwg0L3QsCDQvtCx0YrQtdC60YIgXFxcIiR7dGFibGVDYXB0aW9ufVxcXCJgO1xyXG4gICAgY29uc3Qgcm9sZXMgPSByaWdodHNSZXN1bHQubWFwKHJpZ2h0ID0+IGZvcm1hdFJvbGUocmlnaHQuU3lzQWRtaW5Vbml0SWQsIHJpZ2h0LlVuaXROYW1lKSk7XHJcbiAgICByZXR1cm4gW1wiLypcIiwgaGVhZGVyLCAuLi5yb2xlcywgXCIqL1wiXTtcclxufVxyXG5cclxuY29uc3QgZ2V0U2NyaXB0Um93cyA9IChyaWdodHNSZXN1bHQsIHNjaGVtYVVJZCkgPT4ge1xyXG4gICAgY29uc3Qgc2NoZW1hVmFyaWFibGUgPSBnZXRTY2hlbWFWYXJpYWJsZShzY2hlbWFVSWQpO1xyXG4gICAgY29uc3QgZGVsZXRlUm93cyA9IGdldERlbGV0ZVJvd3MoKTtcclxuXHJcbiAgICBjb25zdCB1bml0VmFyaWFibGVzID0gW107XHJcbiAgICBjb25zdCBpbnNlcnRSb3dzID0gW107XHJcblxyXG4gICAgaW5zZXJ0Um93cy5wdXNoKGZvcm1hdEluc2VydFN0YXRlbWVudCgpKTtcclxuICAgIHJpZ2h0c1Jlc3VsdC5mb3JFYWNoKChyaWdodCwgaXgpID0+IHtcclxuICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBnZXRWYXJpYWJsZU5hbWUocmlnaHQuVW5pdE5hbWUpO1xyXG4gICAgICAgIHVuaXRWYXJpYWJsZXMucHVzaChnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQodmFyaWFibGVOYW1lLCByaWdodC5TeXNBZG1pblVuaXRJZCkpO1xyXG4gICAgICAgIGluc2VydFJvd3MucHVzaChmb3JtYXRJbnNlcnQodmFyaWFibGVOYW1lLCByaWdodC5DYW5SZWFkLCBcclxuICAgICAgICAgICAgcmlnaHQuQ2FuQXBwZW5kLCByaWdodC5DYW5FZGl0LCByaWdodC5DYW5EZWxldGUsIHJpZ2h0LlBvc2l0aW9uKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIFwiRE8gJCRcIixcclxuICAgICAgICBcIkRFQ0xBUkVcIixcclxuICAgICAgICAuLi51bml0VmFyaWFibGVzLCBcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIHNjaGVtYVZhcmlhYmxlLFxyXG4gICAgICAgIFwiQkVHSU5cIixcclxuICAgICAgICBkZWxldGVSb3dzLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uaW5zZXJ0Um93cyxcclxuICAgICAgICBcIkVORDtcIixcclxuICAgICAgICBcIiQkXCJcclxuICAgIF07XHJcbn1cclxuXHJcbmNvbnN0IGZvcm1hdFJvbGUgPSAocm9sZUlkLCByb2xlTmFtZSkgPT4ge1xyXG4gICAgcmV0dXJuIGAnJHtyb2xlSWR9JyAtICR7cm9sZU5hbWV9YFxyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZU5hbWUgPSAoc3lzQWRtaW5Vbml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgY2xlYXJlZFZhcmlhYmxlID0gc3lzQWRtaW5Vbml0TmFtZS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XHJcbiAgICByZXR1cm4gYCR7Y2xlYXJlZFZhcmlhYmxlLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpfSR7Y2xlYXJlZFZhcmlhYmxlLnNsaWNlKDEpfUlkYDtcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50ID0gKHZhcmlhYmxlTmFtZSwgYWRtaW5Vbml0SWQpID0+IFxyXG4gICAgYFxcdCR7dmFyaWFibGVOYW1lfSB1dWlkID0gJyR7YWRtaW5Vbml0SWR9JztgO1xyXG5cclxuY29uc3QgZm9ybWF0SW5zZXJ0U3RhdGVtZW50ID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaW5zZXJ0ID0gYFxcdElOU0VSVCBJTlRPIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiAoXCJTeXNBZG1pblVuaXRJZFwiLCBcIkNhblJlYWRcIiwgXCJDYW5BcHBlbmRcIiwgXCJDYW5FZGl0XCIsIFwiQ2FuRGVsZXRlXCIsIFwiUG9zaXRpb25cIiwgXCJTdWJqZWN0U2NoZW1hVUlkXCIpIFZBTFVFU2A7XHJcbiAgICByZXR1cm4gaW5zZXJ0O1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRJbnNlcnQgPSAoYWRtaW5Vbml0VmFyaWFibGUsIGNhblJlYWQsIGNhbkFwcGVuZCwgY2FuRWRpdCwgY2FuRGVsZXRlLCBwb3NpdGlvbikgPT4ge1xyXG4gICAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgICAgIGAke2FkbWluVW5pdFZhcmlhYmxlfWAsXHJcbiAgICAgICAgK2NhblJlYWQsXHJcbiAgICAgICAgK2NhbkFwcGVuZCxcclxuICAgICAgICArY2FuRWRpdCxcclxuICAgICAgICArY2FuRGVsZXRlLFxyXG4gICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgIGBAJHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX1gXHJcbiAgICBdXHJcbiAgICBjb25zdCBmb3JtYXR0ZWRWYWx1ZXMgPSBgXFx0KCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBmb3JtYXR0ZWRWYWx1ZXM7XHJcbn1cclxuXHJcbmNvbnN0IGdldERlbGV0ZVJvd3MgPSAoKSA9PlxyXG4gICAgYFxcdERFTEVURSBGUk9NIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiBXSEVSRSBcIlN1YmplY3RTY2hlbWFVSWRcIiA9ICR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YDtcclxuXHJcbmNvbnN0IGdldFNjaGVtYVZhcmlhYmxlID0gKHNjaGVtYVVJZCkgPT4gXHJcbiAgICBgXFx0JHtnZXRTY2htZWFWYXJpYWJsZU5hbWUoKX0gdXVpZCA9ICcke3NjaGVtYVVJZH0nO2BcclxuXHJcbmNvbnN0IGdldFNjaG1lYVZhcmlhYmxlTmFtZSA9ICgpID0+XHJcbiAgICBcInJpZ2h0c1NjaGVtYVVJZFwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZW5lcmF0ZVNjcmlwdDsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBcIi4vcG9wdXAuY3NzXCI7XHJcbmltcG9ydCBmb3JtYXR0ZXIgZnJvbSBcIi4uLy4uLy4uL2Zvcm1hdHRlci9mb3JtYXR0ZXIuanNcIlxyXG5cclxuY29uc3QgZm9ybWF0U2NyaXB0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtYXQtYnRuXCIpO1xyXG5cclxuY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoXCJkYlR5cGVcIiwgYXN5bmMgKHJlc3VsdCkgPT4ge1xyXG5cdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0Y29uc3QgZGJUeXBlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRiLXR5cGVcIik7XHJcblx0aWYgKHR5cGVvZihyZXN1bHQ/LmRiVHlwZSkgPT09IFwibnVtYmVyXCIpe1xyXG5cdFx0ZGJUeXBlSW5wdXQudmFsdWUgPSByZXN1bHQuZGJUeXBlO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7ZGJUeXBlOiAwfSk7XHJcblx0fVxyXG5cclxuXHRkYlR5cGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChldmVudCkgPT4ge1xyXG5cdFx0Y29uc3QgdmFsdWUgPSBldmVudC50YXJnZXQ/LnZhbHVlIHx8IDA7XHJcblx0XHRjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7ZGJUeXBlOiBwYXJzZUludCh2YWx1ZSl9KTtcclxuXHR9KVxyXG5cclxuXHRjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG5cdFx0dGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcclxuXHRcdGZ1bmN0aW9uOiBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVyc1xyXG5cdH0sIHVwZGF0ZVNRTFRleHQpO1xyXG59KVxyXG5cclxuY29uc3QgdXBkYXRlU1FMVGV4dCA9IChwYXJhbWV0ZXJzKSA9PiB7XHJcblx0Y2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoXCJzY3JpcHRcIiwgYXN5bmMgKHJlc3VsdCkgPT4ge1xyXG5cdFx0Y29uc29sZS5sb2cocGFyYW1ldGVycyk7XHJcblx0XHRjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG5cdFx0aWYgKHJlc3VsdD8uc2NyaXB0Py51cmwgPT09IHBhcmFtZXRlcnNbMF0ucmVzdWx0Py51cmwpe1xyXG5cdFx0XHR1cGRhdGVPdXRwdXQocmVzdWx0LnNjcmlwdC50ZXh0KTtcclxuXHRcdH1cclxuXHR9KTtcclxufVxyXG5cclxuZm9ybWF0U2NyaXB0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcblx0Zm9ybWF0U2NyaXB0QnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICBcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0Y2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuXHRcdHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXHJcbiAgICBcdGZ1bmN0aW9uOiBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVyc1xyXG5cdH0sIHNlbmRGb3JtYXRNZXNzYWdlKTtcclxufSk7XHJcblxyXG5jb25zdCBzZW5kRm9ybWF0TWVzc2FnZSA9IChpbmplY3Rpb25SZXN1bHRzKSA9PiB7XHJcblx0aWYgKGluamVjdGlvblJlc3VsdHMgJiYgaW5qZWN0aW9uUmVzdWx0cy5sZW5ndGggIT09IDApe1xyXG5cdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHQgJiYgaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiYgXHJcblx0XHRcdGluamVjdGlvblJlc3VsdC5yZXN1bHQ/LnNjaGVtYVVJZCAmJiBcclxuXHRcdFx0aW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udXJsKXtcclxuXHRcdFx0Y29uc3QgcGFyYW1ldGVycyA9IHtcclxuXHRcdFx0XHR0b2tlbjogaW5qZWN0aW9uUmVzdWx0LnJlc3VsdC50b2tlbixcclxuXHRcdFx0XHR1cmw6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudXJsLCAgXHJcblx0XHRcdFx0c2NoZW1hVUlkOiBpbmplY3Rpb25SZXN1bHQucmVzdWx0LnNjaGVtYVVJZFxyXG5cdFx0XHR9XHJcblx0XHRcdGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHBhcmFtZXRlcnMsIHByb2Nlc3NGb3JtYXR0ZWRTY3JpcHQpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY29uc3QgcHJvY2Vzc0Zvcm1hdHRlZFNjcmlwdCA9IGFzeW5jIChyZXNwb25zZSkgPT4ge1xyXG5cdGZvcm1hdFNjcmlwdEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXB0aW9uICYmIHJlc3BvbnNlLnJpZ2h0cyAmJiBcclxuXHRcdHJlc3BvbnNlLnJpZ2h0cy5sZW5ndGggIT09IDAgJiYgcmVzcG9uc2Uuc2NoZW1hVUlkKXtcclxuXHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtzY2hlbWFVSWQ6IHJlc3BvbnNlLnNjaGVtYVVJZH0pO1xyXG5cdFx0Y29uc3QgZGJUeXBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkYi10eXBlXCIpPy52YWx1ZSB8fCAwO1xyXG5cdFx0Y29uc3Qgc2NyaXB0Rm9ybWF0dGVyID0gZm9ybWF0dGVyKHBhcnNlSW50KGRiVHlwZSkpO1xyXG5cdFx0Y29uc3Qgc3FsU2NyaXB0ID0gc2NyaXB0Rm9ybWF0dGVyKHJlc3BvbnNlLmNhcHRpb24sIHJlc3BvbnNlLnNjaGVtYVVJZCwgcmVzcG9uc2UucmlnaHRzKTtcclxuXHRcdHVwZGF0ZU91dHB1dChzcWxTY3JpcHQpO1xyXG5cdFx0Y2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe3NjcmlwdDoge3VybDogcmVzcG9uc2UudXJsLCB0ZXh0OiBzcWxTY3JpcHR9fSk7XHJcblx0XHRcclxuXHRcdGNvbnN0IGlzQmluZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmluZC1jaGVja2JveFwiKS5jaGVja2VkO1xyXG5cdFx0aWYgKGlzQmluZCl7XHJcblx0XHRcdGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcblx0XHRcdGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcblx0XHRcdFx0dGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcclxuXHRcdFx0XHRmdW5jdGlvbjogZ2V0Q3JlYXRpb1NlcnZlclBhcmFtZXRlcnNcclxuXHRcdFx0fSwgYmluZFRvUGFja2FnZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBnZXRDcmVhdGlvU2VydmVyUGFyYW1ldGVycyA9ICgpID0+IHtcclxuXHRpZiAoZG9jdW1lbnQ/LmNvb2tpZSAmJiB3aW5kb3c/LmxvY2F0aW9uPy5ocmVmICYmIGxvY2F0aW9uPy5vcmlnaW4pe1xyXG5cdFx0Y29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIj1cIik7XHJcblx0XHRjb25zdCB1cmxQYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFwiL1wiKTtcclxuXHRcdGlmIChjb29raWVzICYmIGNvb2tpZXMubGVuZ3RoID49IDEgJiYgdXJsUGFydHMgJiYgdXJsUGFydHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdFx0Y29uc3QgdG9rZW4gPSBjb29raWVzWzFdO1xyXG5cdFx0XHRjb25zdCBzY2hlbWFVSWQgPSB1cmxQYXJ0c1t1cmxQYXJ0cy5sZW5ndGggLSAxXTtcclxuXHRcdFx0Y29uc3QgdXJsID0gbG9jYXRpb24ub3JpZ2luO1xyXG5cdFx0XHRyZXR1cm4ge3VybCwgdG9rZW4sIHNjaGVtYVVJZH1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmNvbnN0IGJpbmRUb1BhY2thZ2UgPSBhc3luYyAoaW5qZWN0aW9uUmVzdWx0cykgPT4ge1xyXG5cdGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwic2NoZW1hVUlkXCIsIChyZXN1bHQpID0+IHtcclxuXHRcdGlmIChpbmplY3Rpb25SZXN1bHRzICYmIGluamVjdGlvblJlc3VsdHMubGVuZ3RoICE9PSAwKXtcclxuXHRcdFx0Y29uc3QgaW5qZWN0aW9uUmVzdWx0ID0gaW5qZWN0aW9uUmVzdWx0c1swXTtcclxuXHRcdFx0Y29uc3Qgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0cHV0XCIpO1xyXG5cdFx0XHRpZiAoaW5qZWN0aW9uUmVzdWx0LnJlc3VsdD8udG9rZW4gJiZcclxuXHRcdFx0XHRpbmplY3Rpb25SZXN1bHQucmVzdWx0Py51cmwgJiYgb3V0cHV0RWxlbWVudCAmJiBcclxuXHRcdFx0XHRvdXRwdXRFbGVtZW50LnRleHRDb250ZW50KXtcclxuXHRcdFx0XHRmZXRjaChgJHtpbmplY3Rpb25SZXN1bHQucmVzdWx0LnVybH0vMC9yZXN0L1JpZ2h0c1NjcmlwdEdlbmVyYXRvclNlcnZpY2UvR2VuZXJhdGVTY3JpcHRgLCB7XHJcblx0XHRcdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxyXG5cdFx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuXHRcdFx0XHRcdFx0XCJCUE1DU1JGXCI6IGluamVjdGlvblJlc3VsdC5yZXN1bHQudG9rZW5cclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRcdHNjcmlwdDogb3V0cHV0RWxlbWVudC50ZXh0Q29udGVudCxcclxuXHRcdFx0XHRcdFx0c2NoZW1hVUlkOiByZXN1bHQuc2NoZW1hVUlkXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuXHRcdFx0XHQudGhlbihyZXMgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKHJlcz8uR2VuZXJhdGVTY3JpcHRSZXN1bHQ/LklzU3VjY2Vzc2Z1bCAmJiByZXM/LkdlbmVyYXRlU2NyaXB0UmVzdWx0Py5TY3JpcHRVcmwpe1xyXG5cdFx0XHRcdFx0XHRjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IHJlcy5HZW5lcmF0ZVNjcmlwdFJlc3VsdC5TY3JpcHRVcmwgfSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG5jb25zdCB1cGRhdGVPdXRwdXQgPSAoc2NyaXB0KSA9PiB7XHJcblx0Y29uc3Qgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0cHV0XCIpO1xyXG5cdG91dHB1dEVsZW1lbnQudGV4dENvbnRlbnQgPSBzY3JpcHQ7XHJcblx0Y29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBvcHVwLWJvZHlcIik7XHJcblx0cG9wdXAuc3R5bGUud2lkdGggPSBcIjYwMHB4XCI7XHJcblx0b3V0cHV0RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIjMwMHB4XCI7XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=