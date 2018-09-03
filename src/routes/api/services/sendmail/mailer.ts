const sendmail = require('sendmail');


let _sendmail: any;

export function sendMailInit() {
  _sendmail = sendmail({
    logger: {
      debug: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    },
    silent: false,
    /*dkim: { // Default: False
      privateKey: fs.readFileSync('./dkim-private.pem', 'utf8'),
      keySelector: 'mydomainkey'
    },*/
    //devPort: 1025, // Default: False
    //devHost: 'localhost', // Default: localhost
    smtpPort: 2525, // Default: 25
    smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
  });
}

export async function sendMail(apiConfig: any, subject: string, html: string) {
  return new Promise((res, rej) => {
    _sendmail({
      from: apiConfig.from,
      to: apiConfig.to.join(),
      subject,
      html
    }, function(err: any, reply: any) {
      if (err) {
        rej(err);
      } else {
        res(reply);
      }

      console.log(err && err.stack);
      console.dir(reply);
    });
  });
}