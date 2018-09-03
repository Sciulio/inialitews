"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendmail = require('sendmail');
let _sendmail;
function sendMailInit() {
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
        smtpPort: 2525,
        smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
    });
}
exports.sendMailInit = sendMailInit;
function sendMail(apiConfig, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            _sendmail({
                from: apiConfig.from,
                to: apiConfig.to.join(),
                subject,
                html
            }, function (err, reply) {
                if (err) {
                    rej(err);
                }
                else {
                    res(reply);
                }
                console.log(err && err.stack);
                console.dir(reply);
            });
        });
    });
}
exports.sendMail = sendMail;
//# sourceMappingURL=mailer.js.map