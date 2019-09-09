"use strict";

const { Runner } = require("./runner");
const { LocalLiquidity } = require("./local-liquidity");
const { LimitOrder } = require("./limit-order");

class CoastlineTrader {

    /**
     * @param {number} originalDelta used to define H1 and H1 of the liquidity indicator.
     * @param {number} longShort  +1 if want only Long trades, -1 only Short.
     */
    constructor(originalDelta, longShort) {
        this.originalDelta = originalDelta;
        this.longShort = longShort;

        this.runners = [];
        this.buyLimitOrder = null;
        this.sellLimitOrder = null;

        // size of the initial traded volume
        // computed using knowledge about the smallest volume (unite * 0.25 * 0.1). Be careful!
        this.originalUnitSize = 1;

        // inventory dictates the current unit size, this one
        this.uniteSizeFromInventory = 0;

        this.initiliazed = false;

        this.localLiquidityIndicator = new LocalLiquidity(originalDelta, originalDelta * 2.525729, 50.0);

        this.inventory = 0;

        // list of all filled limit orders which have not been balanced by an opposite order.
        this.disbalancedOrders = [];

        // the total profit of all closed positions
        this.realizedProfit = 0;

        // the total profit of all de-cascading orders
        this.positionRealizedProfit = 0;

        this.initiateRunners(originalDelta);
    }

    initiateRunners(originalDelta) {
        this.runners[0] = new Runner(originalDelta, originalDelta, originalDelta, originalDelta);

        if (this.longShort === 1) {
            this.runners[1] = new Runner(0.75 * originalDelta, 1.50 * originalDelta, 0.75 * originalDelta, 0.75 * originalDelta);
            this.runners[2] = new Runner(0.50 * originalDelta, 2.00 * originalDelta, 0.50 * originalDelta, 0.50 * originalDelta);
        } else {
            this.runners[1] = new Runner(1.50 * originalDelta, 0.75 * originalDelta, 0.75 * originalDelta, 0.75 * originalDelta);
            this.runners[2] = new Runner(2.00 * originalDelta, 0.50 * originalDelta, 0.50 * originalDelta, 0.50 * originalDelta);
        }
    }

    run(price) {
        this.localLiquidityIndicator.computation(price);

        const events = [];

        events[0] = this.runners[0].run(price);
        events[1] = this.runners[1].run(price);
        events[2] = this.runners[2].run(price);

        if (!this.initiliazed) {
            this.initiliazed = true;

            this.correctThresholdsAndVolumes(this.inventory);
            this.putOrders(price);

            return;
        }

        if (this.checkBuyFilled(price)) {
            this.makeBuyFilled(price);
            this.cancelSellLimitOrder();
        } else if (this.checkSellFilled(price)) {
            this.makeSellFilled(price);
            this.cancelBuyLimitOrder();
        }

        const properRunnerIndex = this.findProperRunnerIndex();

        if (events[properRunnerIndex] !== 0) {

            // if an event happened, but we have not a limit order at
            // that level, than we should replace all active limit orders. I. e., should use the putOrders
            // method. And it does not matter what kind of event just happened.
            this.cancelBuyLimitOrder();
            this.cancelSellLimitOrder();
            this.putOrders(price);
        } else {
            if (this.positionCrossedTargetPnL(price)) {
                this.closePosition(price);
                this.putOrders(price);
            } else {
                this.correctOrdersLevel(this.runners[properRunnerIndex].getExpectedDcLevel());
            }
        }
    }

    checkBuyFilled(price) {
        if (this.buyLimitOrder) {
            if (price.ask < this.buyLimitOrder.getLevel()) {
                return true;
            }
        }

        return false;
    }

