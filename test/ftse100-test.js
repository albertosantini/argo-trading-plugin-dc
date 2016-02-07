"use strict";

var test = require("tape");
var series = require("./ftse100-series").ftse100;

var expected = [
    {index: 60, item: 5586.61, trend: -1, hi: 5825.01, lo: 5586.61, up: 0, down: 0, ext: 5825.01, change: -1, osv: 0},
    {index: 92, item: 5217.82, trend: 1, hi: 5217.82, lo: 5028.15, up: 0, down: 0, ext: 5028.15, change: 1, osv: 0},
    {index: 192, item: 5748.97, trend: 1, hi: 5757.86, lo: 5109.4, up: 0, down: 0, ext: 5109.4, change: 4, osv: 3},
    {index: 292, item: 5904.49, trend: 1, hi: 5904.49, lo: 5598.23, up: 0, down: 0, ext: 5598.23, change: 1, osv: 0},
    {index: 392, item: 5095.3, trend: -1, hi: 5357.63, lo: 5040.76, up: 0, down: 0, ext: 5357.63, change: -1, osv: 0},
    {index: 492, item: 5636.64, trend: 1, hi: 5699.91, lo: 5364.99, up: 0, down: 0, ext: 5364.99, change: 1, osv: 0},
    {index: 592, item: 5435.08, trend: 1, hi: 5447.79, lo: 5260.19, up: 0, down: 0, ext: 5260.19, change: 1, osv: 0},
    {index: 692, item: 5795.1, trend: 1, hi: 5917.05, lo: 5657.86, up: 0, down: 0, ext: 5657.86, change: 0, osv: 0},
    {index: 792, item: 6388.55, trend: 1, hi: 6529.41, lo: 5605.59, up: 0, down: 0, ext: 5605.59, change: 4, osv: 3},
    {index: 892, item: 6587.43, trend: 1, hi: 6681.98, lo: 6029.1, up: 0, down: 0, ext: 6029.1, change: 3, osv: 2},
    {index: 992, item: 6755.45, trend: 1, hi: 6755.45, lo: 6439.96, up: 0, down: 0, ext: 6439.96, change: 1, osv: 0}
];

test("ftse100", function (t) {
    var threshold = 0.03;

    var trendArr = [],
        hiArr = [],
        loArr = [],
        upArr = [],
        downArr = [],
        extArr = [],
        changeArr = [],
        osvArr = [];

    t.plan(99);

    series.forEach(function (item, index) {
        var trend,
            hi,
            lo,
            up,
            down,
            ext,
            change,
            osv;

        if (index === 0) {
            trend = 0;
            hi = item;
            lo = item;
            ext = item;
            up = (((item - lo) / lo) >= threshold) ? 1 : 0;
            down = (((hi - item) / hi) >= threshold) ? 1 : 0;
        } else {
            if (upArr.slice(-1)[0] === 1) {
                trend = 1;
            } else {
                if (downArr.slice(-1)[0] === 1) {
                    trend = -1;
                } else {
                    trend = trendArr.slice(-1)[0];
                }
            }

            if (upArr.slice(-1)[0] === 1) {
                hi = Math.max(series[index - 1], item);
            } else {
                hi = Math.max(hiArr.slice(-1)[0], item);
            }

            if (downArr.slice(-1)[0] === 1) {
                lo = Math.min(series[index - 1], item);
            } else {
                lo = Math.min(loArr.slice(-1)[0], item);
            }

            if (trend === 1) {
                up = 0;
            } else {
                up = (((item - lo) / lo) >= threshold) ? 1 : 0;
            }

            if (trend === -1) {
                down = 0;
            } else {
                down = (((hi - item) / hi) >= threshold) ? 1 : 0;
            }


            if (up === 1) {
                ext = lo;
            } else {
                if (down === 1) {
                    ext = hi;
                } else {
                    ext = extArr.slice(-1)[0];
                }
            }
        }

        change = Math.trunc((((item - ext) / ext) / threshold));

        if (change > 0) {
            osv = change - 1;
        } else {
            osv = change < 0 ? change + 1 : change;
        }

        trendArr.push(trend);
        hiArr.push(hi);
        loArr.push(lo);
        upArr.push(up);
        downArr.push(down);
        extArr.push(ext);
        changeArr.push(change);
        osvArr.push(osv);
    });

    expected.forEach(function (value) {
        t.equal(value.item, series[value.index], "value");
        t.equal(value.trend, trendArr[value.index], "trend");
        t.equal(value.hi, hiArr[value.index], "hi");
        t.equal(value.lo, loArr[value.index], "lo");
        t.equal(value.up, upArr[value.index], "up");
        t.equal(value.down, downArr[value.index], "down");
        t.equal(value.ext, extArr[value.index], "ext");
        t.equal(value.change, changeArr[value.index], "change");
        t.equal(value.osv, osvArr[value.index], "osv");

    });
});
