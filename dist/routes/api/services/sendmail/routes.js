"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_body_1 = __importDefault(require("koa-body"));
const ajv_1 = __importDefault(require("ajv"));
const storage_1 = require("./storage");
const mailer_1 = require("./mailer");
const model_1 = require("./model");
function init(router) {
    const ajv = new ajv_1.default({
        removeAdditional: true
    });
    const validatorTemplate = ajv.compile(model_1.dSendEmailSchema);
    mailer_1.sendMailInit();
    router
        .post("/sendmail", koa_body_1.default(), function (ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validatorTemplate(ctx.request.body)) {
                console.log("POST validator", validatorTemplate.errors);
                ctx.status = 422;
                ctx.body = {
                    error: "Validation errors!",
                    data: validatorTemplate.errors
                };
                return;
            }
            const vmModel = model_1.factory(ctx);
            const dbModel = yield storage_1.insert(vmModel);
            //TODO: async send mail (try/catch => on err update doc as not sent)
            yield mailer_1.sendMail(ctx.api.config, vmModel.subject, `
email from "${vmModel.email}"

text:
  ${vmModel.message}
      `);
            ctx.body = {
                message: "Mail sent!",
                data: dbModel
            };
        });
    });
}
exports.default = init;
//# sourceMappingURL=routes.js.map