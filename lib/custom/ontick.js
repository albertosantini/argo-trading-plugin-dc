"use strict";

const util = require("util"),
    config = require("../util/config"),
    orderUtil = require("../util/order"),
    strategy = require("../signals/dc");

module.exports = ontick;

const SETUP = {
    threshold: 0.001, // 0.1%
    units: 100,
    trailingStop: 10,

    lastFX: {
        EUR_USD: {},
        USD_JPY: {},
        GBP_USD: {},
        EUR_GBP: {},
        EUR_JPY: {},
        USD_CAD: {},
        AUD_USD: {},
        GBP_JPY: {}
    }
};

function ontick(tick) {
    const time = tick.time,
        instrument = tick.instrument,
        o = SETUP.lastFX[instrument],
        bid = parseFloat(tick.bid),
        ask = parseFloat(tick.ask),
        pip = config.pips[instrument],
        countDecimals = pip.split(".")[1].length,
        mid = ((bid + ask) / 2).toFixed(countDecimals),
        spread = ((ask - bid) / pip).toFixed(1);

    let side;

    if (!Object.prototype.hasOwnProperty.call(SETUP.lastFX, "instrument")) {
        return;
    }

    o.time = time;
    o.mid = mid;

    const dc = strategy.directionalChange(instrument, o.mid, SETUP.threshold);

    o.trend = dc.trend;

    if (o.lastTrend === 1 && o.trend === -1 &&
        Math.sign(dc.change) === -1 && dc.osv === 0) {
        side = "sell";
    }

    if (o.lastTrend === -1 && o.trend === 1 &&
        Math.sign(dc.change) === 1 && dc.osv === 0) {
        side = "buy";
    }

    o.lastTrend = o.trend;

    if (side && spread < 9) {
        orderUtil.fillOrder({
            instrument,
            type: "MARKET",
            side,
            units: side === "buy" ? SETUP.units : -SETUP.units,
            trailingStop: {
                distance: (SETUP.trailingStop * pip).toPrecision(2)
            }
        }, err => {
            if (err) {
                util.log(err);
            }
        });
    }
}
