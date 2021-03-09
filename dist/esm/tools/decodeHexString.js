export function decodeHexString(hex) {
    const result = [];
    for (let i = -1; ++i < hex.length;) {
        result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
        ++i;
    }
    return result.join('');
}
//# sourceMappingURL=decodeHexString.js.map