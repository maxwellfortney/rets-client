"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRetsResponse = void 0;
const Xml2Js = __importStar(require("xml2js"));
const models_1 = require("../models");
const ReplyCode_1 = require("../tools/ReplyCode");
const decodeHexString_1 = require("../tools/decodeHexString");
const XML_ATTRIBUTES = '_XmlAttributes';
const XML_CONTENT = '_XmlContent';
const parser = new Xml2Js.Parser(Object.assign(Object.assign({}, Xml2Js.defaults['0.2']), { explicitArray: false, attrkey: XML_ATTRIBUTES, charkey: XML_CONTENT }));
async function parseString(content) {
    return new Promise((resolve, reject) => {
        parser.parseString(content, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
function readNodeContent(source) {
    if (typeof source === 'string') {
        return source;
    }
    return source[XML_CONTENT];
}
async function parseRetsResponse(source, recordXmlTagName, ignoreRepliedError = false) {
    const document = await parseString(source).catch((e) => e);
    if (document instanceof Error) {
        throw new models_1.RetsProcessingError(document);
    }
    if (!document.RETS) {
        throw new models_1.RetsProcessingError(new TypeError('Unable to find RETS root element'));
    }
    const root = document.RETS;
    const result = {
        replyCode: +root[XML_ATTRIBUTES].ReplyCode,
        replyText: root[XML_ATTRIBUTES].ReplyText,
        statusMessage: ReplyCode_1.findReplyCodeName(root[XML_ATTRIBUTES].ReplyCode) || 'Unknown reply code',
        extra: {}
    };
    if (root['RETS-STATUS']) { // 额外状态
        const extraStatus = root['RETS-STATUS'][XML_ATTRIBUTES] || {};
        result.replyCode = +(extraStatus.replyCode || result.replyCode);
        result.replyText = extraStatus.ReplyText || result.replyText;
        result.statusMessage = ReplyCode_1.findReplyCodeName(result.replyCode) || 'Unknown reply code';
    }
    if (root['COLUMNS']) { // COMPACT数据
        let dataDelimiter = '\t';
        if (root['DELIMITER']) {
            dataDelimiter = decodeHexString_1.decodeHexString(root['DELIMITER'][XML_ATTRIBUTES].value);
        }
        const columns = root['COLUMNS'].split(dataDelimiter);
        const element = root['DATA'];
        const rawData = (element ? (element instanceof Array ? element : [element]) : []).map(v => v.split(dataDelimiter));
        result.records = rawData.map(raw => raw.reduce((p, v, i) => {
            if (columns[i] === '') {
                return p;
            } // 写在这里以保证读取顺序
            p[columns[i]] = v;
            return p;
        }, {}));
    }
    Object.keys(root).filter(v => v !== XML_ATTRIBUTES && v !== 'RETS-STATUS' && v !== 'COLUMNS' && v !== 'DELIMITER' && v !== 'DATA').forEach(key => {
        if (key === 'MAXROWS') {
            result.extra.maxRowsExceeded = true;
        }
        else if (key === 'COUNT') {
            result.extra.count = root[key][XML_ATTRIBUTES].Records;
        }
        else if (recordXmlTagName && key === recordXmlTagName) {
            result.records = (result.records || []).concat(root[key]);
        }
        else if (key === 'RETS-RESPONSE') { // RETS回执
            if (root[key][XML_ATTRIBUTES] && (root[key][XML_ATTRIBUTES].xmlns || '').includes('CREA')) { // CREA DDF
                const responseContent = root[key];
                if (responseContent['Pagination']) {
                    const pagination = responseContent['Pagination'];
                    result.extra.pagination = {
                        total: +pagination.TotalRecords,
                        limit: +pagination.Limit,
                        offset: +pagination.Offset,
                        pages: +pagination.TotalPages,
                        returned: +pagination.RecordsReturned
                    };
                }
                Object.keys(responseContent).filter(v => v !== 'Pagination' && v !== XML_ATTRIBUTES && v !== XML_CONTENT).forEach(data => result.records = (result.records || []).concat(responseContent[data]));
            }
            else { // 其他情况
                result.extra.content = readNodeContent(root[key]);
            }
        }
        else {
            result.extra[key] = root[key] instanceof Array ? (root[key].length === 0 ? root[key][0] : root[key]) : root[key];
        }
    });
    if (!ignoreRepliedError && result.replyCode !== 0 && result.replyCode !== 20208) {
        throw new models_1.RetsReplyError(result);
    }
    return result;
}
exports.parseRetsResponse = parseRetsResponse;
//# sourceMappingURL=parseRetsResponse.js.map