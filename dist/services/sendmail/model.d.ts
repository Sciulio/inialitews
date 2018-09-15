import { MultiTenantApiContext } from "../../libs/multitenant";
export declare type tEmail = string;
export declare type tSendEmailVM = {
    _requestId: string;
    _on: number;
    email: tEmail;
    name: string;
    subject: string;
    message: string;
};
export declare type tSendEmailDb = tSendEmailVM & {
    _id: string;
};
export declare const dSendEmailSchema: {
    type: string;
    properties: {
        email: {
            type: string;
            format: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
        };
        subject: {
            type: string;
            minLength: number;
            maxLength: number;
        };
        message: {
            type: string;
            minLength: number;
            maxLength: number;
        };
    };
    required: string[];
    additionalProperties: boolean;
};
export declare function factory(ctx: MultiTenantApiContext): tSendEmailVM;
