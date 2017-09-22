let events = [
    { /* Filler event to make everything else slightly less common. Becomes less important the more eligible events we have. */
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
            let money_gain = Math.round(buildings["bank"].amount * buildings["bank"].generation["money"] * 20 * Math.random() + 10);
            resources["money"].amount += money_gain;
            
            let investment_types = ["gold", "beer", "uranium", "bread", "rugs", "beds", "wool", "toothpicks", "cookies", "toothpaste", "salad"];
            let invested_in = investment_types[Math.floor(Math.random() * investment_types.length)];
            $("#events_content").html("Investing in " + invested_in + " paid off! <br />You gained " + money_gain.toString() + " money from that sweet deal!");
        },
        "name": "Stock Investments Pay Off!",
        "rejection": 10,
    },
    { 
        "condition": function () { return true; },
        "run_event": function () {
            let styling = "style='color: white; border: solid white 1px; border-radius: 3px; padding-left: .3em; padding-right: .3em; display: inline-block; margin: .2em;'";
            let content = "<span>Woah, a meteor just hit in your backyard!</span><br>";
            content += "<span onclick='resources.stone.amount += 1000; $(\"#events\").addClass(\"hidden\");'" + styling + ">Gather stone</span><br>";
            if (resources["iron"].amount > 0) {
                content += "<span onclick='resources.iron.amount += 500; $(\"#events\").addClass(\"hidden\");'" + styling + ">Recover iron</span><br>";
            }
            if (resources["gold"].amount > 0) {
                content += "<span onclick='resources.gold.amount += 50; $(\"#events\").addClass(\"hidden\");'" + styling + ">Look for gold</span><br>";
            }
            if (resources["energy"].amount > 0) {
                content += "<span onclick='resources_per_sec.energy += 3; $(\"#events\").addClass(\"hidden\");'" + styling + ">Capture the heat</span><br>";
                setTimeout(() => resources_per_sec["energy"] -= 3, 60000);
            }
            $("#events_content").html(content);

        },
        "name": "Meteor!",
        "rejection": 30,
    },
    {
        "condition": function () { return buildings["oil_well"].amount > (Math.log(buildings["oil_well"].base_cost["iron"]/500)/Math.log(.95)); },
        "run_event": function () {
            buildings["oil_well"].base_cost["iron"] *= .95; /* Make oil cheaper */
            $("#building_oil_well > .tooltiptext").html(gen_building_tooltip("oil_well")); /* Set tooltip */
            $("#events_content").html("You found an oil reserve!<br /><i style='font-size: small'>Oil wells are now cheaper</i>");
        },
        "name": "Oil Reserve",
        "rejection": 50,
    },
    {
        "condition": function () { return true; },
        "run_event": function () {
            resources["gold"].amount += 35;
            $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360"src= "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"frameborder= "0"> </iframe>');
        },
        "name": "Tree Fiddy",
        "rejection": 90,
    },

];

function handle_event() {
    /* Reset our handle_event timeout */
    setTimeout(handle_event, 2 * 60000 + Math.random() * 60000 * 2);
    /* Events can go away after a minute. */
    setTimeout(function () {
        $("#events").addClass("hidden");
    }, 60000);
    
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

