"use strict";

var test = require("tape");
var dc = require("../lib/signals/dc");

test("aroonUp", function (t) {
    var uptrends = [
            {pext: 1.29840, pos: 1.29990},
            {pext: 1.30038, pos: 1.30175},
            {pext: 1.29940, pos: 1.30072},
            {pext: 1.30065, pos: 1.30200}
        ],
        aroon;

    aroon = dc.aroonUp(uptrends, 3);

    t.plan(2);

    t.equal(aroon.ups[0], 1, "aroon uptrends ups");
    t.equal(aroon.downs[0], 0, "aroon uptrends downs");
});

test("aroonDown", function (t) {
    var downtrends = [
            {pext: 1.30245, pos: 1.30090},
            {pext: 1.30224, pos: 1.30081},
            {pext: 1.30238, pos: 1.30105},
            {pext: 1.30430, pos: 1.30293}
        ],
        aroon;

    aroon = dc.aroonDown(downtrends, 3);
    console.log(aroon);

    t.plan(2);

    t.equal(aroon.ups[0], 0.3333333333333333, "aroon downtrends ups");
    t.equal(aroon.downs[0], 1, "aroon downtrends downs");
});
