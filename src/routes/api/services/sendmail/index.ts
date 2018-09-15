import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import Ajv from "ajv";

import { tApiExport } from '../../libs/exporters';
import { logger } from '../../../../libs/logger';

import { MultiTenantApiContext } from '../../../../libs/multitenant';

import { dSendEmailSchema, tSendEmailDb, factory } from '../../../../services/sendmail/model';
import { sendMailInit, sendMail } from '../../../../services/sendmail/mailer';
import { insert } from '../../../../services/sendmail/storage';


const name = "sendmail";
const router = new Router();

export default {
  name,
  router,
  route: "/" + name,
  init: async () => {
    const ajv = new Ajv({
      removeAdditional: true
    });
    const validatorTemplate = ajv.compile(dSendEmailSchema);
  
    sendMailInit();
  
    router
    .post("/sendmail", koaBody(), async function (ctx: Koa.Context, next: () => Promise<any>) {
      if (!validatorTemplate(ctx.request.body)) {
        logger.debug("POST validator", validatorTemplate.errors);
  
        ctx.status = 422;
        ctx.body = {
          error: "Validation errors!",
          data: validatorTemplate.errors
        };
  
        return;
      }
  
      const vmModel = factory(ctx as MultiTenantApiContext);
      const dbModel = await insert<tSendEmailDb>(vmModel);
      //TODO: async send mail (try/catch => on err update doc as not sent)
      await sendMail(
        (ctx as MultiTenantApiContext).api.config,
        vmModel.subject,
        `
  email from "${vmModel.email}"
  
  text:
    ${vmModel.message}
        `
      );
  
      ctx.body = {
        message: "Mail sent!",
        data: dbModel
      };
    });
  },
  dispose: async () => {}
} as tApiExport;