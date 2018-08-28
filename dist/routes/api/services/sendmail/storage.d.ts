import { tSendEmailVM } from './model';
export declare function initDb(apiKey: string): Promise<void>;
export declare function insert<T extends tSendEmailVM>(item: tSendEmailVM): Promise<T>;