    checkSellFilled(price) {
        if (this.sellLimitOrder) {
            if (price.bid > this.sellLimitOrder.getLevel()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Once called the method will put two orders to the order book: limit order sell at the deltaUp from the current
     * price and limit orders sell at the deltaDown form the actual price.
     * Prior to putting the limit orders, the method updates init size and thresholds.
     * @param {number} price is the current price
     * @returns {void}
     */
    putOrders(price) {
        const cascadeVol = (this.uniteSizeFromInventory * this.computeLiqUniteCoef(this.localLiquidityIndicator.liq));
        const properIndex = this.findProperRunnerIndex();
        const expectedUpperIE = this.runners[properIndex].getExpectedUpperIE();
        const expectedLowerIE = this.runners[properIndex].getExpectedLowerIE();
        const runnerMode = this.runners[properIndex].getMode();
        const deltaUp = this.runners[properIndex].getDeltaUp();
        const deltaDown = this.runners[properIndex].getDeltaDown();
        const dStarUp = this.runners[properIndex].getdStarUp();
        const dStarDown = this.runners[properIndex].getdStarDown();
        const upperIEtype = this.runners[properIndex].getUpperIEtype();
        const lowerIEtype = this.runners[properIndex].getLowerIEtype();

        let buyDcOROS, sellDcOrOS;
        let buyDelta, sellDelta;

        if (runnerMode === -1) {
            buyDcOROS = 2;
            buyDelta = dStarDown;
            sellDcOrOS = 1;
            sellDelta = deltaUp;
        } else {
            buyDcOROS = 1;
            buyDelta = deltaDown;
            sellDcOrOS = 2;
            sellDelta = dStarUp;
        }

        if (this.longShort === 1) {
            if (!this.disbalancedOrders.length) {

                // if there is no disbalanced orders then we just open a new position.
                this.sellLimitOrder = null;
                this.buyLimitOrder = new LimitOrder(1, price, expectedLowerIE, cascadeVol, lowerIEtype, dStarDown);
                this.computeTargetRelatPnL(this.buyLimitOrder);
            } else {
                this.buyLimitOrder = new LimitOrder(1, price, expectedLowerIE, cascadeVol, buyDcOROS, buyDelta);

                const compensatedOrdersList = this.findCompensatedOrdersList(expectedUpperIE, this.originalDelta, -1);

                if (!compensatedOrdersList.length) {

                    // volume is computed at the next step
                    this.sellLimitOrder = new LimitOrder(-1, price, expectedUpperIE, 0, sellDcOrOS, sellDelta);
                    this.sellLimitOrder.setCompensatedOrders(compensatedOrdersList);
                } else {
                    this.sellLimitOrder = null;
                }
            }
        } else {
            if (!this.disbalancedOrders.length) {

                // if there is no disbalanced orders then we just open a new position.
                this.buyLimitOrder = null;
                this.sellLimitOrder = new LimitOrder(-1, price, expectedUpperIE, cascadeVol, upperIEtype, deltaUp);
                this.computeTargetRelatPnL(this.sellLimitOrder);
            } else {
                const compensatedOrdersList = this.findCompensatedOrdersList(expectedLowerIE, this.originalDelta, 1);

                if (!compensatedOrdersList.length) {
                    this.buyLimitOrder = new LimitOrder(1, price, expectedLowerIE, 0, buyDcOROS, buyDelta); // volume is computed at the next step
                    this.buyLimitOrder.setCompensatedOrders(compensatedOrdersList);
                } else {
                    this.buyLimitOrder = null;
                }
                this.sellLimitOrder = new LimitOrder(-1, price, expectedUpperIE, cascadeVol, sellDcOrOS, sellDelta);
            }
        }
    }

    /**
     * The method finds the index of a runner which should be used at the current inventory.
     * @returns {number} runner
     */
    findProperRunnerIndex() {
        if (Math.abs(this.inventory) < 15) {
            return 0;
        }

        if (Math.abs(this.inventory) >= 15 && Math.abs(this.inventory) < 30) {
            return 1;
        }

        return 2;
    }

    /**
     * Should be called when we consider the buy limit order filled
     * @param {number} price is the current market price
     * @returns {void}
     */
    makeBuyFilled(price) {
        this.inventory += this.buyLimitOrder.getVolume();
        this.correctThresholdsAndVolumes(this.inventory);
        if (this.longShort === 1) {
            this.disbalancedOrders.push(this.buyLimitOrder);
        } else { // the case if the order is de-cascading
            this.positionRealizedProfit += this.buyLimitOrder.getRelativePnL();
            this.removeFromDisbalancedOrders(this.buyLimitOrder.compensatedOrders);
        }
        if (!this.disbalancedOrders.length) {

            // inventory can become equal to 0, so there is no
            // a position in reality. We should close in this case.
            this.closePosition(price);
        }
        this.buyLimitOrder = null;
    }

    /**
     * Should be called when we consider the sell limit order filled
     * @param {number} price is the current market price
     * @returns {void}
     */
    makeSellFilled(price) {
        this.inventory -= this.sellLimitOrder.getVolume();
        this.correctThresholdsAndVolumes(this.inventory);
        if (this.longShort === -1) {
            this.disbalancedOrders.push(this.sellLimitOrder);
        } else {

            // the case if the order is de-cascading
            this.positionRealizedProfit += this.sellLimitOrder.getRelativePnL();
            this.removeFromDisbalancedOrders(this.sellLimitOrder.compensatedOrders);
        }
        if (!this.disbalancedOrders.length) {

            // inventory can become equal to 0, so there is no
            // a position in reality. We should close in this case.
            this.closePosition(price);
        }
        this.sellLimitOrder = null;
    }

    /**
     * The method moves the DC limit order if price goes further then size of the threshold
     * @param {number} expectedDcLevel is the level
     * @returns {void}
     */
    correctOrdersLevel(expectedDcLevel) {
        if (this.buyLimitOrder) {
            this.correctBuyLimitOrder(expectedDcLevel);
        }
        if (this.sellLimitOrder) {
            this.correctSellLimitOrder(expectedDcLevel);
        }
    }

    findCompensatedOrdersList(levelOrder, delta, buySell) {
        const compensatedOrders = [];

        this.disbalancedOrders.forEach(aDisbalancedOrder => {

            if ((aDisbalancedOrder.getLevel() - levelOrder) * buySell >= delta * aDisbalancedOrder.getLevel()) {
                compensatedOrders.push(aDisbalancedOrder);
            }
        });

        return compensatedOrders;
    }

    correctBuyLimitOrder(expectedDcLevel) {
        if (this.buyLimitOrder.getDcORos() === 1) {
            if (this.longShort === 1 || this.disbalancedOrders.length > 1) {
                if (expectedDcLevel > this.buyLimitOrder.getLevel()) {
                    if (this.disbalancedOrders.length > 1 && this.longShort === -1) {
                        const compensatedOrdersList = this.findCompensatedOrdersList(expectedDcLevel, this.originalDelta, 1);

                        if (!compensatedOrdersList.length) {
                            this.buyLimitOrder.setLevel(expectedDcLevel);
                            this.buyLimitOrder.setCompensatedOrders(compensatedOrdersList);
                        } else {
                            this.buyLimitOrder = null;
                        }
                    } else {
                        this.buyLimitOrder.setLevel(expectedDcLevel);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    correctSellLimitOrder(expectedDcLevel) {
        if (this.sellLimitOrder.getDcORos() === 1) {
            if (this.longShort === -1 || this.disbalancedOrders.length > 1) {
                if (expectedDcLevel < this.sellLimitOrder.getLevel()) {
                    if (this.disbalancedOrders.length > 1 && this.longShort === 1) {
                        const compensatedOrdersList = this.findCompensatedOrdersList(expectedDcLevel, this.originalDelta, -1);

                        if (!compensatedOrdersList.length) {
                            this.sellLimitOrder.setLevel(expectedDcLevel);
                            this.sellLimitOrder.setCompensatedOrders(compensatedOrdersList);
                        } else {
                            this.sellLimitOrder = null;
                        }
                    } else {
                        this.sellLimitOrder.setLevel(expectedDcLevel);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    cancelSellLimitOrder() {
        this.sellLimitOrder = null;
    }


    cancelBuyLimitOrder() {
        this.buyLimitOrder = null;
    }

    /**
     * The method corrects thresholds.
     * @param {number} inventory inventory
     * @returns {void}
     */
    correctThresholdsAndVolumes(inventory) {
        if (Math.abs(inventory) < 15) {
            this.uniteSizeFromInventory = this.originalUnitSize;
        } else if (Math.abs(inventory) >= 15 && Math.abs(inventory) < 30) {
            this.uniteSizeFromInventory = this.originalUnitSize / 2;
        } else {
            this.uniteSizeFromInventory = this.originalUnitSize / 4;
        }
    }

    /**
     * The method checks the level returned by the Liquidity indicator and changes unit size.
     * Described on the page 15 of the "Alpha..."
     * @param {number} liquidity liquidity
     * @returns {number} liqUnitCoef liquidity coeff
     */
    computeLiqUniteCoef(liquidity) { // eslint-disable-line
        let liqUnitCoef;

        if (liquidity >= 0.5) {
            liqUnitCoef = 1.0;
        } else if (liquidity >= 0.1 && liquidity < 0.5) {
            liqUnitCoef = 0.5;
        } else {
            liqUnitCoef = 0.1;
        }

        return liqUnitCoef;
    }

    /**
     * The method compares my current total PnL and the assigned target level.
     * @param {Object} price price
     * @returns {boolean} true if the PnL is greater or equal then the target PnL
     */
    positionCrossedTargetPnL(price) {

        // @ts-ignore
        return (this.getPositionTotalPnL(price) >= this.targetAbsPnL);
    }

    /**
     * The method returns total PnL based on realized and unrealized ones.
     * @param {number} price is current market price
     * @returns {number} total PnL
     */
    getPositionTotalPnL(price) {
        return this.getPositionProfit(price);
    }

    /**
     * The method computes total profit of the opened posiition
     * @param {number} price current market price
     * @returns {number} profit of the opened position
     */
    getPositionProfit(price) {
        return this.positionRealizedProfit + this.getPositionUnrealizedProfit(price);
    }

    /**
     * The method computes unrealized profit of the opened position
     * @param {Object} price is current market price
     * @returns {number} unrealized profit
     */
    getPositionUnrealizedProfit(price) {
        if (!this.disbalancedOrders.length) {
            const marketPrice = (this.longShort === 1 ? price.bid : price.ask);

            let unrealizedProfit = 0.0;

            this.disbalancedOrders.forEach(aDisbalancedOrder => {
                const absPriceMove = (marketPrice - aDisbalancedOrder.getLevel()) * aDisbalancedOrder.getType();

                unrealizedProfit += absPriceMove / aDisbalancedOrder.getLevel() * aDisbalancedOrder.getVolume();
            });

            return unrealizedProfit;
        }
        return 0.0;
    }

    /**
     * The method should be called as soon as the current PnL is bigger or equal then the targetPnL.
     * @param {number} price price
     * @returns {void}
     */
    closePosition(price) {
        this.marketOrderToClosePosition(price);
        this.realizedProfit += this.positionRealizedProfit;
        this.positionRealizedProfit = 0.0;
        this.inventory = 0;
        this.cancelBuyLimitOrder();
        this.cancelSellLimitOrder();
        this.correctThresholdsAndVolumes(this.inventory);
    }

    /**
     * The method creates a market order of volume of all disbalanced orders to close the current position
     * @param {Object} price is current market price
     * @returns {boolean} true if no problems
     */
    marketOrderToClosePosition(price) {
        const marketPrice = (this.longShort === 1 ? price.bid : price.ask);

        this.disbalancedOrders.forEach(aDisbalencedOrder => {
            const absPriceMove = (marketPrice - aDisbalencedOrder.getLevel()) * aDisbalencedOrder.getType();

            this.positionRealizedProfit += absPriceMove / aDisbalencedOrder.getLevel() * aDisbalencedOrder.getVolume();
        });

        this.disbalancedOrders = [];

        return true;
    }

    computeTargetRelatPnL(limitOrder) { // eslint-disable-line
        // TODO
    }

    getRealizedProfit() {
        return this.realizedProfit;
    }

    removeFromDisbalancedOrders(compensatedOrders) {
        compensatedOrders.forEach(aCompensatedOrder => {
            this.disbalancedOrders.forEach((aDisbalancedOrder, index) => {
                if (aCompensatedOrder.type === aDisbalancedOrder.type &&
                    aCompensatedOrder.priceOpened === aDisbalancedOrder.priceOpened &&
                    aCompensatedOrder.level === aDisbalancedOrder.level &&
                    aCompensatedOrder.volume === aDisbalancedOrder.volume &&
                    aCompensatedOrder.dcORos === aDisbalancedOrder.dcORos &&
                    aCompensatedOrder.delta === aDisbalancedOrder.delta) {

                    this.disbalancedOrders.splice(index, 1);
                }
            });
        });

    }
}
exports.CoastlineTrader = CoastlineTrader;
