"use strict";

class Tools {

    /**
     * The method computes cumulative value of the normal distribution with parameter x
     * @param {number} x is the x coordinate of the normal distribution
     * @returns {number} sum of the cumulative normal distribution
     */
    static cumNorm(x) {

        // protect against overflow
        if (x > 6.0) {
            return 1.0;
        }
        if (x < -6.0) {
            return 0.0;
        }

        const b1 = 0.31938153;
        const b2 = -0.356563782;
        const b3 = 1.781477937;
        const b4 = -1.821255978;
        const b5 = 1.330274429;
        const p = 0.2316419;
        const c2 = 0.3989423;
        const a = Math.abs(x);
        const t = 1.0 / (1.0 + a * p);
        const b = c2 * Math.exp((-x) * (x / 2.0));

        let n = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;

        n = 1.0 - b * n;

        if (x < 0.0) {
            n = 1.0 - n;
        }

        return n;
    }

}

exports.Tools = Tools;
