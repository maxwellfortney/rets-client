/// <reference types="node" />
import { IRetsObject } from '../models';
export declare function parseMultipartResponse(body: Buffer, headers: {
    [key: string]: string | string[];
}): Promise<IRetsObject[]>;
