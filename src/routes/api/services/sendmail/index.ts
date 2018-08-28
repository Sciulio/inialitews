import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import Ajv from "ajv";

import { tApiExport } from '../../base';
import { initDb, insert } from './storage';

import { dSendEmailSchema, tSendEmailDb, factory } from './model';
import { MultiTenantApiContext } from '../../../../libs/multitenant';


const apiKey = "sendmail";
const router = new Router();

let ajv: Ajv.Ajv;
let validatorTemplate: Ajv.ValidateFunction;

export default {
  router,
  route: "/" + apiKey,
  init: async () => {
    await initDb(apiKey);

    ajv = new Ajv({
      removeAdditional: true
    });
    validatorTemplate = ajv.compile(dSendEmailSchema);
  },
  dispose: async () => {}
} as tApiExport;

router
.post("/sendmail", koaBody(), async function (ctx: Koa.Context, next: () => Promise<any>) {
  if (!validatorTemplate(ctx.request.body)) {
    console.log("POST validator", validatorTemplate.errors);
    //ctx.throw(400, JSON.stringify(ajv.errors));
    
    ctx.status = 400;
    ctx.type = ".json"; //TODO add json mime
    ctx.body = {
      error: "Validation errors!",
      data: JSON.stringify(ajv.errors)
    };
    
    return;
  }

  const vmModel = factory(ctx as MultiTenantApiContext);
  const dbModel = await insert<tSendEmailDb>(vmModel);
  //TODO: async send mail (try/catch => on err update doc as not sent)

  ctx.status = 200;
  ctx.type = ".json"; //TODO add json mime
  ctx.body = {
    message: "Mail sent!",
    data: dbModel
  };
});