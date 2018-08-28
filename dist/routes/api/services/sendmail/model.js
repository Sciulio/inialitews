"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dSendEmailSchema = {
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
function factory(ctx) {
    const vmModel = ctx.request.body;
    vmModel._requestId = ctx.api.requestId;
    vmModel._on = new Date().getTime();
    console.log("vmModel", vmModel);
    return vmModel;
}
exports.factory = factory;
//# sourceMappingURL=model.js.map