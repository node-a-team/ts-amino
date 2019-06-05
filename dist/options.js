"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function newFieldInfo(name, type, index, arrayOf, options) {
    if (options === void 0) { options = {}; }
    if (!options.jsonName) {
        options.jsonName = name;
    }
    options.binFieldNum = index + 1;
    return {
        name: name,
        type: type,
        arrayOf: arrayOf,
        index: index,
        fieldOptions: defaultFieldOptions(options)
    };
}
exports.newFieldInfo = newFieldInfo;
function defaultFieldOptions(options) {
    var defaultOptions = {
        jsonName: "",
        jsonOmitEmpty: false,
        binFixed64: false,
        binFixed32: false,
        binFieldNum: 1,
        unsafe: false,
        writeEmpty: true,
        emptyElements: true
    };
    return __assign({}, defaultOptions, options);
}
exports.defaultFieldOptions = defaultFieldOptions;
//# sourceMappingURL=options.js.map