({
    "unlocked": function () { return buildings["s_manastone"].amount >= 200; },
    "go_again_text": "Enter Gate",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Gate of Reality",
            "run_encounter": function challenge_display() {
                /* Add this as a warp location. */
                if (adventure_data["warp_locations"].indexOf("sharks/gate") == -1) {
                    adventure_data["warp_locations"].push("sharks/gate");
                }

                function challenge_info(number, startfunc) {
                    let name = CHALLENGE_INFO[number].name;
                    let description = CHALLENGE_INFO[number].description;
                    let requirements = CHALLENGE_INFO[number].requirements;
                    let restrictions = CHALLENGE_INFO[number].restrictions;
                    let reward = CHALLENGE_INFO[number].reward;

                    $("#events_content").html(name);
                    if (adventure_data["challenges_completed"][number]) { $("#events_content").append(" (Completed)") };
                    $("#events_content").append("<table id='challenge_table'></table>");
                    $("#challenge_table").append("<tr><th align='right'>Description:</th><td align='left'>" + description + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Completion Requirements:</th><td align='left'>" + requirements + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Challenge Restrictions:</th><td align='left'>" + restrictions + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Challenge Reward:</th><td align='left'>" + reward + "</td>");

                    $("#events_content").append("<span class='clickable'>Start!</span>");
                    $("#events_content span").last().click(function () {
                        if (confirm("Are you sure you want to start this challenge?")) {
                            prestige.run(false, function () { /* When they finish, they get to keep mana from prestige. */
                                adventure_data["challenge"] = number; /* Set challenge number to whatever challenge ID they're doing. */
                                adventure_data["challenge_mana"] = buildings["s_manastone"].amount; /* Save old amount of mana */
                                startfunc(); /* Run the start-of-run function for their challenge, which will reset their mana. */
                            });
                        }
                    });
                    $("#events_content").append("<span class='clickable'>Not Yet</span>");
                    $("#events_content span").last().click(challenge_display);
                }
                $("#events_content").html("A gateway exists here. It's older than the one you've been using and much more powerful.<br/>");
                $("#events_content").append("You can use it to travel to alternate worlds, similar to your own.<br/>");
                $("#events_content").append("By conquering other worlds, you can become even stronger.<br/><br/>");

                $("#events_content").append("Challenges</br>");

                if (adventure_data["challenge"] == undefined) {
                    adventure_data["challenge"] = 0;
                }
                if (adventure_data["challenges_completed"] == undefined) {
                    adventure_data["challenges_completed"] = Array(CHALLENGES.TOTAL_AMOUNT).fill(false); /* Completed no challenges. */
                }
                if (adventure_data["challenges_completed"].length < CHALLENGES.TOTAL_AMOUNT) { /* If not enough challenges in here, add them. */
                    adventure_data["challenges_completed"] = adventure_data["challenges_completed"].concat(Array(CHALLENGES.TOTAL_AMOUNT - adventure_data["challenges_completed"].length).fill(false));
                }

                if (adventure_data["challenges_completed"][CHALLENGES.BASIC]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Basic Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.BASIC, function () {
                        /* Basic challenge adds no special restrictions, so just reset mana */
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.POVERTY]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Poverty Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.POVERTY, function () {
                        /* Restriction here is coded elsewhere. Just reset mana. */
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.METEORS]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Meteor Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.METEORS, function () {
                        /* Coded in the events system.  */
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.LOAN]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> A Small Loan<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.LOAN, function () {
                        buildings["s_manastone"].amount = 100; /* They can have a good bit of mana */
                        resources["money"].amount = 1000000; /* ALL the money! */
                        buildings["s_challenge"].generation["money"] = -30; /* Here's the cost to it. */
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.CASCADE]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Cascade<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.CASCADE, function () {
                        /* Coded in the buy/sell system.  */
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.DISCO]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Disco<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.DISCO, function () {
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["challenges_completed"][CHALLENGES.NO_UPGRADE]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> No Upgrade<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info(CHALLENGES.NO_UPGRADE, function () {
                        buildings["s_manastone"].amount = 0;
                    });
                });

                if (adventure_data["tower_floor"] > 50 || adventure_data["challenges_completed"][CHALLENGES.FORCED_PRESTIGE]) {
                    if (adventure_data["challenges_completed"][CHALLENGES.FORCED_PRESTIGE]) {
                        $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                    }
                    $("#events_content").append("<span class='clickable'>Info</span> 3 Minute Challenge<br/>");
                    $("#events_content span").last().click(function () {
                        challenge_info(CHALLENGES.FORCED_PRESTIGE, function () {
                            buildings["s_manastone"].amount = 0;
                        });
                    });
                }

            }
        }),
    ],
    "connects_to": [],
    "enter_cost": 9,
    "leave_cost": 0,
    "name": "A Gate Between Worlds",
})