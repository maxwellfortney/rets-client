import { defaultValue } from './defaultValue';
export function detectContentEncoding(headers) {
    const format = defaultValue(headers.TransferEncoding) || '7bit';
    let encoding = 'ascii';
    if (format === '8bit') {
        encoding = 'utf8';
    }
    else if (format === 'binary') {
        encoding = 'latin1';
    }
    else if (format === 'base64') {
        encoding = 'base64';
    }
    return encoding;
}
//# sourceMappingURL=detectContentEncoding.js.map