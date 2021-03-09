import { IRetsObject } from '../models';
export declare function parseObjectResponse(body: any, headers: {
    [key: string]: string | string[];
}): Promise<IRetsObject>;
