({
    "unlocked": function () { return adventure_data["gates_unlocked"] === true; },
    "go_again_text": "Look",
    "encounters": [
        ({
            "condition": function () { return adventure_data["gates_open"] !== 4; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "The 4 Demon Gates",
            "run_encounter": function gates () {
                $("#events_content").html("You arrive on a planet with scorch marks all around and an acrid, sulfuric smell. Before you lie 4 massive doors, each with a single keyhole and what seems to be nothing behind them.<br/>");

                if (adventure_data["gates_open"] === undefined) {
                    adventure_data["gates_open"] = 0;
                }

                $("#events_content").append("The first gate seems to have some sort of clockwork designs drawn on it.<br/>");
                if (adventure_data["knowledge_gate"] === true) {
                    $("#events_content").append("You've opened this gate already.<br/>");
                } else {
                    if (find_item("conv_key") !== -1) {
                        $("#events_content").append("<button class='fgc bgc_second'>Insert</button> your convolution key into the gate<br/>");
                        $("#events_content button").last().click(() => {
                            if (find_item("conv_key") !== -1) {
                                adventure_data["knowledge_gate"] = true;
                                adventure_data["gates_open"]++;
                                $("#events_content").append("You insert your key into the lock and hear a loud \"clunk\" sound. ");
                                $("#events_content").append("The gate slowly swings open. Behind it, instead of seeing the planet you're on, there's a shifting kaleidoscope of diagrams and symbols. It almost seems to pull you in.<br/>");
                                $("#events_content").append("You're not sure exactly what happened in there, but you feel... smarter?<br/>");
                                $("#events_content").append("<b>Congratulations! You have conquered the Gate of Knowledge!</b><br/>");
                                $("#events_content").append(exit_button("Done"));
                            } else {
                                gates();
                                $("#events_content").prepend("Huh?<br/>");
                            }
                        });
                    }
                }

                $("#events_content").append("The second gate has a fist engraved in it.<br/>");
                if (adventure_data["strength_gate"] === true) {
                    $("#events_content").append("You've opened this gate already.<br/>");
                } else {
                    if (adventure_data["deal_key"] !== undefined) {
                        $("#events_content").append("<button class='fgc bgc_second'>Insert</button> your demonic key into the gate<br/>");
                        $("#events_content button").last().click(() => {
                            adventure_data["strength_gate"] = true;
                            adventure_data["gates_open"]++;
                            $("#events_content").append("You insert your key into the lock and hear a loud \"clunk\" sound. ");
                            $("#events_content").append("The gate slowly swings open. Behind it, instead of seeing the planet you're on, there's a fire burning so hot it's emitting colors you've never seen before. A few meters in, there's a bare patch with a metalic silver floor. You run towards that patch before the fire consumes you. <br/>");
                            $("#events_content").append("It burns your flesh and skin, but you keep going.<br/>");
                            $("#events_content").append("Finally, you reach the bare patch. The fire instantly goes out and you feel... stronger?<br/>")
                            $("#events_content").append("<b>Congratulations! You have conquered the Gate of Strength!</b><br/>");
                            $("#events_content").append(exit_button("Done"));
                        });
                    }
                }

                $("#events_content").append("The third gate is made entirely of gold.<br/>");
                if (adventure_data["luck_gate"] === true) {
                    $("#events_content").append("You've opened this gate already.<br/>");
                } else {
                    if (adventure_data["luck_key"] !== undefined) {
                        $("#events_content").append("<button class='fgc bgc_second'>Insert</button> your golden key into the gate<br/>");
                        $("#events_content button").last().click(() => {
                            adventure_data["luck_gate"] = true;
                            adventure_data["gates_open"]++;
                            $("#events_content").append("You insert your key into the lock and hear a loud \"clunk\" sound. ");
                            $("#events_content").append("The gate slowly swings open. Behind it, instead of seeing the planet you're on, you see a familiar casino. A card dealer beckons you in.<br/>");
                            $("#events_content").append("You sit down to play a game of blackjack. On the first round, you're passed an ace and a king. Blackjack.<br/>");
                            $("#events_content").append("On the second round, you're passed an ace and a jack. Blackjack.<br/>");
                            $("#events_content").append("On the third round, you're passed an ace and a king again. Blackjack.<br/>");
                            $("#events_content").append("On the fourth round, you're passed an ace and a queen. Blackjack.<br/>");
                            $("#events_content").append("At this point, you're getting suspicious. You ask to see the deck, and it's still random. Somehow you feel... luckier?<br/>")
                            $("#events_content").append("<b>Congratulations! You have conquered the Gate of Luck!</b><br/>");
                            $("#events_content").append(exit_button("Done"));
                        });
                    }
                }

                $("#events_content").append("The fourth gate seems to be on fire.<br/>");
                if (adventure_data["sacrifice_gate"] === true) {
                    $("#events_content").append("You've opened this gate already.<br/>");
                } else {
                    if (adventure_data["sacrifice_key"] !== undefined) {
                        $("#events_content").append("<button class='fgc bgc_second'>Insert</button> your bone key into the gate<br/>");
                        $("#events_content button").last().click(() => {
                            adventure_data["sacrifice_gate"] = true;
                            adventure_data["gates_open"]++;
                            $("#events_content").append("You insert your key into the lock and hear a loud \"clunk\" sound. ");
                            $("#events_content").append("The gate slowly swings open. Behind it, instead of seeing the planet you're on, you see nothing. Just the blank void of space, except not even the stars are there.<br/>");
                            $("#events_content").append("What does it mean? You feel like you knew at one point, but lost the memory.<br/>");
                            $("#events_content").append("Maybe you never knew in the first place.<br/>");
                            $("#events_content").append("You feel hollow inside. <br/>")
                            $("#events_content").append("<b>Congratulations! You have conquered the Gate of Sacrifice!</b><br/>");
                            $("#events_content").append(exit_button("Done"));
                        });
                    }
                }
                $("#events_content").append(exit_button("Done"));
            }
        }),
        ({
            "condition": function () { return adventure_data["gates_open"] === 4; },
            "types": ["noncombat"],
            "weight": 0,
            "title": "The End of the Line",
            "run_encounter": function () {
                $("#events_content").html("All the gates have been conquered. You now see a final, 5th gate. It shifts and turns like a mirage.<br/>");
                $("#events_content").append("There is no keyhole. You may enter at your leisure.<br/>")

                $("#events_content").append("<button class='fgc bgc_second'>Enter</button><br/>");
                $("#events_content button").last().click(() => {
                    adventure_data["current_location"] = "demons/final";
                    $("#events_content").html("You enter.<br/>");
                    $("#events_content").append(exit_button("Done"));
                });
                $("#events_content").append(exit_button("Done"));
            }
        })
    ],
    "connects_to": ["demons/vexine"],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The 4 Demon Gates",
})