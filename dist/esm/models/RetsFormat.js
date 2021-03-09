/**
 * RETS response format
 */
export var RetsFormat;
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
})(RetsFormat || (RetsFormat = {}));
//# sourceMappingURL=RetsFormat.js.map