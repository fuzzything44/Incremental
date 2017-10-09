let event_flags = {};

let events = [
    ({ /* Filler event to make everything else slightly less common. Becomes less important the more eligible events we have. */
        "condition": function () { return true; },
        "run_event": function () {
            add_log_elem("Nothing interesting happened.");
            throw Error("Nope, we're not doing an event.");
        },
        "name": "",
        "rejection": 0,
    }), /* End lack of event */
    ({
        "condition": function () { return buildings["bank"].amount > 3; },
        "run_event": function () {
            /* Gain 0-29s of bank raw money production + 10 money for those with few banks. Capped at 200-250. */
            let money_gain = Math.round(buildings["bank"].amount * buildings["bank"].generation["money"] * 20 * Math.random() + 10);
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they have some big banks and they're on, give some extra */
                money_gain += buildings["big_bank"].generation["money"] * buildings["big_bank"].amount * 45
            }
            let antique_item = "";
            if (buildings["s_time_magic"].on && Math.random() > .5) {
                antique_item = "antique ";
                money_gain *= 2;
            }

            resources["money"].amount += money_gain;

            let investment_types = ["gold", "beer", "uranium", "bread", "beds", "wool", "toothpicks", "cookies", "toothpaste", "salad"];
            let invested_in = investment_types[Math.floor(Math.random() * investment_types.length)];
            add_log_elem("You made " + money_gain.toString() + " money from investing!");
            $("#events_content").html("Investing in " + antique_item + invested_in + " paid off! <br />You gained " + money_gain.toString() + " money from that sweet deal!");
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they got extra */
                $("#events_content").append("<br />Thank your investment bankers for the tip!");
            }
            if (purchased_upgrades.indexOf("uranium_finance") != -1) {
                /* Give them some of what they invested in. */
                switch (invested_in) {
                    case "gold": {
                        resources["gold"].amount += 10;
                        $("#events_content").append("<br />You embezzled 10 gold.");
                        break;
                    }
                    case "uranium": {
                        resources["uranium"].amount += 1;
                        if (antique_item != "") {
                            resources["uranium"].amount += .5;
                        }
                        $("#events_content").append("<br />You embezzled some uranium.");
                        break;
                    }
                    case "bread": {
                        resources["stone"].amount += 1000;
                        $("#events_content").append("<br />Man, this bread is as hard as rock.");
                        break;
                    }
                    case "toothpicks": { }
                    case "beds": {
                        resources["wood"].amount += 1000;
                        $("#events_content").append("<br />You turn some extras into wood.");
                        break;
                    }
                } /* End switch*/

            } /* End run_event */
        },
        "name": "Stock Investments Pay Off!",
        "rejection": 10,
    }), /* End stock investments */
    ({ 
        "condition": function () { return true; },
        "run_event": function () {
            let content = "<span>Woah, a meteor just hit in your backyard!</span><br>";
            content += "<span onclick='resources.stone.amount += 1000; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 1000 stone\");' class='clickable'>Gather stone</span><br>";
            if (resources["iron"].amount > 0) {
                content += "<span onclick='resources.iron.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 iron\");' class='clickable'>Recover iron</span><br>";
            }
            if (resources["gold"].amount > 0) {
                content += "<span onclick='resources.gold.amount += 50; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 50 gold\");' class='clickable'>Look for gold</span><br>";
            }
            if (resources["energy"].amount > 0) {
                content += "<span onclick='resources_per_sec.energy += 10; setTimeout(() => resources_per_sec[\"energy\"] -= 10, 5 *60000); $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 10 energy for 5 minutes\");' class='clickable'>Capture the heat</span><br>";
            }
            if (buildings["big_mine"].amount >= 3 && buildings["big_mine"].on && Math.random() > .7 && buildings["library"].amount >= 5) {
                if (resources["uranium"].amount > 0) {
                    content += "<span onclick='resources.uranium.amount += 3; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 3 uranium\");' class='clickable'>Wait, what's that?</span><br>";
                } else {
                    content += "<span onclick='resources.diamond.amount += 10; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 10 diamond\");' class='clickable'>Wait, what's that?</span><br>";
                }
            }
            add_log_elem("A meteor fell!");
            $("#events_content").html(content);

        },
        "name": "Meteor!",
        "rejection": 30,
    }), /* End meteor */
    ({
        "condition": function () { return buildings["s_manastone"].amount < 50; },
        "run_event": function () {
            resources["time"].amount += 300;
            add_log_elem("Time warp.");
            $("#events_content").html("Time warps around you, giving an additional 300 seconds of production.");
        },
        "name": "Timewarp",
        "rejection": 95,
    }), /* End time warping */
    ({
        "condition": function () { return buildings["oil_well"].amount > (Math.log(buildings["oil_well"].base_cost["iron"]/500)/Math.log(.95)); },
        "run_event": function () {
            buildings["oil_well"].base_cost["iron"] *= .95; /* Make oil cheaper */
            $("#building_oil_well > .tooltiptext").html(gen_building_tooltip("oil_well")); /* Set tooltip */
            add_log_elem("Oil reserve discovered!");
            $("#events_content").html("You found an oil reserve!<br /><i style='font-size: small'>Oil wells are now cheaper</i>");
        },
        "name": "Oil Reserve",
        "rejection": 50,
    }), /* End oil reserve */
    ({
        "condition": function () { return true; },
        "run_event": function () {
            resources["gold"].amount += 35;
            event_flags["rickroll"] = true;
            add_log_elem("We're no strangers to love!");
            $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" frameborder="0"> </iframe>');
        },
        "name": "Tree Fiddy",
        "rejection": 90,
    }), /* End rickroll */
    ({
        "condition": function () { return buildings["big_mine"].amount >= 1 && buildings["big_mine"].on; },
        "run_event": function () {
            if (typeof event_flags["artifacts_found"] == "undefined") {
                event_flags["artifacts_found"] = 0;
            }
            event_flags["artifacts_found"] += 1;
            let content = "<span>Your strip mines have uncovered an artifact</span><br>";
            let money_amount = (10000 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.money.amount += " + money_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + money_amount + " money\");' class='clickable'>Sell it</span><br>";
            let gold_amount = (100 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.gold.amount += " + gold_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + gold_amount + " gold\");' class='clickable'>Melt it down</span><br>";
            if (resources["refined_mana"].amount > 500) {
                content += "<span onclick='resources.refined_mana.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 refined mana\");' class='clickable'>Extract magic</span><br>";
            }
            add_log_elem("You found an artifact!");
            $("#events_content").html(content);

        },
        "name": "Artifact",
        "rejection": 50,
    }), /* End artifact */
    ({
        "condition": function () { return purchased_upgrades.indexOf("better_trades_2") != -1; },
        "run_event": function () {
            if (typeof event_flags["demon_trades"] == "undefined") {
                event_flags["demon_trades"] = 0;
            }
            events[6].rejection = Math.min(50 - event_flags["demon_trades"] * 5, 80); /* The more trades you make, the more likely this is. */
            let content = "<span>Demon Traders have come to visit you.</span><br>";
            if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You bleed as they approach. </span><br />"
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
    }), /* End demon trading */
    ({
        "condition": function () { return typeof event_flags["demon_trades"] != "undefined" && event_flags["demon_trades"] > 10; },
        "run_event": function () {
            let content = "<span>Demon Traders have come for you.</span><br>";
            /* Choose a resource */
            let chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            /* Don't choose special resource or money. Make sure they have some (unless it's money. You can always lose money) */
            while (resources[chosen_resource].value == 0 || (resources[chosen_resource].amount == 0 && chosen_resource != "money")) {
                chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            }
            let resource_loss = Math.ceil(resources[chosen_resource].amount / 2);
            if (buildings["s_goldboost"].on) {
                resource_loss = Math.ceil(resource_loss * 4 / 3);
            }
            content += "<span>They took " + resource_loss.toString() + " " + chosen_resource.replace("_", " ") + " from you.</span><br />";
            if (event_flags["demon_trades"] >= 25) {
                content += "<span style='color: red'>You are still very deep in debt.</span>"
            } else if (event_flags["demon_trades"] >= 15) {
                content += "<span style='color: red'>You are still deep in debt.</span>"
            } else if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You are still in debt.</span>"
            }
            resources[chosen_resource].amount -= resource_loss;
            add_log_elem("Demons came for your " + chosen_resource.replace("_", " ") + ".");
            $("#events_content").html(content);

        },
        "name": "Demonic Pact",
        "rejection": 0,
    }), /* End demon stealing */
    ({
        "condition": function () { return typeof event_flags["bribed_politician"] == "undefined" && buildings["big_bank"].amount >= 5 && buildings["bank"].amount >= 180 && purchased_upgrades.indexOf("coal_mines") != -1 && resources["money"].amount >= 1000000 && buildings["s_manastone"].amount >= 150; },
        "run_event": function () {
            let content = "<span>Business isn't doing well. Regulations are really holding you back.</span><br>";
            content += "<span>Why not bribe a politician to change something for you?</span><br />";
            content += "<i>Bribing costs 1,000,000 money and is available once per prestige. Choose wisely.</i><br /><br />";

            /* Bribe investment regulations. Lets them have more money from banks. */
            content += "<span onclick='bribe_finance();' class='clickable'>Remove Financial Regulations</span><i style='text: small'>This provides a massive boost to banks and investment companies.</i><br>";

            /* No environmental regulations. Mines and logging camps much stronger. */
            content += "<span onclick='bribe_environment();' class='clickable'>Remove Environmental Regulations</span><i style='text: small'>This provides a massive boost to mines and logging camps.</i><br>";

            $("#events_content").html(content);

        },
        "name": "Bribe a Politician",
        "rejection": 20,
    }), /* End politician bribing */

];

/* Literally only for testing purposes. */
function force_event(id: number) {
    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        if (id >= events.length) { throw "Error forcing event: No such event exists.";}
        let chosen_event = events[id];
        if (!chosen_event.condition()) {
            console.error("Warning: Prerequisites not satisfied!");
        }

        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}

function handle_event(set_timer: boolean = true) {
    /* Reset our handle_event timeout */
    if (set_timer) {
        setTimeout(handle_event, 2 * 60000 + Math.random() * 60000 * 2);
    }    
    /* Must have some mana to get events */
    if (buildings["s_manastone"].amount < 1) { return; }

    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        /* Check which events can even show up */
        let valid_events = [];
        events.forEach(function (e) {
            if (e.condition()) {
                valid_events.push(e);
            }
        });

        /* No possible events. How sad. */
        if (!valid_events.length) { return; }


        /* Choose random valid event */
        let chosen_event = valid_events[Math.floor(Math.random() * valid_events.length)];
        /* Keep choosing until we get an event that rolls true. This lets us make some events more likely than others */
        while (chosen_event.rejection > Math.random() * 100) { chosen_event = valid_events[Math.floor(Math.random() * valid_events.length)] }

        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}


/* Functions because putting all of this in an onclick is too much. */
function bribe_finance() {
    /* Pay bribe */
    resources["money"].amount -= 1000000;
    /* Boost banks */
    let build_state = buildings["bank"].on;
    if (build_state) {
        toggle_building_state("bank");
    }
    buildings["bank"].generation["money"] *= 50;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("bank");
    }

    /* Boost investments */
    build_state = buildings["big_bank"].on;
    if (build_state) {
        toggle_building_state("big_bank");
    }
    buildings["big_bank"].generation["money"] *= 10;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("big_bank");
    }

    /* Boost printers */
    build_state = buildings["money_printer"].on;
    if (build_state) {
        toggle_building_state("money_printer");
    }
    buildings["money_printer"].generation["money"] *= 3;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("money_printer");
    }
    event_flags["bribed_politician"] = "money";

    $("#events").addClass("hidden");
    add_log_elem("Removed all financial regulations.");
}

function bribe_environment() {
    /* Pay bribe */
    resources["money"].amount -= 1000000;

    let build_state = buildings["mine"].on;
    if (build_state) {
        toggle_building_state("mine");
    }
    buildings["mine"].generation["coal"] *= 10;
    buildings["mine"].generation["stone"] *= 10;
    buildings["mine"].generation["iron_ore"] *= 10;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("mine");
    }

    build_state = buildings["logging"].on;
    if (build_state) {
        toggle_building_state("logging");
    }
    buildings["logging"].generation["wood"] *= 25;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("logging");
    }
    event_flags["bribed_politician"] = "environment";
    $("#events").addClass("hidden");
    add_log_elem("Removed all environmental regulations.");
}