import path from 'path';
import Datastore from 'nedb';
import { loadConfiguration } from '../../../libs/config';
import { tSendEmailVM } from './model';


const config = loadConfiguration();
let db: Datastore;

export async function initDb(apiKey: string) {
  db = new Datastore({
    filename: path.join(process.cwd(), config.services.db.path, apiKey)
  });
    
  await new Promise((res, rej) => {
    db.loadDatabase((err) => {
      if (err) {
        rej(err);
      } else {
        console.log(" - initted db for api:", apiKey);
        res();
      }
    });
  });
}

export async function insert(data: tSendEmailVM) {
  return new Promise((res, rej) => {
    db.insert(data, (err, doc) => {
      if (err) {
        rej(err);
      }
      res(doc);
    })
  });
}