import { parse, format } from 'url';
export function replaceAddress(target, base) {
    const baseUri = parse(base, true, true);
    const targetUri = parse(target, true, true);
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
    return format(result);
}
//# sourceMappingURL=replaceAddress.js.map