/// <reference path ="events.ts" />
/// <reference path ="spells.ts" />
function format_num(num, show_decimals) {
    if (show_decimals === void 0) { show_decimals = true; }
    /* If our numberformatting library broke, we fallback to a terrible option instead. This should really only happen in development when it's being worked on online, so it doesn't matter too much.*/
    if (typeof numberformat == "undefined") {
        return Math.round(num).toString();
    }
    if (isNaN(num)) {
        return "fuzzy";
    }
    if (num < 0) {
        return "-" + format_num(-num, show_decimals);
    }
    if (num == Infinity) {
        return "Yes";
    }
    if (num < 100000) {
        if (show_decimals) {
            return (Math.round(num * 1000) / 1000).toString();
        }
        else {
            return Math.round(num).toString();
        }
    }
    else {
        if (show_decimals) {
            return numberformat.formatShort(num, { sigfigs: 5 });
        }
        else {
            return numberformat.formatShort(num, { sigfigs: 3 });
        }
    }
}
var resources = {};
var resources_per_sec = {};
var buildings = {};
var purchased_upgrades = []; /* Names of all purchased upgrades */
var remaining_upgrades = {}; /* All remaining upgrades that need to be purchased */
var UNLOCK_TREE = {
    "s_manastone": [],
    "s_mana_refinery": [],
    "s_goldboost": [],
    "s_energyboost": [],
    "s_trade": [],
    "s_startboost": [],
    "s_time_magic": [],
    "s_workshop": [],
    "s_time_maker": [],
    "s_workshop_2": [],
    "s_final": [],
    "bank": ["mine", "logging"],
    "oil_well": ["oil_engine"],
    "library": ["water_purifier", "solar_panel"],
    "water_purifier": ["hydrogen_gen", "hydrogen_burner"],
    "skyscraper": ["big_bank"],
    "oil_engine": ["paper_mill", "ink_refinery", "s_energyboost"],
    "solar_panel": [],
    "hydrogen_burner": [],
    "reactor": ["fuel_maker"],
    "mine": ["furnace", "gold_finder"],
    "logging": ["compressor"],
    "furnace": [],
    "gold_finder": ["jeweler"],
    "compressor": ["oil_well"],
    "jeweler": ["jewelry_store"],
    "glass_jeweler": ["jewelry_store"],
    "jewelry_store": [],
    "paper_mill": ["money_printer"],
    "ink_refinery": [],
    "money_printer": ["book_printer"],
    "book_printer": ["library"],
    "hydrogen_gen": [],
    "fuel_maker": [],
    "big_bank": ["big_mine"],
    "big_mine": [],
    "hydrogen_mine": [],
};
var SPELL_BUILDINGS = [
    "s_manastone",
    "s_goldboost",
    "s_energyboost",
    "s_trade",
    "s_startboost",
    "s_time_magic",
    "s_workshop",
    "s_time_maker",
    "s_mana_refinery",
    "s_workshop_2",
    "s_final",
];
function set_initial_state() {
    resources = {
        "time": { "amount": 0, "value": -2 },
        "refined_mana": { "amount": 0, "value": -1 },
        "fuel": { "amount": 0, "value": -1000 },
        "mana": { "amount": 0, "value": 0 },
        "energy": { "amount": 0, "value": 0 },
        "research": { "amount": 0, "value": 0 },
        "manager": { "amount": 0, "value": 0 },
        "money": { "amount": 10, "value": 1 },
        "stone": { "amount": 0, "value": 0.5 },
        "wood": { "amount": 0, "value": 0.5 },
        "iron_ore": { "amount": 0, "value": 1 },
        "coal": { "amount": 0, "value": 1 },
        "iron": { "amount": 0, "value": 4 },
        "gold": { "amount": 0, "value": 50 },
        "diamond": { "amount": 0, "value": 75 },
        "jewelry": { "amount": 0, "value": 300 },
        "oil": { "amount": 0, "value": 2 },
        "paper": { "amount": 0, "value": 4 },
        "ink": { "amount": 0, "value": 10 },
        "book": { "amount": 0, "value": 400 },
        "sand": { "amount": 0, "value": 3 },
        "glass": { "amount": 0, "value": 20 },
        "water": { "amount": 0, "value": 2 },
        "hydrogen": { "amount": 0, "value": 5 },
        "steel_beam": { "amount": 0, "value": 200 },
        "uranium": { "amount": 0, "value": 500 },
        "sandcastle": { "amount": 0, "value": 10000000 },
        "glass_bottle": { "amount": 0, "value": 25000 },
    };
    /* Set resources_per_sec */
    Object.keys(resources).forEach(function (res) {
        resources_per_sec[res] = 0;
    });
    buildings = {
        "s_manastone": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": 1,
            },
            "update": "nop",
            "flavor": "A stone made out of pure crystallized mana. Use it to power spells!",
        },
        "s_mana_refinery": {
            "on": true,
            "amount": 1,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": 0,
            },
            "update": "refinery",
            "flavor": "That's some fine mana.",
        },
        "s_goldboost": {
            "on": false,
            "amount": 2,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "goldboost",
            "flavor": "A magic spell made for tax fraud.",
        },
        "s_energyboost": {
            "on": false,
            "amount": 1,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -3,
                "energy": 1,
            },
            "update": "nop",
            "flavor": "This is actually a much simpler spell than the name implies.",
        },
        "s_trade": {
            "on": false,
            "amount": 6,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "trade",
            "flavor": "With an infinite variety of things, you would think you could find some apples for sale. But you can't.",
        },
        "s_startboost": {
            "on": false,
            "amount": 25,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
                "money": 1,
                "stone": 2,
                "wood": 2,
                "iron_ore": 5 / 25,
                "oil": .5 / 25,
            },
            "update": "nop",
            "flavor": "I HAVE THE POWER!",
        },
        "s_time_magic": {
            "on": false,
            "amount": 40,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "time",
            "flavor": "I HAVE THE POWER!",
        },
        "s_workshop": {
            "on": false,
            "amount": 50,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "nop",
            "mode": "iron",
            "flavor": "Yay, you can read my code.",
        },
        "s_time_maker": {
            "on": false,
            "amount": 100,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
                "time": 0.2 / 100,
            },
            "update": "nop",
            "flavor": "Yay herbs! Thyme is good!",
        },
        "s_workshop_2": {
            "on": false,
            "amount": 200,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "workshop",
            "flavor": "Work. Work. Work. Work. Shop.",
        },
        "s_final": {
            "on": false,
            "amount": 500,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "update": "final",
            "strength": 2,
            "flavor": "MORE MANA!",
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
        "oil_well": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 1000,
                "stone": 1000,
                "iron": 500
            },
            "price_ratio": {
                "money": 1.2,
                "stone": 1.1,
                "iron": 1.3,
            },
            "generation": {
                "oil": 0.1,
            },
            "flavor": "Well, this gets you oil.",
        },
        "library": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 2500,
                "wood": 2500,
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
            "flavor": "To find sand, first you must collect enough mana.",
        },
        "skyscraper": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 5000,
                "steel_beam": 25,
                "glass": 50,
            },
            "price_ratio": {
                "money": 1.09,
                "steel_beam": 1.1,
                "glass": 1.1,
            },
            "generation": {
                "manager": 1,
            },
            "flavor": "Only one per floor so they don't get in each others' ways.",
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
        "solar_panel": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 50000,
                "glass": 100,
                "coal": 100,
                "diamond": 100,
            },
            "price_ratio": {
                "money": .8,
                "glass": 2,
                "coal": 1.5,
                "diamond": 1.5,
            },
            "generation": {
                "energy": 1,
            },
            "flavor": "Praise the sun!",
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
                "energy": 15,
                "water": 7,
            },
            "flavor": "FIRE!",
        },
        "reactor": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 1000000,
                "steel_beam": 100,
                "iron": 10000,
            },
            "price_ratio": {
                "money": 1.1,
                "steel_beam": 1.07,
                "iron": 1.2,
            },
            "generation": {
                "manager": -3,
                "uranium": -0.1,
                "water": -15,
                "energy": 50,
            },
            "flavor": "Don't let it go boom!",
        },
        "mine": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 15,
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
                "money": 15,
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
                "money": 200,
                "stone": 50,
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
        "gold_finder": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "stone": 1000,
                "wood": 400
            },
            "price_ratio": {
                "money": 1.3,
                "stone": 1.3,
                "wood": 1.2,
            },
            "generation": {
                "stone": -10,
                "gold": 0.1,
            },
            "flavor": "",
        },
        "compressor": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 100,
                "stone": 300,
                "iron": 100
            },
            "price_ratio": {
                "money": 1.3,
                "stone": 1.3,
                "iron": 1.3,
            },
            "generation": {
                "coal": -10,
                "diamond": 0.1,
            },
            "flavor": "",
        },
        "jeweler": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 750,
                "stone": 1000,
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
        "glass_jeweler": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 2500,
                "glass": 300,
            },
            "price_ratio": {
                "money": 1.3,
                "glass": 1.3,
            },
            "generation": {
                "glass": -10,
                "jewelry": .5,
            },
            "flavor": "Oooooh.... shiny!",
        },
        "jewelry_store": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 5000,
                "stone": 500,
                "wood": 750
            },
            "price_ratio": {
                "money": 1.5,
                "stone": 1.4,
                "wood": 1.4,
            },
            "generation": {
                "jewelry": -1,
                "money": 400,
            },
            "flavor": "And the cycle repeats...",
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
                "money": 5000,
                "iron": 700,
                "oil": 500,
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
        "fuel_maker": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 1500000,
                "steel_beam": 250,
                "iron": 50000,
                "gold": 3000,
                "research": 20,
            },
            "price_ratio": {
                "money": 1.1,
                "steel_beam": 1.07,
                "iron": 1.2,
                "gold": 1.1,
                "research": 1.2,
            },
            "generation": {
                "energy": -75,
                "uranium": -0.1,
                "hydrogen": -150,
                "refined_mana": -1,
                "fuel": 0.01,
            },
            "flavor": "This fuel is... not healthy.",
        },
        "big_bank": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 25000,
                "stone": 25000,
                "glass": 100,
            },
            "price_ratio": {
                "money": 1.2,
                "stone": 1.1,
                "glass": 1.2,
            },
            "generation": {
                "manager": -1,
                "money": 50,
            },
            "flavor": "Serious business",
        },
        "big_mine": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 10000,
                "steel_beam": 100,
                "wood": 20000,
            },
            "price_ratio": {
                "money": 1.1,
                "steel_beam": 1.03,
                "wood": 1.1,
            },
            "generation": {
                "manager": -1,
                "money": -100,
                "stone": 30,
                "iron_ore": 10,
                "coal": 3,
                "iron": 2,
                "gold": .5,
                "diamond": .1,
                "sand": 10,
            },
            "flavor": "Seriouser business",
        },
        "hydrogen_mine": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "hydrogen": 30,
            },
            "flavor": "The moon rocks. And now you can have those rocks.",
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
            },
            "cost": {
                "money": 2000,
                "stone": 500,
                "iron": 250,
            },
            "tooltip": "Mines produce double stone and 5x iron.",
            "name": "Improve Mines",
            "image": "pickaxe.png",
            "repeats": false,
        },
        "better_logging": {
            "unlock": function () { return buildings["logging"].amount >= 3 && buildings["s_manastone"].amount >= 5; },
            "purchase": function () {
                var build_state = buildings["logging"].on;
                if (build_state) {
                    toggle_building_state("logging");
                }
                buildings["logging"]["generation"]["wood"] *= 2;
                buildings["logging"]["generation"]["coal"] *= 3;
                if (build_state) {
                    toggle_building_state("logging");
                }
            },
            "cost": {
                "money": 2000,
                "wood": 500,
                "iron": 500,
            },
            "tooltip": "console.error('Upgrade not purchased, player needs to buy it!');<br /><i>(Provides an upgrade to logging camps)</i>",
            "name": "Magical Trees",
            "image": "",
            "repeats": false,
        },
        "cheaper_mines": {
            "unlock": function () { return buildings["mine"].amount >= 20; },
            "purchase": function () {
                buildings["mine"].price_ratio["money"] = 1.1;
            },
            "cost": {
                "stone": 5000,
                "money": 5000,
            },
            "tooltip": "Mines are cheaper to buy.",
            "name": "Mountain<br />",
            "image": "pickaxe.png",
            "repeats": false,
        },
        "cheaper_logging": {
            "unlock": function () { return buildings["logging"].amount >= 20; },
            "purchase": function () {
                buildings["logging"].price_ratio["money"] = 1.1;
            },
            "cost": {
                "wood": 5000,
                "money": 5000,
            },
            "tooltip": "Logging Camps are cheaper to buy.",
            "name": "Forest<br />",
            "image": "",
            "repeats": false,
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
            },
            "cost": {
                "money": 1000,
                "stone": 500,
                "wood": 500,
            },
            "tooltip": "Mines produce coal.",
            "name": "Coal Mining<br />",
            "image": "pickaxe.png",
            "repeats": false,
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
            },
            "cost": {
                "money": 3000,
                "iron": 1000,
            },
            "tooltip": "Compressors use 30% less coal.",
            "name": "Improve Compressors",
            "image": "diamond.png",
            "repeats": false,
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
            },
            "cost": {
                "oil": 50,
            },
            "tooltip": "Oil your compressors to have them run more efficiently.",
            "name": "Oil Compressors",
            "image": "diamond.png",
            "repeats": false,
        },
        "better_oil": {
            "unlock": function () { return buildings["oil_well"].amount >= 1; },
            "purchase": function () {
                var comp_state = buildings["oil_well"].on;
                if (comp_state) {
                    toggle_building_state("oil_well");
                }
                buildings["oil_well"]["generation"]["oil"] *= 5;
                if (comp_state) {
                    toggle_building_state("oil_well");
                }
            },
            "cost": {
                "oil": 100,
            },
            "tooltip": "Get more oil for your wells.",
            "name": "Fracking",
            "image": "",
            "repeats": false,
        },
        "even_better_oil": {
            "unlock": function () { return purchased_upgrades.indexOf("better_oil") != -1; },
            "purchase": function () {
                var comp_state = buildings["oil_well"].on;
                if (comp_state) {
                    toggle_building_state("oil_well");
                }
                buildings["oil_well"]["generation"]["oil"] *= 2;
                if (comp_state) {
                    toggle_building_state("oil_well");
                }
            },
            "cost": {
                "oil": 500,
                "research": 1,
            },
            "tooltip": "If it worked once, why not again?",
            "name": "More Fracking",
            "image": "",
            "repeats": false,
        },
        "cheaper_banks": {
            "unlock": function () { return resources["money"].amount >= 2500 && buildings["bank"].amount >= 20; },
            "purchase": function () {
                buildings["bank"].price_ratio["money"] = (buildings["bank"].price_ratio["money"] - 1) * .7 + 1;
            },
            "cost": {
                "money": 5000,
                "iron": 1000,
            },
            "tooltip": "Banks are cheaper to buy.",
            "name": "Build a vault <br />",
            "image": "money.png",
            "repeats": false,
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
            },
            "cost": {
                "money": 10000,
                "iron": 1000,
                "oil": 500,
                "research": 5,
            },
            "tooltip": "Make thinner paper, creating double the paper per wood.",
            "name": "Thinner paper",
            "image": "gear.png",
            "repeats": false,
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
                buildings["furnace"].generation["wood"] *= .7;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
            },
            "cost": {
                "money": 10000,
                "stone": 30000,
                "wood": 20000,
                "coal": 2000,
            },
            "tooltip": "Much hotter furnaces run at 10x the previous rate and consume slightly less wood.",
            "name": "Hotter furnaces",
            "image": "fire.png",
            "repeats": false,
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
            },
            "cost": {
                "money": 25000,
                "gold": 500,
                "iron": 1000,
            },
            "tooltip": "Special gold-plated magnets that attract only gold. And a bit of iron.",
            "name": "Gold magnet <br />",
            "image": "money.png",
            "repeats": false,
        },
        "better_hydrogen_engine": {
            "unlock": function () { return buildings["hydrogen_burner"].amount >= 1; },
            "purchase": function () {
                var comp_state = buildings["hydrogen_burner"].on;
                if (comp_state) {
                    toggle_building_state("hydrogen_burner");
                }
                buildings["hydrogen_burner"].generation["energy"] += 5;
                buildings["hydrogen_burner"].generation["water"] += 3;
                if (comp_state) {
                    toggle_building_state("hydrogen_burner");
                }
            },
            "cost": {
                "gold": 500,
                "iron": 1000,
                "glass": 100,
                "research": 3,
            },
            "tooltip": "Hydrogen Engines run at 100% efficiency.",
            "name": "Fuel Cells<br />",
            "image": "",
            "repeats": false,
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
            },
            "cost": {
                "money": 25000,
                "iron": 2000,
                "stone": 20000,
            },
            "tooltip": "Crushes stone into sand, improving gold find rate.",
            "name": "Destructive Sifter",
            "image": "sand.png",
            "repeats": false,
        },
        "glass_furnace": {
            "unlock": function () { return buildings["furnace"].amount >= 2 && resources["sand"].amount >= 10 && purchased_upgrades.indexOf("better_furnace") != -1; },
            "purchase": function () {
                var comp_state = buildings["furnace"].on;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
                buildings["furnace"].generation["sand"] = -5;
                buildings["furnace"].generation["glass"] = 1;
                if (comp_state) {
                    toggle_building_state("furnace");
                }
            },
            "cost": {
                "money": 250000,
                "iron": 20000,
                "wood": 50000,
            },
            "tooltip": "Furnaces now smelt sand into glass.",
            "name": "Glass Furnace",
            "image": "sand.png",
            "repeats": false,
        },
        "skyscraper": {
            "unlock": function () { return resources["steel_beam"].amount > 5 && buildings["skyscraper"].amount < 1; },
            "purchase": function () {
                /* Give them the first skyscraper. */
                /* So to do this we give them enough resources to buy and then just buy it */
                /* That keeps all the nasty issues of updating everything away */
                Object.keys(buildings["skyscraper"].base_cost).forEach(function (res) {
                    resources[res].amount += buildings["skyscraper"].base_cost[res];
                });
                purchase_building("skyscraper", 1);
            },
            "cost": {
                "money": 25000,
                "steel_beam": 50,
                "glass": 250,
            },
            "tooltip": "Build the first floor of a skyscraper for some managers to live in.",
            "name": "Skyscrapers",
            "image": "",
            "repeats": false,
        },
        "glassblowing": {
            "unlock": function () { return resources["glass"].amount > 5; },
            "purchase": function () {
                /* Give them the first building. */
                /* So to do this we give them enough resources to buy and then just buy it */
                /* That keeps all the nasty issues of updating everything away */
                Object.keys(buildings["glass_jeweler"].base_cost).forEach(function (res) {
                    resources[res].amount += buildings["glass_jeweler"].base_cost[res];
                });
                purchase_building("glass_jeweler", 1);
            },
            "cost": {
                "money": 25000,
                "glass": 250,
                "research": 7,
            },
            "tooltip": "Research how to blow glass into jewelry.",
            "name": "Glassblowing",
            "image": "",
            "repeats": false,
        },
        "better_jeweler": {
            "unlock": function () { return resources["sand"].amount > 0 && resources["paper"].amount > 0; },
            "purchase": function () {
                var comp_state = buildings["jeweler"].on;
                if (comp_state) {
                    toggle_building_state("jeweler");
                }
                buildings["jeweler"]["generation"]["diamond"] *= .8;
                if (comp_state) {
                    toggle_building_state("jeweler");
                }
            },
            "cost": {
                "money": 250000,
                "sand": 2500,
                "paper": 5000,
                "research": 12,
            },
            "tooltip": "Sand diamonds for a bright polish!",
            "name": "Sandpaper<br />",
            "image": "sand.png",
            "repeats": false,
        },
        "better_jewelry_store": {
            "unlock": function () { return resources["jewelry"].amount > 100 && resources["manager"].amount > 0; },
            "purchase": function () {
                var comp_state = buildings["jewelry_store"].on;
                if (comp_state) {
                    toggle_building_state("jewelry_store");
                }
                buildings["jewelry_store"]["generation"]["money"] *= 2;
                buildings["jewelry_store"]["generation"]["manager"] = -1;
                if (comp_state) {
                    toggle_building_state("jewelry_store");
                }
            },
            "cost": {
                "money": 10000000,
                "research": 8,
            },
            "tooltip": "High-pressure sales tactics let you sell jewelry for more. But you'll need managers to keep employees in line.",
            "name": "Sleazy Managers",
            "image": "",
            "repeats": false,
        },
        "better_trades": {
            "unlock": function () { return resources["refined_mana"].amount >= 1000 && buildings["s_trade"].on; },
            "purchase": function () { },
            "cost": {
                "refined_mana": 10000,
                "gold": 500,
            },
            "tooltip": "Your portals cover more of the market, letting you get better deals.",
            "name": "Mystic Portals",
            "image": "money.png",
            "repeats": false,
        },
        "better_trades_2": {
            "unlock": function () { return purchased_upgrades.indexOf("better_trades") != -1; },
            "purchase": function () { },
            "cost": {
                "refined_mana": 30000,
                "diamond": 1000,
            },
            "tooltip": "Your portals cover more of the market, letting you get better deals.",
            "name": "Arcane Portals",
            "image": "diamond.png",
            "repeats": false,
        },
        "better_time": {
            "unlock": function () { return buildings["s_time_magic"].on; },
            "purchase": function () {
                var comp_state = buildings["s_time_magic"].on;
                if (comp_state) {
                    toggle_building_state("s_time_magic");
                }
                buildings["s_time_magic"]["amount"] -= 10;
                if (comp_state) {
                    toggle_building_state("s_time_magic");
                }
                $("#building_s_time_magic > .building_amount").text("30");
            },
            "cost": {
                "time": 30000,
            },
            "tooltip": "Throw away some extra time. You didn't need that, did you?",
            "name": "Time removal",
            "image": "shield_power.png",
            "repeats": false
        },
        "uranium_finance": {
            "unlock": function () { return typeof event_flags["bribed_politician"] != "undefined" && event_flags["bribed_politician"] == "money" && buildings["s_manastone"].amount >= 200; },
            "purchase": function () { },
            "cost": {
                "money": 10000000,
                "research": 15,
            },
            "tooltip": "Get some of what you invest in. Sometimes.",
            "name": "Investment Embezzling",
            "image": "uranium.png",
            "repeats": false,
        },
        "uranium_environment": {
            "unlock": function () { return typeof event_flags["bribed_politician"] != "undefined" && event_flags["bribed_politician"] == "environment" && buildings["s_manastone"].amount >= 200; },
            "purchase": function () {
                var comp_state = buildings["big_mine"].on;
                if (comp_state) {
                    toggle_building_state("big_mine");
                }
                buildings["big_mine"]["generation"]["uranium"] = .01;
                if (comp_state) {
                    toggle_building_state("big_mine");
                }
            },
            "cost": {
                "money": 50000000,
                "research": 15,
            },
            "tooltip": "Huh, what's this metal your strip mines are finding?",
            "name": "Deeper mines",
            "image": "uranium.png",
            "repeats": false,
        },
        "uranium_power": {
            "unlock": function () { return resources["uranium"].amount > 10; },
            "purchase": function () {
                Object.keys(buildings["reactor"].base_cost).forEach(function (res) {
                    resources[res].amount += buildings["reactor"].base_cost[res];
                });
                purchase_building("reactor", 1);
            },
            "cost": {
                "money": 50000000,
                "research": 20,
            },
            "tooltip": "Research how to use uranium for energy.",
            "name": "Uranium Research",
            "image": "uranium.png",
            "repeats": false,
        },
        "more_events": {
            "unlock": function () { return resources["uranium"].amount > 10; },
            "purchase": function () { },
            "cost": {
                "time": 20000,
                "refined_mana": 10000,
            },
            "tooltip": "Events are more common.",
            "name": "Unlimited Events",
            "image": "shield_on.png",
            "repeats": false,
        },
        "better_library": {
            "unlock": function () { return adventure_data["cath_discovery"] >= 3; },
            "purchase": function () {
                buildings["library"].price_ratio["iron"] = (buildings["library"].price_ratio["iron"] - 1) * .75 + 1;
                buildings["library"].price_ratio["book"] = (buildings["library"].price_ratio["book"] - 1) * .75 + 1;
                buildings["book_printer"].flavor = "New and improved: now prints 50 Shades of Grey.";
            },
            "cost": {
                "book": 5000,
            },
            "tooltip": "Print more material for your libraries.",
            "name": "Reading Material",
            "image": "",
            "repeats": false,
        },
        "better_library_2": {
            "unlock": function () { return purchased_upgrades.indexOf("better_library") != -1; },
            "purchase": function () {
                buildings["library"].price_ratio["iron"] = (buildings["library"].price_ratio["iron"] - 1) * .67 + 1;
                buildings["library"].price_ratio["book"] = (buildings["library"].price_ratio["book"] - 1) * .67 + 1;
                buildings["book_printer"].flavor = "New and even more improved: now prints Harry Potter. All of them.";
            },
            "cost": {
                "book": 15000,
            },
            "tooltip": "Start printing actually good books for your libraries.",
            "name": "Good Reading Material",
            "image": "",
            "repeats": false,
        },
        "sandcastles": {
            "unlock": function () {
                /* Since we check if it's unlocked first, we can set the cost in this function.*/
                if (adventure_data["sandcastle_boost_unlocked"]) {
                    remaining_upgrades["sandcastles"].cost = { "sand": 1000000 * adventure_data["sandcastle_boost_unlocked"] };
                    return true;
                }
                else {
                    return false;
                }
            },
            "purchase": function () {
                /* Next one costs more, remove this one from purchased ones. */
                adventure_data["sandcastle_boost_unlocked"]++;
                resources["sandcastle"].amount++;
            },
            "cost": {
                "sand": 1000000,
            },
            "tooltip": "Build a sandcastle.",
            "name": "Sandcastle",
            "image": "",
            "repeats": true,
        },
        "glass_bottles": {
            "unlock": function () { return buildings["glass_jeweler"].amount > 0 && adventure_data["science_level"] > 0; },
            "purchase": function () {
                var comp_state = buildings["glass_jeweler"].on;
                if (comp_state) {
                    toggle_building_state("glass_jeweler");
                }
                buildings["glass_jeweler"]["generation"]["jewelry"] = 0;
                buildings["glass_jeweler"]["generation"]["glass_bottle"] = 0.01;
                if (comp_state) {
                    toggle_building_state("glass_jeweler");
                }
            },
            "cost": {
                "money": 250000,
                "glass": 5000,
                "research": 30,
            },
            "tooltip": "Glassblowers make glass bottles instead of jewelry.",
            "name": "Bottle Making",
            "image": "",
            "repeats": false,
        },
        "money_crisis_slow_1": {
            "unlock": function () {
                if (event_flags["crisis_slow_1_increase"] == undefined) {
                    event_flags["crisis_slow_1_increase"] = 0;
                }
                /* Doubles cost each time purchased. */
                remaining_upgrades["money_crisis_slow_1"].cost["money"] = Math.pow(4, event_flags["crisis_slow_1_increase"]);
                return buildings["bank"].generation["money"] <= 5 && event_flags["bribed_politician"] == "money";
            },
            "purchase": function () {
                var comp_state = buildings["bank"].on;
                if (comp_state) {
                    toggle_building_state("bank");
                }
                buildings["bank"]["generation"]["money"] *= 10;
                event_flags["crisis_slow_1_increase"]++;
                remaining_upgrades["money_crisis_slow_1"].name = ["Raise Taxes", "Lower Taxes"][Math.random() > 0.5 ? 1 : 0];
                if (comp_state) {
                    toggle_building_state("bank");
                }
            },
            "cost": {
                "money": 1,
            },
            "tooltip": "Banks produce 10x money.",
            "name": "Lower taxes",
            "image": "money.png",
            "repeats": true,
        },
        "money_crisis_slow_2": {
            "unlock": function () {
                return buildings["bank"].base_cost["money"] <= 0.5 && !event_flags["crisis_averted"];
            },
            "purchase": function () {
                event_flags["to_money_decrease"] += 120;
            },
            "cost": {
                "oil": 10000,
            },
            "tooltip": "Gives an extra 2 minutes before bank generation falls again.",
            "name": "Oil-backed currency",
            "image": "money.png",
            "repeats": true,
        },
        "money_crisis_avert": {
            "unlock": function () {
                return buildings["bank"].base_cost["money"] == 0;
            },
            "purchase": function () {
                event_flags["crisis_averted"] = true;
                buildings["bank"].generation["money"] = 50;
                resources_per_sec["money"] += 50 * buildings["bank"].amount; /* We can assume they generate nothing at this point. */
                buildings["big_bank"].generation["money"] = 500;
                resources_per_sec["money"] += 500 * buildings["big_bank"].amount;
            },
            "cost": {
                "money": 1000000000,
            },
            "tooltip": "Rebuilds your economy. Solves economy collapse until you prestige.",
            "name": "MAKE MORE JOBS!",
            "image": "money.png",
            "repeats": false,
        },
        "trade": {
            "unlock": function () { return false; },
            "purchase": function () { },
            "cost": {},
            "tooltip": "",
            "name": "Trade Items<br />",
            "image": "money.png",
            "repeats": true,
        },
    };
    event_flags = {};
    $("#buy_amount").val(1);
}
var prestige = {
    points: function () {
        var prestige_points = 0;
        Object.keys(resources).forEach(function (res) { return prestige_points += resources[res].amount * Math.abs(resources[res].value); });
        return prestige_points;
    },
    /* Calculate mana gain */
    mana: function () {
        var prestige_points = prestige.points();
        var mana = buildings["s_manastone"].amount;
        var mana_gain = prestige_points / 15000 - Math.pow(mana, 1.3) * .5; /* One for every 20k pp, and apply reduction based off of current mana */
        mana_gain = Math.floor(Math.pow(Math.max(0, mana_gain), .36)); /* Then raise to .33 power and apply some rounding/checking */
        mana_gain = mana_gain / (1 + Math.floor(mana / 50) * .5); /* Then divide gain by a number increasing every 50 mana. */
        if (mana_gain > 50) {
            mana_gain = 50 + (mana_gain - 50) / 2;
        }
        return Math.round(mana_gain);
    },
    percent_through: function () {
        return Math.max(0, Math.min(100, Math.floor((prestige.points() / 15000) / (Math.pow(buildings["s_manastone"].amount, 1.3) * .5 + 1) * 100)));
    },
    run: function (ask) {
        if (ask === void 0) { ask = true; }
        var mana_gain = prestige.mana();
        var mana = buildings["s_manastone"].amount;
        if (mana_gain < 1 && ask) {
            if (!confirm("Prestige now wouldn't produce mana! As you get more mana, it gets harder to make your first mana stone in a run. You are currently " + prestige.percent_through().toString() + "% of the way to your first mana. Prestige anyway?")) {
                return;
            }
        }
        if (!ask || confirm("You will lose all resources and all buildings but gain " + mana_gain.toString() + " mana after reset. Proceed?")) {
            var total_mana = buildings["s_manastone"].amount + mana_gain;
            set_initial_state();
            buildings["s_manastone"].amount = total_mana;
            adventure_data.current_location = "home"; /* You have to prestige at home. */
            save();
            location.reload();
        }
    },
    update: function () {
        if (prestige.mana()) {
            $("#prestige > span").first().html("Prestige&nbsp;(" + format_num(prestige.mana(), false) + ")");
        }
        else {
            $("#prestige > span").first().html("Prestige&nbsp;(" + prestige.percent_through().toString() + "%)");
        }
    }
};
function add_log_elem(to_add) {
    while ($("#log > span").length >= 10) {
        $("#log > span").last().remove(); /* Remove last child. Repeat until no more. */
    }
    $("#log").prepend("<span>" + to_add + "<br />" + "</span>");
}
function save() {
    Object.keys(resources).forEach(function (type) {
        localStorage["res-" + type] = resources[type].amount;
    });
    Object.keys(buildings).forEach(function (type) {
        localStorage["build-" + type] = JSON.stringify(buildings[type]);
    });
    localStorage["flags"] = JSON.stringify(event_flags);
    localStorage["upgrades"] = JSON.stringify(purchased_upgrades);
    localStorage["last_save"] = Date.now();
    localStorage["adventure"] = JSON.stringify(adventure_data);
    localStorage["groupings"] = JSON.stringify(groupings);
    $('#save_text').css('opacity', '1');
    setTimeout(function () { return $('#save_text').css({ 'opacity': '0', 'transition': 'opacity 1s' }); }, 1000);
    console.log("Saved");
    add_log_elem("Saved!");
}
function load() {
    console.log("Loading resources...");
    Object.keys(resources).forEach(function (type) {
        if (localStorage.getItem("res-" + type)) {
            resources[type].amount = parseFloat(localStorage.getItem("res-" + type));
        }
    });
    console.log("Loading buildings...");
    Object.keys(buildings).forEach(function (type) {
        if (localStorage.getItem("build-" + type)) {
            buildings[type] = JSON.parse(localStorage.getItem("build-" + type));
            if (buildings[type].amount == null) {
                buildings[type].amount = Infinity;
            }
            /* Show how many buildings they have and set tooltip properly */
            $('#building_' + type + " > .building_amount").html(format_num(buildings[type].amount, false));
        }
    });
    console.log("Loading flags...");
    if (localStorage.getItem("flags")) {
        event_flags = JSON.parse(localStorage.getItem("flags"));
    }
    console.log("Setting workshop mode...");
    if (buildings["s_manastone"].amount > 0) {
        $("#spells").removeClass("hidden");
        s_workshop(buildings["s_workshop"].mode); /* Load workshop option */
    }
    console.log("Loading upgrades...");
    if (!localStorage.getItem("upgrades")) {
        purchased_upgrades = [];
    }
    else {
        purchased_upgrades = JSON.parse(localStorage.getItem("upgrades"));
    }
    console.log("Loading last update");
    if (localStorage.getItem("last_save")) {
        last_update = parseInt(localStorage.getItem("last_save"));
    }
    console.log("Loading adventure mode");
    if (localStorage.getItem("adventure")) {
        adventure_data = JSON.parse(localStorage.getItem("adventure"));
    }
    console.log("Loading groupings");
    if (localStorage.getItem("groupings")) {
        groupings = JSON.parse(localStorage.getItem("groupings"));
        if (adventure_data["groupings_unlocked"]) {
            $("#production_box").parent().removeClass("hidden");
            $("#all_on").addClass("hidden");
            $("#all_off").addClass("hidden");
        }
    }
    console.log("Loading theme");
    if (!localStorage.getItem("theme")) {
        localStorage["theme"] = "dark"; /* Default dark theme. */
    }
    change_theme(localStorage.getItem("theme"));
    purchased_upgrades.forEach(function (upg) {
        var upg_name = remaining_upgrades[upg].name;
        delete remaining_upgrades[upg]; /* They shouldn't be able to get the same upgrade twice, so delete what was bought. */
        update_total_upgrades(upg_name);
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
    var save_data = {};
    Object.keys(localStorage).forEach(function (item) {
        save_data[item] = localStorage[item];
    });
    var text = btoa(JSON.stringify(save_data));
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
    try {
        loaded_data = JSON.parse(loaded_data);
        Object.keys(loaded_data).forEach(function (key) {
            localStorage[key] = loaded_data[key];
        });
    }
    catch (e) {
        /* Using old save probably */
        loaded_data.split(';').forEach(function (data) {
            try {
                var split_data = data.replace(' ', '').split("=");
                localStorage[split_data[0]] = split_data[1];
            }
            catch (e) {
                console.error(e.message);
            }
        });
    }
    location.reload();
}
function toggle_building_state(name) {
    if (buildings[name].on) {
        if (name == "s_mana_refinery") {
            return; /* Can't turn off the refinery */
        }
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
        /* Make sure we can run for 1s first */
        try {
            Object.keys(buildings[name].generation).forEach(function (key) {
                /* Make sure we can still run buildings if they generate a resource we have negative of. */
                if (buildings[name].generation[key] < 0 && buildings[name].amount * buildings[name].generation[key] * -1 > resources[key].amount) {
                    throw "Can't run it for enough time, building stays off.";
                }
            });
        }
        catch (e) {
            /* We don't want this error going all the way through the stack as a ton of places call this function and need to continue (they rely on it silently failing) */
            console.error(e);
            return 1;
        }
        buildings[name].on = true;
        /* Go through each resource it generates... */
        Object.keys(buildings[name].generation).forEach(function (key) {
            /* And increase production */
            resources_per_sec[key] += buildings[name].amount * buildings[name].generation[key];
            /* Also for special production. */
            if (resources[key].value == 0) {
                resources[key].amount += buildings[name].amount * buildings[name].generation[key];
            }
        });
        $("#toggle_" + name).addClass("building_state_on");
        $("#toggle_" + name).removeClass("building_state_off");
        $("#toggle_" + name).text("On");
    }
}
var time_on = false;
function toggle_time() {
    time_on = !time_on;
    $("#time_toggle").html((time_on ? "Slow" : "Speed") + " time");
}
var last_update = Date.now();
function update() {
    /* Find time since last update. */
    var delta_time = Date.now() - last_update;
    last_update = Date.now();
    if (delta_time > 15000) {
        resources["time"].amount += delta_time / 1000; /* 1 sec of production, rest goes to time. */
        return;
    }
    if (time_on) {
        /* Find how much time they will use up */
        if (resources["time"].amount < 10) {
            delta_time += resources["time"].amount * 1000; /* Give extra production for however much they can get, and remove that much time. */
            toggle_time();
            $("#time").addClass("hidden");
            resources["time"].amount = 0;
        }
        else {
            delta_time += 10000;
            resources["time"].amount -= 10;
        }
    }
    /* Check for negative resources or resources that will run out. */
    Object.keys(resources).forEach(function (res) {
        if (isNaN(resources[res].amount)) {
            resources[res].amount = 0;
        }
        if (Math.abs(resources[res].amount) > 0.1) {
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
    /* Perform spell actions */
    SPELL_BUILDINGS.forEach(function (build) {
        if (buildings[build].on) {
            spell_funcs[buildings[build].update](delta_time);
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
        $("#" + key + " span").first().html((key.charAt(0).toUpperCase() + key.slice(1)).replace("_", " ") + ": " + format_num(resources[key].amount, false));
        /* Same for per sec */
        $("#" + key + "_per_sec").text((resources_per_sec[key] > 0 ? "+" : "") + format_num(resources_per_sec[key]) + "/s");
        /* Don't color special resources */
        if (resources[key].value <= 0) {
            return;
        }
        /* Color it. */
        if (resources[key].amount < -0.0001) {
            $("#" + key).css("color", "red");
        }
        else {
            $("#" + key).css("color", "");
        }
        /* Color per sec. Hide if super small. */
        if (resources_per_sec[key] < -0.0001) {
            $("#" + key + "_per_sec").css("color", "red");
        }
        else if (resources_per_sec[key] > 0.0001) {
            $("#" + key + "_per_sec").css("color", "");
        }
        else {
            $("#" + key + "_per_sec").text("");
        }
    });
    /* Unhide buildings */
    Object.keys(buildings).forEach(function (build) {
        if (SPELL_BUILDINGS.indexOf(build) == -1) {
            $('#building_' + build + " > .tooltiptext").html(gen_building_tooltip(build)); /* Generate tooltip for it. */
        }
        if (buildings[build].amount > 0 && SPELL_BUILDINGS.indexOf(build) == -1) {
            $("#building_" + build).parent().removeClass("hidden"); /* Any owned building is unlocked. Needed in case they sell previous ones and reload. */
            UNLOCK_TREE[build].forEach(function (unlock) {
                $("#building_" + unlock).parent().removeClass("hidden");
            });
        }
        try {
            var amount_1 = parseInt($("#buy_amount").val());
            if (isNaN(amount_1)) {
                amount_1 = 1;
            }
            Object.keys(buildings[build].base_cost).forEach(function (key) {
                var cost = buildings[build].base_cost[key] * Math.pow(buildings[build].price_ratio[key], buildings[build].amount) * (1 - Math.pow(buildings[build].price_ratio[key], amount_1)) / (1 - buildings[build].price_ratio[key]);
                if (Math.pow(buildings[build].price_ratio[key], buildings[build].amount + amount_1 - 1) == Infinity) {
                    cost = Infinity;
                }
                if (cost > resources[key].amount) {
                    throw Error("Not enough resources!");
                }
            });
            $("#building_" + build).removeClass("building_expensive");
        }
        catch (e) {
            $("#building_" + build).addClass("building_expensive");
        }
    });
    /* Show favicon */
    if ($("#events").hasClass("hidden")) {
        $("#icon").attr("href", "images/favicon.ico");
    }
    else {
        $("#icon").attr("href", "images/favicon2.ico");
    }
}
/* Not in update as this could change a lot if they have too many unpurchased upgrades. */
function update_upgrade_list() {
    /* Loop through all remaining upgrades */
    Object.keys(remaining_upgrades).forEach(function (upg_name) {
        if (remaining_upgrades[upg_name].unlock()) {
            $("#upgrade_" + upg_name).removeClass("hidden");
            var color_1 = ""; /* Set color to lightgray or red depending on if they can afford it */
            Object.keys(remaining_upgrades[upg_name].cost).forEach(function (res) {
                if (resources[res].amount < remaining_upgrades[upg_name].cost[res]) {
                    color_1 = "red";
                }
            });
            $("#upgrade_" + upg_name).css("color", color_1);
            /* Refresh tooltip */
            var tooltip = remaining_upgrades[upg_name].tooltip;
            var reg_costs_1 = [];
            var req_costs_1 = [];
            Object.keys(remaining_upgrades[upg_name].cost).forEach(function (res) {
                if (resources[res].value) {
                    var cost = "";
                    if (resources[res].amount < remaining_upgrades[upg_name].cost[res]) {
                        cost += "<span style='color: red'>";
                    }
                    else {
                        cost += "<span class='fgc'>";
                    }
                    cost += format_num(remaining_upgrades[upg_name].cost[res], true) + " " + res.replace("_", " ") + "</span>";
                    reg_costs_1.push(cost);
                }
                else {
                    var cost = "";
                    if (resources[res].amount < remaining_upgrades[upg_name].cost[res]) {
                        cost += "<span style='color: red'>";
                    }
                    else {
                        cost += "<span class='fgc'>";
                    }
                    cost += "Requires " + format_num(remaining_upgrades[upg_name].cost[res], true) + " " + res.replace("_", " ") + "</span>";
                    req_costs_1.push(cost);
                }
            });
            if (reg_costs_1.length && upg_name != "trade") {
                tooltip += "<br />Costs " + reg_costs_1.join(", ");
            }
            if (req_costs_1.length) {
                tooltip += "<br />" + req_costs_1.join("<br />");
            }
            $("#upgrade_" + upg_name + " .tooltiptext").html(tooltip);
        }
        else {
            $("#upgrade_" + upg_name).addClass("hidden");
        }
    });
}
function update_total_upgrades(name) {
    /* Update upgrade total */
    $("#num_upgrades").html("Upgrades: " + purchased_upgrades.length.toString());
    /* Update tooltip list of purchased upgrades */
    $("#purchased_upgrades").append("<br />" + name.replace("<br />", ""));
}
function gen_building_tooltip(name) {
    var amount = parseInt($("#buy_amount").val());
    if (isNaN(amount)) {
        amount = 1;
    }
    var gen_text = "Generates ";
    /* Add resource gen, update how much each one generates. */
    Object.keys(buildings[name].generation).forEach(function (key) {
        if (resources[key].value) {
            gen_text += format_num(buildings[name].generation[key]) + " " + key.replace("_", " ") + "/s, ";
        }
        else {
            gen_text += format_num(buildings[name].generation[key]) + " " + key.replace("_", " ") + ", ";
        }
    });
    var cost_text = "Costs ";
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        /* Total cost for a buy all. Uses a nice summation formula. */
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        if (Math.pow(buildings[name].price_ratio[key], buildings[name].amount + amount - 1) == Infinity && !isNaN(cost)) {
            cost = Infinity;
        }
        if (cost > resources[key].amount) {
            cost_text += "<span style='color: red'>";
        }
        else if (isNaN(cost)) {
            cost_text += "<span style='color: green'>";
        }
        else {
            cost_text += "<span>";
        }
        cost_text += format_num(cost, false) + " " + key.replace("_", " ") + "</span>, ";
    });
    if (cost_text == "Costs ") {
        cost_text = "Unbuyable,";
    } /* Free buildings don't have a cost. */
    var flavor_text = "<hr><i style='font-size: small'>" + buildings[name].flavor + "</i>";
    if (buildings[name].flavor == undefined || buildings[name].flavor == "") {
        flavor_text = "";
    }
    return gen_text.trim().replace(/.$/, ".") + "<br />" + cost_text.trim().replace(/.$/, ".") + flavor_text;
}
function purchase_building(name, amount) {
    if (amount === void 0) { amount = null; }
    if (amount == null) {
        amount = parseInt($("#buy_amount").val());
    }
    if (isNaN(amount)) {
        amount = 1;
    }
    if (amount < 0) {
        amount = 0;
    }
    /* Make sure they have enough to buy it */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Checking money");
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        /* Make it so they can't buy above what they should be able to get. */
        if (Math.pow(buildings[name].price_ratio[key], buildings[name].amount + amount - 1) == Infinity && !isNaN(cost)) {
            cost = Infinity;
        }
        if (cost > resources[key].amount) {
            add_log_elem("You can't afford that. Missing: " + key.replace("_", " "));
            throw Error("Not enough resources!");
        }
        else if (isNaN(cost)) {
            add_log_elem("Sorry, but " + key.replace("_", " ") + " is not fuzzy.");
            throw Error("fuzzy resources!");
        }
    });
    /* Spend money to buy */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Spending money");
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        resources[key].amount -= cost;
    });
    /* Add resource gen */
    Object.keys(buildings[name].generation).forEach(function (key) {
        if (buildings[name].on) {
            resources_per_sec[key] += buildings[name].generation[key] * amount;
        }
    });
    buildings[name].amount += amount;
    $('#building_' + name + " > .building_amount").html(format_num(buildings[name].amount, false));
}
function destroy_building(name) {
    var amount = parseInt($("#buy_amount").val());
    if (isNaN(amount)) {
        amount = 1;
    }
    for (var i = 0; i < amount; i++) {
        if (buildings[name].amount <= 1) {
            add_log_elem("You can't destroy your last building.");
            return; /* Can't sell last building */
        }
        /* Remove resource gen */
        Object.keys(buildings[name].generation).forEach(function (key) {
            if (buildings[name].on) {
                resources_per_sec[key] -= buildings[name].generation[key];
            }
        });
        /* Refund resources a bit. Get 30% back. */
        Object.keys(buildings[name].base_cost).forEach(function (key) {
            resources[key].amount += 0.3 * buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - 1);
        });
        buildings[name].amount--;
        $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());
    }
}
function purchase_upgrade(name) {
    var upg = remaining_upgrades[name];
    /* Check that they have enough */
    Object.keys(upg.cost).forEach(function (resource) {
        if (resources[resource].amount < upg.cost[resource]) {
            add_log_elem("Not enough resources! Missing: " + resource.replace("_", " "));
            throw Error("Not enough resources!");
        }
    });
    /* Spend it */
    Object.keys(upg.cost).forEach(function (resource) {
        resources[resource].amount -= upg.cost[resource];
    });
    /* Do cleanup. Get benefit from having it, remove it from purchasable upgrades, add it to purchased upgrades, remove from page */
    upg.purchase();
    if (!upg.repeats) {
        purchased_upgrades.push(name);
        var upg_name = remaining_upgrades[name].name;
        delete remaining_upgrades[name];
        update_total_upgrades(upg_name);
        $("#upgrade_" + name).remove();
    }
    else {
        $("#upgrade_" + name).addClass("hidden");
    }
}
function random_title() {
    var TITLES = [
        "CrappyIdle v.π²",
        "Drink Your Ovaltine!",
        "(!) Not Responding (I lied)",
        "17 New Resources That Will Blow Your Mind!",
        "Ÿ̛̦̯ͬ̔̾̃ͥ͑o͋ͩ̽̓͋̚͘u͚̼̜̞͉͓̹ͦ͒͌̀ ̄͋̉̓҉̖̖̠̤ņ͔̄͟͟e̦̝̻̼̖͖͋̓̔̓͒ͬe̷͈̗̻̘̩̙̖͗ͫͭͮ͌̃́ͬ̔d̥̞ͨ̏͗͆̉ͩ ̨̟̭̻͔̰͓͍̤͍̀ͤͤ̎͐͘͠m͙͈͖̱͍̖̤͑̃͐͋ͪ̐ͯ̏͘ͅȍ̼̭̦͚̥̜͉̥̱ͬ͞r̥̣̰͈̻̰ͮ̓̚e̳͊ͯ͞ ̏ͯ̈́҉̛̮͚̖͈̼g̩͖̙̞̮̟̍ͦͫ̓ͭͥ̀o̧̻̞̰͉̤͇̭̘͓ͨ̆̔ͨl̴͕͉̦̩̟̤̰̃͋̃̉̓͌ͪ͌ͩd̢̨̲̻̿ͫ",
        "Help im trapped in an html factory",
        "This title dedicated to /u/GitFlucked who really didn't like the previous one.",
        "Try Foodbits! They're super tasty*! *ᴾᵃʳᵗ ᵒᶠ ᵃ ᶜᵒᵐᵖˡᵉᵗᵉ ᵇʳᵉᵃᵏᶠᵃˢᵗ⋅ ᴺᵒᵗ ᶠᵒʳ ʰᵘᵐᵃⁿ ᶜᵒⁿˢᵘᵐᵖᵗᶦᵒⁿ⋅ ᴰᵒ ⁿᵒᵗ ᶜᵒⁿˢᵘᵐᵉ ʷʰᶦˡᵉ ᵘⁿᵈᵉʳ ᵗʰᵉ ᶦⁿᶠˡᵘᵉⁿᶜᵉ ᵒᶠ ᵈʳᵘᵍˢ ᵒʳ ᵃˡᶜᵒʰᵒˡ⋅ ᴼʳ ᵃᶦʳ⋅",
        "BUY ME MORE JEWELRY!",
        "Beware the space squid",
        "Now with more kittens",
        "Technomancy",
        "You grew a CARROT! Your mother is so proud!",
        "Strangely Bubbling Potion of Dancing",
        "...",
    ];
    document.title = TITLES.filter(function (item) { return item !== document.title; })[Math.floor(Math.random() * (TITLES.length - 1))];
}
function change_theme(new_theme) {
    var themes = {
        "light": ".bgc {background-color: white;}.fgc {color: black;}.bgc_second {background-color: #CCC;}",
        "dark": ".bgc {background-color: black;}.fgc {color: lightgray;}.bgc_second {background-color: #333;}",
        "halloween": ".bgc {background-color: black;}.fgc {color: darkorange;}.bgc_second {background-color: purple;}",
        "christmas": ".bgc {background-color: #050;}.fgc {color: #A00;}.bgc_second {background-color: #400;}",
        "crazy": "                                              \
          .bgc, .bgc_second, .fgc {                             \
            animation: strobe 200ms steps(1,end) infinite;      \
            animation-duration: 250ms;                          \
            transition: flex .3s;                               \
          }                                                     \
          @keyframes strobe {                                   \
              16% { background: red; color: blue; }             \
              33% { background: orange; color: purple;}         \
              49% { background: yellow; color: red; }           \
              66% { background: green; color: orange; }         \
              82% { background: blue; color: yellow; }          \
              0%  { background: purple; color: green; }         \
          }                                                     \
         ",
    };
    var theme_music = {
        "light": "",
        "dark": "",
        "halloween": "",
        "christmas": "https://www.youtube.com/embed/JXjQO0UixxM",
        "crazy": "https://www.youtube.com/embed/MTrzTABzLfY",
    };
    /* Make sure the theme exists */
    if (themes[new_theme]) {
        /* Set a <style> field in the document. */
        $("#color_theme").html(themes[new_theme]);
        /* Remember what theme */
        localStorage["theme"] = new_theme;
        /* Play music for it (or stop music if there is none) */
        if (theme_music[new_theme]) {
            $("#music").html("<iframe width='0' height='0' src='" + theme_music[new_theme] + "?autoplay=1&loop=1' frameborder='0'></iframe>");
        }
        else {
            $("#music").html("");
        }
        /* Set the select box. This is really just for loading, but best to make sure. */
        $("#theme_select").val(new_theme);
    }
}
/**
 * Maps Grouping name => buildings affected.
 */
