var event_flags = {};
var events = [
    ({
        "condition": function () { return true; },
        "run_event": function () {
            add_log_elem("Nothing interesting happened.");
            throw Error("Nope, we're not doing an event.");
        },
        "name": "",
        "rejection": 0,
    }),
    ({
        "condition": function () { return buildings["bank"].amount > 3; },
        "run_event": function () {
            /* Gain 0-29s of bank raw money production + 10 money for those with few banks. Capped at 200-250. */
            var money_gain = Math.round(buildings["bank"].amount * buildings["bank"].generation["money"] * 20 * Math.random() + 10);
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they have some big banks and they're on, give some extra */
                money_gain += buildings["big_bank"].generation["money"] * buildings["big_bank"].amount * 45;
            }
            resources["money"].amount += money_gain;
            var investment_types = ["gold", "beer", "uranium", "bread", "rugs", "beds", "wool", "toothpicks", "cookies", "toothpaste", "salad"];
            var invested_in = investment_types[Math.floor(Math.random() * investment_types.length)];
            add_log_elem("You made " + money_gain.toString() + " money from investing!");
            $("#events_content").html("Investing in " + invested_in + " paid off! <br />You gained " + money_gain.toString() + " money from that sweet deal!");
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they got extra */
                $("#events_content").append("<br />Thank your investment bankers for the tip!");
            }
        },
        "name": "Stock Investments Pay Off!",
        "rejection": 10,
    }),
    ({
        "condition": function () { return true; },
        "run_event": function () {
            var content = "<span>Woah, a meteor just hit in your backyard!</span><br>";
            content += "<span onclick='resources.stone.amount += 1000; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 1000 stone\");' class='clickable'>Gather stone</span><br>";
            if (resources["iron"].amount > 0) {
                content += "<span onclick='resources.iron.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 iron\");' class='clickable'>Recover iron</span><br>";
            }
            if (resources["gold"].amount > 0) {
                content += "<span onclick='resources.gold.amount += 50; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 50 gold\");' class='clickable'>Look for gold</span><br>";
            }
            if (resources["energy"].amount > 0) {
                content += "<span onclick='resources_per_sec.energy += 3; setTimeout(() => resources_per_sec[\"energy\"] -= 3, 60000); $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 3 energy for 1 minute\");' class='clickable'>Capture the heat</span><br>";
            }
            if (buildings["big_mine"].amount >= 3 && buildings["big_mine"].on && Math.random() > .7 && buildings["library"].amount >= 5) {
                content += "<span onclick='resources.diamond.amount += 10; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 10 diamond\");' class='clickable'>Wait, what's that?</span><br>";
            }
            add_log_elem("A meteor fell!");
            $("#events_content").html(content);
        },
        "name": "Meteor!",
        "rejection": 30,
    }),
    ({
        "condition": function () { return buildings["oil_well"].amount > (Math.log(buildings["oil_well"].base_cost["iron"] / 500) / Math.log(.95)); },
        "run_event": function () {
            buildings["oil_well"].base_cost["iron"] *= .95; /* Make oil cheaper */
            $("#building_oil_well > .tooltiptext").html(gen_building_tooltip("oil_well")); /* Set tooltip */
            add_log_elem("Oil reserve discovered!");
            $("#events_content").html("You found an oil reserve!<br /><i style='font-size: small'>Oil wells are now cheaper</i>");
        },
        "name": "Oil Reserve",
        "rejection": 50,
    }),
    ({
        "condition": function () { return true; },
        "run_event": function () {
            resources["gold"].amount += 35;
            event_flags["rickroll"] = true;
            add_log_elem("We're no strangers to love!");
            if (typeof event_flags["rickroll"] == "undefined") {
                $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0"> </iframe>');
            }
            else {
                $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" frameborder="0"> </iframe>');
            }
        },
        "name": "Tree Fiddy",
        "rejection": 90,
    }),
    ({
        "condition": function () { return buildings["big_mine"].amount >= 1 && buildings["big_mine"].on; },
        "run_event": function () {
            if (typeof event_flags["artifacts_found"] == "undefined") {
                event_flags["artifacts_found"] = 0;
            }
            event_flags["artifacts_found"] += 1;
            var content = "<span>Your strip mines have uncovered an artifact</span><br>";
            var money_amount = (10000 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.money.amount += " + money_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + money_amount + " money\");' class='clickable'>Sell it</span><br>";
            var gold_amount = (100 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.gold.amount += " + gold_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + gold_amount + " gold\");' class='clickable'>Melt it down</span><br>";
            if (resources["refined_mana"].amount > 500) {
                content += "<span onclick='resources.refined_mana.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 refined mana\");' class='clickable'>Extract magic</span><br>";
            }
            add_log_elem("You found an artifact!");
            $("#events_content").html(content);
        },
        "name": "Artifact",
        "rejection": 50,
    }),
    ({
        "condition": function () { return purchased_upgrades.indexOf("better_trades_2") != -1; },
        "run_event": function () {
            if (typeof event_flags["demon_trades"] == "undefined") {
                event_flags["demon_trades"] = 0;
            }
            events[6].rejection = Math.min(50 - event_flags["demon_trades"] * 5, 80); /* The more trades you make, the more likely this is. */
            var content = "<span>Demon Traders have come to visit you.</span><br>";
            if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You bleed as they approach. </span><br />";
            }
            content += "<span onclick=' " +
                "resources.diamond.amount += 300;" +
                "event_flags[\"demon_trades\"] += 1;" +
                "$(\"#events\").addClass(\"hidden\"); " +
                "add_log_elem(\"Gained 300 diamond... at what cost?\");'" +
                "class='clickable'>Buy Diamond</span><br>";
            if (event_flags["demon_trades"] > 5) {
                content += "<span onclick='" +
                    "resources.gold.amount += 1000;" +
                    "event_flags[\"demon_trades\"] += 15;" +
                    "$(\"#events\").addClass(\"hidden\"); " +
                    "add_log_elem(\"You sold your soul. I hope you&rsquo;re happy.\");'" +
                    "class='clickable'>Sign Demon Pact</span><br>";
            }
            content += "<span onclick=' " +
                "resources.iron.amount -= 500;" +
                "event_flags[\"demon_trades\"] -= 1;" +
                "$(\"#events\").addClass(\"hidden\"); " +
                "add_log_elem(\"Demons killed using 500 iron as weapons.\");'" +
                "class='clickable'>Fight them!</span><br>";
            add_log_elem("Demons came to trade with you.");
            $("#events_content").html(content);
            /* If they're corrupted enough, potentially skip this and go directly to pact*/
            if (Math.random() < (event_flags["demon_trades"] - 15) / 10) {
                event_flags["demon_trades"] -= 1; /* Reduce corruption */
                force_event(7);
            }
        },
        "name": "Demonic Trading",
        "rejection": 50,
    }),
    ({
        "condition": function () { return typeof event_flags["demon_trades"] != "undefined" && event_flags["demon_trades"] > 10; },
        "run_event": function () {
            var content = "<span>Demon Traders have come for you.</span><br>";
            /* Choose a resource */
            var chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            /* Don't choose special resource or money. Make sure they have some (unless it's money. You can always lose money) */
            while (resources[chosen_resource].value == 0 || (resources[chosen_resource].amount == 0 && chosen_resource != "money")) {
                chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            }
            var resource_loss = Math.ceil(resources[chosen_resource].amount / 2);
            if (buildings["s_goldboost"].on) {
                resource_loss = Math.ceil(resource_loss * 4 / 3);
            }
            content += "<span>They took " + resource_loss.toString() + " " + chosen_resource.replace("_", " ") + " from you.</span><br />";
            if (event_flags["demon_trades"] >= 25) {
                content += "<span style='color: red'>You are still very deep in debt.</span>";
            }
            else if (event_flags["demon_trades"] >= 15) {
                content += "<span style='color: red'>You are still deep in debt.</span>";
            }
            else if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You are still in debt.</span>";
            }
            resources[chosen_resource].amount -= resource_loss;
            add_log_elem("Demons came for your " + chosen_resource.replace("_", " ") + ".");
            $("#events_content").html(content);
        },
        "name": "Demonic Pact",
        "rejection": 0,
    }),
];
function force_event(id) {
    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        if (id >= events.length) {
            throw "Error forcing event: No such event exists.";
        }
        var chosen_event = events[id];
        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}
function handle_event(set_timer) {
    if (set_timer === void 0) { set_timer = true; }
    /* Reset our handle_event timeout */
    if (set_timer) {
        setTimeout(handle_event, 2 * 60000 + Math.random() * 60000 * 2);
    }
    /* Must have some mana to get events */
    if (buildings["s_manastone"].amount < 1) {
        return;
    }
    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        /* Check which events can even show up */
        var valid_events_1 = [];
        events.forEach(function (e) {
            if (e.condition()) {
                valid_events_1.push(e);
            }
        });
        /* No possible events. How sad. */
        if (!valid_events_1.length) {
            return;
        }
        /* Choose random valid event */
        var chosen_event = valid_events_1[Math.floor(Math.random() * valid_events_1.length)];
        /* Keep choosing until we get an event that rolls true. This lets us make some events more likely than others */
        while (chosen_event.rejection > Math.random() * 100) {
            chosen_event = valid_events_1[Math.floor(Math.random() * valid_events_1.length)];
        }
        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}
//# sourceMappingURL=events.js.map