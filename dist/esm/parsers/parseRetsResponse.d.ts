import { IRetsBody } from '../models';
export declare function parseRetsResponse(source: string, recordXmlTagName?: string, ignoreRepliedError?: boolean): Promise<IRetsBody>;
