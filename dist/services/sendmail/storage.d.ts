import { tSendEmailVM } from './model';
export declare const initDb: (apiKey: string) => Promise<void>;
export declare const insert: <T extends tSendEmailVM>(item: tSendEmailVM) => Promise<T>;
