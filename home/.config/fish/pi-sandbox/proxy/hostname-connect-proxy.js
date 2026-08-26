"use strict";

const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const dns = require("node:dns");

const port = Number.parseInt(process.env.PI_SANDBOX_PROXY_PORT || "8443", 10);
const policyPath = process.env.PI_SANDBOX_NET_POLICY;

if (!policyPath) {
  throw new Error("PI_SANDBOX_NET_POLICY is required");
}

const rawPolicy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const allowRules = Array.isArray(rawPolicy.allow) ? rawPolicy.allow : [];
const denyRules = Array.isArray(rawPolicy.deny) ? rawPolicy.deny : [];

function normalizeHost(input) {
  return input.toLowerCase().replace(/\.+$/, "");
}

function matchRule(rule, host) {
  const normalizedRule = normalizeHost(rule);
  if (normalizedRule.startsWith("*.")) {
    const base = normalizedRule.slice(2);
    return host !== base && host.endsWith(`.${base}`);
  }
  return host === normalizedRule;
}

function isAllowed(host) {
  if (denyRules.some((rule) => matchRule(rule, host))) {
    return false;
  }
  return allowRules.some((rule) => matchRule(rule, host));
}

function sendError(socket, code, message) {
  socket.write(`HTTP/1.1 ${code} ${message}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const octets = address.split(".").map((item) => Number.parseInt(item, 10));
    if (octets.length !== 4 || octets.some((item) => Number.isNaN(item))) {
      return true;
    }
    return (
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    );
  }
  if (family === 6) {
    let normalized = address.toLowerCase();
    // Reject IPv4-mapped IPv6 addresses unless the embedded IPv4 is also public.
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) {
      return isPrivateAddress(mapped[1]);
    }
    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }
  return true;
}

function parseConnectAuthority(authority) {
  if (!authority) {
    return null;
  }
  const bracketed = authority.match(/^\[([^\]]+)\](?::(\d+))?$/);
  if (bracketed) {
    return { host: bracketed[1], port: bracketed[2] || "443" };
  }
  const split = authority.split(":");
  if (split.length > 2) {
    return null;
  }
  if (split.length === 1) {
    return { host: split[0], port: "443" };
  }
  return { host: split[0], port: split[1] };
}

const server = http.createServer((req, res) => {
  res.writeHead(403, { Connection: "close" });
  res.end("CONNECT required\n");
});

server.on("connect", (req, clientSocket, head) => {
  const target = parseConnectAuthority(req.url || "");
  if (!target || !target.host || !target.port) {
    sendError(clientSocket, 400, "Bad Request");
    return;
  }

  const host = normalizeHost(target.host);
  const targetPort = Number.parseInt(target.port, 10);
  if (!Number.isInteger(targetPort) || targetPort <= 0 || targetPort > 65535) {
    sendError(clientSocket, 400, "Bad Request");
    return;
  }
  if (targetPort !== 443) {
    sendError(clientSocket, 403, "Forbidden");
    return;
  }
  if (net.isIP(host) !== 0) {
    sendError(clientSocket, 403, "Forbidden");
    return;
  }
  if (!isAllowed(host)) {
    sendError(clientSocket, 403, "Forbidden");
    return;
  }

  dns.lookup(host, { all: true, verbatim: true }, (lookupError, addresses) => {
    if (lookupError || !addresses || addresses.length === 0) {
      sendError(clientSocket, 502, "Bad Gateway");
      return;
    }
    const destination = addresses.find((entry) => !isPrivateAddress(entry.address));
    if (!destination) {
      sendError(clientSocket, 403, "Forbidden");
      return;
    }

    let connected = false;
    const upstream = net.connect(
      { host: destination.address, port: targetPort, family: destination.family },
      () => {
        connected = true;
        clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        if (head && head.length > 0) {
          upstream.write(head);
        }
        upstream.pipe(clientSocket);
        clientSocket.pipe(upstream);
      },
    );

    upstream.on("error", () => {
      if (connected) {
        clientSocket.destroy();
        return;
      }
      sendError(clientSocket, 502, "Bad Gateway");
    });
  });
});

server.on("clientError", (err, socket) => {
  if (socket.writable) {
    sendError(socket, 400, "Bad Request");
  }
});

server.listen(port, "0.0.0.0");
