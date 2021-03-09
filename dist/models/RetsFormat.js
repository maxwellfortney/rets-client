"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetsFormat = void 0;
/**
 * RETS response format
 */
var RetsFormat;
(function (RetsFormat) {
    /**
     * Compact data (usually TSV)
     */
    RetsFormat["Compact"] = "COMPACT";
    /**
     * Compact decoded data (usually TSV)
     */
    RetsFormat["CompactDecoded"] = "COMPACT-DECODED";
    /**
     * Standard XML data (server may not support)
     */
    RetsFormat["StandardXml"] = "STANDARD-XML";
})(RetsFormat = exports.RetsFormat || (exports.RetsFormat = {}));
//# sourceMappingURL=RetsFormat.js.map