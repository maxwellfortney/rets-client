"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetsClientError = exports.RetsParamError = exports.RetsProcessingError = exports.RetsServerError = exports.RetsReplyError = exports.RetsError = void 0;
const ReplyCode_1 = require("../tools/ReplyCode");
/**
 * Basic RETS error
 */
class RetsError extends Error {
    /**
     * Create a RETS error
     * @param name Error name
     * @param code Error code (Rets reply code or other reasonable code)
     * @param message Error message
     */
    constructor(name, code, message) {
        super();
        this.name = name;
        this.errorCode = code;
        this.message = message || ReplyCode_1.findReplyCodeName(code) || 'Unknown Reply Code';
    }
    toString() {
        return `${this.name} (${this.errorCode}): ${this.message}`;
    }
}
exports.RetsError = RetsError;
/**
 * Error that returned from RETS server
 */
class RetsReplyError extends RetsError {
    /**
     * Create a RETS reply error
     * @param response RETS response body
     */
    constructor(response) {
        super('RetsReplyError', response.replyCode, response.replyText);
    }
}
exports.RetsReplyError = RetsReplyError;
/**
 * Error when communicating with RETS server
 */
class RetsServerError extends RetsError {
    /**
     * Create a RETS server error
     * @param status Status code
     * @param message Status message
     */
    constructor(status, message) {
        super('RetsServerError', status, message);
    }
}
exports.RetsServerError = RetsServerError;
/**
 * Error when processing RETS server's response
 */
class RetsProcessingError extends RetsError {
    /**
     * Create a RETS processing error
     * @param error Error content
     */
    constructor(error) {
        super('RetsProcessingError', -1, error.toString());
    }
}
exports.RetsProcessingError = RetsProcessingError;
/**
 * Error caused by RETS request parameter
 */
class RetsParamError extends RetsError {
    /**
     * Create a RETS param error
     * @param message Error message
     */
    constructor(message) {
        super('RetsParamError', -1, message);
    }
}
exports.RetsParamError = RetsParamError;
/**
 * Any other error caused by RETS client
 */
class RetsClientError extends RetsError {
    /**
     * Create a RETS client error
     * @param message Error message
     */
    constructor(message) {
        super('RetsClientError', -1, message);
    }
}
exports.RetsClientError = RetsClientError;
//# sourceMappingURL=Errors.js.map