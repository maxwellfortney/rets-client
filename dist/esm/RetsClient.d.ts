import { DefaultUriUrlRequestApi, Request, CoreOptions, OptionalUriUrl } from 'request';
import { IRetsBody, IClientConnection, IRetsQueryOptions, IRetsObject, IRetsObjectOptions } from './models';
/**
 * Client for communicate with RETS server
 */
export declare class RetsClient {
    /**
     * Client configuration
     */
    readonly configuration: IClientConnection;
    /**
     * Available rets actions
     */
    readonly actions: {
        [key: string]: DefaultUriUrlRequestApi<Request, CoreOptions, OptionalUriUrl>;
    };
    private session;
    private headers;
    /**
     * Create a new RETS client
     * @param configuration Client configuration
     */
    constructor(configuration: IClientConnection);
    /**
     * Send Login request
     */
    login(): Promise<void>;
    /**
     * Send Logout request
     */
    logout(): Promise<void>;
    /**
     * Send Search request
     * @param options Search options
     */
    search(options: IRetsQueryOptions): Promise<IRetsBody>;
    /**
     * Send GetObject request
     * @param options GetObject options
     */
    getObjects(options: IRetsObjectOptions): Promise<IRetsObject | IRetsObject[]>;
    private createHeader;
    private findRequest;
    private sendAction;
}