var groupings = {};
function setup_groups() {
    /* Add all on/off */
    groupings["All"] = Object.keys(buildings);
    /* Remove spell buildings from this. */
    SPELL_BUILDINGS.forEach(function (build) {
        groupings["All"].splice(groupings["All"].indexOf(build), 1);
    });
    /* Ugh. We have to make a copy. Because otherwise we modify SPELL_BUILDINGS, even though it's marked as const. */
    groupings["Spells"] = JSON.parse(JSON.stringify(SPELL_BUILDINGS));
    groupings["Spells"].splice(groupings["Spells"].indexOf("s_manastone"), 1);
    groupings["Spells"].splice(groupings["Spells"].indexOf("s_mana_refinery"), 1);
    groupings["Spells"].splice(groupings["Spells"].indexOf("s_final"), 1); /* This building isn't officially a thing yet and we don't want it on. */
    /* Clear group name box*/
    $("#group_names").html("<table></table>");
    Object.keys(groupings).forEach(function (grouping) {
        $("#group_names > table").append("<tr></tr>");
        $("#group_names tr").last().append("<td style='overflow: auto; max-width: 5em;'>" + grouping + "</td>");
        /* Can't edit the default filters. */
        if (grouping != "All" && grouping != "Spells") {
            $("#group_names tr").last().append("<td><span class='clickable'>Edit</span></td>");
            $("#group_names span").last().click(function () {
                draw_group(grouping);
            });
        }
        else {
            $("#group_names tr").last().append("<td></td>");
        }
        $("#group_names tr").last().append("<td><span class='clickable' style='background-color: green;'>On</span></td>");
        $("#group_names span").last().click(function () {
            var failed = false;
            groupings[grouping].forEach(function (build) {
                /* Turn them all on. Note if we failed. */
                if (!buildings[build].on && toggle_building_state(build)) {
                    failed = true;
                }
            });
            if (failed) {
                alert("Turning all on failed.");
            }
        });
        $("#group_names tr").last().append("<td><span class='clickable' style='background-color: red;'>Off</span></td>");
        $("#group_names span").last().click(function () {
            groupings[grouping].forEach(function (build) {
                /* Turn them all off. */
                if (buildings[build].on) {
                    toggle_building_state(build);
                }
            });
        });
    });
    $("#group_names").append("<span class='clickable' style='position: relative; left: 6em;'>+</span>");
    $("#group_names > span").last().click(function () {
        var group_name = prompt("What will you name your group?").trim();
        /* New group and has a name */
        if (group_name && groupings[group_name] == undefined) {
            if (groupings[group_name] == undefined) {
                groupings[group_name] = [];
            }
            setup_groups();
            draw_group(group_name);
        }
    });
}
function draw_group(name) {
    /* Clear old stuff and say what we're editing. */
    $("#group_data").html("");
    $("#group_data").html("<div style='text-align: center; border-bottom: solid 1px;'>" + name + " <span class='clickable'>Delete</span></div>");
    $("#group_data > div > span").click(function () {
        if (confirm("Really delete group " + name + "?")) {
            delete groupings[name];
            setup_groups();
            $("#group_data").html("");
        }
    });
    /* Now show every building (that they can see) and if it's in or not.
        We're also specifically excluding two buildings because they should never be able to be turned off.
    */
    Object.keys(buildings).forEach(function (build) {
        if (build != "s_manastone" && build != "s_mana_refinery" && !$("#building_" + build).parent().hasClass("hidden")) {
            /* Get the name */
            var b_name = $("#building_" + build + " .building_name").text();
            /* Get the color. Red if not in the grouping, green if it is. */
            var color = groupings[name].indexOf(build) == -1 ? "red" : "green";
            /* Add the element */
            $("#group_data").append("<span class='clickable' style='color:" + color + "'>" + b_name + "</span><br/>");
            /* Add the onclick handler to add/remove it from the group. */
            $("#group_data > span").last().click(function () {
                /* Check if it's in the group or not. */
                if (groupings[name].indexOf(build) == -1) {
                    groupings[name].push(build);
                }
                else {
                    groupings[name].splice(groupings[name].indexOf(build), 1);
                }
                draw_group(name);
            });
        }
    });
}
function prng(seed) {
    if (seed <= 0) {
        seed = 1234567;
    }
    return seed * 16807 % 2147483647;
}
window.onload = function () {
    set_initial_state();
    load();
    setInterval(update, 35);
    /* Add upgrades to be unhidden*/
    /* Loop through all remaining upgrades */
    Object.keys(remaining_upgrades).forEach(function (upg_name) {
        var upg_elem = "<li id='upgrade_" + upg_name + "' class='upgrade tooltip fgc bgc_second' onclick=\"purchase_upgrade('" + upg_name + "')\" style='text-align: center;'><span>" + remaining_upgrades[upg_name].name + "<br />";
        /* Stops error message spamming in the console if an unlocked upgrade has no image. */
        if (remaining_upgrades[upg_name].image) {
            upg_elem += "<img src='images/" + remaining_upgrades[upg_name].image + "' alt='' style='width: 3em; height: 3em; float: bottom;' />";
        }
        upg_elem += "</span><span class='tooltiptext fgc bgc_second' style='opacity: 1;'>" + remaining_upgrades[upg_name].tooltip + "</span></li>";
        $("#upgrades > ul").append(upg_elem);
    });
    update_upgrade_list();
    setInterval(update_upgrade_list, 500);
    /* Set prestige button updates. So you see how much mana you would get. */
    prestige.update();
    setInterval(prestige.update, 1000);
    random_title();
    setInterval(random_title, 600000);
    SPELL_BUILDINGS.forEach(function (build) {
        if (buildings["s_manastone"].amount * 2 < buildings[build].amount * -buildings[build].generation["mana"]) {
            $("#building_" + build).parent().addClass("hidden");
        }
    });
    /* Give spell rewards */
    if (buildings["s_manastone"].amount > 0 && event_flags["start_buildings"] == undefined) {
        event_flags["start_buildings"] = true;
        if (resources["money"].amount != 10) {
            resources["money"].amount = 10;
        }
        /* What building each mana gives. */
        var start_buildings = [
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "furnace",
            "gold_finder",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "compressor",
            "",
            "",
            "",
            "",
            "oil_well",
            "bank",
            "bank",
            "bank",
            "bank",
            "oil_well",
            "",
            "",
            "",
            "",
            "library",
            "library",
            "library",
            "library",
            "library",
            "library",
            "bank",
            "bank",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "",
            "",
            "",
            "",
            "oil_engine",
            "solar_panel",
            "solar_panel",
            "solar_panel",
            "solar_panel",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "",
            "",
            "",
            "",
            "skyscraper",
            "bank",
            "skyscraper",
            "bank",
            "skyscraper",
            "bank",
            "skyscraper",
            "bank",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "bank",
            "mine",
            "bank",
            "logging",
            "furnace",
            "gold_finder",
            "compressor",
            "paper_mill",
            "ink_refinery",
            "paper_mill"
        ];
        /* Only go as much as they have mana for or we boosts exist for. */
        for (var i = 0; i < Math.min(buildings["s_manastone"].amount, start_buildings.length); i++) {
            var bname = start_buildings[i];
            if (bname == "") {
                continue;
            }
            var comp_state = buildings[bname].on;
            if (comp_state) {
                toggle_building_state(bname);
            }
            buildings[bname].amount++;
            if (comp_state) {
                toggle_building_state(bname);
            }
            $("#building_" + bname + "  > .building_amount").html(format_num(buildings[bname].amount, false));
        }
    }
    /* Start our event system */
    var to_next_event = 2 * 60000 + Math.random() * 60000 * 2;
    if (purchased_upgrades.indexOf("more_events") != -1) {
        to_next_event *= .7;
    }
    setTimeout(handle_event, to_next_event);
    setup_events();
    /* Set up for adventure mode requests */
    $.ajaxSetup({
        "async": false,
        "cache": false,
    });
    /* Make sure we have enough hydrogen mines */
    if (buildings["hydrogen_mine"].amount < adventure_data["hydrogen_mines"]) {
        var comp_state = buildings["hydrogen_mine"].on;
        if (comp_state) {
            toggle_building_state("hydrogen_mine");
        }
        buildings["hydrogen_mine"].amount = adventure_data["hydrogen_mines"];
        if (comp_state) {
            toggle_building_state("hydrogen_mine");
        }
        $("#building_hydrogen_mine  > .building_amount").html(format_num(buildings["hydrogen_mine"].amount, false));
    }
    setup_groups();
    /* Only set to save last in case something messes up. */
    setInterval(save, 30000);
};
function hack(level) {
    add_log_elem("You cheater :(");
    Object.keys(resources).forEach(function (r) { resources[r].amount = level; });
}
function superhack(level) {
    add_log_elem("You filthy cheater :(. You make me sad.");
    Object.keys(resources).forEach(function (r) { resources_per_sec[r] = level; });
}
//# sourceMappingURL=app.js.map