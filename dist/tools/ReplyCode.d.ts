/**
 * Tags & Constant representation for reply codes
 *
 * Authoritative documentation for all reply codes in current rets standard:
 * http://www.reso.org/assets/RETS/Specifications/rets_1_8.pdf
 */
export declare const ReplyCode: {
    [key: string]: number | number[];
};
/**
 * Find name using reply code
 * @param code Reply code
 */
export declare function findReplyCodeName(code: number | string): string | undefined;
