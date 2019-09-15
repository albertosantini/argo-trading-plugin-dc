"use strict";

const tools = require("../util/tools");

class LimitOrder {
    constructor(type, priceOpened, level, volume, dcORos, delta) {
        this.type = type;
        this.priceOpened = priceOpened;
        this.level = level;
        this.volume = +volume.toFixed(); // inteeger, no decimals
        this.delta = delta;
        this.dcORos = dcORos;
        this.compensatedOrders = [];
    }

    /**
     * Can be called in case if we need to change the level of the order
     * @param {number} level is the new level
     * @returns {void}
     */
    setLevel(level) {
        this.level = level;
    }

    getType() {
        return this.type;
    }

    getLevel() {
        return this.level;
    }

    getVolume() {
        return this.volume;
    }

    getDcORos() {
        return this.dcORos;
    }

    getDelta() {
        return this.delta;
    }

    addCompenstedOrder(compensatedOrder) {
        this.compensatedOrders.push(compensatedOrder);
    }

    cleanCompensatedList() {
        this.compensatedOrders = [];
    }

    setCompensatedOrders(compensatedOrders) {
        this.compensatedOrders = compensatedOrders;
        this.volume = this.computeCompensatedVolume();
    }

    computeCompensatedVolume() {
        let compensatedVolume = 0;

        this.compensatedOrders.forEach(aCompensatedOrder => {
            compensatedVolume += aCompensatedOrder.getVolume();
        });

        return compensatedVolume;
    }


    getRelativePnL() {
        let relativePnL = 0;

        this.compensatedOrders.forEach(aCompensatedOrder => {
            const absPriceMove = (aCompensatedOrder.getLevel() - this.level) * this.type;

            if (absPriceMove < 0) {
                tools.log(`Negative price move when Sell? ${absPriceMove}`);
            }
            relativePnL += absPriceMove / aCompensatedOrder.getLevel() * aCompensatedOrder.getVolume();

        });

        return relativePnL;
    }
}

exports.LimitOrder = LimitOrder;
