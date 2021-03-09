"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectContentEncoding = void 0;
const defaultValue_1 = require("./defaultValue");
function detectContentEncoding(headers) {
    const format = defaultValue_1.defaultValue(headers.TransferEncoding) || '7bit';
    let encoding = 'ascii';
    if (format === '8bit') {
        encoding = 'utf8';
    }
    else if (format === 'binary') {
        encoding = 'latin1';
    }
    else if (format === 'base64') {
        encoding = 'base64';
    }
    return encoding;
}
exports.detectContentEncoding = detectContentEncoding;
//# sourceMappingURL=detectContentEncoding.js.map