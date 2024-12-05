// B"H
const http = require('http');
const https = require('https');
const url = require('url');
const { URLSearchParams } = require('url');

const server = http.createServer((req, res) => {
    const queryParams = url.parse(req.url, true).query;
    const targetUrl = queryParams.url;
    
    // Check if the URL is provided
    if (!targetUrl) {
        res.statusCode = 400;
        res.end('Error: Missing URL parameter');
        return;
    }

    // Parse the provided URL
    const parsedUrl = new URL(targetUrl);
    const method = req.method; // Method: GET or POST
    const headers = req.headers; // Forward headers

    // Determine the protocol to use (http or https)
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    // Prepare options for the proxy request
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search, // Preserve query string
        method: method, // GET or POST
        headers: {
            ...headers, // Forward client headers (e.g., cookies, user-agent, etc.)
            'Host': parsedUrl.hostname, // Ensure correct host header
        }
    };

    // Forward the request to the target URL
    const proxyRequest = protocol.request(options, (proxyResponse) => {
        // Set the appropriate headers for the response
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        
        // Pipe the response data back to the client
        proxyResponse.pipe(res);
    });

    // Handle POST data if the method is POST
    if (method === 'POST') {
        req.pipe(proxyRequest);
    } else {
        proxyRequest.end();
    }

    // Handle errors
    proxyRequest.on('error', (err) => {
        res.statusCode = 500;
        res.end(`Error: ${err.message}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}/`);
});
