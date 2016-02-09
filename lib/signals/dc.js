"use strict";

exports.directionalChange = directionalChange;

var last = {};

function directionalChange(instrument, price, threshold) {
    var trend,
        hi,
        lo,
        up,
        down,
        ext,
        change,
        osv;

    if (!last[instrument]) {
        last[instrument] = {
            price: null,
            trend: null,
            hi: null,
            lo: null,
            up: null,
            down: null,
            ext: null
        };
    }

    if (!last[instrument].price) {
        trend = 0;
        hi = price;
        lo = price;
        up = (((price - lo) / lo) >= threshold) ? 1 : 0;
        down = (((hi - price) / hi) >= threshold) ? 1 : 0;
    } else {
        if (last[instrument].up === 1) {
            trend = 1;
        } else {
            if (last[instrument].down === 1) {
                trend = -1;
            } else {
                trend = last[instrument].trend;
            }
        }

        if (last[instrument].up === 1) {
            hi = Math.max(last[instrument].price, price);
        } else {
            hi = Math.max(last[instrument].hi, price);
        }

        if (last[instrument].down === 1) {
            lo = Math.min(last[instrument].price, price);
        } else {
            lo = Math.min(last[instrument].lo, price);
        }

        if (trend === 1) {
            up = 0;
        } else {
            up = (((price - lo) / lo) >= threshold) ? 1 : 0;
        }

        if (trend === -1) {
            down = 0;
        } else {
            down = (((hi - price) / hi) >= threshold) ? 1 : 0;
        }

        if (up === 1) {
            ext = lo;
        } else {
            if (down === 1) {
                ext = hi;
            } else {
                ext = last[instrument].ext;
            }
        }

    }

    change = Math.trunc((((price - ext) / ext) / threshold));

    if (change > 0) {
        osv = change - 1;
    } else {
        osv = change < 0 ? change + 1 : change;
    }

    last[instrument].price = price;
    last[instrument].trend = trend;
    last[instrument].hi = hi;
    last[instrument].lo = lo;
    last[instrument].up = up;
    last[instrument].down = down;
    last[instrument].ext = ext;

    return {
        trend: trend,
        hi: hi,
        lo: lo,
        up: up,
        down: down,
        ext: ext,
        change: change,
        osv: osv
    };
}
