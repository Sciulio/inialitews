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
/*export function bindData(rawData: any, schema: { properties: {[key: string]: any} }) {
  //let valid = ajv.validate(person, this.request.body);
  const resData: {[key: string]: any} = {};

  for (var key in schema.properties) {
    resData[key] = rawData[key];
    
    delete rawData[key];
  }

  return resData;
}*/ 
//# sourceMappingURL=model.js.map