"use strict";

const tools = require("./tools");
const config = require("./config");


exports.fillOrder = fillOrder;

function fillOrder(order, callback) {
    const url = `${config.apiUrl}/api/order`;

    tools.request({
        method: "POST",
        url,
        body: {
            isPlugin: true,
            instrument: order.instrument,
            units: order.units,
            side: order.side,
            type: order.type,
            expiry: order.expiry,
            price: order.price,
            priceBound: order.lowerBound || order.upperBound,
            stopLossOnFill: order.stopLossOnFill,
            takeProfitOnFill: order.takeProfitOnFill,
            trailingStopLossOnFill: order.trailingStopLossOnFill
        }
    }, (err, res, trade) => {
        if (!err && !trade.errorMessage && !trade.code) {
            return callback(null, trade);
        }

        tools.log("ERROR fillOrder", err || trade.errorMessage || trade.code);

        return callback(err || trade.errorMessage || trade.code);
    });

}
