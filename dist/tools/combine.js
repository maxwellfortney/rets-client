"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineObjectOptions = exports.combineQueryOptions = void 0;
const models_1 = require("../models");
function combineQueryOptions(source) {
    const result = {};
    result.QueryType = source.queryType || models_1.RetsQueryType.DMQL2;
    // result.RestrictedIndicator = source.restrictedIndicator || '***';
    result.StandardNames = source.standardNames || models_1.RetsQueryStandardNamesType.UseSystemName;
    result.Format = source.format || models_1.RetsFormat.CompactDecoded;
    result.Offset = source.offset || 0;
    result.Count = source.count || models_1.RetsQueryCountType.OnlyRecord;
    result.Limit = source.limit || 'NONE';
    result.Query = source.query;
    result.SearchType = source.searchType;
    result.Class = source.class;
    result.Culture = source.culture;
    result.Select = source.select ? (source.select instanceof Array ? source.select.join(',') : source.select) : undefined;
    return result;
}
exports.combineQueryOptions = combineQueryOptions;
function combineObjectOptions(source) {
    const result = {};
    result.Resource = source.resource;
    result.Type = source.type;
    result.ID = `${source.contentId}:${source.objectId || '*'}`;
    result.Location = source.withLocation ? 1 : 0;
    result.Culture = source.culture;
    return result;
}
exports.combineObjectOptions = combineObjectOptions;
//# sourceMappingURL=combine.js.map