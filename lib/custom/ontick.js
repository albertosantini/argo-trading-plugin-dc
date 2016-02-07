"use strict";

var util = require("util"),
    config = require("../util/config"),
    orderUtil = require("../util/order"),
    strategy = require("../strategy/dc");

module.exports = ontick;

var SETUP = {
    threshold: 0.003, // 0.3%
    units: 100,
    trailingStop: 20,

    lastFX: {
        "EUR_USD": {},
        "USD_JPY": {},
        "GBP_USD": {},
        "EUR_GBP": {},
        "EUR_JPY": {},
        "USD_CAD": {},
        "AUD_USD": {},
        "GBP_JPY": {}
    }
};

function ontick(tick) {
    var time = tick.time,
        instrument = tick.instrument,
        o = SETUP.lastFX[instrument],
        bid = tick.bid,
        ask = tick.ask,
        pip = config.pips[instrument],
        countDecimals = pip.split(".")[1].length,
        mid = ((bid + ask) / 2).toFixed(countDecimals),
        spread = ((ask - bid) / pip).toFixed(1),
        dc,
        side;

    if (!SETUP.lastFX.hasOwnProperty(instrument)) {
        return;
    }

    o.time = time;
    o.mid = mid;

    dc = strategy.directionalChange(o.mid, SETUP.threshold);
    o.trend = dc.trend;

    if (o.lastTrend === 1 && o.trend === -1) {
        side = "sell";
    }

    if (o.lastTrend === -1 && o.trend === 1) {
        side = "buy";
    }

    util.log(time, instrument, mid, spread, o.lastTrend, o.trend, side);

    o.lastTrend = o.trend;

    if (side && spread < 9) {
        orderUtil.fillOrder({
            instrument: instrument,
            type: "market",
            side: side,
            units: SETUP.units,
            trailingStop: SETUP.trailingStop
        }, function (err, trade) {
            if (!err) {
                util.log(trade.time, instrument, side, trade.price);
            } else {
                util.log(err);
            }
        });
    }
}
