"use strict";

var util = require("util"),
    config = require("../util/config"),
    orderUtil = require("../util/order");

module.exports = ontick;

var SETUP = {
    delta: 0.0004,
    units: 10,
    trailingStop: 10,

    lastFX: { // main currencies
        "EUR_USD": {}
        // "USD_JPY": {},
        // "GBP_USD": {},
        // "EUR_GBP": {},
        // "USD_CHF": {},
        // "EUR_JPY": {},
        // "EUR_CHF": {},
        // "USD_CAD": {},
        // "AUD_USD": {},
        // "GBP_JPY": {}
    }
};

function ontick(tick) {
    var time = tick.time,
        instrument = tick.instrument,
        o = SETUP.lastFX[instrument],
        bid = tick.bid,
        ask = tick.ask,
        mid = (bid + ask) / 2,
        pip = config.pips[instrument],
        spread = ((ask - bid) / pip).toFixed(1),
        dc;

    if (!SETUP.lastFX.hasOwnProperty(instrument)) {
        return;
    }

    o.time = time;
    o.mid = mid;

    if (!o.event) {
        o.event = "UPTURN";
        o.pl = mid;
        o.ph = mid;
        o.status = "NA";
    } else {
        dc = directionalChange(o.mid, o.event, o.pl, o.ph, SETUP.delta);

        o.event = dc.event;
        o.pl = dc.pl;
        o.ph = dc.ph;
        o.status = dc.status;
    }

    util.log(time, instrument, bid, ask, spread, o.event, o.status);
    createOrder(time, instrument, o.status);
}

function createOrder(time, instrument, status) {
    var side;

    if (status === "UP") {
        side = "sell";
    }
    if (status === "DOWN") {
        side = "buy";
    }

    if (!side) {
        return;
    }

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

function directionalChange(pt, event, pl, ph, l) {
    var status = "NA";

    if (event === "UPTURN") {

        if (pt <= ph * (1 - l)) {
            pl = pt;
            // End time for a Downturn event
            // Start time for a Downward Overshoot Event
            event = "DOWNTURN";
            status = "DOWN*";
        } else {
            if (ph < pt) {
                ph = pt;
                // Start time for a Downturn event
                // End time for an Upward Overshoot Event
                status = "DOWN";
            }
        }

    } else {

        if (pt >= pl * (1 + l)) {
            ph = pt;
            // End time for a Upturn event
            // Start time for an Upward Overshoot Event
            event = "UPTURN";
            status = "UP*";
        } else {
            if (pl > pt) {
                pl = pt;
                // Start time for a Upturn event
                // End time for an Downward Overshoot Event
                status = "UP";
            }
        }
    }

    return {
        "event": event,
        "pl": pl,
        "ph": ph,
        "status": status
    };
}
