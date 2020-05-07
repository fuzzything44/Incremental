({
    "unlocked": function () { return adventure_data["cath_discovery"] >= 3; },
    "go_again_text": "Follow a kitten",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "Cats... cats everywhere!",
            "run_encounter": function () {
                $("#events_content").html("This is Cath, the home planet of the kittens. They are known for their trading empire and knowledge about the layout of the stars. <br />");
                $("#events_content").append("<span class='clickable'>Wander</span> the market<br/>");
                $("#events_content > span").last().click(function cat_market() {
                    $("#character").addClass("hidden"); /* Hide char pane so they can see what they have. */
                    $("#events_content").html("You wander the market and find many goods for sale. You have <span id='cath_money'>" + format_num(resources["money"].amount) + "</span> money to spend.<br />");
                    let purchase_amount = resources["money"].amount / 10; /* How much money they can spend on a trade */
                    purchase_amount = clamp(purchase_amount, 50000, 10000 * Math.log(purchase_amount));
                    let sold_resources = ["wood", "gold", "oil", "coal", "iron_ore", "iron", "uranium", "steel_beam", "hydrogen"]; /* What kittens have for sale. */
                    if (event_flags["bribed_politician"] == "environment" && event_flags["crisis_averted"]) {
                        sold_resources.push("book");
                    }
                    sold_resources.forEach(function (resource) {
                        if (event_flags["c_sell_" + resource] == undefined) {
                            event_flags["c_sell_" + resource] = 0;
                        }
                        let resource_amount = purchase_amount / (resources[resource].value * 2);
                        if (event_flags["c_sell_" + resource] < Date.now() - 60000 * 10) { /* Each resource can only be bought once every 10 minutes. */
                            $("#events_content").append("<span class='clickable'>Purchase</span> " + format_num(resource_amount, false) + " " + resource.replace("_", " ") + " (" + format_num(purchase_amount, false) + " money) <br />");
                            $("#events_content > span").last().click(function () {
                                /* Make sure they still have enough money */
                                if (resources["money"].amount >= purchase_amount) {
                                    resources["money"].amount -= purchase_amount;
                                    resources[resource].amount += resource_amount;
                                }
                                event_flags["c_sell_" + resource] = Date.now();
                                cat_market();
                                setTimeout(60000 * 10, function () {
                                    if (localStorage["cath_notify"] == "true") {
                                        $("#events_topbar").html("Cath Resources Available!");
                                        $("#events_content").html("You can now buy more " + resource.replace("_", " ") + " at Cath!");
                                        $("#events").removeClass("hidden");
                                    }
                                });
                            });
                        }
                    });
                    if (adventure_data["logicat_level"] >= 10 && adventure_data["piscine_unlocked"] == undefined) {
                        $("#events_content").append("<span class='clickable'>Purchase</span> a starchart (5,000 book)<br />");
                        $("#events_content > span").last().click(function () {
                            /* Make sure they still have enough money */
                            if (resources["book"].amount >= 5000) {
                                resources["book"].amount -= 5000;
                                adventure_data["piscine_unlocked"] = true;
                                $("#events_content").html("You purchase the chart. Apparently there's a new planet somewhere near Terminus.");
                            }
                            else {
                                cat_market();
                            }
                        });
                    }
                    if (adventure_data["tower_floor"] > 40 && adventure_data["omega_planet_unlocked"] == undefined) {
                        $("#events_content").append("<span class='clickable'>Purchase</span> a starchart (25,000 book)<br />");
                        $("#events_content > span").last().click(function () {
                            /* Make sure they still have enough money */
                            if (resources["book"].amount >= 25000) {
                                resources["book"].amount -= 25000;
                                adventure_data["omega_planet_unlocked"] = true;
                                $("#events_content").html("You purchase the chart. Apparently there's a new planet somewhere near Mars (check out the Moon when you have a ton of mana).");
                            }
                            else {
                                cat_market();
                            }
                        });
                    }
                    if ((find_item("conv_key") != -1 ||
                        adventure_data["deal_key"] !== undefined ||
                        adventure_data["luck_key"] !== undefined ||
                        adventure_data["sacrifice_key"] !== undefined)
                        && adventure_data["gates_unlocked"] == undefined) {
                        $("#events_content").append("<span class='clickable'>Purchase</span> a black market map of the demon's realm (" + format_num(100000) + " " + OMEGA + ") <br />");
                        $("#events_content > span").last().click(function () {
                            /* Make sure they still have enough money */
                            if (resources[OMEGA].amount >= 100000) {
                                resources[OMEGA].amount -= 100000;
                                adventure_data["gates_unlocked"] = true;
                                $("#events_content").html("You purchase the chart. It's blackened and burnt in places, but shows you something strange near Vexine.");
                            }
                            else {
                                cat_market();
                            }
                        });
                    }
                    $("#events_content").append("<span class='clickable' onclick='$(\"#character\").removeClass(\"hidden\");start_adventure()'>Leave</span>");
                });
                $("#events_content").append("<span class='clickable'>Listen</span> to an old cat tell stories<br/>");
                $("#events_content > span").last().click(function cat_market() {
                    $("#events_content").html("The old cat tells a tale about the very start of the civilization. \"It all started with a kitten in a catnip forest...\" <br />You listen to his ever more complex tale, which seems to take years and years to tell - slowly growing more complex, adding in hunters and unicorns and trade with other civilizations. The knowledge of kittens grew and eventually they reached space. What could the future hold for such an ambitious race?<br />If you'd like to experience the full story of kittens, check <a href=\"http://bloodrizer.ru/games/kittens/\" target=\"_blank\" style=\"text- decoration: none; color: lightgray;\">here</a>.<br />");
                    $("#events_content").append(exit_button("Leave"));
                });
                $("#events_content").append(exit_button("Leave"));
            },
        }),
    ],
    "connects_to": ["kittens/terminus", "kittens/umbra", "warpgate"],
    "enter_cost": 5,
    "leave_cost": 0,
    "name": "Cath",
});
//# sourceMappingURL=cath.js.map