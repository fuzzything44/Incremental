var spell_funcs = {
    "nop": nop,
    "goldboost": s_goldboost,
    "trade": s_trade,
    "time": s_time,
    "refinery": s_refinery_buff,
    "workshop": s_workshop_update,
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
            to_next_trade = 60000;
            delete remaining_upgrades["trade"];
        },
        "cost": {},
        "tooltip": "",
        "name": "Trade Items <br />",
        "image": "money.png",
        "repeats": true,
    };
    to_next_trade -= delta_time;
    if (remaining_upgrades["trade"] == undefined && to_next_trade < 0) {
        remaining_upgrades["trade"] = trade_upgrade;
        /* Roll money amount. Horrible arbitrary formula, takes your money and remaining mana into account for upper bound. */
        var money_value = Math.round(Math.max(1, Math.random() * Math.min(Math.pow(resources["mana"].amount, 3) * 10, resources["money"].amount) * 2 + 10));
        /* Choose resources to be about the same money worth. */
        var resource_value = Math.round((money_value * 5 / 6) + (Math.random() * money_value * 1 / 3));
        /* Choose a resource */
        var chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        /* They can only get resources with a value of <= 100 each, increased by 50 with each better trade upgrade. */
        var value_cap = 100 + (purchased_upgrades.indexOf("better_trades") != -1 ? 50 : 0) + (purchased_upgrades.indexOf("better_trades_2s") != -1 ? 50 : 0);
        /* Don't choose special resource or money. Make sure they have some (unless it's stone. You can always get stone) */
        while (resources[chosen_resource].value <= 0 || chosen_resource == "money" || (resources[chosen_resource].amount == 0 && chosen_resource != "stone") || resources[chosen_resource].value > value_cap) {
            chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        }
        resource_value = Math.max(1, Math.round(resource_value / resources[chosen_resource].value)); /* Reduce resource gain to better line up with different valued resources */
        var trade_advantage = 0.75; /* How much prices tip in our favor. If < 1, out of favor. */
        if (buildings["s_goldboost"].on) {
            trade_advantage += 0.25;
        } /* Obviously being greedy makes prices better */
        if (purchased_upgrades.indexOf("better_trades") != -1) {
            trade_advantage += .25;
        }
        if (purchased_upgrades.indexOf("better_trades_2") != -1) {
            trade_advantage += .3;
        }
        /* See if we're buying or selling */
        if (Math.random() > 0.5) {
            /* We're buying it */
            remaining_upgrades["trade"].cost["money"] = money_value;
            remaining_upgrades["trade"].cost[chosen_resource] = Math.round(resource_value * -trade_advantage); /* Negative so we get the resource */
            remaining_upgrades["trade"].tooltip += "Spend " + format_num(money_value) + " money to buy " + format_num(resource_value * trade_advantage) + " " + chosen_resource.replace('_', ' ');
        }
        else {
            /* Selling */
            remaining_upgrades["trade"].cost["money"] = Math.round(money_value * -trade_advantage);
            remaining_upgrades["trade"].cost[chosen_resource] = resource_value; /* Negative so we get the resource */
            remaining_upgrades["trade"].tooltip += "Sell " + format_num(resource_value) + " " + chosen_resource.replace('_', ' ') + " for " + format_num(money_value * trade_advantage) + " money";
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
function s_refinery(amount) {
    if (isNaN(amount)) {
        amount = 1;
    }
    if (!confirm("Are you sure you want to refine " + amount.toString() + " mana? It will be lost until next prestige!")) {
        return;
    }
    /* Check to make sure we have enough mana before refining. */
    if (resources["mana"].amount < amount) {
        amount = resources["mana"].amount; /* Only make as much as we can */
    }
    resources_per_sec["mana"] -= amount;
    resources["refined_mana"].amount += amount * 1000;
    buildings["s_mana_refinery"].generation["mana"] -= amount; /* Take away per sec right now and add per sec cost to building for reloads.*/
}
var refinery_countdown = 30000;
function s_refinery_buff(delta_time) {
    /* Give some of a random resource based off of refined mana */
    refinery_countdown -= delta_time;
    if (refinery_countdown < 0) {
        refinery_countdown = 30000;
        if (resources["refined_mana"].amount < 100) {
            return;
        } /* Not enough to do stuff, so don't bother with a message. */
        /* Give resources! */
        var chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        /* Make sure they have some (unless it's money. You can always get money) */
        while (resources[chosen_resource].value == 0 || chosen_resource == "refined_mana" || (resources[chosen_resource].amount == 0 && chosen_resource != "money")) {
            chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
        }
        /* How much of it to give. We give 10 value per mana they spent for this. */
        var to_give = resources["refined_mana"].amount / 100;
        to_give = Math.ceil(to_give / Math.abs(resources[chosen_resource].value)); /* Give approx value */
        if (resources[chosen_resource].value < 0) {
            /* Specialty resource chosen. So cap it.*/
            to_give = Math.min(to_give, -50 / resources[chosen_resource].value);
        }
        resources[chosen_resource].amount += to_give;
        add_log_elem("Refined mana warped " + to_give.toString() + " " + chosen_resource.replace("_", " ") + " into reality.");
    }
}
var workshop_item = "";
var workshop_time_total = 1;
var workshop_elapsed_time = 0;
var craftable_items = {
    "glass": {
        "time": 5000,
        "adventure_item": false,
        "costs": {
            "sand": 100,
        },
        "return": 50,
    },
    "steel_beam": {
        "time": 10000,
        "adventure_item": false,
        "costs": {
            "iron": 500,
            "coal": 500,
        },
        "return": 25,
    },
    "ink": {
        "time": 10000,
        "adventure_item": false,
        "costs": {
            "oil": 50,
        },
        "return": 50,
    },
    "money": {
        "time": 15000,
        "adventure_item": false,
        "costs": {
            "gold": 10,
        },
        "return": 1500,
    },
    "basic_weapon": {
        "time": 60000 * 5,
        "adventure_item": true,
        "costs": {
            "iron": 1000,
        },
        "return": 1,
    },
    "machine_part": {
        "time": 150000,
        "adventure_item": true,
        "costs": {
            "iron": 10,
        },
        "return": 1,
    },
};
function s_workshop_set(item) {
    /* Make sure they have enough to buy it */
    Object.keys(craftable_items[item].costs).forEach(function (key) {
        if (craftable_items[item].costs[key] > resources[key].amount) {
            add_log_elem("You can't afford that. Missing: " + key.replace("_", " "));
            throw Error("Not enough resources!");
        }
    });
    /* Spend money to buy */
    Object.keys(craftable_items[item].costs).forEach(function (key) {
        resources[key].amount -= craftable_items[item].costs[key];
    });
    workshop_time_total = craftable_items[item].time;
    workshop_elapsed_time = 0;
    workshop_item = item;
    $("#workshop_progress_bar").css("width", "0");
}
function s_workshop_update(delta_time) {
    /* Add new recipes! */
    /* Base adventure mode recipes */
    if (resources["fuel"].amount > 0) {
        $("#workshop_adv").removeClass("hidden");
    }
    /* Tick building */
    if (workshop_item == "") {
        workshop_elapsed_time = 0;
        $("#workshop_progress_bar").css("width", "17.5em");
        $("#workshop_progress_bar").css("background-color", "green");
    }
    else {
        workshop_elapsed_time += delta_time;
        /* Set width. 17.5em is full bar. */
        var width = 17.5 * Math.min(1, workshop_elapsed_time / workshop_time_total);
        $("#workshop_progress_bar").css("width", width.toString() + "em");
        $("#workshop_progress_bar").css("background-color", "red");
        /* Item finished! */
        if (workshop_elapsed_time >= workshop_time_total) {
            /* Give them the item */
            if (craftable_items[workshop_item].adventure_item) {
                /* TODO: Handle adventure mode items. Once adventure mode exists. */
                adventure_data.warehouse.push({ name: workshop_item });
                add_log_elem("Finished crafting " + gen_equipment({ name: workshop_item }).name);
            }
            else {
                resources[workshop_item].amount += craftable_items[workshop_item].return;
                add_log_elem("Finished crafting " + workshop_item.replace("_", " "));
            }
            workshop_item = "";
        }
    }
}
//# sourceMappingURL=spells.js.map