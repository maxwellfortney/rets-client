"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAddress = void 0;
const url_1 = require("url");
function replaceAddress(target, base) {
    const baseUri = url_1.parse(base, true, true);
    const targetUri = url_1.parse(target, true, true);
    if (targetUri.host !== null) {
        return target;
    }
    const result = {
        protocol: baseUri.protocol,
        slashes: true,
        host: baseUri.host,
        pathname: targetUri.pathname,
        query: targetUri.query
    };
    return url_1.format(result);
}
exports.replaceAddress = replaceAddress;
//# sourceMappingURL=replaceAddress.js.map