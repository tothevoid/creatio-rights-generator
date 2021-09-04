/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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L2NvbnN0YW50cy9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvbXNzcWxGb3JtYXR0ZXIuanMiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvcG9zdGdyZUZvcm1hdHRlci5qcyIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3JpZ2h0cy1leHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9yaWdodHMtZXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcmlnaHRzLWV4dC8uLi8uLi9mb3JtYXR0ZXIvZm9ybWF0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNxbEZvcm1hdCA9IHtcclxuICAgIE1TU1FMOiAwLFxyXG4gICAgUG9zdGdyZVNRTDogMVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzcWxGb3JtYXQ7IiwiY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRIZWFkZXJSb3dzID0gKHRhYmxlQ2FwdGlvbiwgcmlnaHRzUmVzdWx0KSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXIgPSBg0J3QsNGB0YLRgNC+0LnQutCwINC/0YDQsNCyINC00L7RgdGC0YPQv9CwINC/0L4g0L7Qv9C10YDQsNGG0LjRj9C8INC90LAg0L7QsdGK0LXQutGCIFxcXCIke3RhYmxlQ2FwdGlvbn1cXFwiYDtcclxuICAgIGNvbnN0IHJvbGVzID0gcmlnaHRzUmVzdWx0Lm1hcChyaWdodCA9PiBmb3JtYXRSb2xlKHJpZ2h0LlN5c0FkbWluVW5pdElkLCByaWdodC5Vbml0TmFtZSkpO1xyXG4gICAgcmV0dXJuIFtcIi8qXCIsIGhlYWRlciwgLi4ucm9sZXMsIFwiKi9cIl07XHJcbn1cclxuXHJcbmNvbnN0IGdldFNjcmlwdFJvd3MgPSAocmlnaHRzUmVzdWx0LCBzY2hlbWFVSWQpID0+IHtcclxuICAgIGNvbnN0IHNjaGVtYVZhcmlhYmxlID0gZ2V0U2NoZW1hVmFyaWFibGUoc2NoZW1hVUlkKTtcclxuICAgIGNvbnN0IGRlbGV0ZVJvd3MgPSBnZXREZWxldGVSb3dzKCk7XHJcblxyXG4gICAgY29uc3QgdW5pdFZhcmlhYmxlcyA9IFtdO1xyXG4gICAgY29uc3QgaW5zZXJ0Um93cyA9IFtdO1xyXG5cclxuICAgIHJpZ2h0c1Jlc3VsdC5mb3JFYWNoKChyaWdodCwgaXgpID0+IHtcclxuICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBnZXRWYXJpYWJsZU5hbWUocmlnaHQuVW5pdE5hbWUpO1xyXG4gICAgICAgIHVuaXRWYXJpYWJsZXMucHVzaChnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQodmFyaWFibGVOYW1lLCByaWdodC5TeXNBZG1pblVuaXRJZCkpO1xyXG4gICAgICAgIGluc2VydFJvd3MucHVzaCguLi5mb3JtYXRSaWdodEluc2VydCh2YXJpYWJsZU5hbWUsIHJpZ2h0LkNhblJlYWQsIFxyXG4gICAgICAgICAgICByaWdodC5DYW5BcHBlbmQsIHJpZ2h0LkNhbkVkaXQsIHJpZ2h0LkNhbkRlbGV0ZSwgcmlnaHQuUG9zaXRpb24pKTtcclxuXHJcbiAgICAgICAgaWYgKGl4ICE9PSByaWdodHNSZXN1bHQubGVuZ3RoIC0gMSl7XHJcbiAgICAgICAgICAgIGluc2VydFJvd3MucHVzaChcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIC4uLnVuaXRWYXJpYWJsZXMsIFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgc2NoZW1hVmFyaWFibGUsXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICAuLi5kZWxldGVSb3dzLFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgLi4uaW5zZXJ0Um93c1xyXG4gICAgXTtcclxufVxyXG5cclxuY29uc3QgZm9ybWF0Um9sZSA9IChyb2xlSWQsIHJvbGVOYW1lKSA9PiB7XHJcbiAgICByZXR1cm4gYCcke3JvbGVJZH0nIC0gJHtyb2xlTmFtZX1gXHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlTmFtZSA9IChzeXNBZG1pblVuaXROYW1lKSA9PiB7XHJcbiAgICBjb25zdCBjbGVhcmVkVmFyaWFibGUgPSBzeXNBZG1pblVuaXROYW1lLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcclxuICAgIHJldHVybiBgJHtjbGVhcmVkVmFyaWFibGUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCl9JHtjbGVhcmVkVmFyaWFibGUuc2xpY2UoMSl9SWRgO1xyXG59XHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZURlY2xhcmVTdGF0ZW1lbnQgPSAodmFyaWFibGVOYW1lLCBhZG1pblVuaXRJZCkgPT4gXHJcbiAgICBgREVDTEFSRSBAJHt2YXJpYWJsZU5hbWV9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHthZG1pblVuaXRJZH0nO2BcclxuXHJcbmNvbnN0IGZvcm1hdFJpZ2h0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IFwiSU5TRVJUIElOVE8gU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHQgKFN5c0FkbWluVW5pdElkLCBDYW5SZWFkLCBDYW5BcHBlbmQsIENhbkVkaXQsIENhbkRlbGV0ZSwgUG9zaXRpb24sIFN1YmplY3RTY2hlbWFVSWQpXCI7XHJcbiAgICBcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgQCR7YWRtaW5Vbml0VmFyaWFibGV9YCxcclxuICAgICAgICArY2FuUmVhZCxcclxuICAgICAgICArY2FuQXBwZW5kLFxyXG4gICAgICAgICtjYW5FZGl0LFxyXG4gICAgICAgICtjYW5EZWxldGUsXHJcbiAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgYEAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWBcclxuICAgIF1cclxuICAgIGNvbnN0IGZvcm1hdHRlZFZhbHVlcyA9IGBcXHRWQUxVRVMgKCR7dmFsdWVzLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgIHJldHVybiBbaW5zZXJ0LCBmb3JtYXR0ZWRWYWx1ZXNdO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGVsZXRlU3RhdGVtZW50ID0gXCJERUxFVEUgRlJPTSBbU3lzRW50aXR5U2NoZW1hT3BlcmF0aW9uUmlnaHRdXCI7XHJcbiAgICBjb25zdCBmaWx0ZXIgPSBgXFx0V0hFUkUgW1N1YmplY3RTY2hlbWFVSWRdID0gQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YDtcclxuICAgIHJldHVybiBbZGVsZXRlU3RhdGVtZW50LCBmaWx0ZXJdO1xyXG59XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYERFQ0xBUkUgQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9IHVuaXF1ZWlkZW50aWZpZXIgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5jb25zdCBnZXRTY2htZWFWYXJpYWJsZU5hbWUgPSAoKSA9PlxyXG4gICAgXCJyaWdodHNTY2hlbWFVSWRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVTY3JpcHQ7IiwiY29uc3QgZ2VuZXJhdGVTY3JpcHQgPSAodGFibGVDYXB0aW9uLCBzY2hlbWFVSWQsIHJpZ2h0cykgPT4ge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IGdldEhlYWRlclJvd3ModGFibGVDYXB0aW9uLCByaWdodHMpO1xyXG4gICAgY29uc3Qgc2NyaXB0Um93cyA9IGdldFNjcmlwdFJvd3MocmlnaHRzLCBzY2hlbWFVSWQpO1xyXG4gICAgcmV0dXJuIFsuLi5oZWFkZXJSb3dzLCBcIlwiLCAuLi5zY3JpcHRSb3dzXS5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5jb25zdCBnZXRIZWFkZXJSb3dzID0gKHRhYmxlQ2FwdGlvbiwgcmlnaHRzUmVzdWx0KSA9PiB7XHJcbiAgICBjb25zdCBoZWFkZXIgPSBg0J3QsNGB0YLRgNC+0LnQutCwINC/0YDQsNCyINC00L7RgdGC0YPQv9CwINC/0L4g0L7Qv9C10YDQsNGG0LjRj9C8INC90LAg0L7QsdGK0LXQutGCIFxcXCIke3RhYmxlQ2FwdGlvbn1cXFwiYDtcclxuICAgIGNvbnN0IHJvbGVzID0gcmlnaHRzUmVzdWx0Lm1hcChyaWdodCA9PiBmb3JtYXRSb2xlKHJpZ2h0LlN5c0FkbWluVW5pdElkLCByaWdodC5Vbml0TmFtZSkpO1xyXG4gICAgcmV0dXJuIFtcIi8qXCIsIGhlYWRlciwgLi4ucm9sZXMsIFwiKi9cIl07XHJcbn1cclxuXHJcbmNvbnN0IGdldFNjcmlwdFJvd3MgPSAocmlnaHRzUmVzdWx0LCBzY2hlbWFVSWQpID0+IHtcclxuICAgIGNvbnN0IHNjaGVtYVZhcmlhYmxlID0gZ2V0U2NoZW1hVmFyaWFibGUoc2NoZW1hVUlkKTtcclxuICAgIGNvbnN0IGRlbGV0ZVJvd3MgPSBnZXREZWxldGVSb3dzKCk7XHJcblxyXG4gICAgY29uc3QgdW5pdFZhcmlhYmxlcyA9IFtdO1xyXG4gICAgY29uc3QgaW5zZXJ0Um93cyA9IFtdO1xyXG5cclxuICAgIGluc2VydFJvd3MucHVzaChmb3JtYXRJbnNlcnRTdGF0ZW1lbnQoKSk7XHJcbiAgICByaWdodHNSZXN1bHQuZm9yRWFjaCgocmlnaHQsIGl4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gZ2V0VmFyaWFibGVOYW1lKHJpZ2h0LlVuaXROYW1lKTtcclxuICAgICAgICB1bml0VmFyaWFibGVzLnB1c2goZ2V0VmFyaWFibGVEZWNsYXJlU3RhdGVtZW50KHZhcmlhYmxlTmFtZSwgcmlnaHQuU3lzQWRtaW5Vbml0SWQpKTtcclxuICAgICAgICBpbnNlcnRSb3dzLnB1c2goZm9ybWF0SW5zZXJ0KHZhcmlhYmxlTmFtZSwgcmlnaHQuQ2FuUmVhZCwgXHJcbiAgICAgICAgICAgIHJpZ2h0LkNhbkFwcGVuZCwgcmlnaHQuQ2FuRWRpdCwgcmlnaHQuQ2FuRGVsZXRlLCByaWdodC5Qb3NpdGlvbikpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBcIkRPICQkXCIsXHJcbiAgICAgICAgXCJERUNMQVJFXCIsXHJcbiAgICAgICAgLi4udW5pdFZhcmlhYmxlcywgXHJcbiAgICAgICAgXCJcIixcclxuICAgICAgICBzY2hlbWFWYXJpYWJsZSxcclxuICAgICAgICBcIkJFR0lOXCIsXHJcbiAgICAgICAgZGVsZXRlUm93cyxcclxuICAgICAgICBcIlwiLFxyXG4gICAgICAgIC4uLmluc2VydFJvd3MsXHJcbiAgICAgICAgXCJFTkQ7XCIsXHJcbiAgICAgICAgXCIkJFwiXHJcbiAgICBdO1xyXG59XHJcblxyXG5jb25zdCBmb3JtYXRSb2xlID0gKHJvbGVJZCwgcm9sZU5hbWUpID0+IHtcclxuICAgIHJldHVybiBgJyR7cm9sZUlkfScgLSAke3JvbGVOYW1lfWBcclxufVxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVOYW1lID0gKHN5c0FkbWluVW5pdE5hbWUpID0+IHtcclxuICAgIGNvbnN0IGNsZWFyZWRWYXJpYWJsZSA9IHN5c0FkbWluVW5pdE5hbWUucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xyXG4gICAgcmV0dXJuIGAke2NsZWFyZWRWYXJpYWJsZS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKX0ke2NsZWFyZWRWYXJpYWJsZS5zbGljZSgxKX1JZGA7XHJcbn1cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlRGVjbGFyZVN0YXRlbWVudCA9ICh2YXJpYWJsZU5hbWUsIGFkbWluVW5pdElkKSA9PiBcclxuICAgIGBcXHQke3ZhcmlhYmxlTmFtZX0gdXVpZCA9ICcke2FkbWluVW5pdElkfSc7YDtcclxuXHJcbmNvbnN0IGZvcm1hdEluc2VydFN0YXRlbWVudCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGluc2VydCA9IGBcXHRJTlNFUlQgSU5UTyBcIlN5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0XCIgKFwiU3lzQWRtaW5Vbml0SWRcIiwgXCJDYW5SZWFkXCIsIFwiQ2FuQXBwZW5kXCIsIFwiQ2FuRWRpdFwiLCBcIkNhbkRlbGV0ZVwiLCBcIlBvc2l0aW9uXCIsIFwiU3ViamVjdFNjaGVtYVVJZFwiKSBWQUxVRVNgO1xyXG4gICAgcmV0dXJuIGluc2VydDtcclxufVxyXG5cclxuY29uc3QgZm9ybWF0SW5zZXJ0ID0gKGFkbWluVW5pdFZhcmlhYmxlLCBjYW5SZWFkLCBjYW5BcHBlbmQsIGNhbkVkaXQsIGNhbkRlbGV0ZSwgcG9zaXRpb24pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgICAgICBgJHthZG1pblVuaXRWYXJpYWJsZX1gLFxyXG4gICAgICAgICtjYW5SZWFkLFxyXG4gICAgICAgICtjYW5BcHBlbmQsXHJcbiAgICAgICAgK2NhbkVkaXQsXHJcbiAgICAgICAgK2NhbkRlbGV0ZSxcclxuICAgICAgICBwb3NpdGlvbixcclxuICAgICAgICBgQCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9YFxyXG4gICAgXVxyXG4gICAgY29uc3QgZm9ybWF0dGVkVmFsdWVzID0gYFxcdCgke3ZhbHVlcy5qb2luKFwiLCBcIil9KWA7XHJcbiAgICByZXR1cm4gZm9ybWF0dGVkVmFsdWVzO1xyXG59XHJcblxyXG5jb25zdCBnZXREZWxldGVSb3dzID0gKCkgPT5cclxuICAgIGBcXHRERUxFVEUgRlJPTSBcIlN5c0VudGl0eVNjaGVtYU9wZXJhdGlvblJpZ2h0XCIgV0hFUkUgXCJTdWJqZWN0U2NoZW1hVUlkXCIgPSAke2dldFNjaG1lYVZhcmlhYmxlTmFtZSgpfWA7XHJcblxyXG5jb25zdCBnZXRTY2hlbWFWYXJpYWJsZSA9IChzY2hlbWFVSWQpID0+IFxyXG4gICAgYFxcdCR7Z2V0U2NobWVhVmFyaWFibGVOYW1lKCl9IHV1aWQgPSAnJHtzY2hlbWFVSWR9JztgXHJcblxyXG5jb25zdCBnZXRTY2htZWFWYXJpYWJsZU5hbWUgPSAoKSA9PlxyXG4gICAgXCJyaWdodHNTY2hlbWFVSWRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVTY3JpcHQ7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgc3FsQ29uc3RhbnRzICBmcm9tIFwiLi9jb25zdGFudHMvY29uc3RhbnRzLmpzXCJcclxuaW1wb3J0IG1zc3FsRm9ybWF0dGVyIGZyb20gXCIuL21zc3FsRm9ybWF0dGVyLmpzXCJcclxuaW1wb3J0IHBvc3RncmVGb3JtYXR0ZXIgZnJvbSBcIi4vcG9zdGdyZUZvcm1hdHRlci5qc1wiXHJcblxyXG5jb25zdCBnZXRGb3JtYXR0ZXIgPSAoZm9ybWF0KSA9PiB7XHJcbiAgICBzd2l0Y2ggKGZvcm1hdCl7XHJcbiAgICAgICAgY2FzZSAoc3FsQ29uc3RhbnRzLk1TU1FMKTpcclxuICAgICAgICAgICAgcmV0dXJuIG1zc3FsRm9ybWF0dGVyO1xyXG4gICAgICAgIGNhc2UgKHNxbENvbnN0YW50cy5Qb3N0Z3JlU1FMKTpcclxuICAgICAgICAgICAgcmV0dXJuIHBvc3RncmVGb3JtYXR0ZXI7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXQgcGFzc2VkXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRGb3JtYXR0ZXI7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9