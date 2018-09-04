import 'async-extensions';
export declare type baseDoc = {
    _id?: string;
};
export declare type docBuildAudit = baseDoc & {
    _type: "buildinfo";
    on: number;
    duration: number;
};
export declare type docFileAudit = baseDoc & {
    _type: "fileinfo";
    _on: number;
    path: string;
    url: string;
    audit: {
        action: "created" | "edited" | "deleted";
        version: number;
    };
    stats: {
        hash: string;
        size: number;
    };
    content: {
        type: string;
        charset: string;
        visibility: "public" | "private";
        lastModified: string;
    };
    has: {
        [keyProp: string]: boolean;
    };
};
export declare type tBuildAudit = docBuildAudit & {};
export declare type tFileAudit = docFileAudit & {
    buildInfo: tBuildAudit;
};
declare const _default: import("../../../../Sviluppo/IniaLiteWs/src/libs/exporters").tConfigExporter;
export default _default;
export declare function fetchFileAudit(tenantName: string, url: string): Promise<docFileAudit>;
