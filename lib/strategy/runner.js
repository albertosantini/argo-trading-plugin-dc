"use strict";

class Runner {

    constructor(deltaUp, deltaDown, dStarUp, dStarDown) {
        this.deltaUp = deltaUp;
        this.deltaDown = deltaDown;
        this.dStarUp = dStarUp;
        this.dStarDown = dStarDown;
        this.initialized = false;
        this.mode = 1;

        this.extreme = 0;
        this.reference = 0;
        this.expectedDcLevel = 0;
        this.expectedOsLevel = 0;
    }

    run(price) {
        if (!this.initialized) {
            this.initialized = true;
            this.extreme = this.reference = price.mid;
            this.findExpectedDClevel();
            this.findExpectedOSlevel();

            return 0;
        }

        if (this.mode === -1) {
            if (price.bid >= this.expectedDcLevel) {
                this.mode = 1;
                this.extreme = this.reference = price.bid;
                this.findExpectedDClevel();
                this.findExpectedOSlevel();
                return 1;
            }
            if (price.ask < this.extreme) {
                this.extreme = price.ask;
                this.findExpectedDClevel();
                if (price.ask < this.expectedOsLevel) {
                    this.reference = this.extreme;
                    this.findExpectedOSlevel();

                    return -2;
                }
            }
        } else if (this.mode === 1) {
            if (price.ask <= this.expectedDcLevel) {
                this.mode = -1;
                this.extreme = this.reference = price.ask;
                this.findExpectedDClevel();
                this.findExpectedOSlevel();

                return -1;
            }
            if (price.bid > this.extreme) {
                this.extreme = price.bid;
                this.findExpectedDClevel();
                if (price.bid > this.expectedOsLevel) {
                    this.reference = this.extreme;
                    this.findExpectedOSlevel();

                    return 2;
                }
            }
        }

        return 0;
    }

    findExpectedDClevel() {
        if (this.mode === -1) {
            this.expectedDcLevel = Math.exp(Math.log(this.extreme) + this.deltaUp);
        } else {
            this.expectedDcLevel = Math.exp(Math.log(this.extreme) - this.deltaDown);
        }
    }

    findExpectedOSlevel() {
        if (this.mode === -1) {
            this.expectedOsLevel = Math.exp(Math.log(this.reference) - this.dStarDown);
        } else {
            this.expectedOsLevel = Math.exp(Math.log(this.reference) + this.dStarUp);
        }
    }


    getExpectedDcLevel() {
        return this.expectedDcLevel;
    }


    getExpectedOsLevel() {
        return this.expectedOsLevel;
    }


    getExpectedUpperIE() {
        return this.expectedDcLevel > this.expectedOsLevel
            ? this.expectedDcLevel : this.expectedOsLevel;
    }


    getExpectedLowerIE() {
        return this.expectedDcLevel < this.expectedOsLevel
            ? this.expectedDcLevel : this.expectedOsLevel;
    }


    getMode() {
        return this.mode;
    }


    getDeltaUp() {
        return this.deltaUp;
    }


    getDeltaDown() {
        return this.deltaDown;
    }


    getdStarUp() {
        return this.dStarUp;
    }


    getdStarDown() {
        return this.dStarDown;
    }


    getUpperIEtype() {
        return this.expectedDcLevel > this.expectedOsLevel ? 1 : 2;
    }


    getLowerIEtype() {
        return this.expectedDcLevel < this.expectedOsLevel ? 1 : 2;
    }

}

exports.Runner = Runner;
