"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObjectResponse = void 0;
const detectContentEncoding_1 = require("../tools/detectContentEncoding");
const parseRetsResponse_1 = require("./parseRetsResponse");
const defaultValue_1 = require("../tools/defaultValue");
async function parseObjectResponse(body, headers) {
    const result = { type: defaultValue_1.defaultValue(headers.ContentType) };
    if (headers.Location) { // 地址
        result.address = defaultValue_1.defaultValue(headers.Location);
    }
    if (headers.ObjectID) { // ID
        result.id = defaultValue_1.defaultValue(headers.ObjectID);
    }
    if (headers.ContentDescription) { // 描述
        result.description = defaultValue_1.defaultValue(headers.ContentDescription);
        if (result.description === 'null') {
            delete result.description;
        }
    }
    if (defaultValue_1.defaultValue(headers.ContentType) === 'text/xml') { // 错误
        result.error = await parseRetsResponse_1.parseRetsResponse(body, undefined, true);
        return result;
    }
    if (!body || body === '') {
        return result;
    }
    if (body instanceof Buffer) { // 单一文件
        result.content = body;
        return result;
    }
    // 文本编码
    result.content = body instanceof Buffer ? body : Buffer.from(body, detectContentEncoding_1.detectContentEncoding(headers));
    return result;
}
exports.parseObjectResponse = parseObjectResponse;
//# sourceMappingURL=parseObjectResponse.js.map