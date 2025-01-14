const http = require("http");
const httpProxy = require("http-proxy");
const winston = require("winston");

const proxy = httpProxy.createProxyServer({});
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const requestHandler = (req, res) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);

  // Route to /movies correctly
  if (req.url.startsWith("/api/movies")) {
    const path = req.url.replace("/api", "");
    logger.info(`Routing to: https://movies-backend-qzuk.onrender.com${path}`);
    proxy.web(req, res, {
      target: "https://movies-backend-qzuk.onrender.com",
      changeOrigin: true,
      secure: false,
    });
  } else {
    logger.info("Routing to website");
    proxy.web(req, res, { target: "http://httpbin.org" });
  }
};

proxy.on("error", (err, req, res) => {
  logger.error(`Error occurred: ${err.message}`);
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end("Something went wrong!");
});

const server = http.createServer(requestHandler);

server.listen(8000, () => {
  logger.info("Proxy server running at http://localhost:8000");
});
