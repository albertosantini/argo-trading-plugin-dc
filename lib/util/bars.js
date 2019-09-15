"use strict";

const tools = require("./tools");
const config = require("./config");

exports.getHistBars = getHistBars;

function getHistBars(bar, callback) {
    const url = `${config.apiUrl}/api/candles`,
        instrument = bar && bar.instrument || "EUR_USD",
        granularity = bar && bar.granularity || "M5",
        count = bar && bar.count || 100,
        dailyAlignment = bar && bar.dailyAlignment || "0";

    tools.request({
        method: "POST",
        url,
        body: {
            isPlugin: true,
            instrument,
            granularity,
            count,
            dailyAlignment
        }
    }, (err, res, bars) => {
        if (!err && !bars.code) {
            return callback(null, bars.reverse());
        }

        tools.log("ERROR getHistBars", instrument, bars.message);

        return callback(err || bars.code, bars);
    });

}
