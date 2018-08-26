import path from 'path';
import 'async-extensions';
import Datastore from 'nedb';
import { loadConfiguration } from './config';


const config = loadConfiguration();

//TODO: set a lib:package for this VVVVVVVVVV

export type baseDoc = {
  _id?: string;
}
export type docBuildAudit = baseDoc & {
  _type: "buildinfo",
  on: number;
  duration: number;
};
export type docFileAudit = baseDoc & {
  _type: "fileinfo",
  _on: number;
  path: string;
  url: string;
  audit: {
    action: "created" | "edited" | "deleted";
    version: number;
  };
  stats: {
    hash: string;
    size: number;
  };
  content: {
    type: string;
    charset: string;
    visibility: "public" | "private";
    lastModified: string;
  };
  has: {[keyProp: string]: boolean};
};

export type tBuildAudit = docBuildAudit & {
};
export type tFileAudit = docFileAudit & {
  buildInfo: tBuildAudit;
};
//TODO: set a lib:package for this AAAAAAAA

const dbs: {[key: string]: {
  db: Datastore,
  on: number
}} = {};

export async function initDb() {
  await Object.keys(config.tenants)
  .forEachAsync(async tenantKey => {
    const tenant = config.tenants[tenantKey];
    const db = new Datastore({
      filename: path.join(config.target.root, tenant.name, "audit.db")
    });
    
    await new Promise((res, rej) => {
      db.loadDatabase((err) => {
        if (err) {
          rej(err);
        } else {
          console.log(" - initted db for tenant:", tenant.name);

          dbs[tenant.name] = {
            db,
            on: Date.now()
          };

          res();
        }
      });
    });
  });
}

export async function fetchFileAudit(tenantName: string, url: string) {
  const db = dbs[tenantName].db;

  return new Promise<docFileAudit>((res, rej) => {
    db.findOne<docFileAudit>({
      url
    }, function (err, doc) {
      // doc is the document Mars
      // If no document is found, doc is null
      err ? rej(err) : res(doc);
    });
  });
}