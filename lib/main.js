"use strict";

const flic = require("flic");

const tools = require("./util/tools");
const config = require("./util/config");
const pluginName = require("./custom/name");
const onheartbeat = require("./custom/onheartbeat");
const onload = require("./custom/onload");
const ontick = require("./custom/ontick");
const onbar = require("./custom/onbar");
const ontransaction = require("./custom/ontransaction");
const onunload = require("./custom/onunload");
const bars = require("./bars");

const masterNodeName = "master";

let status;

const pluginNode = flic.createNode({
    id: pluginName,
    "connect_callback": error => { // eslint-disable-line
        const event = `${masterNodeName}:argo.register`;

        if (!error) {
            pluginNode.tell(event, pluginName, (err, setup) => {
                if (!err) {
                    status = "loaded";
                    config.apiUrl = setup;
                    onload(pluginName);
                    tools.log("Argo plugin online", pluginName);
                } else {
                    tools.log("Argo plugin not registered", err);
                }
            });
        } else {
            tools.log(error);
        }
    }
});

// @ts-ignore
pluginNode.on("argo.status", (name, callback) => {
    tools.log("Argo plugin status", name, status);
    callback(null, status);
});

// @ts-ignore
pluginNode.on("argo.enable", (name, cfg, callback) => {
    status = "enabled";
    tools.log("Argo plugin enabled", pluginName);
    config.pips = cfg.pips || config.pips;
    callback();
});

// @ts-ignore
pluginNode.on("argo.disable", (name, callback) => {
    status = "loaded";
    tools.log("Argo plugin disabled", pluginName);
    callback();
});

// @ts-ignore
pluginNode.on("argo.streaming", data => {
    const isLoaded = status === "loaded",
        isEnabled = status === "enabled";

    let json, tick, completeBars;

    try {
        json = typeof data === "string" ? JSON.parse(data) : data;

        if ((isLoaded || isEnabled) && json.type === "HEARTBEAT") {
            onheartbeat(json);
        }
        if (isEnabled && json.type === "PRICE") {
            tick = {
                time: json.time,
                instrument: json.instrument,
                bid: json.bids[0].price || json.closeoutBid,
                ask: json.asks[0].price || json.closeoutAsk
            };

            ontick(tick);
            completeBars = bars.getCompleteBars(tick);
            completeBars.forEach(bar => {
                onbar(bar);
            });
        }
        if (isEnabled && json.accountID) {
            ontransaction(json);
        }
    } catch (e) {

        // Discard "incomplete" json
    }
});

// @ts-ignore
pluginNode.on("error", err => {
    tools.log(err);
});

process.on("uncaughtException", err => {
    handlingException(err);
});

process.on("SIGINT", () => {
    handlingException("Got SIGINT");
    onunload(pluginName);
    process.exit(0); // eslint-disable-line
});

function handlingException(err) {
    const event = `${masterNodeName}:argo.unregister`;

    pluginNode.tell(event, pluginName, () => {
        status = "loaded";
    });
    tools.log(err);
}
