"use strict";

const tools = require("../util/tools");

const { CoastlineTrader } = require("./coastline-trader");

class AlphaEngine {
    constructor(instrument) {
        const deltaS = [
            0.25 / 100.0,
            0.5 / 100.0,
            1.0 / 100.0,
            1.5 / 100.0
        ];

        this.instrument = instrument;
        this.longCoastlineTraders = [];
        this.shortCoastlineTraders = [];

        deltaS.forEach((delta, index) => {
            this.longCoastlineTraders[index] = new CoastlineTrader(delta, 1);
        });

        deltaS.forEach((delta, index) => {
            this.shortCoastlineTraders[index] = new CoastlineTrader(delta, -1);
        });
    }

    run(price) {
        try {
            this.longCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
            this.shortCoastlineTraders.forEach(coastlineTrader => coastlineTrader.run(price));
        } catch (e) {
            tools.log(e);
        }
    }
}

exports.AlphaEngine = AlphaEngine;
