// <reference path ="/jquery-3.2.1.js"/>
var resources = {};
var resources_per_sec = {};
var buildings = {};
var purchased_upgrades = []; /* Names of all purchased upgrades */
var remaining_upgrades = {}; /* All remaining upgrades that need to be purchased */
var UNLOCK_TREE = {
    "s_manastone": [],
    "s_goldboost": [],
    "s_energyboost": [],
    "s_trade": [],
    "s_startboost": [],
    "bank": ["mine", "logging"],
    "mine": ["furnace", "gold_finder"],
    "logging": ["compressor"],
    "furnace": [],
    "compressor": ["oil_well"],
    "gold_finder": ["jeweler"],
    "jeweler": ["jewelry_store"],
    "jewelry_store": [],
    "oil_well": ["oil_engine"],
    "oil_engine": ["paper_mill", "ink_refinery", "s_energyboost"],
    "paper_mill": ["money_printer"],
    "ink_refinery": [],
    "money_printer": ["book_printer"],
    "book_printer": ["library"],
    "library": ["water_purifier"],
    "water_purifier": ["hydrogen_gen", "hydrogen_burner"],
    "hydrogen_gen": [],
    "hydrogen_burner": [],
};
var SPELL_BUILDINGS = [
    "s_manastone",
    "s_goldboost",
    "s_energyboost",
    "s_trade",
    "s_startboost",
];
var SPELL_FUNCTIONS = [
    /*   0 */ function (delta_time) { },
    /*   1 */ function (delta_time) {
        var _this = this;
        if (typeof this.boost == "undefined") {
            this.boost = 0;
            this.boost_gold = 0;
        }
        /* Calc native money gain */
        var normal_gain = resources_per_sec["money"] - this.boost;
        if (this.boost != normal_gain) {
            resources_per_sec["money"] -= this.boost;
            this.boost = resources_per_sec["money"];
            resources_per_sec["money"] += this.boost;
        }
        var normal_gold_gain = resources_per_sec["gold"] - this.boost_gold;
        if (this.boost_gold != normal_gold_gain) {
            resources_per_sec["gold"] -= this.boost_gold;
            this.boost_gold = resources_per_sec["gold"];
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
    },
    /*   2 */ function (delta_time) {
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
            if (buildings["s_moneyboost"].on) {
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
    },
];
var to_next_trade = 60000;
function energy_converter_add() {
    var num_to_add = parseInt($("#buy_amount").val());
    /* Add one converter */
    buildings["s_energyboost"].amount += num_to_add;
    $("#building_s_energyboost > .building_amount").html(buildings["s_energyboost"].amount.toString());
    /* Add energy only if on */
    if (buildings["s_energyboost"].on) {
        resources_per_sec["energy"] += num_to_add;
        resources_per_sec["mana"] -= num_to_add;
    }
}
function energy_converter_remove() {
    var num_to_remove = parseInt($("#buy_amount").val());
    /* Make sure it can't go negative. Don't want people to trade the other way! */
    if (buildings["s_energyboost"].amount - num_to_remove < 0) {
        num_to_remove = buildings["s_energyboost"].amount;
    }
    /* Remove a converter */
    buildings["s_energyboost"].amount -= num_to_remove;
    $("#building_s_energyboost > .building_amount").html(buildings["s_energyboost"].amount.toString());
    /* Remove energy only if on */
    if (buildings["s_energyboost"].on) {
        resources_per_sec["energy"] -= 1;
        resources_per_sec["mana"] += 1;
    }
}
function set_initial_state() {
    resources = {
        "mana": { "amount": 0, "value": 0 },
        "energy": { "amount": 0, "value": 0 },
        "research": { "amount": 0, "value": 0 },
        "money": { "amount": 10, "value": 1 },
        "stone": { "amount": 0, "value": 0.5 },
        "wood": { "amount": 0, "value": 0.5 },
        "iron_ore": { "amount": 0, "value": 1 },
        "coal": { "amount": 0, "value": 1 },
        "iron": { "amount": 0, "value": 4 },
        "gold": { "amount": 0, "value": 75 },
        "diamond": { "amount": 0, "value": 100 },
        "jewelry": { "amount": 0, "value": 400 },
        "oil": { "amount": 0, "value": 2 },
        "paper": { "amount": 0, "value": 4 },
        "ink": { "amount": 0, "value": 10 },
        "book": { "amount": 0, "value": 600 },
        "sand": { "amount": 0, "value": 1 },
        "glass": { "amount": 0, "value": 1.5 },
        "water": { "amount": 0, "value": 2 },
        "hydrogen": { "amount": 0, "value": 1 },
    };
    /* Set resources_per_sec */
    Object.keys(resources).forEach(function (res) {
        resources_per_sec[res] = 0;
    });
    buildings = {
        "s_manastone": {
            "on": true,
            "amount": 0,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana": 1 },
            "generation": {
                "mana": 1,
            },
            "update": 0,
            "flavor": "A stone made out of pure crystallized mana. Use it to power spells!",
        },
        "s_goldboost": {
            "on": false,
            "amount": 2,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana": 1 },
            "generation": {
                "mana": -1,
            },
            "update": 1,
            "flavor": "A magic spell made for tax fraud.",
        },
        "s_energyboost": {
            "on": false,
            "amount": 2,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana": 1 },
            "generation": {
                "mana": -1,
                "energy": 1,
            },
            "update": 0,
            "flavor": "This is actually a much simpler spell than the name implies.",
        },
        "s_trade": {
            "on": false,
            "amount": 6,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana": 1 },
            "generation": {
                "mana": -1,
            },
            "update": 2,
            "flavor": "With an infinite variety of things, you would think you could find some apples for sale. But you can't.",
        },
        "s_startboost": {
            "on": false,
            "amount": 25,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana": 1 },
            "generation": {
                "mana": -1,
                "money": 1,
                "stone": 2,
                "wood": 2,
                "iron_ore": 10 / 25,
                "oil": 5 / 25,
            },
            "update": 0,
            "flavor": "I HAVE THE POWER!",
        },
        "bank": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 10,
            },
            "price_ratio": {
                "money": 1.1,
            },
            "generation": {
                "money": 1,
            },
            "flavor": "It's a pretty small branch bank.",
        },
        "mine": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 20,
            },
            "price_ratio": {
                "money": 1.2,
            },
            "generation": {
                "money": -1,
                "stone": 1,
                "iron_ore": 0.1,
            },
            "flavor": "IT'S ALL MINE!",
        },
        "logging": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 20,
            },
            "price_ratio": {
                "money": 1.2,
            },
            "generation": {
                "money": -1,
                "wood": 1,
                "coal": 0.1,
            },
            "flavor": "console.log('Player read tooltip.')",
        },
        "furnace": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 15,
                "stone": 30,
            },
            "price_ratio": {
                "money": 1.1,
                "stone": 1.2,
            },
            "generation": {
                "wood": -5,
                "iron_ore": -3,
                "iron": 1,
                "coal": 1,
            },
            "flavor": "Come on in! It's a blast!",
        },
        "compressor": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 100,
                "stone": 500,
                "iron": 200
            },
            "price_ratio": {
                "money": 1.3,
                "stone": 1.3,
                "iron": 1.2,
            },
            "generation": {
                "coal": -10,
                "diamond": 0.1,
            },
            "flavor": "",
        },
        "gold_finder": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 100,
                "stone": 500,
                "wood": 200
            },
            "price_ratio": {
                "money": 1.3,
                "stone": 1.3,
                "wood": 1.2,
            },
            "generation": {
                "stone": -20,
                "gold": 0.1,
            },
            "flavor": "",
        },
        "jeweler": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 200,
                "stone": 750,
            },
            "price_ratio": {
                "money": 1.3,
                "stone": 1.3,
            },
            "generation": {
                "gold": -3,
                "diamond": -1,
                "jewelry": 1,
            },
            "flavor": "A jeweler uses jewels to make jewelry in July.",
        },
        "jewelry_store": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 5000,
                "stone": 500,
                "wood": 500
            },
            "price_ratio": {
                "money": 1.5,
                "stone": 1.4,
                "wood": 1.4,
            },
            "generation": {
                "jewelry": -1,
                "money": 500,
            },
            "flavor": "And the cycle repeats...",
        },
        "oil_well": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 1000,
                "stone": 100,
                "iron": 500
            },
            "price_ratio": {
                "money": 1.2,
                "stone": 1.1,
                "iron": 1.3,
            },
            "generation": {
                "oil": 1,
            },
            "flavor": "Well, this gets you oil.",
        },
        "oil_engine": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "iron": 200
            },
            "price_ratio": {
                "money": 1.3,
                "iron": 1.3,
            },
            "generation": {
                "oil": -1,
                "energy": 1,
            },
            "flavor": "",
        },
        "paper_mill": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 200,
                "iron": 200,
                "oil": 100,
            },
            "price_ratio": {
                "money": 1.1,
                "iron": 1.1,
                "oil": 1.1
            },
            "generation": {
                "energy": -1,
                "wood": -3,
                "paper": 1,
            },
            "flavor": "",
        },
        "ink_refinery": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 200,
                "iron": 200,
                "oil": 100,
            },
            "price_ratio": {
                "money": 1.1,
                "iron": 1.1,
                "oil": 1.1
            },
            "generation": {
                "energy": -1,
                "oil": -3,
                "ink": 1,
            },
            "flavor": "",
        },
        "money_printer": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "iron": 500,
                "oil": 200,
            },
            "price_ratio": {
                "money": 1.2,
                "iron": 1.2,
                "oil": 1.3,
            },
            "generation": {
                "energy": -1,
                "paper": -2,
                "ink": -1,
                "money": 30,
            },
            "flavor": "100% legal. Trust me on this.",
        },
        "book_printer": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "iron": 500,
                "oil": 200,
            },
            "price_ratio": {
                "money": 1.2,
                "iron": 1.2,
                "oil": 1.3,
            },
            "generation": {
                "energy": -1,
                "paper": -2,
                "ink": -1,
                "book": 0.1,
            },
            "flavor": "It's actually just printing a bunch of copies of My Immortal.",
        },
        "library": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "wood": 500,
                "iron": 50,
                "book": 10,
            },
            "price_ratio": {
                "money": 1.2,
                "iron": 1.4,
                "wood": .95,
                "book": 1.1,
            },
            "generation": {
                "research": 1,
            },
            "flavor": "They do very important research here. <br />DO NOT DISTURB THE LIBRARIANS.",
        },
        "water_purifier": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "stone": 500,
                "sand": 500,
                "glass": 100,
            },
            "price_ratio": {
                "money": 1.1,
                "stone": 1.1,
                "sand": 1.1,
                "glass": 1.1,
            },
            "generation": {
                "water": 1,
            },
            "flavor": "Turns out sand can be used to purify water. Who knew?",
        },
        "hydrogen_gen": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 2500,
                "glass": 500,
            },
            "price_ratio": {
                "money": 1.1,
                "glass": 1.2,
            },
            "generation": {
                "energy": -2,
                "water": -1,
                "hydrogen": 2,
            },
            "flavor": "Runs electricity through water...",
        },
        "hydrogen_burner": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 2500,
                "iron": 500,
            },
            "price_ratio": {
                "money": 1.1,
                "iron": 1.2,
            },
            "generation": {
                "hydrogen": -20,
                "energy": 10,
                "water": 7,
            },
            "flavor": "...And lights it on fire!",
        },
    };
    purchased_upgrades = [];
    remaining_upgrades = {
        "better_mines": {
            "unlock": function () { return buildings["mine"].amount >= 3; },
            "purchase": function () {
                var mines_state = buildings["mine"].on;
                if (mines_state) {
                    toggle_building_state("mine");
                }
                buildings["mine"]["generation"]["stone"] *= 2;
                buildings["mine"]["generation"]["iron_ore"] *= 5;
                if (mines_state) {
                    toggle_building_state("mine");
                }
                $("#building_mine > .tooltiptext").html(gen_building_tooltip("mine"));
            },
            "cost": {
                "money": 100,
                "stone": 10,
            },
            "tooltip": "Mines produce double stone and 5x iron. <br /> Costs 100 money, 10 stone.",
            "name": "Improve Mines",
            "image": "pickaxe.png",
        },
        "coal_mines": {
            "unlock": function () { return buildings["mine"].amount >= 3 && buildings["compressor"].amount >= 1 && (resources["coal"].amount < 50 || resources["research"].amount > 5); },
            "purchase": function () {
                var mines_state = buildings["mine"].on;
                if (mines_state) {
                    toggle_building_state("mine");
                }
                buildings["mine"]["generation"]["coal"] = 0.2;
                if (mines_state) {
                    toggle_building_state("mine");
                }
                $("#building_mine > .tooltiptext").html(gen_building_tooltip("mine"));
            },
            "cost": {
                "money": 100,
                "stone": 10,
                "research": 3,
            },
            "tooltip": "Mines produce coal.<br /> Costs 100 money, 100 wood. <br /> Requires research level of 3.",
            "name": "Coal Mining <br />",
            "image": "pickaxe.png",
        },
        "better_compressors": {
            "unlock": function () { return buildings["compressor"].amount >= 1; },
            "purchase": function () {
                var comp_state = buildings["compressor"].on;
                if (comp_state) {
                    toggle_building_state("compressor");
                }
                buildings["compressor"]["generation"]["coal"] *= 0.7;
                if (comp_state) {
                    toggle_building_state("compressor");
                }
                $("#building_compressor > .tooltiptext").html(gen_building_tooltip("compressor"));
            },
            "cost": {
                "money": 100,
                "iron": 100,
            },
            "tooltip": "Compressors use 30% less coal. <br /> Costs 100 money, 100 iron.",
            "name": "Improve Compressors",
            "image": "diamond.png",
        },
        "oiled_compressors": {
            "unlock": function () { return buildings["compressor"].amount >= 1 && resources["oil"].amount > 20; },
            "purchase": function () {
                var comp_state = buildings["compressor"].on;
                if (comp_state) {
                    toggle_building_state("compressor");
                }
                buildings["compressor"]["generation"]["coal"] *= 0.9;
                if (comp_state) {
                    toggle_building_state("compressor");
                }
                $("#building_compressor > .tooltiptext").html(gen_building_tooltip("compressor"));
            },
            "cost": {
                "oil": 50,
            },
            "tooltip": "Oil your compressors to have them run more efficiently. <br /> Costs 50 oil.",
            "name": "Oil Compressors",
            "image": "diamond.png",
        },
        "cheaper_banks": {
            "unlock": function () { return resources["money"].amount >= 2500 && buildings["bank"].amount > 20; },
            "purchase": function () {
                buildings["bank"].price_ratio["money"] = (buildings["bank"].price_ratio["money"] - 1) * .7 + 1;
                $("#building_bank > .tooltiptext").html(gen_building_tooltip("bank"));
            },
            "cost": {
                "money": 3000,
                "iron": 500,
            },
            "tooltip": "Banks are cheaper to buy.<br /> Costs 3000 money, 500 iron.",
            "name": "Build a vault <br />",
            "image": "money.png",
        },
        "better_paper": {
            "unlock": function () { return buildings["paper_mill"].amount >= 3; },
            "purchase": function () {
                var comp_state = buildings["paper_mill"].on;
                if (comp_state) {
                    toggle_building_state("paper_mill");
                }
                buildings["paper_mill"]["generation"]["paper"] *= 2;
                if (comp_state) {
                    toggle_building_state("paper_mill");
                }
                $("#building_compressor > .tooltiptext").html(gen_building_tooltip("paper_mill"));
            },
            "cost": {
                "money": 100,
                "iron": 100,
                "oil": 100,
                "research": 5,
            },
            "tooltip": "Make thinner paper, creating double the paper per wood.<br /> Costs 100 money, 100 iron, 100 oil. <br /> Requires research level of 5.",
            "name": "Thinner paper",
            "image": "gear.png",
        },
        "better_furnace": {
            "unlock": function () { return buildings["furnace"].amount >= 3; },
            "purchase": function () {
                var comp_state = buildings["furnace"].on;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
                Object.keys(buildings["furnace"].generation).forEach(function (res) {
                    buildings["furnace"].generation[res] *= 10;
                });
                if (comp_state) {
                    toggle_building_state("furnace");
                }
                $("#building_furnace > .tooltiptext").html(gen_building_tooltip("furnace"));
            },
            "cost": {
                "money": 100,
                "stone": 300,
                "wood": 200,
                "coal": 200,
            },
            "tooltip": "Much hotter furnaces run at 10x the previous rate. <br /> Costs 100 money, 300 stone, 200 wood, 200 coal.",
            "name": "Hotter furnaces",
            "image": "fire.png",
        },
        "better_gold": {
            "unlock": function () { return buildings["gold_finder"].amount >= 3; },
            "purchase": function () {
                var comp_state = buildings["gold_finder"].on;
                if (comp_state) {
                    toggle_building_state("gold_finder");
                }
                buildings["gold_finder"].generation["gold"] *= 2;
                buildings["gold_finder"].generation["iron"] = 0.05;
                if (comp_state) {
                    toggle_building_state("gold_finder");
                }
                $("#building_gold_finder > .tooltiptext").html(gen_building_tooltip("gold_finder"));
            },
            "cost": {
                "money": 250,
                "gold": 50,
                "iron": 200,
                "coal": 200,
            },
            "tooltip": "Special gold-plated magnets that attract only gold. And a bit of iron. <br /> Costs 250 money, 50 gold, 200 iron.",
            "name": "Gold magnet <br />",
            "image": "money.png",
        },
        "gold_crusher": {
            "unlock": function () { return buildings["gold_finder"].amount >= 5 && buildings["s_manastone"].amount >= 10; },
            "purchase": function () {
                var comp_state = buildings["gold_finder"].on;
                if (comp_state) {
                    toggle_building_state("gold_finder");
                }
                buildings["gold_finder"].generation["sand"] = 2;
                buildings["gold_finder"].generation["gold"] *= 2;
                if (comp_state) {
                    toggle_building_state("gold_finder");
                }
                $("#building_gold_finder > .tooltiptext").html(gen_building_tooltip("gold_finder"));
            },
            "cost": {
                "money": 250,
                "iron": 200,
                "stone": 750,
            },
            "tooltip": "Crushes stone into sand, improving gold find rate. <br /> Costs 250 money, 200 iron, 750 stone.",
            "name": "Destructive Sifter",
            "image": "sand.png",
        },
        "glass_furnace": {
            "unlock": function () { return buildings["furnace"].amount >= 5 && resources["sand"].amount >= 10 && purchased_upgrades.indexOf("better_furnace") != -1; },
            "purchase": function () {
                var comp_state = buildings["furnace"].on;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
                buildings["furnace"].generation["sand"] = -1;
                buildings["furnace"].generation["glass"] = 1;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
                $("#building_furnace > .tooltiptext").html(gen_building_tooltip("furnace"));
            },
            "cost": {
                "money": 250,
                "iron": 200,
                "wood": 500,
            },
            "tooltip": "Furnaces now smelt sand into glass at a rate of 1/s. <br /> Costs 250 money, 200 iron, 500 wood.",
            "name": "Glass Furnace",
            "image": "sand.png",
        },
    };
    $("#buy_amount").val(1);
}
function prestige() {
    /* Calculate mana gain */
    var prestige_points = 0;
    Object.keys(resources).forEach(function (res) { return prestige_points += resources[res].amount * resources[res].value; });
    var mana_gain = Math.max(0, Math.floor(Math.log((prestige_points) / 10000 + 1)));
    if (confirm("You will lose all resources and all buildings but gain " + mana_gain.toString() + " mana after reset. Proceed?")) {
        SPELL_BUILDINGS.forEach(function (build) {
            if (buildings[build].on) {
                toggle_building_state(build);
            }
        });
        var total_mana = buildings["s_manastone"].amount + mana_gain;
        set_initial_state();
        resources_per_sec["mana"] = total_mana;
        buildings["s_manastone"].amount = total_mana;
        $("#building_s_manastone span:nth-child(2)").html(total_mana.toString());
        $("#spells").removeClass("hidden");
    }
    save();
    location.reload();
}
function save() {
    Object.keys(resources).forEach(function (type) {
        document.cookie = "res-" + type + "=" + resources[type].amount.toString() + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    });
    Object.keys(buildings).forEach(function (type) {
        document.cookie = "build-" + type + "=" + JSON.stringify(buildings[type]) + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    });
    document.cookie = "upgrades=" + JSON.stringify(purchased_upgrades) + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    document.cookie = "last_save=" + Date.now() + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    $('#save_text').css('opacity', '1');
    setTimeout(function () { return $('#save_text').css({ 'opacity': '0', 'transition': 'opacity 1s' }); }, 1000);
    console.log("Saved");
}
function load() {
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = document.cookie;
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                console.log("Found request for " + cname + ": " + c.substring(name.length, c.length));
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    console.log("Loading resources...");
    Object.keys(resources).forEach(function (type) {
        /* Store in temp string because we need to check if it exists */
        var temp_str = getCookie("res-" + type);
        if (temp_str !== "") {
            resources[type].amount = parseFloat(temp_str);
        }
    });
    console.log("Loading buildings...");
    Object.keys(buildings).forEach(function (type) {
        var temp_str = getCookie("build-" + type);
        if (temp_str !== "") {
            buildings[type] = JSON.parse(temp_str);
            /* Show how many buildings they have and set tooltip properly */
            $('#building_' + type + " > .building_amount").html(buildings[type].amount.toString());
            if (SPELL_BUILDINGS.indexOf(type) == -1) {
                $('#building_' + type + " > .tooltiptext").html(gen_building_tooltip(type));
            }
        }
    });
    if (buildings["s_manastone"].amount > 0) {
        $("#spells").removeClass("hidden");
    }
    console.log("Loading upgrades...");
    if (getCookie("upgrades") == "") {
        purchased_upgrades = [];
    }
    else {
        purchased_upgrades = JSON.parse(getCookie("upgrades"));
    }
    console.log("Loading last update");
    if (getCookie("last_save") != "") {
        last_update = parseInt(getCookie("last_save"));
    }
    purchased_upgrades.forEach(function (upg) {
        delete remaining_upgrades[upg]; /* They shouldn't be able to get the same upgrade twice, so delete what was bought. */
    });
    /* Recalculate earnings. Loop through each building */
    Object.keys(buildings).forEach(function (name) {
        /* See if it's on */
        if (buildings[name].on) {
            /* Go through each resource it generates... */
            Object.keys(buildings[name].generation).forEach(function (key) {
                /* And increase production */
                resources_per_sec[key] += buildings[name].amount * buildings[name].generation[key];
            });
            $("#toggle_" + name).addClass("building_state_on");
            $("#toggle_" + name).removeClass("building_state_off");
            $("#toggle_" + name).text("On");
        }
        else {
            $("#toggle_" + name).addClass("building_state_off");
            $("#toggle_" + name).removeClass("building_state_on");
            $("#toggle_" + name).text("Off");
        }
    });
}
function save_to_clip() {
    save();
    var text = btoa(document.cookie);
    var textArea = document.createElement("textarea");
    /* Styling to make sure it doesn't do much if the element gets rendered */
    /* Place in top-left corner of screen regardless of scroll position. */
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        if (successful) {
            alert("Save copied to clipboard.");
        }
    }
    catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}
