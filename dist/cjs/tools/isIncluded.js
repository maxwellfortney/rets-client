"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIncluded = void 0;
function isIncluded(target, source) {
    if (!source) {
        return false;
    }
    return source instanceof Array ? source.some(target) : target(source);
}
exports.isIncluded = isIncluded;
//# sourceMappingURL=isIncluded.js.map