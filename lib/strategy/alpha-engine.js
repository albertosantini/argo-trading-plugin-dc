"use strict";

const { CoastlineTrader } = require("./coastline-trader");

exports.run = run;

const deltaS = [
    0.25 / 1000.0,
    0.5 / 1000.0,
    1.0 / 1000.0,
    1.5 / 1000.0
];
const longCoastlineTraders = [];
const shortCoastlineTraders = [];

deltaS.forEach((delta, index) => {
    longCoastlineTraders[index] = new CoastlineTrader(delta, 1);
});

deltaS.forEach((delta, index) => {
    shortCoastlineTraders[index] = new CoastlineTrader(delta, -1);
});

function run(price) {
    try {
        longCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
        shortCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
    } catch (e) {
        console.log(e); // eslint-disable-line
    }
}
