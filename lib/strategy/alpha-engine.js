"use strict";

// const util = require("util"),
//     config = require("../util/config"),
//     orderUtil = require("../util/order"),
//     strategy = require("../signals/dc");

const CoastlineTrader = require("./coastline-trader");

exports.run = run;

const longCoastlineTraders = [];

longCoastlineTraders[0] = new CoastlineTrader(0.0025, 1);
longCoastlineTraders[1] = new CoastlineTrader(0.005, 1);
longCoastlineTraders[2] = new CoastlineTrader(0.01, 1);
longCoastlineTraders[3] = new CoastlineTrader(0.015, 1);

const shortCoastlineTraders = [];

shortCoastlineTraders[0] = new CoastlineTrader(0.0025, -1);
shortCoastlineTraders[1] = new CoastlineTrader(0.005, -1);
shortCoastlineTraders[2] = new CoastlineTrader(0.01, -1);
shortCoastlineTraders[3] = new CoastlineTrader(0.015, -1);

function run(price) {
    longCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
    shortCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
}
