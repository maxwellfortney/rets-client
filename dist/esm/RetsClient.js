import { createHash } from 'crypto';
import cloneDeep from 'lodash.clonedeep';
import { defaults as defaultRequest, jar as requestJar } from 'request';
import { RetsAction, RetsRequestMethod, RetsServerError, RetsProcessingError, RetsClientError } from './models';
import { combineQueryOptions, combineObjectOptions } from './tools/combine';
import { parseMultipartResponse } from './parsers/parseMultipartResponse';
import { parseObjectResponse } from './parsers/parseObjectResponse';
import { parseRetsResponse } from './parsers/parseRetsResponse';
import { processHeaders } from './tools/processHeaders';
import { replaceAddress } from './tools/replaceAddress';
import { isIncluded } from './tools/isIncluded';
/**
 * Client for communicate with RETS server
 */
export class RetsClient {
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
        this.configuration = cloneDeep(configuration);
        this.createHeader();
        this.session = defaultRequest({
            jar: requestJar(),
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
        this.actions[RetsAction.Login] = this.session.defaults({ uri: this.configuration.url });
    }
    /**
     * Send Login request
     */
    async login() {
        const response = await this.sendAction(this.findRequest(RetsAction.Login)).catch((e) => e);
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
            throw new RetsProcessingError(new ReferenceError('Could not find URL information after login'));
        }
        source.split('\r\n').filter(v => v.indexOf('=') > -1).map(v => v.replace(/\s/g, '').split('=')).forEach(url => {
            const [name, address] = url;
            let action;
            switch (name) {
                case 'GetObject':
                    action = RetsAction.GetObject;
                    break;
                case 'Logout':
                    action = RetsAction.Logout;
                    break;
                case 'Search':
                    action = RetsAction.Search;
                    break;
            }
            if (action != null) {
                this.actions[action] = this.session.defaults({ uri: replaceAddress(address, this.configuration.url) });
            }
        });
    }
    /**
     * Send Logout request
     */
    async logout() {
        const response = await this.sendAction(this.findRequest(RetsAction.Logout)).catch((e) => e);
        if (response instanceof Error) {
            throw response;
        }
        delete this.actions[RetsAction.GetObject];
        delete this.actions[RetsAction.Logout];
        delete this.actions[RetsAction.Search];
    }
    /**
     * Send Search request
     * @param options Search options
     */
    async search(options) {
        const response = await this.sendAction(this.findRequest(RetsAction.Search), combineQueryOptions(options));
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
        const action = this.findRequest(RetsAction.GetObject).defaults({
            headers: Object.assign(Object.assign({}, this.headers), { Accept: options.mime || 'image/jpeg' }),
            encoding: null
        });
        const response = await this.sendAction(action, combineObjectOptions(options));
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
            this.headers['RETS-UA-Authorization'] = 'Digest ' + createHash('md5').update([
                createHash('md5').update(`${this.configuration.userAgent}:${this.configuration.userAgentPassword}`).digest('hex'),
                '',
                this.configuration.sessionId || '',
                this.headers['RETS-Version']
            ].join(':')).digest('hex');
        }
    }
    findRequest(action) {
        if (!this.actions[action]) {
            throw new RetsClientError('No active session detected. Need login first.');
        }
        return this.actions[action];
    }
    async sendAction(action, query) {
        const data = await new Promise((resolve, reject) => action({ [this.configuration.method === RetsRequestMethod.POST ? 'form' : 'qs']: query }, (e, r, b) => {
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
            throw new RetsServerError(data.response.statusCode, data.response.statusMessage);
        }
        else {
            const headers = processHeaders(data.response.rawHeaders);
            let body;
            if (isIncluded(v => v.includes('text/xml'), headers.ContentType)) {
                if (data.body instanceof Buffer) {
                    data.body = data.body.toString();
                    console.log("PARSED BUFFER", data.body);
                }
                body = parseRetsResponse(data.body);
            }
            else if (isIncluded(v => v.includes('multipart'), headers.ContentType)) {
                body = parseMultipartResponse(data.body, headers);
            }
            else {
                body = parseObjectResponse(data.body, headers);
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
//# sourceMappingURL=RetsClient.js.map