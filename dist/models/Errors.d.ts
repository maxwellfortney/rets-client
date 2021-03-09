import { IRetsBody } from './IRetsBody';
/**
 * Basic RETS error
 */
export declare class RetsError extends Error {
    readonly errorCode: number;
    /**
     * Create a RETS error
     * @param name Error name
     * @param code Error code (Rets reply code or other reasonable code)
     * @param message Error message
     */
    constructor(name: string, code: number, message?: string);
    toString(): string;
}
/**
 * Error that returned from RETS server
 */
export declare class RetsReplyError extends RetsError {
    /**
     * Create a RETS reply error
     * @param response RETS response body
     */
    constructor(response: IRetsBody);
}
/**
 * Error when communicating with RETS server
 */
export declare class RetsServerError extends RetsError {
    /**
     * Create a RETS server error
     * @param status Status code
     * @param message Status message
     */
    constructor(status: number, message: string);
}
/**
 * Error when processing RETS server's response
 */
export declare class RetsProcessingError extends RetsError {
    /**
     * Create a RETS processing error
     * @param error Error content
     */
    constructor(error: Error);
}
/**
 * Error caused by RETS request parameter
 */
export declare class RetsParamError extends RetsError {
    /**
     * Create a RETS param error
     * @param message Error message
     */
    constructor(message: string);
}
/**
 * Any other error caused by RETS client
 */
export declare class RetsClientError extends RetsError {
    /**
     * Create a RETS client error
     * @param message Error message
     */
    constructor(message: string);
}
