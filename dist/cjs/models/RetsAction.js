"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetsAction = void 0;
/**
 * RETS action
 */
var RetsAction;
(function (RetsAction) {
    /**
     * Action for get object
     */
    RetsAction[RetsAction["GetObject"] = 0] = "GetObject";
    /**
     * Action for search data, such as listings
     */
    RetsAction[RetsAction["Search"] = 1] = "Search";
    /**
     * Action for login
     */
    RetsAction[RetsAction["Login"] = 2] = "Login";
    /**
     * Action for logout
     */
    RetsAction[RetsAction["Logout"] = 3] = "Logout";
})(RetsAction = exports.RetsAction || (exports.RetsAction = {}));
//# sourceMappingURL=RetsAction.js.map