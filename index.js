// B"H
const http = require('http');
const https = require('https');
const url = require('url');
const webPush = require("web-push");
const { URLSearchParams } = require('url');
var vapidKeys = {
	"publicKey": "BMFDU3eBLj5pJKRz9lTkadYlfURJRHs0lEe8QB1aMY8yyoS5VhpB9w76b71hrykAxDwOZEFPMj5zglw6HB9uYDI",
	"privateKey": process.env.vapidPrivate
}

var VAPID_PUBLIC_KEY = vapidKeys.publicKey;
var VAPID_PRIVATE_KEY = vapidKeys.privateKey;

// Configure VAPID details for web-push
webPush.setVapidDetails(
  "https://awtsmoos.com/",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        // Handle preflight requests
        res.writeHead(200);
        res.end();
        return;
      }
    if (req.method === "GET") {
        if(req.url === "/vapidPublicKey") {
            // Return the VAPID public key
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(VAPID_PUBLIC_KEY);
            return;
        }
    } else if (req.method === "POST" && req.url === "/sendNotification") {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
        
            req.on("end", () => {
              try {
                const { subscription, payload, ttl, delay } = JSON.parse(body);
                const options = { TTL: ttl };
        
                try {
                await webPush
                    .sendNotification(subscription, payload, options)
                    res.writeHead(201);
                    res.end("Notification sent successfully.");
                    return;
                } catch((error) => {
                  console.error("Notification error:", error);
                  res.writeHead(500);
                  res.end("Failed to send notification.");
                  return;
                }
                
              } catch (error) {
                console.error("Invalid request body:", error);
                res.writeHead(400);
                res.end("Invalid request body");
                return
              }
        });
    }
   
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}/`);
});
