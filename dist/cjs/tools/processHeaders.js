"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processHeaders = exports.normalizeKey = void 0;
const lodash_trim_1 = __importDefault(require("lodash.trim"));
function normalizeKey(input) {
    // some servers return lowercase headers
    return input.split(/[\s-]+/g).map(part => {
        if (/^[a-z]/.test(part) === true) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }
        return part;
    }).join('');
}
exports.normalizeKey = normalizeKey;
function processHeaders(headers) {
    if (!headers || !(headers instanceof Array) || headers.length === 0) {
        return {};
    }
    const result = {};
    let i = 0;
    while (i < headers.length) {
        const [key, value] = [headers[i], headers[i + 1]];
        if (!key || key === '') {
        }
        else if (key.toLowerCase() === 'content-disposition') { // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
            value.split(/\s*;\s*/).forEach((disposition, index) => {
                if (index === 0) {
                    mergeValue(result, 'DispositionType', disposition);
                }
                else {
                    const name = disposition.indexOf('=');
                    if (name > -1) {
                        mergeValue(result, normalizeKey(disposition.substring(0, name)), lodash_trim_1.default(disposition.substring(name + 1), '"'));
                    }
                }
            });
        }
        else if (key.toLowerCase() === 'content-transfer-encoding') {
            mergeValue(result, 'TransferEncoding', value.toLowerCase());
        }
        else {
            mergeValue(result, normalizeKey(key), value);
        }
        i += 2;
    }
    if (result.ObjectData != null) {
        const dataArray = result.objectData instanceof Array ? result.objectData : [result.objectData];
        result.objectData = dataArray.reduce((previous, data) => {
            const index = data.indexOf('=');
            mergeValue(previous, normalizeKey(data.substring(0, index)), data.substring(index + 1));
            return previous;
        }, {});
    }
    return result;
}
exports.processHeaders = processHeaders;
function mergeValue(source, key, value) {
    if (source[key] == null) {
        source[key] = value;
    }
    else if (!(source[key] instanceof Array)) {
        source[key] = [source[key], value];
    }
    else {
        source[key].push(value);
    }
    return source;
}
//# sourceMappingURL=processHeaders.js.map