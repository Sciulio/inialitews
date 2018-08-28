import path from 'path';
import Datastore from 'nedb';
import { loadConfiguration } from '../../../../libs/config';
import { tSendEmailVM } from './model';


const config = loadConfiguration();
let db: Datastore;

export async function initDb(apiKey: string) {
  db = new Datastore({
    filename: path.join(process.cwd(), config.services.db.path, apiKey + ".nedb")
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

export async function insert<T extends tSendEmailVM>(item: tSendEmailVM) {
  return new Promise<T>((res, rej) => {
    db.insert(item, (err, doc) => {
      if (err) {
        rej(err);
      }
      res(doc as T);
    })
  });
}