"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeHexString = void 0;
function decodeHexString(hex) {
    const result = [];
    for (let i = -1; ++i < hex.length;) {
        result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
        ++i;
    }
    return result.join('');
}
exports.decodeHexString = decodeHexString;
//# sourceMappingURL=decodeHexString.js.map