function load_from_clip() {
    var loaded_data = atob(prompt("Paste your save data here."));
    loaded_data.split(";").forEach(function (data) {
        document.cookie = data;
    });
    location.reload();
}
function toggle_building_state(name) {
    if (buildings[name].on) {
        buildings[name].on = false;
        /* Go through each resource it generates... */
        Object.keys(buildings[name].generation).forEach(function (key) {
            /* And decrease production by that much */
            resources_per_sec[key] -= buildings[name].amount * buildings[name].generation[key];
        });
        $("#toggle_" + name).addClass("building_state_off");
        $("#toggle_" + name).removeClass("building_state_on");
        $("#toggle_" + name).text("Off");
    }
    else {
        buildings[name].on = true;
        /* Go through each resource it generates... */
        Object.keys(buildings[name].generation).forEach(function (key) {
            /* And increase production */
            resources_per_sec[key] += buildings[name].amount * buildings[name].generation[key];
        });
        $("#toggle_" + name).addClass("building_state_on");
        $("#toggle_" + name).removeClass("building_state_off");
        $("#toggle_" + name).text("On");
    }
}
var last_update = Date.now();
function update() {
    /* Find time since last update. */
    var delta_time = Date.now() - last_update;
    last_update = Date.now();
    /* Check for negative resources or resources that will run out. */
    Object.keys(resources).forEach(function (res) {
        if (resources[res].amount > 0) {
            /* Unhide resources we have */
            $("#" + res).removeClass("hidden");
        }
        if (resources[res].amount < -resources_per_sec[res] * delta_time / 1000) {
            /* Check all buildings */
            Object.keys(buildings).forEach(function (build) {
                /* Check resource gen */
                if (buildings[build].generation[res] < 0 && buildings[build].on && buildings[build].amount > 0) {
                    toggle_building_state(build);
                }
            });
        }
    });
    /* Update all resources */
    Object.keys(resources).forEach(function (key) {
        if (resources[key].value != 0) {
            /* Don't add special resources */
            resources[key].amount += resources_per_sec[key] * delta_time / 1000;
        }
        else {
            resources[key].amount = resources_per_sec[key];
        }
        /* Formats it so that it says "Resource name: amount" */
        $("#" + key + " span").first().html((key.charAt(0).toUpperCase() + key.slice(1)).replace("_", " ") + ": " + Math.max(0, Math.floor(resources[key].amount)).toString());
        /* Same for tooltip */
        $("#" + key + "_per_sec").text((resources_per_sec[key] > 0 ? "+" : "") + (Math.round(resources_per_sec[key] * 10) / 10).toString() + "/s");
    });
    /* Unhide buildings */
    Object.keys(buildings).forEach(function (build) {
        if (buildings[build].amount > 0 && SPELL_BUILDINGS.indexOf(build) == -1) {
            $("#building_" + build).parent().removeClass("hidden"); /* Any owned building is unlocked. Needed in case they sell previous ones and reload. */
            UNLOCK_TREE[build].forEach(function (unlock) {
                $("#building_" + unlock).parent().removeClass("hidden");
            });
        }
        try {
            Object.keys(buildings[build].base_cost).forEach(function (key) {
                if (buildings[build].base_cost[key] * Math.pow(buildings[build].price_ratio[key], buildings[build].amount) > resources[key].amount) {
                    throw Error("Not enough resources!");
                }
            });
            $("#building_" + build).removeClass("building_expensive");
        }
        catch (e) {
            $("#building_" + build).addClass("building_expensive");
        }
    });
    /* Perform spell actions */
    SPELL_BUILDINGS.forEach(function (build) {
        if (buildings[build].on) {
            SPELL_FUNCTIONS[buildings[build].update](delta_time);
        }
    });
}
/* Not in update as this could change a lot if they have too many unpurchased upgrades. */
function update_upgrade_list() {
    /* Remove old upgrade list */
    $("#upgrades > ul").html('');
    /* Loop through all remaining upgrades */
    Object.keys(remaining_upgrades).forEach(function (upg_name) {
        if (remaining_upgrades[upg_name].unlock()) {
            var color_1 = "lightgray"; /* Set color to lightgray or red depending on if they can afford it */
            Object.keys(remaining_upgrades[upg_name].cost).forEach(function (res) {
                if (resources[res].amount < remaining_upgrades[upg_name].cost[res]) {
                    color_1 = "red";
                }
            });
            var upg_elem = "<li id=\"upgrade_" + upg_name +
                "\" class=\"upgrade tooltip\" onclick=\"purchase_upgrade('" + upg_name + "')\" style='text-align: center; color: " + color_1 + "'><span>" +
                remaining_upgrades[upg_name].name + "<br /> <img src='images/" + remaining_upgrades[upg_name].image + "' alt='' style='width: 3em; height: 3em; float: bottom;' /></span><span class=\"tooltiptext\">" +
                remaining_upgrades[upg_name].tooltip + "</span> </li>";
            $("#upgrades > ul").append(upg_elem);
        }
    });
    /* Update upgrade total */
    $("#upgrade_count").html("Upgrades: " + purchased_upgrades.length.toString() + "/" + (purchased_upgrades.length + Object.keys(remaining_upgrades).length).toString());
}
function gen_building_tooltip(name) {
    var gen_text = "Generates ";
    /* Add resource gen, update how much each one generates. */
    Object.keys(buildings[name].generation).forEach(function (key) {
        gen_text += Math.round((buildings[name].generation[key]) * 10) / 10 + " " + key.replace("_", " ") + " per second, ";
    });
    var cost_text = "Costs ";
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        cost_text += Math.ceil(buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount)).toString();
        cost_text += " " + key + ", ";
    });
    var flavor_text = "<hr><i style='font-size: small'>" + buildings[name].flavor + "</i>";
    if (buildings[name].flavor == undefined || buildings[name].flavor == "") {
        flavor_text = "";
    }
    return gen_text.trim().replace(/.$/, ".") + "<br />" + cost_text.trim().replace(/.$/, ".") + flavor_text;
}
function purchase_building(name) {
    var amount = parseInt($("#buy_amount").val());
    if (isNaN(amount)) {
        amount = 1;
    }
    for (var i = 0; i < amount; i++) {
        /* Make sure they have enough to buy it */
        Object.keys(buildings[name].base_cost).forEach(function (key) {
            console.log("Checking money");
            if (buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount) > resources[key].amount) {
                throw Error("Not enough resources!");
            }
        });
        /* Spend money to buy */
        Object.keys(buildings[name].base_cost).forEach(function (key) {
            console.log("Spending money");
            resources[key].amount -= buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount);
        });
        /* Add resource gen */
        Object.keys(buildings[name].generation).forEach(function (key) {
            if (buildings[name].on) {
                resources_per_sec[key] += buildings[name].generation[key];
            }
        });
        buildings[name].amount++;
        $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());
        $('#building_' + name + " > .tooltiptext").html(gen_building_tooltip(name));
    }
}
function destroy_building(name) {
    var amount = parseInt($("#buy_amount").val());
    if (isNaN(amount)) {
        amount = 1;
    }
    for (var i = 0; i < amount; i++) {
        if (buildings[name].amount < 1) {
            return; /* Can't sell last building */
        }
        /* Remove resource gen */
        Object.keys(buildings[name].generation).forEach(function (key) {
            if (buildings[name].on) {
                resources_per_sec[key] -= buildings[name].generation[key];
            }
        });
        buildings[name].amount--;
        $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());
        $('#building_' + name + " > .tooltiptext").html(gen_building_tooltip(name));
    }
}
function purchase_upgrade(name) {
    var upg = remaining_upgrades[name];
    /* Check that they have enough */
    Object.keys(upg.cost).forEach(function (resource) {
        if (resources[resource].amount < upg.cost[resource]) {
            throw Error("Not enough resources!");
        }
    });
    /* Spend it */
    Object.keys(upg.cost).forEach(function (resource) {
        resources[resource].amount -= upg.cost[resource];
    });
    /* Do cleanup. Get benefit from having it, remove it from purchasable upgrades, add it to purchased upgrades, remove from page */
    purchased_upgrades.push(name);
    delete remaining_upgrades[name];
    $("#upgrade_" + name).remove();
    upg.purchase();
}
function random_title() {
    var TITLES = [
        "CrappyIdle v.π²",
        "Drink Your Ovaltine!",
        "(!) Not Responding (I lied)",
        "17 New Resources That Will Blow Your Mind!",
        "Ÿ̛̦̯ͬ̔̾̃ͥ͑o͋ͩ̽̓͋̚͘u͚̼̜̞͉͓̹ͦ͒͌̀ ̄͋̉̓҉̖̖̠̤ņ͔̄͟͟e̦̝̻̼̖͖͋̓̔̓͒ͬe̷͈̗̻̘̩̙̖͗ͫͭͮ͌̃́ͬ̔d̥̞ͨ̏͗͆̉ͩ ̨̟̭̻͔̰͓͍̤͍̀ͤͤ̎͐͘͠m͙͈͖̱͍̖̤͑̃͐͋ͪ̐ͯ̏͘ͅȍ̼̭̦͚̥̜͉̥̱ͬ͞r̥̣̰͈̻̰ͮ̓̚e̳͊ͯ͞ ̏ͯ̈́҉̛̮͚̖͈̼g̩͖̙̞̮̟̍ͦͫ̓ͭͥ̀o̧̻̞̰͉̤͇̭̘͓ͨ̆̔ͨl̴͕͉̦̩̟̤̰̃͋̃̉̓͌ͪ͌ͩd̢̨̲̻̿ͫ",
        "Help im trapped in an html factory",
        "Totally no malware here",
        "Try Foodbits! They're super tasty*! *ᴾᵃʳᵗ ᵒᶠ ᵃ ᶜᵒᵐᵖˡᵉᵗᵉ ᵇʳᵉᵃᵏᶠᵃˢᵗ⋅ ᴺᵒᵗ ᶠᵒʳ ʰᵘᵐᵃⁿ ᶜᵒⁿˢᵘᵐᵖᵗᶦᵒⁿ⋅ ᴰᵒ ⁿᵒᵗ ᶜᵒⁿˢᵘᵐᵉ ʷʰᶦˡᵉ ᵘⁿᵈᵉʳ ᵗʰᵉ ᶦⁿᶠˡᵘᵉⁿᶜᵉ ᵒᶠ ᵈʳᵘᵍˢ ᵒʳ ᵃˡᶜᵒʰᵒˡ⋅ ᴼʳ ᵃᶦʳ⋅",
    ];
    document.title = TITLES.filter(function (item) { return item !== document.title; })[Math.floor(Math.random() * (TITLES.length - 1))];
}
window.onload = function () {
    set_initial_state();
    load();
    setInterval(update, 35);
    setInterval(save, 30000);
    update_upgrade_list();
    setInterval(update_upgrade_list, 500);
    random_title();
    setInterval(random_title, 60000);
    SPELL_BUILDINGS.forEach(function (build) {
        if (buildings["s_manastone"].amount < buildings[build].amount * -buildings[build].generation["mana"]) {
            $("#building_" + build).parent().addClass("hidden");
        }
    });
};
function hack(level) {
    Object.keys(resources).forEach(function (r) { resources[r].amount = level; });
}
function superhack(level) {
    Object.keys(resources).forEach(function (r) { resources_per_sec[r] = level; });
}
//# sourceMappingURL=app.js.map