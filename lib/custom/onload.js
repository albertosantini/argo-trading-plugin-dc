"use strict";

const tools = require("../util/tools");

module.exports = onload;

function onload(name) {
    tools.log("Plugin loaded", name);
}
