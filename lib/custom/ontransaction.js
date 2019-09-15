"use strict";

const tools = require("../util/tools");

module.exports = ontransaction;

function ontransaction(transaction) {
    const t = transaction;

    if (t.type === "ORDER_FILL") {
        tools.log(t.time, t.id, t.type, t.instrument, t.accountBalance, t.pl);
    }
}
