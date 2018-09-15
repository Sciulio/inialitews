import { MultiTenantApiContext } from "../../libs/multitenant";


export type tEmail = string;

export type tSendEmailVM = {
  _requestId: string;
  _on: number;

  email: tEmail;
  name: string;
  subject: string;
  message: string;
};
export type tSendEmailDb = tSendEmailVM & {
  _id: string;
};

export const dSendEmailSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    name: { type: "string", minLength: 4, maxLength: 64 },
    subject: { type: "string", minLength: 4, maxLength: 64 },
    message: { type: "string", minLength: 2, maxLength: 1024 },
  },
  required: ["email", "name", "subject", "message"],
  additionalProperties: false
};

export function factory(ctx: MultiTenantApiContext) {
  const vmModel = ctx.request.body as tSendEmailVM;
  
  vmModel._requestId = ctx.api.requestId;
  vmModel._on = new Date().getTime();

  return vmModel;
}