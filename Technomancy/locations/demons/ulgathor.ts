/* 
    Omega machine planet
*/
({
    "unlocked": function () { return adventure_data["omega_planet_unlocked"]; },
    "go_again_text": "Bank",
    "encounters": [
        ({
            "condition": function () { return adventure_data["omega_intro"] == undefined; },
            "types": [],
            "weight": 0,
            "title": "Banking with Demons",
            "run_encounter": function () {
                adventure_data["omega_intro"] = true;
                adventure_data["warp_locations"].push("demons/ulgathor");

                $("#events_content").html("You arrive at Ulgathor. It's a nasty smelling planet with no plant life that you can see. Skyscrapers go on for miles. Is this planet one giant city?<br/>");
                $("#events_content").append("Just when you think you're lost, you see something ahead of you - a giant " + OMEGA + " symbol.<br/>");
                $("#events_content").append("Huh, that looks familiar somehow. When you go to it, you find it's the symbol for some sort of interdimensional bank.");
                $("#events_content").append("You note the location of the bank and go back to your ship before getting fully lost.<br />");
                $("#events_content").append(exit_button("Done"));
            }
        }),
        ({
            "condition": function () { return adventure_data["omega_intro"]; },
            "types": [],
            "weight": 0,
            "title": "Banking with Demons",
            "run_encounter": function omega_bank() {
                if (adventure_data["omegas_banked"] == undefined) {
                    adventure_data["omegas_banked"] = 0;
                    $("#events_content").html("You head back to the bank. There, you decide to set up an account. It seems that they bank in " + OMEGA + " instead of regular money. Would you like to deposit any?<br />");

                } else {
                    $("#events_content").html("You head back to the bank. Would you like to deposit any of your " + OMEGA + "? (You currently have " + format_num(adventure_data["omegas_banked"]) + " banked and " + format_num(resources[OMEGA].amount) + " on hand)<br />");
                }

                $("#events_content").append("<span class='clickable'>Deposit</span> <input id='omega_deposit' class='fgc bgc_second' type='number' min='0' value='1'><br/>");
                $("#events_content span").last().click(function () {
                    let bank_amount = Math.round(parseFloat($("#omega_deposit").val()));
                    if (isNaN(bank_amount) || bank_amount < 0) { bank_amount = 0; }

                    if (resources[OMEGA].amount > bank_amount) {
                        resources[OMEGA].amount -= bank_amount;
                        adventure_data["omegas_banked"] += bank_amount;
                    }

                    omega_bank();
                });

                if (adventure_data["omegas_banked"] && adventure_data["omega_upgrades"] == undefined) {
                    $("#events_content").append("Also, through some byzantine regulations you don't understand, you're apparently not able to withdraw any omegas. That kind of sucks.<br />");
                }

                if (adventure_data["omega_upgrades"] != undefined) {
                    class omega_upgrade {
                        name: string;
                        description: string;
                        costs: number[];
                        purchase: any

                        constructor(name: string, desc: string, costs: number[], on_purchase) {
                            this.name = name;
                            this.description = desc;
                            this.costs = costs;
                            this.purchase = on_purchase;
                        }
                    }
                    const OMEGA_UPGRADES = [
                        [
                            new omega_upgrade("Flux Capacitor", "Increases maximum mana", [1000, 5000, 10000, 100000], function (n) {
                                adventure_data["max_mana"] += 100000;
                            }),
                            new omega_upgrade("Batch Refining", "Increases maximum refinement batch size", [5000, 10000, 25000, 250000], function (n) {
                                adventure_data["max_refine"] += 10000;
                            }),
                            new omega_upgrade("Essence Hyperlooping", "Increases essence effectiveness", [100000, 250000, 500000, 3333333], function (n) {

                            }),
                        ],
                    ];

                    $("#events_content").append("Also, you're allowed to spend some of your " + OMEGA + " on various upgrades.<br/><table id='omega_upgrades' border='1'></table>");
                    for (let i = 0; i < adventure_data["omega_upgrades"].length; i++) {
                        let upgrade_line = OMEGA_UPGRADES[i];

                        $("#omega_upgrades").append('<tr></tr>');
                        for (let j = 0; j < upgrade_line.length; j++) {
                            let upgrade = upgrade_line[j];
                            let upgrade_level = adventure_data["omega_upgrades"][i][j];

                            let upgrade_cost = upgrade_level < 4 ? format_num(upgrade.costs[upgrade_level]) : "MAX";
                            $("#omega_upgrades tr").last().append("<td class='tooltip level_" + upgrade_level + "'>" + upgrade.name + "<br/>" + upgrade_cost + "<span class='tooltiptext fgc bgc_second'>" + upgrade.description + "</span></td>");
                            if (upgrade_level < 4) {
                                $("#omega_upgrades td").last().click(function () {
                                    if (adventure_data["omegas_banked"] >= upgrade.costs[upgrade_level]) {
                                        adventure_data["omegas_banked"] -= upgrade.costs[upgrade_level];
                                        adventure_data["omega_upgrades"][i][j]++;
                                        upgrade.purchase(upgrade_level);
                                        omega_bank();
                                    }
                                });
                            }

                        }
                    }
                } /* End omega upgrades*/

                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["demons/mars"],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "Ulgathor",
})