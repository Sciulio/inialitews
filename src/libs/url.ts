import url from 'url';
import path from 'path';


export function urlToPath(_url: string|url.URL): string {
  // parse URL
  const parsedUrl = _url instanceof url.URL ? _url : url.parse(_url);
  // extract URL path
  let urlPathname = `.${parsedUrl.pathname}`;

  if (urlPathname.endsWith("/")) {
    urlPathname = path.join(urlPathname, "index.html");
  }

  let fileName = path.basename(urlPathname);
  let filePath = path.dirname(urlPathname);
  const fileExt = path.extname(urlPathname);

  if (!fileExt) {
    fileName += ".html";
  }

  if (filePath[0] != "/") {
    filePath = "/" + filePath;
  }
  filePath = path.normalize(filePath);

  //return path.join(config.target.root, ctx.tenant.staticPath, filePath, fileName);
  return path.join(filePath, fileName);
}