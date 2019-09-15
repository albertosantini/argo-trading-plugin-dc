"use strict";

const tools = require("../util/tools");

module.exports = onunload;

function onunload(name) {
    tools.log("Plugin unloaded", name);
}
