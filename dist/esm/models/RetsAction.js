/**
 * RETS action
 */
export var RetsAction;
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
})(RetsAction || (RetsAction = {}));
//# sourceMappingURL=RetsAction.js.map