/* Ascension burning */
({
    "unlocked": function () { return adventure_data["magic_seals"] == 5; },
    "go_again_text": "Burn more",
    "encounters": [
        ({
            "condition": function () { return adventure_data["tower_ascension"] > 7; },
            "types": [],
            "weight": 0,
            "title": "Ascension Burning",
            "run_encounter": function () {
                const to_spend = adventure_data["tower_ascension"] - 6;

                $("#events_content").html("The acrid fumes and high heat of the planet attempt to burn you, but it's nothing compared to what you've faced. <br/>");
                $("#events_content").append("A demon appears<br/>");
                $("#events_content").append("\"Hey, you look like you've got a lot on your mind. Want to forget something? I offer great deals for quality memories.<br/>");
                $("events_content").append("What do I do with them? Well, it has to do with fire. That's all you get to know.\"");
                $("#events_content").append("<br/>Make a deal with the devil? It will reduce your tower ascension, along with give great rewards.<br />");
                $("#events_content").append("You can spend " + format_num(to_spend) + " more ascensions.<br/>");
                $("#events_content").append("Current deals: <br/>");

                if (adventure_data["deal_key"] == undefined) {
                    $("events_content").append("<button class='fgc bgc_second'>Burn</button> 7 ascensions to get a strange key<br/>");
                    $("#events_content button").last().click(() => {
                        if (to_spend >= 7) {
                            adventure_data["deal_key"] = true;
                            adventure_data["tower_ascension"] -= 7;
                            run_adventure("demons/vexine", false);
                        } else {
                            $("events_content").prepend("You don't have the ascensions to burn on that<br/>");
                        }
                    });
                }

                if (adventure_data["deal_essence"] == undefined) {
                    $("#events_content").append("<button class='fgc bgc_second'>Burn</button> 1 ascension to double essence gain from the small tower<br/>");
                    $("#events_content button").last().click(() => {
                        adventure_data["deal_essence"] = 1;
                        adventure_data["tower_ascension"] -= 1;
                        run_adventure("demons/vexine", false);
                    });
                }

                if (adventure_data["deal_cheap_essence"] == undefined) {
                    $("#events_content").append("<button class='fgc bgc_second'>Burn</button> 1 ascension to reduce essence prices<br/>");
                    $("#events_content button").last().click(() => {
                        adventure_data["deal_cheap_essence"] = 1;
                        adventure_data["tower_ascension"] -= 1;
                        run_adventure("demons/vexine", false);
                    });
                }

                if (adventure_data["deal_mana"] == undefined) {
                    $("#events_content").append("<button class='fgc bgc_second'>Burn</button> 2 ascensions to increase mana<br/>");
                    $("#events_content button").last().click(() => {
                        if (to_spend >= 2) {
                            adventure_data["deal_mana"] = 1;
                            adventure_data["tower_ascension"] -= 2;
                            run_adventure("demons/vexine", false);
                        } else {
                            $("events_content").prepend("You don't have the ascensions to burn on that<br/>");
                        }

                    });
                } else if (adventure_data["deal_mana"] == 1) {
                    $("#events_content").append("<button class='fgc bgc_second'>Burn</button> 3 ascensions to increase mana<br/>");
                    $("#events_content button").last().click(() => {
                        if (to_spend >= 3) {
                            adventure_data["deal_mana"] = 2;
                            adventure_data["tower_ascension"] -= 3;
                            run_adventure("demons/vexine", false);
                        } else {
                            $("events_content").prepend("You don't have the ascensions to burn on that<br/>");
                        }

                    });
                } else if (adventure_data["deal_mana"] == 2) {
                    $("#events_content").append("<button class='fgc bgc_second'>Burn</button> 6 ascensions to increase mana<br/>");
                    $("#events_content button").last().click(() => {
                        if (to_spend >= 6) {
                            adventure_data["deal_mana"] = 3;
                            adventure_data["tower_ascension"] -= 6;
                            run_adventure("demons/vexine", false);
                        } else {
                            $("events_content").prepend("You don't have the ascensions to burn on that<br/>");
                        }

                    });
                }
                $("#events_content").append(exit_button("Done"));
            }
        }),
        ({
            "condition": function () { return adventure_data["tower_ascension"] <= 7; },
            "types": [],
            "weight": 0,
            "title": "Pain",
            "run_encounter": function () {
                $("#events_content").html("The pain...<br />The acrid fumes of this planet burn you, and the heat is nearly unbearable.<br />");
                $("#events_content").append("You can't stay here. You're not strong enough.<br/>");
                $("#events_content").append("<i>(Come back at a higher tower ascension)</i>");
                $("#events_content").append(exit_button("Done"));
            }
        })
    ],
    "connects_to": ["demons/mars", "demons/seals", "demons/gates"],
    "enter_cost": 2,
    "leave_cost": 0,
    "name": "Vexine",
})