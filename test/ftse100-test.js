"use strict";

var test = require("tape");
var series = require("./ftse100-series").ftse100;
var strategy = require("../lib/strategy/dc");

var expected = [
    {index: 60, price: 5586.61, trend: -1, hi: 5825.01, lo: 5586.61, up: 0, down: 0, ext: 5825.01, change: -1, osv: 0},
    {index: 92, price: 5217.82, trend: 1, hi: 5217.82, lo: 5028.15, up: 0, down: 0, ext: 5028.15, change: 1, osv: 0},
    {index: 192, price: 5748.97, trend: 1, hi: 5757.86, lo: 5109.4, up: 0, down: 0, ext: 5109.4, change: 4, osv: 3},
    {index: 292, price: 5904.49, trend: 1, hi: 5904.49, lo: 5598.23, up: 0, down: 0, ext: 5598.23, change: 1, osv: 0},
    {index: 392, price: 5095.3, trend: -1, hi: 5357.63, lo: 5040.76, up: 0, down: 0, ext: 5357.63, change: -1, osv: 0},
    {index: 492, price: 5636.64, trend: 1, hi: 5699.91, lo: 5364.99, up: 0, down: 0, ext: 5364.99, change: 1, osv: 0},
    {index: 592, price: 5435.08, trend: 1, hi: 5447.79, lo: 5260.19, up: 0, down: 0, ext: 5260.19, change: 1, osv: 0},
    {index: 692, price: 5795.1, trend: 1, hi: 5917.05, lo: 5657.86, up: 0, down: 0, ext: 5657.86, change: 0, osv: 0},
    {index: 792, price: 6388.55, trend: 1, hi: 6529.41, lo: 5605.59, up: 0, down: 0, ext: 5605.59, change: 4, osv: 3},
    {index: 892, price: 6587.43, trend: 1, hi: 6681.98, lo: 6029.1, up: 0, down: 0, ext: 6029.1, change: 3, osv: 2},
    {index: 992, price: 6755.45, trend: 1, hi: 6755.45, lo: 6439.96, up: 0, down: 0, ext: 6439.96, change: 1, osv: 0}
];

test("ftse100", function (t) {
    var threshold = 0.03,
        trend = [],
        hi = [],
        lo = [],
        up = [],
        down = [],
        ext = [],
        change = [],
        osv = [];

    t.plan(99);

    series.forEach(function (price) {
        var res = strategy.directionalChange(price, threshold);

        trend.push(res.trend);
        hi.push(res.hi);
        lo.push(res.lo);
        up.push(res.up);
        down.push(res.down);
        ext.push(res.ext);
        change.push(res.change);
        osv.push(res.osv);
    });

    expected.forEach(function (value) {
        t.equal(value.price, series[value.index], "value");
        t.equal(value.trend, trend[value.index], "trend");
        t.equal(value.hi, hi[value.index], "hi");
        t.equal(value.lo, lo[value.index], "lo");
        t.equal(value.up, up[value.index], "up");
        t.equal(value.down, down[value.index], "down");
        t.equal(value.ext, ext[value.index], "ext");
        t.equal(value.change, change[value.index], "change");
        t.equal(value.osv, osv[value.index], "osv");

    });
});
