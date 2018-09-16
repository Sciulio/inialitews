import path from 'path';

import { logger } from '../../libs/logger';
import { loadConfiguration } from '../../libs/config';
import { isMasterProcess } from '../../libs/env';
import { requestMaster, subscribeReqResChannel } from '../../libs/clusterbus';

import Datastore from 'nedb';

import { tSendEmailVM } from './model';


const config = loadConfiguration();

const channelLabel = "api_services_sendmail";

let _initDb: (apiKey: string) => Promise<void>;
let _insert: <T extends tSendEmailVM>(item: tSendEmailVM) => Promise<T>;

if (isMasterProcess()) {
  let db: Datastore;

  _initDb = async function(apiKey: string) {
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
    
    subscribeReqResChannel(channelLabel, async (data: tSendEmailVM) => {
      return await _insert(data);
    });
  };

  _insert = async function<T extends tSendEmailVM>(item: tSendEmailVM) {
    return new Promise<T>((res, rej) => {
      db.insert(item, (err: Error, doc: {}) => {
        if (err) {
          rej(err);
        }
        res(doc as T);
      })
    });
  };
} else {
  _initDb = async function(apiKey: string) {}

  _insert = async function<T extends tSendEmailVM>(item: tSendEmailVM) {
    return await (requestMaster<T>(channelLabel, item) as Promise<T>);
  };
}

export const initDb = _initDb;
export const insert = _insert;