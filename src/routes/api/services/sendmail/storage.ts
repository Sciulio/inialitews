import path from 'path';

import { logger } from '../../../../libs/logger';

import Datastore from 'nedb';
//const Datastore = require('nedb-multi')(8085);

import { loadConfiguration } from '../../../../libs/config';
import { tSendEmailVM } from './model';


const config = loadConfiguration();
//let db: Datastore;
let db: any;

export async function initDb(apiKey: string) {
  db = new Datastore({
    filename: path.join(process.cwd(), config.services.db.path, apiKey + ".nedb")
  });
  
  await new Promise((res, rej) => {
    db.loadDatabase((err: Error) => {
      if (err) {
        rej(err);
      } else {
        logger.info(` - initted db for api: ${apiKey}`);

        res();
      }
    });
  });
}

export async function insert<T extends tSendEmailVM>(item: tSendEmailVM) {
  return new Promise<T>((res, rej) => {
    db.insert(item, (err: Error, doc: {}) => {
      if (err) {
        rej(err);
      }
      res(doc as T);
    })
  });
}