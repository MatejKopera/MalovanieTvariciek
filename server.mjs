import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const root = process.cwd();
const port = 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, `http://${request.headers.host}`).pathname,
    );
    const relative =
      pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = join(root, relative);
    const segments = relativePath(filePath).split(/[\\/]/);
    if (
      segments.some(
        (segment) =>
          segment.startsWith(".") ||
          ["fotky-originaly", "figma-export", "scripts"].includes(segment),
      )
    )
      throw new Error("Private path");
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    const contentType = types[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
});

function relativePath(filePath) {
  const result = relative(root, filePath);
  if (result === ".." || result.startsWith(`..${sep}`))
    throw new Error("Invalid path");
  return result;
}
