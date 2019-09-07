"use strict";

const { Tools } = require("./tools");

class LocalLiquidity {
    constructor(d, deltaStar, alpha) {
        this.type = -1;
        this.deltaUp = this.deltaDown = d;
        this.deltaStar = deltaStar;
        this.delta = d;
        this.initalized = false;
        this.alpha = alpha;
        this.alphaWeight = Math.exp(-2.0 / (alpha + 1.0));

        this.computeH1H2exp();

        this.extreme = 0;
        this.reference = 0;

        this.surp = 0;
        this.liq = 0;
        this.H1 = 0;
        this.H2 = 0;
    }

    computeH1H2exp() {
        this.H1 = -Math.exp(-this.deltaStar / this.delta) *
                Math.log(Math.exp(-this.deltaStar / this.delta)) -
            (1.0 - Math.exp(-this.deltaStar / this.delta)) *
                Math.log(1.0 - Math.exp(-this.deltaStar / this.delta));

        this.H2 = Math.exp(-this.deltaStar / this.delta) *
                Math.pow(Math.log(Math.exp(-this.deltaStar / this.delta)), 2.0) -
            (1.0 - Math.exp(-this.deltaStar / this.delta)) *
                Math.pow(Math.log(1.0 - Math.exp(-this.deltaStar / this.delta)), 2.0) - this.H1 * this.H1;

        return true;
    }


    /**
     * This method should be called with every new price
     * @param {number} price new price
     * @returns {boolean} liq
     */
    computation(price) {
        const event = this.run(price);

        if (!event) {
            this.surp = this.alphaWeight * (Math.abs(event) === 1 ? 0.08338161 : 2.525729) + (1.0 - this.alphaWeight) * this.surp;
            this.liq = 1.0 - Tools.CumNorm(Math.sqrt(this.alpha) * (this.surp - this.H1) / Math.sqrt(this.H2)); // eslint-disable-line
        }

        return this.liq;
    }

    /**
     * This is the local runner of the class. It can be delegated to an external class
     * @param {number} price is just a new price
     * @returns {boolean} 1 and -1 if DC IE, 2 or -2 if OS IE, 0 otherwise.
     */
    run(price) {
        if (!price) {
            return 0;
        }

        if (!this.initalized) {
            this.initalized = true;
            this.type = -1;
            this.extreme = this.reference = price.mid;

            return 0;
        }

        if (this.type === -1) {
            if (Math.log(price.bid / this.extreme) >= this.deltaUp) {
                this.type = 1;
                this.extreme = price.bid;
                this.reference = price.bid;

                return 1;
            }
            if (price.ask < this.extreme) {
                this.extreme = price.ask;
            }
            if (Math.log(this.reference / this.extreme) >= this.deltaStar) {
                this.reference = this.extreme;

                return -2;
            }
        } else if (this.type === 1) {
            if (Math.log(price.ask / this.extreme) <= -this.deltaDown) {
                this.type = -1;
                this.extreme = price.ask;
                this.reference = price.ask;

                return -1;
            }
            if (price.bid > this.extreme) {
                this.extreme = price.bid;
            }
            if (Math.log(this.reference / this.extreme) <= -this.deltaStar) {
                this.reference = this.extreme;

                return 2;
            }
        }
        return 0;
    }


}

exports.LocalLiquidity = LocalLiquidity;
