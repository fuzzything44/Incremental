var events = [
    {
        "condition": function () { return true; },
        "run_event": function () {
            throw Error("Nope, we're not doing an event.");
        },
        "name": "",
        "rejection": 0,
    },
    {
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
    },
    {
        "condition": function () { return true; },
        "run_event": function () {
            var styling = "style='color: white; border: solid white 1px; border-radius: 3px; padding-left: .3em; padding-right: .3em; display: inline-block; margin: .2em;'";
            var content = "<span>Woah, a meteor just hit in your backyard!</span><br>";
            content += "<span onclick='resources.stone.amount += 1000; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 1000 stone\");'" + styling + ">Gather stone</span><br>";
            if (resources["iron"].amount > 0) {
                content += "<span onclick='resources.iron.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 iron\");'" + styling + ">Recover iron</span><br>";
            }
            if (resources["gold"].amount > 0) {
                content += "<span onclick='resources.gold.amount += 50; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 50 gold\");'" + styling + ">Look for gold</span><br>";
            }
            if (resources["energy"].amount > 0) {
                content += "<span onclick='resources_per_sec.energy += 3; setTimeout(() => resources_per_sec[\"energy\"] -= 3, 60000); $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 3 energy for 1 minute\");'" + styling + ">Capture the heat</span><br>";
            }
            add_log_elem("A meteor fell!");
            $("#events_content").html(content);
        },
        "name": "Meteor!",
        "rejection": 30,
    },
    {
        "condition": function () { return buildings["oil_well"].amount > (Math.log(buildings["oil_well"].base_cost["iron"] / 500) / Math.log(.95)); },
        "run_event": function () {
            buildings["oil_well"].base_cost["iron"] *= .95; /* Make oil cheaper */
            $("#building_oil_well > .tooltiptext").html(gen_building_tooltip("oil_well")); /* Set tooltip */
            add_log_elem("Oil reserve discovered!");
            $("#events_content").html("You found an oil reserve!<br /><i style='font-size: small'>Oil wells are now cheaper</i>");
        },
        "name": "Oil Reserve",
        "rejection": 50,
    },
    {
        "condition": function () { return true; },
        "run_event": function () {
            resources["gold"].amount += 35;
            add_log_elem("We're no strangers to love!");
            $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0"> </iframe>');
        },
        "name": "Tree Fiddy",
        "rejection": 90,
    },
];
function handle_event() {
    /* Reset our handle_event timeout */
    setTimeout(handle_event, 2 * 60000 + Math.random() * 60000 * 2);
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