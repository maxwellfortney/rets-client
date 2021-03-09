"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMultipartResponse = void 0;
const lodash_flatten_1 = __importDefault(require("lodash.flatten"));
const lodash_trim_1 = __importDefault(require("lodash.trim"));
const models_1 = require("../models");
const detectContentEncoding_1 = require("../tools/detectContentEncoding");
const parseObjectResponse_1 = require("./parseObjectResponse");
const processHeaders_1 = require("../tools/processHeaders");
const defaultValue_1 = require("../tools/defaultValue");
const LINE_SPLITTER = Buffer.from('\r\n');
const PART_SPLITTER = Buffer.from('\r\n\r\n');
async function parseMultipartResponse(body, headers) {
    const encoding = detectContentEncoding_1.detectContentEncoding(headers);
    const boundary = Buffer.from(findBoundary(headers), encoding);
    const result = [];
    for (let i = -1, length = body.length; i < length;) {
        let boundaryIndex = findBufferIndex(body, boundary, i);
        if (boundaryIndex < 0) {
            return result;
        }
        boundaryIndex += boundary.length + LINE_SPLITTER.length; // 跳过Boundary和换行符 (\r\n)
        const headerEndIndex = findBufferIndex(body, PART_SPLITTER, boundaryIndex); // 找到Header和二进制数据的分界点
        if (headerEndIndex < 0) {
            return result;
        }
        const headerText = body.slice(boundaryIndex, headerEndIndex).toString(encoding);
        let nextBoundayIndex = findBufferIndex(body, boundary, headerEndIndex + PART_SPLITTER.length);
        if (nextBoundayIndex < 0) {
            return result;
        } // 如果没有下一个数据的开始边界，则到达结尾
        if (nextBoundayIndex === headerEndIndex + PART_SPLITTER.length) { // CREA DDF的错误XML是Header的一部分
            const headerItems = headerText.split('\r\n');
            result.push(await parseObjectResponse_1.parseObjectResponse(headerItems[headerItems.length - 1], Object.assign(Object.assign({}, headers), processHeaders_1.processHeaders(lodash_flatten_1.default(headerItems.slice(0, headerItems.length - 1).map(v => [v.substring(0, v.indexOf(':')), v.substring((v.indexOf(':') + 1)).trim()]))))));
            i = nextBoundayIndex;
        }
        else { // 正常返回，或其他情况
            nextBoundayIndex -= LINE_SPLITTER.length;
            const content = body.slice(headerEndIndex + PART_SPLITTER.length, nextBoundayIndex);
            result.push(await parseObjectResponse_1.parseObjectResponse(content, Object.assign(Object.assign({}, headers), processHeaders_1.processHeaders(lodash_flatten_1.default(headerText.split('\r\n').map(v => [v.substring(0, v.indexOf(':')), v.substring((v.indexOf(':') + 1)).trim()]))))));
            i = nextBoundayIndex + LINE_SPLITTER.length;
        }
    }
    return result;
}
exports.parseMultipartResponse = parseMultipartResponse;
function findBufferIndex(source, target, startAt = 0) {
    for (let i = startAt - 1, length = source.length; ++i < length;) {
        let fit = true;
        for (let j = -1; ++j < target.length;) {
            if (source[i + j] !== target[j]) {
                fit = false;
                break;
            }
        }
        if (fit) {
            return i;
        }
    }
    return -1;
}
function findBoundary(headers) {
    const boundary = defaultValue_1.defaultValue(headers.ContentType).match(/boundary=([^;]+)/);
    if (!boundary) {
        throw new models_1.RetsProcessingError(new TypeError('Could not find boundary under Content-Type'));
    }
    return `--${lodash_trim_1.default(boundary[1], '"')}`;
}
//# sourceMappingURL=parseMultipartResponse.js.map