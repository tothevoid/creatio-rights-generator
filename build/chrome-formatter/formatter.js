/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/*!************************************!*\
  !*** ../../formatter/formatter.js ***!
  \************************************/
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
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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anMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvY29uc3RhbnRzL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9tc3NxbEZvcm1hdHRlci5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9wb3N0Z3JlRm9ybWF0dGVyLmpzIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0Ly4uLy4uL2Zvcm1hdHRlci9mb3JtYXR0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdldEhlYWRlclJvd3MgPSAodGFibGVDYXB0aW9uLCByaWdodHNSZXN1bHQpID0+IHtcclxuICAgIGNvbnN0IGhlYWRlciA9IGBcXFwiJHt0YWJsZUNhcHRpb259XFxcImA7XHJcbiAgICBjb25zdCByb2xlcyA9IHJpZ2h0c1Jlc3VsdC5tYXAocmlnaHQgPT4gZm9ybWF0Um9sZShyaWdodC5TeXNBZG1pblVuaXRJZCwgcmlnaHQuVW5pdE5hbWUpKTtcclxuICAgIHJldHVybiBbXCIvKlwiLCBoZWFkZXIsIC4uLnJvbGVzLCBcIiovXCJdO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0U2NoZW1hVmFyaWFibGVOYW1lID0gKCkgPT5cclxuICAgIFwicmlnaHRzU2NoZW1hVUlkXCJcclxuXHJcbmNvbnN0IGZvcm1hdFJvbGUgPSAocm9sZUlkLCByb2xlTmFtZSkgPT4ge1xyXG4gICAgcmV0dXJuIGAnJHtyb2xlSWR9JyAtICR7cm9sZU5hbWV9YFxyXG59IiwiY29uc3Qgc3FsRm9ybWF0ID0ge1xyXG4gICAgTVNTUUw6IDAsXHJcbiAgICBQb3N0Z3JlU1FMOiAxXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNxbEZvcm1hdDsiLCJpbXBvcnQgeyBnZXRIZWFkZXJSb3dzLCBnZXRTY2hlbWFWYXJpYWJsZU5hbWUgfSBmcm9tIFwiLi9jb21tb24uanNcIlxyXG5cclxuY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICByaWdodHNSZXN1bHQuZm9yRWFjaCgocmlnaHQsIGl4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goLi4uZm9ybWF0UmlnaHRJbnNlcnQodmFyaWFibGVOYW1lLCByaWdodC5DYW5SZWFkLCBcclxuICAgICAgICAgICAgcmlnaHQuQ2FuQXBwZW5kLCByaWdodC5DYW5FZGl0LCByaWdodC5DYW5EZWxldGUsIHJpZ2h0LlBvc2l0aW9uKSk7XHJcblxyXG4gICAgICAgIGlmIChpeCAhPT0gcmlnaHRzUmVzdWx0Lmxlbmd0aCAtIDEpe1xyXG4gICAgICAgICAgICBpbnNlcnRSb3dzLnB1c2goXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAuLi51bml0VmFyaWFibGVzLCBcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIHNjaGVtYVZhcmlhYmxlLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3NcclxuICAgIF07XHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlTmFtZSA9IChzeXNBZG1pblVuaXROYW1lKSA9PiB7XHJcbiAgICBjb25zdCBjbGVhcmVkVmFyaWFibGUgPSBzeXNBZG1pblVuaXROYW1lLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcclxuICAgIHJldHVybiBgJHtjbGVhcmVkVmFyaWFibGUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCl9JHtjbGVhcmVkVmFyaWFibGUuc2xpY2UoMSl9SWRgO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQgPSAodmFyaWFibGVOYW1lLCBhZG1pblVuaXRJZCkgPT4gXHJcbiAgICBgREVDTEFSRSBAJHt2YXJpYWJsZU5hbWV9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHthZG1pblVuaXRJZH0nO2BcclxuXHJcbmNvbnN0IGZvcm1hdFJpZ2h0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IFwiSU5TRVJUIElOVE8gU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHQgKFN5c0FkbWluVW5pdElkLCBDYW5SZWFkLCBDYW5BcHBlbmQsIENhbkVkaXQsIENhbkRlbGV0ZSwgUG9zaXRpb24sIFN1YmplY3RTY2hlbWFVSWQpXCI7XHJcbiAgICBcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgQCR7YWRtaW5Vbml0VmFyaWFibGV9YCxcclxuICAgICAgICArY2FuUmVhZCxcclxuICAgICAgICArY2FuQXBwZW5kLFxyXG4gICAgICAgICtjYW5FZGl0LFxyXG4gICAgICAgICtjYW5EZWxldGUsXHJcbiAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgYEAke2dldFNjaGVtYVZhcmlhYmxlTmFtZSgpfWBcclxuICAgIF1cclxuICAgIGNvbnN0IGZvcm1hdHRlZFZhbHVlcyA9IGBcXHRWQUxVRVMgKCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBbaW5zZXJ0LCBmb3JtYXR0ZWRWYWx1ZXNdO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGVsZXRlU3RhdGVtZW50ID0gXCJERUxFVEUgRlJPTSBbU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRdXCI7XHJcbiAgICBjb25zdCBmaWx0ZXIgPSBgXFx0V0hFUkUgW1N1YmplY3RTY2hlbWFVSWRdID0gQCR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9YDtcclxuICAgIHJldHVybiBbZGVsZXRlU3RhdGVtZW50LCBmaWx0ZXJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYERFQ0xBUkUgQCR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZW5lcmF0ZVNjcmlwdDsiLCJpbXBvcnQgeyBnZXRIZWFkZXJSb3dzLCBnZXRTY2hlbWFWYXJpYWJsZU5hbWUgfSBmcm9tIFwiLi9jb21tb24uanNcIlxyXG5cclxuY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY3JpcHRSb3dzID0gKHJpZ2h0c1Jlc3VsdCwgc2NoZW1hVUlkKSA9PiB7XHJcbiAgICBjb25zdCBzY2hlbWFWYXJpYWJsZSA9IGdldFNjaGVtYVZhcmlhYmxlKHNjaGVtYVVJZCk7XHJcbiAgICBjb25zdCBkZWxldGVSb3dzID0gZ2V0RGVsZXRlUm93cygpO1xyXG5cclxuICAgIGNvbnN0IHVuaXRWYXJpYWJsZXMgPSBbXTtcclxuICAgIGNvbnN0IGluc2VydFJvd3MgPSBbXTtcclxuXHJcbiAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0U3RhdGVtZW50KCkpO1xyXG4gICAgcmlnaHRzUmVzdWx0LmZvckVhY2goKHJpZ2h0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0KHZhcmlhYmxlTmFtZSwgcmlnaHQuQ2FuUmVhZCwgXHJcbiAgICAgICAgICAgIHJpZ2h0LkNhbkFwcGVuZCwgcmlnaHQuQ2FuRWRpdCwgcmlnaHQuQ2FuRGVsZXRlLCByaWdodC5Qb3NpdGlvbikpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBcIkRPICQkXCIsXHJcbiAgICAgICAgXCJERUNMQVJFXCIsXHJcbiAgICAgICAgLi4udW5pdFZhcmlhYmxlcywgXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICBzY2hlbWFWYXJpYWJsZSxcclxuICAgICAgICBcIkJFR0lOXCIsXHJcbiAgICAgICAgZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3MsXHJcbiAgICAgICAgXCJFTkQ7XCIsXHJcbiAgICAgICAgXCIkJFwiXHJcbiAgICBdO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZU5hbWUgPSAoc3lzQWRtaW5Vbml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgY2xlYXJlZFZhcmlhYmxlID0gc3lzQWRtaW5Vbml0TmFtZS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XHJcbiAgICByZXR1cm4gYCR7Y2xlYXJlZFZhcmlhYmxlLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpfSR7Y2xlYXJlZFZhcmlhYmxlLnNsaWNlKDEpfUlkYDtcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50ID0gKHZhcmlhYmxlTmFtZSwgYWRtaW5Vbml0SWQpID0+IFxyXG4gICAgYFxcdCR7dmFyaWFibGVOYW1lfSB1dWlkID0gJyR7YWRtaW5Vbml0SWR9JztgO1xyXG5cclxuY29uc3QgZm9ybWF0SW5zZXJ0U3RhdGVtZW50ID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaW5zZXJ0ID0gYFxcdElOU0VSVCBJTlRPIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiAoXCJTeXNBZG1pblVuaXRJZFwiLCBcIkNhblJlYWRcIiwgXCJDYW5BcHBlbmRcIiwgXCJDYW5FZGl0XCIsIFwiQ2FuRGVsZXRlXCIsIFwiUG9zaXRpb25cIiwgXCJTdWJqZWN0U2NoZW1hVUlkXCIpIFZBTFVFU2A7XHJcbiAgICByZXR1cm4gaW5zZXJ0O1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRJbnNlcnQgPSAoYWRtaW5Vbml0VmFyaWFibGUsIGNhblJlYWQsIGNhbkFwcGVuZCwgY2FuRWRpdCwgY2FuRGVsZXRlLCBwb3NpdGlvbikgPT4ge1xyXG4gICAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgICAgIGAke2FkbWluVW5pdFZhcmlhYmxlfWAsXHJcbiAgICAgICAgK2NhblJlYWQsXHJcbiAgICAgICAgK2NhbkFwcGVuZCxcclxuICAgICAgICArY2FuRWRpdCxcclxuICAgICAgICArY2FuRGVsZXRlLFxyXG4gICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgIGBAJHtnZXRTY2hlbWFWYXJpYWJsZU5hbWUoKX1gXHJcbiAgICBdXHJcbiAgICBjb25zdCBmb3JtYXR0ZWRWYWx1ZXMgPSBgXFx0KCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBmb3JtYXR0ZWRWYWx1ZXM7XHJcbn1cclxuXHJcbmNvbnN0IGdldERlbGV0ZVJvd3MgPSAoKSA9PlxyXG4gICAgYFxcdERFTEVURSBGUk9NIFwiU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRcIiBXSEVSRSBcIlN1YmplY3RTY2hlbWFVSWRcIiA9ICR7Z2V0U2NoZW1hVmFyaWFibGVOYW1lKCl9YDtcclxuXHJcbmNvbnN0IGdldFNjaGVtYVZhcmlhYmxlID0gKHNjaGVtYVVJZCkgPT4gXHJcbiAgICBgXFx0JHtnZXRTY2hlbWFWYXJpYWJsZU5hbWUoKX0gdXVpZCA9ICcke3NjaGVtYVVJZH0nO2BcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlU2NyaXB0OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHNxbENvbnN0YW50cyAgZnJvbSBcIi4vY29uc3RhbnRzL2NvbnN0YW50cy5qc1wiXHJcbmltcG9ydCBtc3NxbEZvcm1hdHRlciBmcm9tIFwiLi9tc3NxbEZvcm1hdHRlci5qc1wiXHJcbmltcG9ydCBwb3N0Z3JlRm9ybWF0dGVyIGZyb20gXCIuL3Bvc3RncmVGb3JtYXR0ZXIuanNcIlxyXG5cclxuY29uc3QgZ2V0Rm9ybWF0dGVyID0gKGZvcm1hdCkgPT4ge1xyXG4gICAgc3dpdGNoIChmb3JtYXQpe1xyXG4gICAgICAgIGNhc2UgKHNxbENvbnN0YW50cy5NU1NRTCk6XHJcbiAgICAgICAgICAgIHJldHVybiBtc3NxbEZvcm1hdHRlcjtcclxuICAgICAgICBjYXNlIChzcWxDb25zdGFudHMuUG9zdGdyZVNRTCk6XHJcbiAgICAgICAgICAgIHJldHVybiBwb3N0Z3JlRm9ybWF0dGVyO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZm9ybWF0IHBhc3NlZFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2V0Rm9ybWF0dGVyOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==