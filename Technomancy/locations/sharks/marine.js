({
    "unlocked": function () { return true; },
    "go_again_text": "Dive",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 1,
            "title": "Deep Sea Casino",
            "run_encounter": function () {
                /* Use a special token for the table in case it gets closed/reopened before the interval clears. */
                const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let table_token = "slots_";
                for (let i = 0; i < 5; i++) {
                    table_token += TOKEN_CHARS.charAt(Math.floor(Math.random() * TOKEN_CHARS.length));
                }
                /* Define all our adventure data we need to keep track of. This lets us later use it without caring if it's in adventure data (it is). */
                if (adventure_data["casino_tokens"] == undefined) {
                    adventure_data["casino_tokens"] = 0;
                }
                if (adventure_data["slots_less"] == undefined) {
                    adventure_data["slots_less"] = 0;
                }
                if (adventure_data["slots_time"] == undefined) {
                    adventure_data["slots_time"] = 1;
                }
                if (adventure_data["slots_reward"] == undefined) {
                    adventure_data["slots_reward"] = 1;
                }
                if (adventure_data["key_piece_1"] == undefined) {
                    adventure_data["key_piece_1"] = 0;
                }
                if (adventure_data["key_piece_2"] == undefined) {
                    adventure_data["key_piece_2"] = 0;
                }
                if (adventure_data["key_piece_3"] == undefined) {
                    adventure_data["key_piece_3"] = 0;
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
                function token_updates() {
                    if (!$("#events").hasClass("hidden") && $("#" + table_token).length != 0) {
                        setTimeout(token_updates, 50);
                        $("#casino_tokens").html(format_num(adventure_data["casino_tokens"]));
                    }
                }
                token_updates();
                /* Run our slot machine! */
                let slot_strength = 0;
                let chars = "ABCDEFabcdefVWXYwvxy$?!";
                chars = chars.slice(adventure_data["slots_less"], chars.length);
                if (adventure_data["slots_double"]) {
                    chars += "$!?$!?$!?$!?$!?*"; /* 5x $!?, then one * */
                }
                function slots() {
                    /* Move up all columns. Sometimes we'll skip one. So 70% chance of skipping a random column. */
                    let colskip = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : -1;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if (j == colskip)
                                continue;
                            let char = "";
                            if (i == 2) {
                                char = chars[Math.floor(Math.random() * chars.length)];
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
                            let time = 300 - (slot_strength * 6);
                            time /= adventure_data["slots_time"];
                            setTimeout(slots, time);
                        }
                        else {
                            /* Slot machine finished, so total up results. */
                            if ($("#" + table_token + " #slot_1_0").html() == $("#" + table_token + " #slot_1_1").html() && $("#" + table_token + " #slot_1_0").html() == $("#" + table_token + " #slot_1_2").html()) { /* All 3 in the center row match. */
                                $("#slot_results").html("You win!");
                                adventure_data["casino_tokens"] += 5 * adventure_data["slots_reward"];
                                /* Check for special symbols and do what they do. */
                                if ($("#" + table_token + " #slot_1_0").html() == "$") {
                                    $("#slot_results").append(" Jackpot! That's a lot of these tokens!");
                                    adventure_data["casino_tokens"] += 95 * adventure_data["slots_reward"]; /* Total of 100 tokens/reward level*/
                                }
                                else if ($("#" + table_token + " #slot_1_0").html() == "?") {
                                    $("#slot_results").append(" Weird. Whats this symbol mean? Hey, you got some gold thing though!");
                                    adventure_data["key_piece_1"]++;
                                }
                                else if ($("#" + table_token + " #slot_1_0").html() == "!") {
                                    $("#slot_results").append(" You're really excited! Oh nice, that's a bit of gold!");
                                    adventure_data["key_piece_2"]++;
                                }
                                else if ($("#" + table_token + " #slot_1_0").html() == "*") {
                                    $("#slot_results").append(" Woah, that's a special character! And a shiny piece of something golden!");
                                    adventure_data["key_piece_3"]++;
                                }
                                /* Color the center row. Because looking nice is always good. */
                                $("#" + table_token + " #slot_1_0").html("<span style='color: yellow'>" + $("#" + table_token + " #slot_1_0").html() + "</span>");
                                $("#" + table_token + " #slot_1_1").html("<span style='color: yellow'>" + $("#" + table_token + " #slot_1_1").html() + "</span>");
                                $("#" + table_token + " #slot_1_2").html("<span style='color: yellow'>" + $("#" + table_token + " #slot_1_2").html() + "</span>");
                            }
                            else if ($("#" + table_token + " #slot_1_0").html() == $("#" + table_token + " #slot_1_1").html() || $("#" + table_token + " #slot_1_1").html() == $("#" + table_token + " #slot_1_2").html()) {
                                $("#slot_results").html("You won! You get... a plastic coin? Come on!");
                                adventure_data["casino_tokens"] += adventure_data["slots_reward"];
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
                if (adventure_data["slots_less"] < 17) { /* Arbitrary value less than 23. */
                    $("#events_content").append("<span class='clickable'>Improve</span> slot machine odds (" + format_num(adventure_data["slots_less"] + 1, false) + " tokens)<br />");
                    $("#events_content span").last().click(() => {
                        if (adventure_data["casino_tokens"] > adventure_data["slots_less"]) {
                            adventure_data["slots_less"]++;
                            adventure_data["casino_tokens"] -= adventure_data["slots_less"];
                            this.run_encounter();
                        }
                    });
                }
                else if (adventure_data["slots_double"] == undefined) {
                    $("#events_content").append("<span class='clickable'>Improve</span> slot machine odds (50 tokens)<br />");
                    $("#events_content span").last().click(() => {
                        if (adventure_data["casino_tokens"] >= 50) {
                            adventure_data["slots_double"] = true;
                            adventure_data["casino_tokens"] -= 50;
                            this.run_encounter();
                        }
                    });
                }
                if (adventure_data["slots_time"] < 7) { /* Arbitrary value. */
                    $("#events_content").append("<span class='clickable'>Increase</span> slot machine speed (" + format_num(adventure_data["slots_time"], false) + " tokens)<br />");
                    $("#events_content span").last().click(() => {
                        if (adventure_data["casino_tokens"] >= adventure_data["slots_time"]) {
                            adventure_data["casino_tokens"] -= adventure_data["slots_time"];
                            adventure_data["slots_time"]++;
                            this.run_encounter();
                        }
                    });
                }
                if (adventure_data["slots_reward"] < 5) { /* Yet another arbitrary value. */
                    let cost = Math.pow(2, adventure_data["slots_reward"]) + adventure_data["slots_reward"];
                    $("#events_content").append("<span class='clickable'>Increase</span> slot machine reward (" + format_num(cost, false) + " tokens)<br />");
                    $("#events_content span").last().click(() => {
                        if (adventure_data["casino_tokens"] >= cost) {
                            adventure_data["casino_tokens"] -= cost;
                            adventure_data["slots_reward"]++;
                            this.run_encounter();
                        }
                    });
                }
                if (adventure_data["luck_key"] === undefined && adventure_data["key_piece_1"] >= 5 && adventure_data["key_piece_2"] >= 5 && adventure_data["key_piece_3"] >= 5) {
                    $("#events_content").append("Hmm, you have a lot of those golden bits. Maybe try to tinker with them and see what you can get<br/>");
                    $("#events_content").append("<button class='fgc bgc_second'>Combine</button> the pieces<br/>");
                    $("#events_content button").last().click(() => {
                        adventure_data["luck_key"] = true;
                        $("#events_content").html("You take some of the parts and manage to put them together into a nice golden key! Sweet, I wonder what it goes to!");
                        $("#events_content").append(exit_button("Done"));
                    });
                }
                if (adventure_data["casino_tokens"] >= 25) { /* They have a bunch of tokens. */
                    $("#events_content").append("<table id='slot_prizes'><caption>Prize Wall</caption></table>");
                    $("#slot_prizes").append("<tr><th>Prize</td><th>Token Cost</td></tr>");
                    $("#slot_prizes").append("<tr><td class='clickable'>500 Steel</td><td>10</td></tr>");
                    $("#slot_prizes td.clickable").last().click(() => {
                        if (adventure_data["casino_tokens"] >= 10) {
                            adventure_data["casino_tokens"] -= 10;
                            resources["steel_beam"].amount += 500;
                        }
                    });
                    $("#slot_prizes").append("<tr><td class='clickable'>250 Fuel</td><td>10</td></tr>");
                    $("#slot_prizes td.clickable").last().click(() => {
                        if (adventure_data["casino_tokens"] >= 10) {
                            adventure_data["casino_tokens"] -= 10;
                            resources["fuel"].amount += 250;
                        }
                    });
                    if (resources["mithril"].amount >= 100) {
                        $("#slot_prizes").append("<tr><td class='clickable'>100 Mithril</td><td>25</td></tr>");
                        $("#slot_prizes td.clickable").last().click(() => {
                            if (adventure_data["casino_tokens"] >= 25) {
                                adventure_data["casino_tokens"] -= 25;
                                resources["mithril"].amount += 100;
                            }
                        });
                    }
                    $("#slot_prizes").append("<tr><td class='clickable'>1 Void</td><td>50</td></tr>");
                    $("#slot_prizes td.clickable").last().click(() => {
                        if (adventure_data["casino_tokens"] >= 50) {
                            adventure_data["casino_tokens"] -= 50;
                            resources["void"].amount += 1;
                        }
                    });
                }
                $("#events_content").append(exit_button("Leave") + " the casino.<br/>");
            } /* End run_encounter*/
        }),
        ({
            "condition": function () { return event_flags["alchemist_ingredients"] != undefined && event_flags["alchemist_ingredients"]["core"] && Math.random() > 0.9; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "Gate",
            "run_encounter": function () {
                $("#events_content").html("Gate.<br/>The gate is.<br/>The gate is the world. Between worlds. Beyond. The gate. The gate. The gate. Gate. Gate.gate.gategategategate.<br /><span class='clickable'>Gate</span>");
                $("#events_content > span").last().click(() => {
                    $("#events_content").html("You obtain it.<br /><span class='clickable' onclick='start_adventure()'>Yay!</span>");
                    adventure_data["alchemy_ingredients"]["Dimensional Core"]++;
                });
            },
        }),
    ],
    "connects_to": ["sharks/abandoned", "sharks/gate"],
    "enter_cost": 7,
    "leave_cost": 3,
    "name": "Marine World",
});
//# sourceMappingURL=marine.js.map