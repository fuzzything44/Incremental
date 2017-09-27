var spell_funcs = {
    "nop": nop,
    "goldboost": s_goldboost,
    "trade": s_trade,
    "time": s_time,
};
function nop(delta_time) { }
function s_goldboost(delta_time) {
    var _this = this;
    if (typeof this.boost == "undefined") {
        this.boost = 0;
        this.boost_gold = 0;
    }
    /* Calc native money gain */
    var normal_gain = resources_per_sec["money"] - this.boost;
    if (this.boost != normal_gain) {
        resources_per_sec["money"] -= this.boost;
        this.boost = Math.max(0, resources_per_sec["money"]);
        resources_per_sec["money"] += this.boost;
    }
    var normal_gold_gain = resources_per_sec["gold"] - this.boost_gold;
    if (this.boost_gold != normal_gold_gain) {
        resources_per_sec["gold"] -= this.boost_gold;
        this.boost_gold = Math.max(0, resources_per_sec["gold"]);
        resources_per_sec["gold"] += this.boost_gold;
    }
    /* Checks if building was turned off */
    setTimeout(function () {
        if (!buildings["s_goldboost"].on) {
            resources_per_sec["money"] -= _this.boost;
            resources_per_sec["gold"] -= _this.boost_gold;
            _this.boost = 0;
            _this.boost_gold = 0;
        }
    }, 50);
}
function s_trade(delta_time) {
    var trade_upgrade = {
        "unlock": function () {
            if (Date.now() > trade_expires) {
                delete remaining_upgrades["trade"];
                to_next_trade = 45000;
                return false;
            }
            return buildings["s_trade"].on;
        },
        "purchase": function () {
            purchased_upgrades.pop();
            to_next_trade = 60000;
        },
        "cost": {},
        "tooltip": "",
        "name": "Trade Items <br />",
        "image": "money.png",
    };
    to_next_trade -= delta_time;
    if (remaining_upgrades["trade"] == undefined && to_next_trade < 0) {
        remaining_upgrades["trade"] = trade_upgrade;
        /* Roll money amount. Horrible arbitrary formula, takes your money and max mana into account for upper bound. */
        var money_value = Math.round(Math.max(1, Math.random() * Math.min(Math.pow(1.5, resources["mana"].amount) * 10, resources["money"].amount) * 2 + 10));
        /* Choose resources to be about the same money worth. */
        var resource_value = Math.round((money_value * 5 / 6) + (Math.random() * money_value * 1 / 3));
        /* Choose a resource */
        var chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        /* Don't choose special resource or money. Make sure they have some (unless it's stone. You can always get stone) */
        while (resources[chosen_resource].value == 0 || chosen_resource == "money" || (resources[chosen_resource].amount == 0 && chosen_resource != "stone")) {
            chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        }
        resource_value = Math.max(1, Math.round(resource_value / resources[chosen_resource].value)); /* Reduce resource gain to better line up with different valued resources */
        var trade_advantage = 0.75; /* How much prices tip in our favor. If < 1, out of favor. */
        if (buildings["s_goldboost"].on) {
            trade_advantage += 0.25;
        } /* Obviously being greedy makes prices better */
        /* See if we're buying or selling */
        if (Math.random() > 0.5) {
            /* We're buying it */
            remaining_upgrades["trade"].cost["money"] = money_value;
            remaining_upgrades["trade"].cost[chosen_resource] = Math.round(resource_value * -trade_advantage); /* Negative so we get the resource */
            remaining_upgrades["trade"].tooltip += "Spend " + money_value.toString() + " money to buy " + Math.round(resource_value * trade_advantage).toString() + " " + chosen_resource.replace('_', ' ');
        }
        else {
            /* Selling */
            remaining_upgrades["trade"].cost["money"] = Math.round(money_value * -trade_advantage);
            remaining_upgrades["trade"].cost[chosen_resource] = resource_value; /* Negative so we get the resource */
            remaining_upgrades["trade"].tooltip += "Sell " + resource_value.toString() + " " + chosen_resource.replace('_', ' ') + " for " + Math.round(money_value * trade_advantage).toString() + " money";
        }
        var trade_expires = Date.now() + 15000;
    }
}
function s_time(delta_time) {
    var last_dt = this.last_dt; /* How much time "elapsed" last loop */
    this.last_dt = delta_time; /* Save for next iteration */
    if (typeof last_dt == "undefined") {
        return;
    }
    last_update -= 0.5 * delta_time; /* Reverse the clock a bit */
}
function s_workshop(newopt) {
    $("#workshop_select").val(newopt); /* Seems redundant, but needed for loading easily. */
    buildings["s_workshop"].mode = newopt; /* Set mode to get saved */
    var comp_state = buildings["s_workshop"].on; /* Turn off to get per sec values right */
    if (comp_state) {
        toggle_building_state("s_workshop");
    }
    /* Tooltips for each option */
    var workshop_tooltips = {
        "iron": "Finds 10 iron from 50 stone per second.",
        "wood": "Grows and chops down trees for 75 wood per second.",
        "glass": "Melts 10 sand into 10 glass per second.",
        "steel": "Uses 100 iron ore and 30 coal to make 1 steel beam per second.",
    };
    /* What option corresponds to what production */
    var workshop_items = {
        "iron": {
            "stone": -50 / 50,
            "iron": 10 / 50,
        },
        "wood": {
            "wood": 75 / 50,
        },
        "glass": {
            "sand": -10 / 50,
            "glass": 10 / 50,
        },
        "steel": {
            "iron_ore": -100 / 50,
            "coal": -30 / 50,
            "steel_beam": 1 / 50,
        },
    };
    /* Set production to match */
    buildings["s_workshop"].generation = workshop_items[newopt];
    buildings["s_workshop"].generation["mana"] = -1; /* And lose mana */
    if (comp_state) {
        toggle_building_state("s_workshop");
    }
    $("#workshop_prod").html(workshop_tooltips[newopt]); /* Set tooltip to new val */
}
//# sourceMappingURL=spells.js.map