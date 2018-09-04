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