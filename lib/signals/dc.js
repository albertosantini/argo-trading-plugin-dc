"use strict";

exports.directionalChange = directionalChange;
exports.dcBasedAnalysis = dcBasedAnalysis;
exports.aroonUp = aroonUp;
exports.aroonDown = aroonDown;

const last = {};

function directionalChange(instrument, price, threshold) {
    let trend,
        hi,
        lo,
        up,
        down,
        ext,
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

    const change = ((price - ext) / ext) / threshold;

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
        trend,
        hi,
        lo,
        up,
        down,
        ext,
        change: Math.trunc(change),
        osv: Math.trunc(osv),
        osv2: osv
    };
}

function dcBasedAnalysis(instrument, prices, threshold) {
    const uptrends = [],
        downtrends = [];

    prices.forEach(price => {
        const dc = directionalChange(instrument, price, threshold);

        if (dc.down === 1) {
            downtrends.push({
                trend: dc.trend,
                pext: dc.ext,
                pos: price,
                osv: dc.osv2
            });
        }

        if (dc.up === 1) {
            uptrends.push({
                trend: dc.trend,
                pext: dc.ext,
                pos: price,
                osv: dc.osv2
            });
        }

        return {
            uptrends,
            downtrends
        };
    });
}

function aroonUp(uptrends, period) {
    const pexts = uptrends.map(observation => observation.pext);

    const poss = uptrends.map(observation => observation.pos);

    return aroon(1, pexts, poss, period);
}

function aroonDown(downtrends, period) {
    const pexts = downtrends.map(observation => observation.pext);

    const poss = downtrends.map(observation => observation.pos);

    return aroon(-1, pexts, poss, period);
}

function aroon(trend, pexts, poss, period = 20) {
    const ups = [],
        downs = [];

    poss.forEach((pos, index) => {
        let m1, m2;

        if (index < period) {
            return;
        }

        const subPexts = pexts.slice(index - period, index + 1);
        const subPoss = poss.slice(index - period, index + 1);

        if (trend === 1) {
            m1 = subPoss.indexOf(Math.max.apply(null, subPoss.reverse()));
            m2 = subPexts.indexOf(Math.min.apply(null, subPexts.reverse()));
            ups.push((period - m1) / period);
            downs.push((period - m2) / period);
        }
        if (trend === -1) {
            m1 = subPoss.indexOf(Math.max.apply(null, subPoss.reverse()));
            m2 = subPexts.indexOf(Math.min.apply(null, subPexts.reverse()));
            ups.push((period - m2) / period);
            downs.push((period - m1) / period);
        }
    });

    return {
        ups,
        downs
    };
}
