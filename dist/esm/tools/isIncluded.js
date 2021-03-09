export function isIncluded(target, source) {
    if (!source) {
        return false;
    }
    return source instanceof Array ? source.some(target) : target(source);
}
//# sourceMappingURL=isIncluded.js.map