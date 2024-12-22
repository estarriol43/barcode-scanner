const osc = require("osc");
const WebSocket = require("ws");
const fs = require("fs");
const https = require("https");
const express = require("express");
const ngrok = require('ngrok');

// Configuration
require('dotenv').config()

// Set up osc port
const udpPort = new osc.UDPPort({
  remotePort: 9091,
  remoteAddress: "127.0.0.1"
});

// Open the port
udpPort.open();

console.log(`Send OSC message to ${process.env.REMOTE_OSC_IP}:${process.env.REMOTE_OSC_PORT}`)

// Create an Express-based Web Socket server
const appResources = __dirname + '/../frontend/build';
const app = express();

app.use("/", express.static(appResources));

app.use(express.json());

const bAddress2oscAddress = {
  "v1p" : "/vocal/1/play",
  "v2p" : "/vocal/2/play",
  "v3p" : "/vocal/3/play",
  "v4p" : "/vocal/4/play",
  "v5p" : "/vocal/5/play",
  "v6p" : "/vocal/6/play",
  "v7p" : "/vocal/7/play",
  "v8p" : "/vocal/8/play",
  "mc"  : "/main/circling",
  "pd"  : "/percussion/d",
  "m3f" : "/mic3/filter",
  "syz" : "/synth/z",
  "syd" : "/synth/d",
  "start" : "/start",
}

const bArgs2oscArgs = {
  "b" : "bang",
  "u" : "up",
  "d" : "down",
  "f" : "far",
  "n" : "near",
  "r" : "random",
  "s" : "steady"
}

app.post('/', (req, res) => {
  console.log(`Received message: ${req.body.code}`);

  var baddress, address, bargs, args;

  try {
    baddress  = req.body.code.split('-')[0]
    bargs = req.body.code.split('-')[1]

    address = bAddress2oscAddress[baddress];
    args = bArgs2oscArgs[bargs];

  } catch (error) {
    res.json({ status: 'failed', receivedMessage: req.body.code });
    console.error(`Failed to parse barcode`)
  }

  console.log(`address: ${address}, args: ${args}`)

  if (address != null && args != null) {
    udpPort.send({
      address: address,
      args: [
        { type: "s", value: args },
      ]
    });
    res.json({ status: 'success', receivedMessage: req.body.code });
    console.log("success")
  } else {
    res.json({ status: 'failed', receivedMessage: req.body.code });
    console.error(`Failed to parse barcode`)
  }
});

(async function() {
  console.log("Initializing Ngrok tunnel...");

  // Initialize ngrok using auth token and hostname
  const url = await ngrok.connect({
    proto: "http",
    // Your authtoken if you want your hostname to be the same everytime
    authtoken: process.env.NGROK_AUTHTOKEN,
    // Your hostname if you want your hostname to be the same everytime
    hostname: process.env.NGROK_HOSTNAME,
    // Your app port
    addr: process.env.HOST_PORT,
  });

  console.log(`App listening on url ${url}`);
  console.log("Ngrok tunnel initialized!");
})();

app.listen(process.env.HOST_PORT, () => {
  console.log(`App listening on port ${process.env.HOST_PORT}!`);});
