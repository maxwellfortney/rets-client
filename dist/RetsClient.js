"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetsClient = void 0;
const crypto_1 = require("crypto");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const request_1 = require("request");
const models_1 = require("./models");
const combine_1 = require("./tools/combine");
const parseMultipartResponse_1 = require("./parsers/parseMultipartResponse");
const parseObjectResponse_1 = require("./parsers/parseObjectResponse");
const parseRetsResponse_1 = require("./parsers/parseRetsResponse");
const processHeaders_1 = require("./tools/processHeaders");
const replaceAddress_1 = require("./tools/replaceAddress");
const isIncluded_1 = require("./tools/isIncluded");
/**
 * Client for communicate with RETS server
 */
class RetsClient {
    /**
     * Create a new RETS client
     * @param configuration Client configuration
     */
    constructor(configuration) {
        /**
         * Available rets actions
         */
        this.actions = {};
        this.headers = {};
        this.configuration = lodash_clonedeep_1.default(configuration);
        this.createHeader();
        this.session = request_1.defaults({
            jar: request_1.jar(),
            headers: this.headers,
            method: this.configuration.method || 'GET',
            auth: {
                user: this.configuration.username,
                pass: this.configuration.password,
                sendImmediately: false
            },
            timeout: this.configuration.timeout,
            proxy: this.configuration.proxyUrl,
            tunnel: this.configuration.useTunnel
        });
        this.actions[models_1.RetsAction.Login] = this.session.defaults({ uri: this.configuration.url });
    }
    /**
     * Send Login request
     */
    async login() {
        const response = await this.sendAction(this.findRequest(models_1.RetsAction.Login)).catch((e) => e);
        if (response instanceof Error) {
            throw response;
        }
        if (response.headers.SetCookie) {
            const cookies = [].concat(response.headers.SetCookie);
            for (let i = -1; ++i < cookies.length;) {
                const matches = cookies[i].match(/(?:(?:RETS-Session-ID)|(?:X-SESSIONID))=([^;]+);/);
                if (matches) {
                    this.configuration.sessionId = matches[1];
                    break;
                }
            }
        }
        if (response.headers.RETSVersion) {
            this.configuration.version =
                (response.headers.RETSVersion instanceof Array ? response.headers.RETSVersion[0] : response.headers.RETSVersion);
        }
        this.createHeader(); // 更新Header
        const source = response.body.content.toString();
        if (!source) {
            throw new models_1.RetsProcessingError(new ReferenceError('Could not find URL information after login'));
        }
        source.split('\r\n').filter(v => v.indexOf('=') > -1).map(v => v.replace(/\s/g, '').split('=')).forEach(url => {
            const [name, address] = url;
            let action;
            switch (name) {
                case 'GetObject':
                    action = models_1.RetsAction.GetObject;
                    break;
                case 'Logout':
                    action = models_1.RetsAction.Logout;
                    break;
                case 'Search':
                    action = models_1.RetsAction.Search;
                    break;
            }
            if (action != null) {
                this.actions[action] = this.session.defaults({ uri: replaceAddress_1.replaceAddress(address, this.configuration.url) });
            }
        });
    }
    /**
     * Send Logout request
     */
    async logout() {
        const response = await this.sendAction(this.findRequest(models_1.RetsAction.Logout)).catch((e) => e);
        if (response instanceof Error) {
            throw response;
        }
        delete this.actions[models_1.RetsAction.GetObject];
        delete this.actions[models_1.RetsAction.Logout];
        delete this.actions[models_1.RetsAction.Search];
    }
    /**
     * Send Search request
     * @param options Search options
     */
    async search(options) {
        const response = await this.sendAction(this.findRequest(models_1.RetsAction.Search), combine_1.combineQueryOptions(options));
        if (response instanceof Error) {
            throw response;
        }
        return response.body;
    }
    /**
     * Send GetObject request
     * @param options GetObject options
     */
    async getObjects(options) {
        const action = this.findRequest(models_1.RetsAction.GetObject).defaults({
            headers: Object.assign(Object.assign({}, this.headers), { Accept: options.mime || 'image/jpeg' }),
            encoding: null
        });
        const response = await this.sendAction(action, combine_1.combineObjectOptions(options));
        if (response instanceof Error) {
            throw response;
        }
        return (response.body instanceof Array ? response.body : [response.body]);
    }
    createHeader() {
        this.headers = this.headers || {};
        this.headers['User-Agent'] = this.configuration.userAgent || 'RETS NodeJS-Client/1.x';
        this.headers['RETS-Version'] = this.configuration.version;
        if (this.configuration.userAgentPassword) {
            this.headers['RETS-UA-Authorization'] = 'Digest ' + crypto_1.createHash('md5').update([
                crypto_1.createHash('md5').update(`${this.configuration.userAgent}:${this.configuration.userAgentPassword}`).digest('hex'),
                '',
                this.configuration.sessionId || '',
                this.headers['RETS-Version']
            ].join(':')).digest('hex');
        }
    }
    findRequest(action) {
        if (!this.actions[action]) {
            throw new models_1.RetsClientError('No active session detected. Need login first.');
        }
        return this.actions[action];
    }
    async sendAction(action, query) {
        const data = await new Promise((resolve, reject) => action({ [this.configuration.method === models_1.RetsRequestMethod.POST ? 'form' : 'qs']: query }, (e, r, b) => {
            if (e) {
                reject(e);
            }
            else {
                resolve({ response: r, body: b });
            }
        })).catch((e) => e);
        if (data instanceof Error) {
            throw data;
        }
        if (data.response.statusCode !== 200) {
            throw new models_1.RetsServerError(data.response.statusCode, data.response.statusMessage);
        }
        else {
            const headers = processHeaders_1.processHeaders(data.response.rawHeaders);
            let body;
            if (isIncluded_1.isIncluded(v => v.includes('text/xml'), headers.ContentType)) {
                if (data.body instanceof Buffer) {
                    data.body = data.body.toString();
                    console.log("PARSED BUFFER", data.body);
                }
                body = parseRetsResponse_1.parseRetsResponse(data.body);
            }
            else if (isIncluded_1.isIncluded(v => v.includes('multipart'), headers.ContentType)) {
                body = parseMultipartResponse_1.parseMultipartResponse(data.body, headers);
            }
            else {
                body = parseObjectResponse_1.parseObjectResponse(data.body, headers);
            }
            const response = {
                headers: headers,
                body: await body.catch((e) => e),
                response: data.response
            };
            if (response.body instanceof Error) {
                throw response.body;
            }
            return response;
        }
    }
}
exports.RetsClient = RetsClient;
//# sourceMappingURL=RetsClient.js.map