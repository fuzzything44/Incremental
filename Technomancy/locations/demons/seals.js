({
    "unlocked": function () { return adventure_data["magic_seals"] != undefined; },
    "go_again_text": "View Seals",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "The Seals",
            "run_encounter": function seals() {
                $("#events_topbar").html("The Seals of Eternity");
                $("#events_content").html("The 5 Seals of Eternity lie here.<br/>");
                $("#events_content").append("Each seal broken gives an (additive) +50% mana bonus.<br/>");
                let cost_list = [
                    {
                        "text": format_num(100 * get_extension("Qa")) + " money",
                        "can_buy": function () { return resources["money"].amount >= 100 * get_extension("Qa"); },
                        "buy": function () {
                            resources["money"].amount -= 100 * get_extension("Qa");
                        },
                    },
                    {
                        "text": format_num(250000) + " mana stones",
                        "can_buy": function () { return buildings["s_manastone"].amount > 250000; },
                        "buy": function () {
                            buildings["s_manastone"].amount -= 250000;
                            resources_per_sec["mana"] -= 250000;
                            update_building_amount("s_manastone");
                        },
                    },
                    {
                        "text": format_num(10000) + " essence",
                        "can_buy": function () { return adventure_data["current_essence"] > 10000; },
                        "buy": function () {
                            spend_essence(10000);
                        },
                    },
                    {
                        "text": "free, once you beat the UDM challenge",
                        "can_buy": function () { return adventure_data["challenges_completed"].length > CHALLENGES.UDM && adventure_data["challenges_completed"][CHALLENGES.UDM]; },
                        "buy": function () {
                        },
                    },
                    {
                        "text": "The small key",
                        "can_buy": function () { return count_item("conv_key", adventure_data.warehouse) + count_item("conv_key", adventure_data.inventory) > 0; },
                        "buy": function () {
                            let item_loc = find_item("conv_key", adventure_data.warehouse);
                            if (item_loc == -1) {
                                item_loc = find_item("conv_key", adventure_data.inventory);
                                adventure_data.inventory.splice(item_loc, 1);
                            }
                            else {
                                adventure_data.warehouse.splice(item_loc, 1);
                            }
                        },
                    },
                ];
                if (adventure_data["magic_seals"] < 5) {
                    let cost = adventure_data["magic_seals"];
                    $("#events_content").append("You can <span class='clickable'>shatter</span> the next one for " + cost_list[cost].text + "<br/>");
                    $("#events_content span").last().click(function () {
                        if (cost_list[cost].can_buy()) {
                            cost_list[cost].buy();
                            adventure_data["magic_seals"]++;
                            seals();
                        }
                        else {
                            $("#events_content").prepend("You can't break this seal yet.<br/>");
                        }
                    });
                }
                if (adventure_data["magic_seals"] == 5 && adventure_data["sacrifice_key"] === undefined) {
                    $("#events_content").append("The seals are all broken. You feel a calling to sacrifice yourself.<br/>");
                    $("#events_content").append("Warning: this will enact a heavy cost. You may not gain anything for a long time.<br/>");
                    $("#events_content").append("<button class='fgc bgc_second>Sacrifice</button><br/>");
                    $("#events_content button").last().click(() => {
                        adventure_data["sacrifice_key"] = true;
                        adventure_data["tower_power"] = Math.floor(adventure_data["tower_power"] / 10);
                        adventure_data["tower_toughness"] = Math.floor(adventure_data["tower_toughness"] / 10);
                        spend_essence(adventure_data["current_essence"] - 1);
                        $("#events_content").html("It is done. You receive a bone key for your sacrifice.");
                        prestige.mana = () => 1;
                        prestige.run(false);
                    });
                }
                $("#events_content").append("<br/><div id='seal_area' style='position: relative;'></div>");
                $("#seal_area").append("<svg height='400' width='400' style='position: absolute; top: 5em; left: 285px;'><polygon points='200,20 80,396 380,156 20,156 320,396' style='stroke: red; stroke-width: 5; position: absolute;'/></svg>");
                /* Draw the seal images, switching image depending on if it's broken */
                if (adventure_data["magic_seals"] < 1) {
                    $("#seal_area").append("<img src='images/seal_locked.png' alt='' style='position: absolute; top: 45px; left: 435px;'/>");
                }
                else {
                    $("#seal_area").append("<img src='images/seal_unlocked.png' alt='' style='position: absolute; top: 45px; left: 435px;'/>");
                }
                if (adventure_data["magic_seals"] < 2) {
                    $("#seal_area").append("<img src='images/seal_locked.png' alt='' style='position: absolute; top: 180px; left: 255px;'/>");
                }
                else {
                    $("#seal_area").append("<img src='images/seal_unlocked.png' alt='' style='position: absolute; top: 180px; left: 255px;'/>");
                }
                if (adventure_data["magic_seals"] < 3) {
                    $("#seal_area").append("<img src='images/seal_locked.png' alt='' style='position: absolute; top: 422px; left: 315px;'/>");
                }
                else {
                    $("#seal_area").append("<img src='images/seal_unlocked.png' alt='' style='position: absolute; top: 422px; left: 315px;'/>");
                }
                if (adventure_data["magic_seals"] < 4) {
                    $("#seal_area").append("<img src='images/seal_locked.png' alt='' style='position: absolute; top: 422px; left: 555px;'/>");
                }
                else {
                    $("#seal_area").append("<img src='images/seal_unlocked.png' alt='' style='position: absolute; top: 422px; left: 555px;'/>");
                }
                if (adventure_data["magic_seals"] < 5) {
                    $("#seal_area").append("<img src='images/seal_locked.png' alt='' style='position: absolute; top: 180px; left: 625px;'/>");
                }
                else {
                    $("#seal_area").append("<img src='images/seal_unlocked.png' alt='' style='position: absolute; top: 180px; left: 625px;'/>");
                }
                return;
            }
        }),
    ],
    "connects_to": ["demons/ulgathor", "demons/vexine"],
    "enter_cost": 5,
    "leave_cost": 0,
    "name": "The Seals of Eternity",
});
//# sourceMappingURL=seals.js.map