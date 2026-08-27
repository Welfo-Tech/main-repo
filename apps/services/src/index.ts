import { createServer } from "http";

const PORT = Number(process.env.PORT ?? 4001);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "welfo-services" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  process.stdout.write(`welfo services running on port ${PORT}\n`);
});
