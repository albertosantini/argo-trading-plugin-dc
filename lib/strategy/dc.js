"use strict";

exports.directionalChange = directionalChange;

var lastPrice,
    lastTrend,
    lastHi,
    lastLo,
    lastUp,
    lastDown,
    lastExt;

function directionalChange(price, threshold) {
    var trend,
        hi,
        lo,
        up,
        down,
        ext,
        change,
        osv;

    if (!lastPrice) {
        trend = 0;
        hi = price;
        lo = price;
        up = (((price - lo) / lo) >= threshold) ? 1 : 0;
        down = (((hi - price) / hi) >= threshold) ? 1 : 0;
    } else {
        if (lastUp === 1) {
            trend = 1;
        } else {
            if (lastDown === 1) {
                trend = -1;
            } else {
                trend = lastTrend;
            }
        }

        if (lastUp === 1) {
            hi = Math.max(lastPrice, price);
        } else {
            hi = Math.max(lastHi, price);
        }

        if (lastDown === 1) {
            lo = Math.min(lastPrice, price);
        } else {
            lo = Math.min(lastLo, price);
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
                ext = lastExt;
            }
        }

    }

    change = Math.trunc((((price - ext) / ext) / threshold));

    if (change > 0) {
        osv = change - 1;
    } else {
        osv = change < 0 ? change + 1 : change;
    }

    lastPrice = price;
    lastTrend = trend;
    lastHi = hi;
    lastLo = lo;
    lastUp = up;
    lastDown = down;
    lastExt = ext;

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
