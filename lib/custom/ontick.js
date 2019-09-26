"use strict";

const config = require("../util/config");
const { AlphaEngine } = require("../strategy/alpha-engine");

module.exports = ontick;

const instruments = [
    "EUR_USD"
];

const engines = {};

instruments.forEach(instrument => {
    engines[instrument] = new AlphaEngine(instrument);

});

function ontick(tick) {
    const instrument = tick.instrument;

    if (!instruments.includes(instrument)) {
        return;
    }

    const ask = parseFloat(tick.ask);
    const bid = parseFloat(tick.bid);
    const time = tick.time;

    const pip = config.pips[instrument];
    const countDecimals = pip.toString().split(".")[1].length;
    const mid = parseFloat(((bid + ask) / 2).toFixed(countDecimals));
    const spread = parseFloat(((ask - bid) / pip).toFixed(1));

    const price = {
        instrument,
        ask,
        bid,
        time,
        mid,
        spread,
        countDecimals
    };

    engines[instrument].run(price);
}
