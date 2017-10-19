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

                    let purchase_amount = resources["money"].amount / 20; /* Each trade they spend 5% of their money */
                    let sold_resources = ["wood", "gold", "oil", "coal", "iron_ore", "iron", "uranium", "steel_beam", "hydrogen"]; /* What kittens have for sale. */
                    sold_resources.forEach(function (resource) {
                        let resource_amount = purchase_amount / resources[resource].value
                        $("#events_content").append("<span class='clickable'>Purchase</span> " + format_num(resource_amount, false) + " " + resource.replace("_", " ") + " (" + format_num(purchase_amount, false) + " money) <br />");
                        $("#events_content > span").last().click(function () {
                            /* Make sure they still have enough money */
                            if (resources["money"].amount >= purchase_amount) {
                                resources["money"].amount -= purchase_amount;
                                resources[resource].amount += resource_amount;
                            }
                            cat_market()
                        });
                    });

                    $("#events_content").append("<span class='clickable' onclick='$(\"#character\").removeClass(\"hidden\");start_adventure()'>Leave</span>");
                });
                $("#events_content").append("<span class='clickable'>Listen</span> to an old cat tell stories<br/>");
                $("#events_content > span").last().click(function cat_market() {
                    $("#events_content").html("The old cat tells a tale about the very start of the civilization. \"It all started with a kitten in a catnip forest...\" <br />You listen to his ever more complex tale, which seems to take years and years to tell - slowly growing more complex, adding in hunters and unicorns and trade with other civilizations. The knowledge of kittens grew and eventually they reached space. What could the future hold for such an ambitious race?<br />If you'd like to experience the full story of kittens, check <a href=\"http://bloodrizer.ru/games/kittens/\" target=\"_blank\" style=\"text- decoration: none; color: lightgray;\">here</a>.<br />");
                    $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Leave</span>");
                });
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Leave</span>");
            },
        }),

    ],
    "connects_to": ["kittens/terminus", "kittens/umbra", "warpgate"],
    "enter_cost": 5,
    "leave_cost": 0,
    "name": "Cath",
})