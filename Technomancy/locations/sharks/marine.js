({
    "unlocked": function () { return true; },
    "go_again_text": "Dive",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Deep Sea Casino",
            "run_encounter": function () {
                /* Use a special token for the table in case it gets closed/reopened before the interval clears. */
                var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var table_token = "slots_";
                for (var i = 0; i < 5; i++) {
                    table_token += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
                }
                $("#character").addClass("hidden");
                $("#events_content").html("Welcome to the Casino of Bad Slot Machines!<br />");
                $("#events_content").append("You currently have <span id='casino_tokens'>0</span> casino tokens!");
                $("#events_content").append("<table id='" + table_token + "'>" +
                    "<tr>" +
                    "<td id='slot_0_0'>A</td>" +
                    "<td id='slot_0_1'>v</td>" +
                    "<td id='slot_0_2'>Q</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td id='slot_1_0'>S</td>" +
                    "<td id='slot_1_1'>l</td>" +
                    "<td id='slot_1_2'>v</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td id='slot_2_0'>R</td>" +
                    "<td id='slot_2_1'>s</td>" +
                    "<td id='slot_2_2'>N</td>" +
                    "</tr>" +
                    "</table><br />");
                /* Run our slot machine! */
                var slot_strength = 0;
                function slots() {
                    /* Move up all columns. Sometimes we'll skip one. So 70% chance of skipping a random column. */
                    var colskip = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : -1;
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            if (j == colskip)
                                continue;
                            var char = "*";
                            if (i == 2) {
                                var CHARS_1 = "ABCDEFabcdefVWXYwvxy$?!";
                                char = CHARS_1[Math.floor(Math.random() * CHARS_1.length)];
                            }
                            else {
                                char = $("#" + table_token + " #slot_" + (i + 1).toString() + "_" + j.toString()).html();
                            }
                            $("#" + table_token + " #slot_" + i.toString() + "_" + j.toString()).html(char);
                        }
                    }
                    /* If events is hidden (they closed it) or we can't find the slot table, we're done. Clear it. */
                    if (!$("#events").hasClass("hidden") && $("#" + table_token).length != 0) {
                        slot_strength--;
                        if (slot_strength > 0) {
                            setTimeout(slots, 300 - (slot_strength * 6));
                        }
                        else {
                            /* Slot machine finished, so total up results. */
                            if ($("#" + table_token + " #slot_1_0").html() == $("#" + table_token + " #slot_1_1").html() && $("#" + table_token + " #slot_1_0").html() == $("#" + table_token + " #slot_1_2").html()) {
                                $("#slot_results").html("You win!");
                                resources["money"].amount += 10000000; /* Give a laughable 10M */
                                if ($("#" + table_token + " #slot_1_0").html() == "$") {
                                    $("#slot_results").append(" Jackpot!");
                                    resources["money"].amount += 100000000; /* Give a laughable 100M */
                                }
                            }
                            else {
                                $("#slot_results").html("You lose :(");
                            }
                        }
                    }
                }
                ;
                $("#events_content").append("<span class='clickable'>Play</span> the slot machine (1M money)<br />");
                $("#events_content").append("<div id='slot_results'></div>");
                $("#events_content span").last().click(function () {
                    if (resources["money"].amount >= 1000000 && slot_strength <= 0) {
                        resources["money"].amount -= 1000000;
                        slot_strength = Math.round(Math.random() * 30) + 20;
                        slots();
                    }
                });
                return;
            }
        }),
    ],
    "connects_to": ["sharks/abandoned"],
    "enter_cost": 7,
    "leave_cost": 3,
    "name": "Marine World",
});
//# sourceMappingURL=marine.js.map