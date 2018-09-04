import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import Ajv from "ajv";

import { insert } from './storage';
import { sendMailInit, sendMail } from './mailer';

import { dSendEmailSchema, tSendEmailDb, factory } from './model';
import { MultiTenantApiContext } from '../../../../libs/multitenant';
import { logger } from '../../../../libs/logger';


export default function init(router: Router) {
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
}