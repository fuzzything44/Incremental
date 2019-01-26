/// <reference path ="events.ts" />
/// <reference path ="spells.ts" />
var OMEGA = "Ω";
var DELTA = "Δ";
var EPSILON = "ε";
var PHI = "φ";
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
    if (num < 100000) { /* Show more precise values if we aren't going to numberformat*/
        if (show_decimals) {
            return (Math.round(num * 1000) / 1000).toString();
        }
        else {
            return Math.round(num).toString();
        }
    }
    else {
        var sf = 3;
        var fm = "standard";
        if (localStorage["notation_sci"] == "true") {
            fm = "scientific";
        }
        if (show_decimals) {
            sf = 5;
        }
        return numberformat.formatShort(num, { sigfigs: sf, format: fm });
    }
}
var resources = {};
var resources_per_sec = {};
var buildings = {};
var purchased_upgrades = []; /* Names of all purchased upgrades */
var remaining_upgrades = {}; /* All remaining upgrades that need to be purchased */
var UNLOCK_TREE = {
    "s_manastone": [],
    "s_essence": [],
    "s_mana_refinery": [],
    "s_goldboost": [],
    "s_energyboost": [],
    "s_trade": [],
    "s_startboost": [],
    "s_time_magic": [],
    "s_workshop": [],
    "s_time_maker": [],
    "s_workshop_2": [],
    "s_enchantment": [],
    "s_ai": [],
    "s_autoessence": [],
    "s_final": [],
    "s_challenge": [],
    "challenge_basic": [],
    "challenge_medium": [],
    "challenge_advanced": [],
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
    "magnet": ["steel_smelter"],
    "book_boost": [],
    "steel_smelter": [],
    "mithril_smelter": ["drill"],
    "drill": [],
    "big_bank": ["big_mine"],
    "big_mine": [],
    "hydrogen_mine": [],
    "mana_purifier": [],
    "omega_machine": [],
};
var SPELL_BUILDINGS = [
    "s_manastone",
    "s_essence",
    "s_goldboost",
    "s_energyboost",
    "s_trade",
    "s_startboost",
    "s_time_magic",
    "s_workshop",
    "s_time_maker",
    "s_mana_refinery",
    "s_workshop_2",
    "s_enchantment",
    "s_ai",
    "s_autoessence",
    "s_final",
    "s_challenge",
];
function set_initial_state() {
    var _a, _b;
    /*
        Each resource has a few different fields:
            amount: How many they have. This is the ONLY field stored on save/load
            value: How much it's worth (for prestige or otherwise).
            mult: The per-second multiplier. (Amount per second is stored elsewhere because bad design decisions). If you have +10/s and a mult of 2, you actually get +20/s. Only is applied for positive net changes.
            changes: List of [string, value] elements. Tracks what's modifying the /s gain to be displayed later. TODO: Actually do stuff with this.
    */
    resources = (_a = {
            "time": { "amount": 0, "value": -2, "mult": 1, "changes": {}, "ps_change": "" },
            "refined_mana": { "amount": 0, "value": -1, "mult": 1, "changes": {}, "ps_change": "" },
            "purified_mana": { "amount": 0, "value": -2500, "mult": 1, "changes": {}, "ps_change": "" },
            "fuel": { "amount": 0, "value": -1000, "mult": 1, "changes": {}, "ps_change": "" },
            "magic_bag": { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" }
        },
        _a[OMEGA] = { "amount": 0, "value": -15000000, "mult": 1, "changes": {}, "ps_change": "" },
        _a["mana"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["essence"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["energy"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["research"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["manager"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["sludge"] = { "amount": 0, "value": 0, "mult": 1, "changes": {}, "ps_change": "" },
        _a["money"] = { "amount": 10, "value": 1, "mult": 1, "changes": {}, "ps_change": "" },
        _a["stone"] = { "amount": 0, "value": 0.5, "mult": 1, "changes": {}, "ps_change": "" },
        _a["wood"] = { "amount": 0, "value": 0.5, "mult": 1, "changes": {}, "ps_change": "" },
        _a["iron_ore"] = { "amount": 0, "value": 1, "mult": 1, "changes": {}, "ps_change": "" },
        _a["coal"] = { "amount": 0, "value": 1, "mult": 1, "changes": {}, "ps_change": "" },
        _a["iron"] = { "amount": 0, "value": 4, "mult": 1, "changes": {}, "ps_change": "" },
        _a["gold"] = { "amount": 0, "value": 50, "mult": 1, "changes": {}, "ps_change": "" },
        _a["diamond"] = { "amount": 0, "value": 75, "mult": 1, "changes": {}, "ps_change": "" },
        _a["jewelry"] = { "amount": 0, "value": 300, "mult": 1, "changes": {}, "ps_change": "" },
        _a["oil"] = { "amount": 0, "value": 2, "mult": 1, "changes": {}, "ps_change": "" },
        _a["paper"] = { "amount": 0, "value": 4, "mult": 1, "changes": {}, "ps_change": "" },
        _a["ink"] = { "amount": 0, "value": 10, "mult": 1, "changes": {}, "ps_change": "" },
        _a["book"] = { "amount": 0, "value": 400, "mult": 1, "changes": {}, "ps_change": "" },
        _a["sand"] = { "amount": 0, "value": 2, "mult": 1, "changes": {}, "ps_change": "" },
        _a["glass"] = { "amount": 0, "value": 20, "mult": 1, "changes": {}, "ps_change": "" },
        _a["water"] = { "amount": 0, "value": 2, "mult": 1, "changes": {}, "ps_change": "" },
        _a["hydrogen"] = { "amount": 0, "value": 5, "mult": 1, "changes": {}, "ps_change": "" },
        _a["steel_beam"] = { "amount": 0, "value": 200, "mult": 1, "changes": {}, "ps_change": "" },
        _a["uranium"] = { "amount": 0, "value": 500, "mult": 1, "changes": {}, "ps_change": "" },
        _a["sandcastle"] = { "amount": 0, "value": 10000000, "mult": 1, "changes": {}, "ps_change": "" },
        _a["glass_bottle"] = { "amount": 0, "value": 25000, "mult": 1, "changes": {}, "ps_change": "" },
        _a["mithril"] = { "amount": 0, "value": 3500, "mult": 1, "changes": {}, "ps_change": "" },
        _a["void"] = { "amount": 0, "value": 100000, "mult": 1, "changes": {}, "ps_change": "" },
        _a);
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
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_essence": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "essence": 1,
            },
            "multipliers": {
                "energy": 0.1,
                "research": 0.1,
                "manager": 0.1,
                "money": 0.1,
                "stone": 0.1,
                "wood": 0.1,
                "iron_ore": 0.1,
                "coal": 0.1,
                "iron": 0.1,
                "gold": 0.1,
                "diamond": 0.1,
                "jewelry": 0.1,
                "oil": 0.1,
                "paper": 0.1,
                "ink": 0.1,
                "book": 0.1,
                "sand": 0.1,
                "glass": 0.1,
                "water": 0.1,
                "hydrogen": 0.1,
                "steel_beam": 0.1,
                "uranium": 0.1,
                "sandcastle": 0.1,
                "glass_bottle": 0.1,
                "mithril": 0.1,
                "void": 0.1,
            },
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_mana_refinery": {
            "on": true,
            "amount": 1,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": 0,
            },
            "multipliers": {},
            "update": "refinery",
            "free": 0,
            "flavor": "",
        },
        "s_goldboost": {
            "on": false,
            "amount": 2,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {
                "money": 0.5,
                "gold": 0.5,
            },
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_energyboost": {
            "on": false,
            "amount": 1,
            "base_cost": { "mana": 0 },
            "price_ratio": { "mana": 0 },
            "generation": {
                "mana": -3,
                "energy": 1,
            },
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_trade": {
            "on": false,
            "amount": 6,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "trade",
            "free": 0,
            "flavor": "",
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
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_time_magic": {
            "on": false,
            "amount": 40,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "time",
            "free": 0,
            "flavor": "",
        },
        "s_workshop": {
            "on": false,
            "amount": 50,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "nop",
            "mode": "iron",
            "free": 0,
            "flavor": "",
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
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_workshop_2": {
            "on": false,
            "amount": 200,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "workshop",
            "free": 0,
            "flavor": "",
        },
        "s_enchantment": {
            "on": false,
            "amount": 500,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "enchantment",
            "item": "",
            "time_left": 0,
            "free": 0,
            "flavor": "",
        },
        "s_final": {
            "on": false,
            "amount": 500,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "final",
            "strength": 2,
            "free": 0,
            "flavor": "",
        },
        "s_ai": {
            "on": false,
            "amount": Infinity,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
                "manager": 1 / 50,
            },
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "s_autoessence": {
            "on": false,
            "amount": Infinity,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "mana": -1,
            },
            "multipliers": {},
            "update": "autoessence",
            "free": 0,
            "flavor": "",
        },
        "s_challenge": {
            "on": true,
            "amount": 1,
            "base_cost": {},
            "price_ratio": {},
            "generation": {},
            "multipliers": {},
            "update": "nop",
            "free": 0,
            "flavor": "",
        },
        "challenge_basic": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "money": 10,
                "stone": 20,
                "wood": 20,
                "iron_ore": 10,
                "coal": 5,
            },
            "multipliers": {
                "money": 0.1,
                "stone": 0.1,
                "wood": 0.1,
            },
            "free": 0,
            "flavor": "Congratulations on beating the basic challenge.",
        },
        "challenge_medium": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "gold": 5,
                "diamond": 5,
                "oil": 15,
                "paper": 5,
                "ink": 5,
            },
            "multipliers": {
                "oil": 0.1,
                "book": 0.3,
                "glass": 0.1,
            },
            "free": 0,
            "flavor": "Another building to help you out.",
        },
        "challenge_advanced": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "steel_beam": 3,
                "uranium": 3,
                "manager": 3,
                "research": 5,
                "energy": 10,
            },
            "multipliers": {
                "steel_beam": 0.5,
                "fuel": 0.5,
                "hydrogen": 0.5
            },
            "free": 0,
            "flavor": "Woah, that's a lot of mana.",
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
            "multipliers": {},
            "free": 0,
            "flavor": "It's a pretty small branch bank.",
        },
        "oil_well": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 1000,
                "stone": 1000,
                "iron": 100
            },
            "price_ratio": {
                "money": 1.2,
                "stone": 1.1,
                "iron": 1.3,
            },
            "generation": {
                "oil": 0.1,
            },
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
            "flavor": "To find sand, first you must collect 10 mana.",
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
            "flavor": "",
        },
        "compressor": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 100,
                "stone": 300,
                "iron": 50
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
            "multipliers": {},
            "free": 0,
            "flavor": "Running this machine is a high-pressure job.",
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
            "flavor": "100% free-range, non-GMO, organic jewelry!",
        },
        "paper_mill": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 200,
                "iron": 100,
                "oil": 50,
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
            "multipliers": {},
            "free": 0,
            "flavor": "",
        },
        "ink_refinery": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 200,
                "iron": 100,
                "oil": 50,
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
            "multipliers": {},
            "free": 0,
            "flavor": "",
        },
        "money_printer": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 500,
                "iron": 100,
                "oil": 100,
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
            "multipliers": {},
            "free": 0,
            "flavor": "100% legal. Trust me on this.",
        },
        "book_printer": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "money": 5000,
                "iron": 500,
                "oil": 300,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
            "flavor": "This fuel is... not healthy.",
        },
        "magnet": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "iron": 10000,
                "steel_beam": 500,
            },
            "price_ratio": {
                "iron": 1.1,
                "steel_beam": 1.1,
            },
            "generation": {},
            "multipliers": {
                "iron": 0.1,
                "iron_ore": 0.1,
            },
            "free": 0,
            "flavor": "It's just a big magnet.",
        },
        "book_boost": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "energy": -1,
                "book": -0.1,
            },
            "multipliers": {
                "book": 0.15
            },
            "free": 0,
            "flavor": "",
        },
        "steel_smelter": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "iron": 20000,
                "stone": 50000,
            },
            "price_ratio": {
                "iron": 1.1,
                "stone": 1.1,
            },
            "generation": {
                "manager": -1,
                "iron": -25,
                "coal": -25,
                "steel_beam": 1,
            },
            "multipliers": {},
            "free": 0,
            "flavor": "Hot hot hot!",
        },
        "mithril_smelter": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "manager": -1,
                "gold": -5,
                "refined_mana": -25,
                "mithril": 0.1,
            },
            "multipliers": {},
            "free": 0,
            "flavor": "",
        },
        "drill": {
            "on": true,
            "amount": 0,
            "base_cost": {
                "mithril": 50,
                "diamond": 10,
                "steel_beam": 100,
            },
            "price_ratio": {
                "mithril": 1.11,
                "diamond": 1.13,
                "steel_beam": 1.05,
            },
            "generation": {
                "water": -5,
                "energy": -5,
                "stone": 20,
                "diamond": 0.1,
                "iron_ore": 1,
            },
            "multipliers": {
                "iron_ore": 0.05
            },
            "free": 0,
            "flavor": "A massive, water-cooled drill to recover materials from the center of the earth. It's pretty bore-ing.",
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
            "multipliers": {},
            "free": 0,
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
            "multipliers": {},
            "free": 0,
            "flavor": "Seriouser business",
        },
        "hydrogen_mine": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "hydrogen": 10,
            },
            "multipliers": {},
            "free": 0,
            "flavor": "The moon rocks. And now you can have those rocks.",
        },
        "mana_purifier": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": {
                "refined_mana": -1,
                "energy": -25,
                "mana": -50,
                "purified_mana": 0.001,
            },
            "multipliers": {},
            "free": 0,
            "flavor": "Makes purified mana.",
        },
        "omega_machine": {
            "on": true,
            "amount": 0,
            "base_cost": {},
            "price_ratio": {},
            "generation": (_b = {
                    "time": -10,
                    "refined_mana": -100,
                    "purified_mana": -0.1,
                    "fuel": -25,
                    "mana": -500,
                    "energy": -250,
                    "research": -50,
                    "manager": -75,
                    "money": -5000,
                    "gold": -750,
                    "diamond": -1000,
                    "book": -250,
                    "water": -1000,
                    "uranium": -100,
                    "sandcastle": -1,
                    "mithril": -1,
                    "void": -1
                },
                _b[OMEGA] = 1,
                _b),
            "multipliers": {
                "stone": -0.5,
                "wood": -0.5,
                "iron": -0.5,
                "oil": -0.5,
                "sand": -0.5,
            },
            "free": 0,
            "flavor": "Condenses the fabric of the universe itself into " + OMEGA,
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
                if (mines_state) { /* Only turn on if it already was on */
                    toggle_building_state("mine");
                }
            },
            "cost": {
                "money": 2000,
                "stone": 500,
                "iron": 150,
            },
            "tooltip": "Mines produce double stone and 5x iron ore.",
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
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("logging");
                }
            },
            "cost": {
                "money": 2000,
                "wood": 500,
                "iron": 250,
            },
            "tooltip": "console.error('Upgrade not purchased, player needs to buy it!');<br /><i>(Provides an upgrade to logging camps)</i>",
            "name": "Magical Trees",
            "image": "",
            "repeats": false,
        },
        "cheaper_mines": {
            "unlock": function () { return buildings["mine"].amount >= 20; },
            "purchase": function () {
                buildings["mine"].price_ratio["money"] = 1.15;
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
                buildings["logging"].price_ratio["money"] = 1.15;
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
                if (event_flags["bribed_politician"] == "environment") {
                    buildings["mine"]["generation"]["coal"] = 2;
                }
                else {
                    buildings["mine"]["generation"]["coal"] = 0.2;
                }
                if (mines_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                "iron": 500,
            },
            "tooltip": "Banks are cheaper to buy.",
            "name": "Build a Vault <br />",
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("furnace");
                }
            },
            "cost": {
                "money": 10000,
                "stone": 20000,
                "wood": 15000,
                "coal": 2000,
            },
            "tooltip": "Much hotter furnaces run at 10x the previous rate and consume slightly less wood.",
            "name": "Hotter Furnaces",
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
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("gold_finder");
                }
            },
            "cost": {
                "money": 25000,
                "gold": 500,
                "iron": 500,
            },
            "tooltip": "Special gold-plated magnets that attract only gold. And a bit of iron.",
            "name": "Gold Magnet<br />",
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("s_time_magic");
                }
                update_building_amount("s_time_magic");
            },
            "cost": {
                "time": 30000,
            },
            "tooltip": "Throw away some extra time. You didn't need that, did you?",
            "name": "Time Removal",
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
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("big_mine");
                }
            },
            "cost": {
                "money": 50000000,
                "research": 15,
            },
            "tooltip": "Huh, what's this metal your strip mines are finding?",
            "name": "Deeper Mines",
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
        "better_library_3": {
            "unlock": function () { return purchased_upgrades.indexOf("better_library_2") != -1; },
            "purchase": function () {
                buildings["library"].price_ratio["iron"] = 1.05;
                buildings["library"].price_ratio["wood"] = 1.05;
                buildings["library"].price_ratio["book"] = 1.05;
                buildings["library"].price_ratio["money"] = 1.05;
            },
            "cost": {
                "wood": 150000,
            },
            "tooltip": "Libraries take more wood and less iron.",
            "name": "Elven Library",
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
            "tooltip": "Build a Sandcastle.",
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
                if (comp_state) { /* Only turn on if it already was on */
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
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("bank");
                }
            },
            "cost": {
                "money": 1,
            },
            "tooltip": "Banks produce 10x money.",
            "name": "Lower Taxes<br/>",
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
            "name": "Oil-backed Currency",
            "image": "money.png",
            "repeats": true,
        },
        "money_crisis_avert": {
            "unlock": function () {
                return buildings["bank"].base_cost["money"] == 0;
            },
            "purchase": function () {
                event_flags["crisis_averted"] = true;
                /* Fix banks. */
                var comp_state = buildings["bank"].on;
                if (comp_state) {
                    toggle_building_state("bank");
                }
                buildings["bank"].generation["money"] = 50;
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("bank");
                }
                /* Fix investments */
                comp_state = buildings["big_bank"].on;
                if (comp_state) {
                    toggle_building_state("big_bank");
                }
                buildings["big_bank"].generation["money"] = 500;
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("big_bank");
                }
                $("#events_topbar").html("Crisis Over!");
                $("#events_content").html("You finally managed to get through the crisis! Your banks and investment banks will now produce much more. Also, if you haven't already, go buy all the banks you can get! (It's a bit over 10,000).<br/>You've also been hearing rumors about someone teaching powerful knowledge. Maybe building more libraries will get them to arrive.");
                $("#events").removeClass("hidden");
            },
            "cost": {
                "money": 1000000000,
            },
            "tooltip": "Rebuilds your economy. Solves economy collapse until you prestige.",
            "name": "MAKE MORE JOBS!",
            "image": "money.png",
            "repeats": false,
        },
        "time_use_boost": {
            "unlock": function () {
                return resources["time"].amount > 25000 && buildings["bank"].free != undefined;
            },
            "purchase": function () { },
            "cost": {
                "time": 1,
                "mana": 100,
            },
            "tooltip": "You can use time faster.<br />Also makes more stuff affected by speed time.",
            "name": "Chronomancy",
            "image": "",
            "repeats": false,
        },
        "enviro_crisis_avert": {
            "unlock": function () {
                return resources["sludge"].amount > 10;
            },
            "purchase": function () {
                event_flags["crisis_averted"] = true;
                event_flags["sludge_level"] = -1;
                /* Fix oil wells. */
                var comp_state = buildings["oil_well"].on;
                if (comp_state) {
                    toggle_building_state("oil_well");
                }
                buildings["oil_well"].amount = 25;
                purchase_building("oil_well", 0); /* Actually updates amount show. */
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("oil_well");
                }
                buildings["oil_well"].base_cost = {};
                /* Fix oil engines. */
                comp_state = buildings["oil_engine"].on;
                if (comp_state) {
                    toggle_building_state("oil_engine");
                }
                buildings["oil_engine"].amount = 10;
                update_building_amount("oil_engine"); /* Actually updates amount show. */
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("oil_engine");
                }
                buildings["oil_engine"].base_cost = {};
                /* Fix ink refinery. */
                comp_state = buildings["ink_refinery"].on;
                if (comp_state) {
                    toggle_building_state("ink_refinery");
                }
                buildings["ink_refinery"].amount = 5;
                update_building_amount("ink_refinery"); /* Actually updates amount show. */
                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("ink_refinery");
                }
                buildings["ink_refinery"].price_ratio["money"] = 2;
                /* And finally, the bonuses... */
                buildings["solar_panel"].price_ratio = {
                    "money": 0.99,
                    "glass": 1.10,
                    "coal": 1.05,
                    "diamond": 1.05,
                };
                buildings["solar_panel"].free = 15;
                buildings["solar_panel"].multipliers = { "diamond": .05, "glass": .1 };
                buildings["solar_panel"].generation["fuel"] = 0.0002;
                $("#events_topbar").html("Crisis Over!");
                $("#events_content").html("You finally managed to get through the crisis! Your oil wells, engines, and ink refineries have had their abilities greatly reduces, but in exchange solar panels are much better.<br/>You've also been hearing rumors about someone teaching powerful knowledge. Maybe building more libraries will get them to arrive.");
                $("#events").removeClass("hidden");
            },
            "cost": {
                "money": 100000000,
                "water": 1000000,
                "wood": 10000000,
                "sludge": 10000,
            },
            "tooltip": "Clean up the environment. You won't be able to use oil near the amount you were though.",
            "name": "Cleanup",
            "image": "",
            "repeats": false,
        },
        "better_logic": {
            "unlock": function () {
                if (adventure_data["logicat_level"] >= 20) {
                    this.cost = {};
                    return true;
                }
                return adventure_data["logicat_rush"] != undefined;
            },
            "purchase": function () { },
            "cost": {
                "fuel": 100,
            },
            "tooltip": "Logicats give 1 free answer.",
            "name": "Panther Rush",
            "image": "",
            "repeats": false,
        },
        "cheaper_skyscraper": {
            "unlock": function () { return buildings["steel_smelter"].amount >= 1; },
            "purchase": function () {
                buildings["skyscraper"].price_ratio = {
                    "money": 1.05,
                    "steel_beam": 1.05,
                    "glass": 1.05,
                };
            },
            "cost": {
                "iron": 100000,
                "steel_beam": 5000,
                "diamond": 10000,
            },
            "tooltip": "Skyscrapers are cheaper to buy.",
            "name": "Stronger Alloys<br />",
            "image": "",
            "repeats": false,
        },
        "csop": {
            "unlock": function () { return adventure_data["logicat_chairs"]; },
            "purchase": function () {
                Object.keys(resources).forEach(function (res) {
                    if (resources[res].value > 0 && resources[res].amount > 0) {
                        resources_per_sec[res] += 0.00001;
                        resources[res].changes["Chairs Sit On People"] = 0.00001;
                    }
                });
                resource_tooltip();
            },
            "onload": function () {
                this.purchase();
            },
            get cost() {
                if (buildings["s_manastone"].amount < 500) {
                    return {
                        "mana": 500,
                    };
                }
                return {
                    "refined_mana": 100000,
                };
            },
            "tooltip": "Multiplies and adds ALL rates.",
            "name": "Chairs sit on people<br />",
            "image": "",
            "repeats": false,
        },
        "make_purifier": {
            "unlock": function () { return adventure_data["mana_purifier"] == undefined && event_flags["know_pts"] >= 10; },
            "purchase": function () {
                adventure_data["mana_purifier"] = 1;
                var build_state = buildings["mana_purifier"].on;
                if (build_state) {
                    toggle_building_state("mana_purifier");
                }
                buildings["mana_purifier"].amount = 1;
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("mana_purifier");
                }
                $("#building_mana_purifier  > .building_amount").html(format_num(buildings["mana_purifier"].amount, false));
            },
            "cost": {
                "refined_mana": 500000,
            },
            "tooltip": "Constructs a mana purifier. Can only be purchased once EVER (it lasts between prestiges, yay!)",
            "name": "Mana Mastery<br />",
            "image": "",
            "repeats": false,
        },
        "better_essence": {
            "unlock": function () { return adventure_data["tower_floor"] > 7; },
            "purchase": function () {
                toggle_building_state("s_essence", true);
                Object.keys(buildings["s_essence"].multipliers).forEach(function (res) {
                    buildings["s_essence"].multipliers[res] *= 2;
                });
                toggle_building_state("s_essence");
            },
            "cost": {
                "refined_mana": 5000,
                "research": 50,
            },
            "tooltip": "Makes your essence better!",
            "name": "Essential Oils",
            "image": "",
            "repeats": false,
        },
        "better_booster": {
            "unlock": function () { return adventure_data["tower_floor"] > 7; },
            "purchase": function () {
                /* Upgrade basic boosters */
                var build_state = buildings["challenge_basic"].on;
                if (build_state) {
                    toggle_building_state("challenge_basic");
                }
                buildings["challenge_basic"]["amount"] *= 2;
                buildings["challenge_basic"]["amount"] += 5;
                update_building_amount("challenge_basic");
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("challenge_basic");
                }
                /* Upgrade medium boosters */
                build_state = buildings["challenge_medium"].on;
                if (build_state) {
                    toggle_building_state("challenge_medium");
                }
                buildings["challenge_medium"]["amount"] *= 2;
                buildings["challenge_medium"]["amount"] += 5;
                update_building_amount("challenge_medium");
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("challenge_medium");
                }
                /* Upgrade advanced boosters */
                build_state = buildings["challenge_advanced"].on;
                if (build_state) {
                    toggle_building_state("challenge_advanced");
                }
                buildings["challenge_advanced"]["amount"] *= 2;
                buildings["challenge_advanced"]["amount"] += 5;
                update_building_amount("challenge_advanced");
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("challenge_advanced");
                }
            },
            "cost": {
                "refined_mana": 5000,
                "research": 50,
            },
            "tooltip": "Makes your boosters bigger!",
            "name": "Essential Boosts",
            "image": "",
            "repeats": false,
        },
        "essence_jeweler": {
            "unlock": function () { return adventure_data["tower_floor"] > 7; },
            "purchase": function () {
                /* Upgrade */
                var build_state = buildings["jewelry_store"].on;
                if (build_state) {
                    toggle_building_state("jewelry_store");
                }
                buildings["jewelry_store"]["generation"]["money"] *= 2;
                update_building_amount("jewelry_store");
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("jewelry_store");
                }
            },
            "cost": {
                "refined_mana": 5000,
                "research": 50,
            },
            "tooltip": "Makes your jewelry sell for more!",
            "name": "Essential Jewelry",
            "image": "",
            "repeats": false,
        },
        "essence_ai": {
            "unlock": function () { return adventure_data["tower_floor"] > 7; },
            "purchase": function () {
                /* Upgrade */
                if (buildings["s_ai"].on) {
                    toggle_building_state("s_ai");
                }
                buildings["s_ai"].amount = 100;
                $("#building_s_ai").parent().removeClass("hidden");
                update_building_amount("s_ai"); /* Previously, there were infinite of these to keep it hidden. Let's update to proper amount. */
            },
            "cost": {
                "refined_mana": 5000,
                "energy": 250,
            },
            "tooltip": "Create a Magic powered AI",
            "name": "AI Creation",
            "image": "",
            "repeats": false,
        },
        "grow_cost": {
            "unlock": function () {
                return (total_time > 1000 * 60 * 5) && purchased_upgrades.indexOf("essence_ai") != -1;
            },
            "purchase": function () {
                var build_state = buildings["s_ai"].on;
                if (build_state) {
                    toggle_building_state("s_ai");
                }
                buildings["s_ai"].generation["manager"] += this.cost["refined_mana"] / 10000; /* It's multiplied by 100, so every 100 refined mana gives +1 manager */
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("s_ai");
                }
            },
            get cost() {
                return { "refined_mana": Math.floor(total_time / 1000) };
            },
            "tooltip": "Gets more expensive over time, but the more it costs the better it is!",
            "name": "AI Growth",
            "image": "",
            "repeats": false,
        },
        "ai_castle": {
            "unlock": function () {
                return (resources[OMEGA].amount > 0) && purchased_upgrades.indexOf("grow_cost") != -1;
            },
            "purchase": function () {
                var build_state = buildings["s_ai"].on;
                if (build_state) {
                    toggle_building_state("s_ai");
                }
                buildings["s_ai"].amount = 1000;
                buildings["s_ai"].generation["sand"] = -1000000 / 1000;
                buildings["s_ai"].generation["sandcastle"] = 0.1 / 1000;
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("s_ai");
                }
                update_building_amount("s_ai");
            },
            "cost": {
                "purified_mana": 30,
                "mithril": 5000,
                "sand": 100000000,
                "sandcastle": 200,
            },
            "tooltip": "Teaches your AI how to build things. Oh, also it'll take up a lot more mana to run.",
            "name": "AI Construction",
            "image": "",
            "repeats": false,
        },
        "ai_void": {
            "unlock": function () {
                return adventure_data["tower_floor"] > 45 && purchased_upgrades.indexOf("ai_castle") != -1;
            },
            "purchase": function () {
                var build_state = buildings["s_ai"].on;
                if (build_state) {
                    toggle_building_state("s_ai");
                }
                buildings["s_ai"].amount = 10000;
                Object.keys(buildings["s_ai"].generation).forEach(function (res) {
                    buildings["s_ai"].generation[res] /= 10;
                });
                buildings["s_ai"].generation["mana"] = -1;
                buildings["s_ai"].generation["void"] = 0.1 / 10000;
                buildings["s_ai"].generation["mithril"] = -1 / 10000;
                buildings["s_ai"].generation["oil"] = -100000 / 10000;
                if (build_state) { /* Only turn on if it already was on */
                    toggle_building_state("s_ai");
                }
                update_building_amount("s_ai");
            },
            "cost": {
                "purified_mana": 30,
                "mithril": 5000,
                "sand": 100000000,
                "sandcastle": 200,
            },
            "tooltip": "Teaches your AI the secrets of void, at the cost of much more mana to run.",
            "name": "AI Negation",
            "image": "",
            "repeats": false,
        },
        "beachball": {
            "unlock": function () { return adventure_data["logicat_beachball"]; },
            "purchase": function () {
            },
            "cost": {
                "mana": 2500,
                "refined_mana": 50000,
                "money": 1000000000,
            },
            "tooltip": "Solves logikittens.",
            "name": "Beachball",
            "image": "",
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
    autobuild_amount = 0;
    $("#buy_amount").val(1);
}
var prestige = {
    points: function (DEBUG) {
        if (DEBUG === void 0) { DEBUG = false; }
        var prestige_points = 0;
        var prestige_vals = [];
        var prestige_names = [];
        Object.keys(resources).forEach(function (res) {
            if (isNaN(resources[res].amount)) {
                resources[res].amount = 0;
            }
            var res_amt = resources[res].amount - calculate_bag_amount(res);
            prestige_points += res_amt * Math.abs(resources[res].value);
            if (res != "sandcastle" && res_amt > 0 && resources[res].value > 0) {
                prestige_vals.push(res_amt * Math.abs(resources[res].value));
                prestige_names.push(res);
            }
        });
        /* Maybe add a funky multiplier */
        if (event_flags["skills"] && event_flags["skills"][4]) {
            function standardDeviation(values) {
                var avg = average(values);
                var squareDiffs = values.map(function (value) {
                    var diff = value - avg;
                    var sqrDiff = diff * diff;
                    return sqrDiff;
                });
                var avgSquareDiff = average(squareDiffs);
                var stdDev = Math.sqrt(avgSquareDiff);
                return stdDev;
            }
            function average(data) {
                var sum = data.reduce(function (sum, value) {
                    return sum + value;
                }, 0);
                var avg = sum / data.length;
                return avg;
            }
            var st_dev = standardDeviation(prestige_vals);
            var sq_diff_vals = prestige_vals.map(function (value) {
                var diff = value - average(prestige_vals);
                var sqrDiff = diff * diff;
                return Math.sqrt(sqrDiff);
            });
            var largest_off = Math.max.apply(Math, sq_diff_vals);
            if (DEBUG) {
                console.log("Prestige info: ");
                console.log("Values: ", prestige_vals);
                console.log("Standard Deviation: ", st_dev);
                console.log("Worst resource:", prestige_names[sq_diff_vals.indexOf(largest_off)], largest_off);
            }
            /* If close enough, multiply pp. */
            if (st_dev < 0.05 * prestige_points) {
                /* Go from 5x to 1x, higher st_dev in relation to pp gives a lower value. */
                var multiplier = 5 - 4 * st_dev / (0.05 * prestige_points);
                if (multiplier > 1) {
                    prestige_points *= multiplier;
                }
                else {
                    console.error("Something went wrong. We got a negative multiplier for pp");
                }
            }
        }
        if (prestige_points < 0) {
            prestige_points = 0;
        }
        if (adventure_data["tower_floor"] > 27) {
            prestige_points *= 10;
        }
        if (adventure_data["tower_floor"] > 30) {
            prestige_points *= Math.max(10, Math.log(prestige_points / 1000000));
        }
        return prestige_points;
    },
    /* Calculate mana gain */
    mana: function (round) {
        if (round === void 0) { round = true; }
        var prestige_points = prestige.points();
        var mana_this_prestige = event_flags["mage_quickmana"]; /* How much instant mana has given them. */
        if (mana_this_prestige == undefined) {
            mana_this_prestige = 0;
        }
        var mana = buildings["s_manastone"].amount - mana_this_prestige; /* Don't count mana gained this prestige in here. */
        var first_wall = Math.pow(mana, 1.3) * 0.5;
        if (isNaN(first_wall)) {
            first_wall = 0;
        }
        var mana_gain = prestige_points / 15000 - first_wall; /* One for every 15k pp, and apply reduction based off of current mana */
        mana_gain = Math.pow(Math.max(0, mana_gain), .36); /* Then raise to .36 power and apply some rounding/checking */
        mana_gain = mana_gain / (1 + Math.floor(mana / 50) * .5); /* Then divide gain by a number increasing every 50 mana. */
        if (mana_gain > 50) { /* If they're getting a ton, they get less*/
            mana_gain = 50 + (mana_gain - 50) / 2;
        }
        mana_gain -= mana_this_prestige; /* Take out what they already got. */
        if (event_flags["skills"] != undefined && event_flags["skills"][8]) { /* They have the quick mana skill */
            if (event_flags["mage_quickmana"] == undefined) { /* Quickly define this. */
                event_flags["mage_quickmana"] = 0;
            }
            if (mana_gain >= 1) { /* Give some mana. */
                var gained = Math.floor(mana_gain);
                event_flags["mage_quickmana"] += gained;
                buildings["s_manastone"].amount += gained;
                update_building_amount("s_manastone");
                resources_per_sec["mana"] += buildings["s_manastone"].generation["mana"] * gained;
                mana_gain -= gained;
                /* Show more buildings with the gained mana. */
                SPELL_BUILDINGS.forEach(function (build) {
                    if (buildings["s_manastone"].amount * 2 >= buildings[build].amount * -buildings[build].generation["mana"]) {
                        $("#building_" + build).parent().removeClass("hidden");
                    }
                });
            }
        }
        mana_gain = Math.max(0, mana_gain); /* Can't get negative mana. */
        if (adventure_data["tower_floor"] > 36) {
            mana_gain *= 2;
        }
        if (isNaN(mana_gain)) {
            mana_gain = 0;
        } /* Can't get NaN mana. */
        if (round) {
            return Math.floor(mana_gain);
        }
        else {
            return mana_gain;
        }
    },
    percent_through: function () {
        if (prestige.mana() < 1 && event_flags["mage_quickmana"] == undefined) {
            return Math.max(0, Math.min(100, Math.floor((prestige.points() / 15000) / (Math.pow(buildings["s_manastone"].amount, 1.3) * .5 + 1) * 100)));
        }
        else {
            return Math.round(100 * (prestige.mana(false) - prestige.mana(true)));
        }
    },
    run: function (ask, callback) {
        if (ask === void 0) { ask = true; }
        if (callback === void 0) { callback = function () { }; }
        var mana_gain = prestige.mana();
        var mana = buildings["s_manastone"].amount;
        /* If they have this skill, don't warn them they're prestiging for 0.  */
        var has_quickmana = event_flags["skills"] != undefined && event_flags["skills"][8];
        if (mana_gain < 1 && ask && !has_quickmana) {
            if (adventure_data["challenge"] == CHALLENGES.LOAN) {
                alert("You can't prestige in this challenge.");
                return;
            }
            if (!confirm("Prestige now wouldn't produce mana! As you get more mana, it gets harder to make your first mana stone in a run. You are currently " + prestige.percent_through().toString() + "% of the way to your first mana. Prestige anyway?")) {
                return;
            }
        }
        if (!ask || confirm("You will lose all resources and all buildings but gain " + mana_gain.toString() + " mana after reset. Proceed?")) {
            var total_mana = buildings["s_manastone"].amount + mana_gain;
            if (total_mana > adventure_data["max_mana"]) {
                total_mana = adventure_data["max_mana"];
                alert("Warning: Mana flux levels too high. Capping mana stones. ");
            }
            set_initial_state();
            buildings["s_manastone"].amount = total_mana;
            adventure_data.current_location = "home"; /* You have to prestige at home. */
            /* Open bags of holding. Iterate backwards so we don't skip bags. Only do this if we're not in a challenge. */
            if (!adventure_data["challenge"]) {
                for (var i = adventure_data.inventory.length - 1; i >= 0; i--) {
                    if (adventure_data.inventory[i].name == "bag" && adventure_data.inventory[i].resource != undefined) {
                        resources[adventure_data.inventory[i].resource].amount += adventure_data.inventory[i].amount;
                        adventure_data.inventory.splice(i, 1);
                    }
                }
                for (var i = adventure_data.warehouse.length - 1; i >= 0; i--) {
                    if (adventure_data.warehouse[i].name == "bag" && adventure_data.warehouse[i].resource != undefined) {
                        resources[adventure_data.warehouse[i].resource].amount += adventure_data.warehouse[i].amount;
                        adventure_data.warehouse.splice(i, 1);
                    }
                }
            }
            callback();
            save();
            location.reload();
        }
    },
    update: function () {
        if (prestige.mana()) {
            $("#prestige > span").first().html("Prestige&nbsp;(" + format_num(prestige.mana(), false) + ", " + format_num(prestige.percent_through(), false) + "%)");
        }
        else {
            if (event_flags["mage_quickmana"]) { /* They have the quick mana skill */
                $("#prestige > span").first().html("Prestige&nbsp;(" + format_num(prestige.percent_through(), false) + "%, @" + format_num(event_flags["mage_quickmana"]) + ")");
            }
            else {
                $("#prestige > span").first().html("Prestige&nbsp;(" + format_num(prestige.percent_through(), false) + "%)");
            }
        }
        var suggested_amounts = [2, 5, 10, 27, 52, 92, 150, 200]; /* What mana amounts are good to prestige at. */
        for (var i in suggested_amounts) {
            if (suggested_amounts[i] > buildings["s_manastone"].amount) {
                $("#prestige_suggest").html("Your next prestige goal is at " + format_num(suggested_amounts[i] - buildings["s_manastone"].amount, false) + " more mana.");
                break;
            }
        }
    }
};
function add_log_elem(to_add) {
    while ($("#log > span").length >= 10) { /* We want to remove the last element(s) to bring length to 9.*/
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
    localStorage["rules"] = JSON.stringify(rules);
    localStorage["erules"] = JSON.stringify(erules);
    localStorage["autobuild"] = JSON.stringify(build_queue);
    localStorage["autobuild_amt"] = JSON.stringify(autobuild_amount);
    localStorage["autobuild_rpt"] = JSON.stringify(autobuild_repeat);
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
    console.log("Loading rules");
    if (localStorage.getItem("rules")) {
        rules = JSON.parse(localStorage.getItem("rules"));
        if (adventure_data["rules_unlocked"]) {
            $("#pc_box").parent().removeClass("hidden");
        }
    }
    console.log("Loading erules");
    if (localStorage.getItem("erules")) {
        erules = JSON.parse(localStorage.getItem("erules"));
    }
    console.log("Loading autobuild");
    if (localStorage.getItem("autobuild")) {
        build_queue = JSON.parse(localStorage.getItem("autobuild"));
    }
    if (localStorage.getItem("autobuild_amt")) {
        autobuild_amount = JSON.parse(localStorage.getItem("autobuild_amt"));
    }
    if (localStorage.getItem("autobuild_rpt")) {
        autobuild_repeat = JSON.parse(localStorage.getItem("autobuild_rpt"));
    }
    console.log("Loading theme");
    if (!localStorage.getItem("theme")) {
        localStorage["theme"] = "dark"; /* Default dark theme. */
    }
    change_theme(localStorage.getItem("theme"));
    purchased_upgrades.forEach(function (upg) {
        var upg_name = remaining_upgrades[upg].name;
        if (remaining_upgrades[upg]["onload"] != undefined) {
            remaining_upgrades[upg]["onload"]();
        }
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
                resources[key].changes[$("#building_" + name + " > .building_name").text()] = buildings[name].amount * buildings[name].generation[key];
                resource_tooltip();
            });
            /* And add the multiplier */
            Object.keys(buildings[name].multipliers).forEach(function (key) {
                resources[key].mult *= 1 + buildings[name].amount * (buildings[name].multipliers[key]);
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
    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }
    save();
    var text = b64EncodeUnicode(JSON.stringify(localStorage));
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
        else {
            throw "Save unsuccessful";
        }
    }
    catch (err) {
        $("#settings").addClass("hidden");
        $("#events_topbar").html("Save Export - Secondary");
        $("#events_content").html("<textarea class='fgc bgc' style='width: 90%; height: 90%;' readonly>" + text + "</textarea>");
        $("#events_content textarea").select();
        $("#events").removeClass("hidden");
    }
    document.body.removeChild(textArea);
}
function load_from_clip() {
    function b64DecodeUnicode(str) {
        return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
    var loaded_data = b64DecodeUnicode(prompt("Paste your save data here."));
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
function resource_tooltip() {
    Object.keys(resources).forEach(function (res) {
        if (!$.isEmptyObject(resources[res].changes)) {
            var changes_1 = "";
            /* Iterate through all things changing, sorted by amount they provide. */
            Object.keys(resources[res].changes).sort(function (a, b) { return resources[res].changes[b] - resources[res].changes[a]; }).forEach(function (changer) {
                if (resources[res].changes[changer] != 0) {
                    changes_1 += "<tr><td>" + changer + "</td><td>" + format_num(resources[res].changes[changer], true) + "</td></tr>";
                }
            });
            resources[res].ps_change = "<table class='change_track'>" + changes_1 + "</table>";
        }
    });
}
function toggle_building_state(name, sudo) {
    if (sudo === void 0) { sudo = false; }
    if (buildings[name].on) { /* Turn it off */
        /* A couple buildings shouldn't be turned off unless forced off. */
        if (name == "s_mana_refinery" || name == "s_essence") {
            if (!sudo)
                return; /* We could have used &&, but that just makes the conditional messier. */
        }
        buildings[name].on = false;
        /* Go through each resource it generates... */
        Object.keys(buildings[name].generation).forEach(function (key) {
            /* And decrease production by that much */
            resources_per_sec[key] -= buildings[name].amount * buildings[name].generation[key];
            if (resources[key].value == 0) {
                resources[key].amount -= buildings[name].amount * buildings[name].generation[key];
            }
            delete resources[key].changes[$("#building_" + name + " > .building_name").text()];
            resource_tooltip();
        });
        Object.keys(buildings[name].multipliers).forEach(function (key) {
            resources[key].mult /= 1 + buildings[name].amount * (buildings[name].multipliers[key]);
        });
        $("#toggle_" + name).addClass("building_state_off");
        $("#toggle_" + name).removeClass("building_state_on");
        $("#toggle_" + name).text("Off");
    }
    else { /* Turn it on */
        /* Make sure we can run for 1s first */
        try {
            Object.keys(buildings[name].generation).forEach(function (key) {
                /* Make sure we can still run buildings if they generate a resource we have negative of. */
                if (resources[key].value == 0 && buildings[name].generation[key] < 0 && buildings[name].amount * buildings[name].generation[key] * -1 > resources_per_sec[key]) {
                    throw "Not enough special resources.";
                }
            });
        }
        catch (e) {
            /* We don't want this error going all the way through the stack as a ton of places call this function and need to continue (they rely on it silently failing) */
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
            resources[key].changes[$("#building_" + name + " > .building_name").text()] = buildings[name].amount * buildings[name].generation[key];
            resource_tooltip();
        });
        /* Add multipliers. */
        Object.keys(buildings[name].multipliers).forEach(function (key) {
            resources[key].mult *= 1 + buildings[name].amount * (buildings[name].multipliers[key]);
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
var rule_timer = 0;
var last_update = Date.now();
var total_time = 0;
function update() {
    /* Find time since last update. */
    var delta_time = Date.now() - last_update;
    last_update = Date.now();
    if (delta_time > 15000) { /* More than 15 sec between tics and it's offline gen time. */
        resources["time"].amount += delta_time / 1000; /* 1 sec of production, rest goes to time. */
        /* This is where offline events go. We say we get 1 every 30 minutes. */
        if (event_flags["skills"] && event_flags["skills"][2]) {
            /* Cap at 20 events.*/
            var num_events = Math.min(20, Math.round(delta_time / (60000 * 30)));
            /* while num_events goes to 0. */
            while (num_events-- > 0) {
                $("#events").addClass("hidden"); /* Hide it for next event. */
                handle_event(false); /* Run an event. */
            }
        }
        return;
    }
    if (time_on) {
        /* Find how much time they will use up */
        if (resources["time"].amount < 10) { /* Not enough for a full addition to the tick. */
            delta_time += resources["time"].amount * 1000; /* Give extra production for however much they can get, and remove that much time. */
            toggle_time();
            resources["time"].amount = 0;
        }
        else { /* Add 10s of production to this tick and remove the time. */
            delta_time += 10000;
            resources["time"].amount -= 10;
            /* They bought a boost! Use time on a percent base.*/
            if (purchased_upgrades.indexOf("time_use_boost") != -1) {
                var amt = resources["time"].amount * 0.01;
                if (amt > Math.pow(buildings["s_manastone"].amount, 2) * 0.01) {
                    amt = Math.pow(buildings["s_manastone"].amount, 2) * 0.01;
                }
                delta_time += 1000 * amt;
                resources["time"].amount -= amt;
            }
        }
        if (adventure_data["challenge"] == CHALLENGES.METEORS) {
            time_to_meteor++;
            if (time_to_meteor >= 6) {
                time_to_meteor = 0;
                meteor_hit();
            }
        }
    }
    /* Perform rules */
    rule_timer += delta_time;
    if (rule_timer > 1000) {
        rule_timer = 0;
        run_rules();
        run_autobuild();
    }
    total_time += delta_time; /* Track total time since refresh */
    /* Check for negative resources or resources that will run out. */
    Object.keys(resources).forEach(function (res) {
        if (isNaN(resources[res].amount)) {
            resources[res].amount = 0;
        }
        if (resources[res].amount > 0.1) {
            /* Unhide resources we have */
            $("#" + res).removeClass("hidden");
        }
        else {
            $("#" + res).addClass("hidden");
        }
        var time = delta_time;
        /* These don't normally run out. */
        if (resources[res].value == 0) {
            time = 0;
        }
        /* Resource will run out. */
        if (resources[res].amount < -resources_per_sec[res] * time / 1000) {
            /* Check all buildings */
            Object.keys(buildings).forEach(function (build) {
                /* Check resource gen */
                if (buildings[build].generation[res] < 0 && buildings[build].on && buildings[build].amount > 0) {
                    toggle_building_state(build);
                    console.log("Turned off " + build + ": Not enough " + res);
                    if (event_flags["skills"] && event_flags["skills"][7]) {
                        add_log_elem("Turned off " + build + ": Not enough " + res);
                    }
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
        /* Don't add special resources */
        if (resources[key].value != 0) {
            /* Only positive generation gets a multiplier. */
            if (resources_per_sec[key] > 0) {
                resources[key].amount += resources_per_sec[key] * resources[key].mult * delta_time / 1000;
            }
            else {
                resources[key].amount += resources_per_sec[key] * delta_time / 1000;
            }
        }
        else { /* We have as much of specialty resources as we generate */
            resources[key].amount = resources_per_sec[key];
        }
        /* Formats it so that it says "Resource name: amount" */
        $("#" + key + " span").first().html((key.charAt(0).toUpperCase() + key.slice(1)).replace("_", " ") + ": " + format_num(resources[key].amount, false));
        if (event_flags["skills"] && event_flags["skills"][7]) {
            $("#" + key + " span").first().append(" (" + format_num(resources[key].value) + ")");
        }
        /* Same for per sec */
        $("#" + key + "_per_sec").text((resources_per_sec[key] > 0 ? "+" : "") + format_num(resources_per_sec[key]) + "/s");
        /* Display multiplier if positive RPS and mult not 1 (approx) */
        if (resources_per_sec[key] > 0 && Math.abs(resources[key].mult - 1) > 0.001) {
            var color = resources[key].mult > 1 ? "green" : "red";
            $("#" + key + "_per_sec").append(" <span style='color:" + color + "'>(x" + format_num(resources[key].mult) + ")</span>");
        }
        /* Add tooltip */
        if ($("#" + key + " .tooltiptext").length == 0) {
            $("#" + key).addClass("tooltip");
            $("#" + key).append("<span class='tooltiptext fgc bgc_second'>" + resources[key].ps_change + "</span>");
        }
        else {
            $("#" + key + " .tooltiptext").html(resources[key].ps_change);
        }
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
    if (adventure_data["challenge"] == CHALLENGES.POVERTY) {
        var MULT = 20;
        if (resources["money"].amount > 30 && resources["money"].amount > resources_per_sec["money"] * resources["money"].mult * MULT) {
            resources["money"].amount = Math.max(30, resources_per_sec["money"] * resources["money"].mult * MULT);
            $("#money span").first().html("Money: " + format_num(resources["money"].amount, false));
        }
        $("#money span").first().append(" / " + format_num(Math.max(30, resources_per_sec["money"] * resources["money"].mult * MULT)));
    }
}
/* Not in update as this could change a lot if they have too many unpurchased upgrades. */
function update_upgrade_list() {
    /* Loop through all remaining upgrades */
    Object.keys(remaining_upgrades).forEach(function (upg_name) {
        /* No upgrades visible in no upgrade challenge. */
        if (adventure_data["challenge"] == CHALLENGES.NO_UPGRADE) {
            $("#upgrade_" + upg_name).addClass("hidden");
            return;
        }
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
    var tooltip = "";
    var gen_text = "";
    /* Add resource gen, update how much each one generates. */
    Object.keys(buildings[name].generation).forEach(function (key) {
        if (resources[key].value) { /* Add X per second for regular resources */
            gen_text += format_num(buildings[name].generation[key]) + " " + key.replace("_", " ") + "/s, ";
        }
        else {
            gen_text += format_num(buildings[name].generation[key]) + " " + key.replace("_", " ") + ", ";
        }
    });
    if (gen_text) {
        tooltip += "Generates " + gen_text.trim().replace(/.$/, ".") + "<br />";
    }
    var mults = [];
    Object.keys(buildings[name].multipliers).forEach(function (key) {
        mults.push("" + format_num(buildings[name].multipliers[key] * 100) + "% bonus to " + key.replace(/\_/g, " "));
    });
    var mult_str = "<span style='color: goldenrod'>Gives a " + mults.join(", a ") + ".</span>";
    if (mults.length) {
        tooltip += mult_str + "<br />";
    }
    var cost_text = "Costs ";
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        /* Total cost for a buy all. Uses a nice summation formula. */
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - buildings[name].free) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        if (Math.pow(buildings[name].price_ratio[key], buildings[name].amount + amount - 1 - buildings[name].free) == Infinity && !isNaN(cost)) {
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
    tooltip += cost_text.trim().replace(/.$/, ".");
    var flavor_text = "<hr><i style='font-size: small'>" + buildings[name].flavor + "</i>";
    if (buildings[name].flavor == undefined || buildings[name].flavor == "") {
        flavor_text = "";
    }
    tooltip += flavor_text;
    return tooltip;
}
function update_building_amount(name) {
    $('#building_' + name + " > .building_amount").html(format_num(buildings[name].amount, false));
}
function purchase_building(name, amt) {
    if (amt === void 0) { amt = null; }
    /* Sometimes we're calling this to update amount shown, so make sure we do so. */
    update_building_amount(name);
    var amount = amt;
    if (amount == null) {
        amount = parseInt($("#buy_amount").val());
    }
    if (isNaN(amount)) {
        amount = 1;
    }
    if (amount < 0) {
        amount = 0;
    }
    /* Make sure not unbuyable. */
    if ($.isEmptyObject(buildings[name].base_cost)) {
        throw Error("Unbuyable building");
    }
    /* Make sure they have enough to buy it */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Checking money");
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - buildings[name].free) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        /* Make it so they can't buy above what they should be able to get. */
        if (Math.pow(buildings[name].price_ratio[key], buildings[name].amount + amount - 1 - buildings[name].free) == Infinity && !isNaN(cost)) {
            cost = Infinity;
        }
        if (cost > resources[key].amount) {
            if (amt == null) {
                add_log_elem("You can't afford that. Missing: " + key.replace("_", " "));
            }
            throw Error("Not enough resources!");
        }
        else if (isNaN(cost)) {
            if (amt == null) {
                add_log_elem("Sorry, but " + key.replace("_", " ") + " is not fuzzy.");
            }
            throw Error("fuzzy resources!");
        }
    });
    /* Spend money to buy */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Spending money");
        var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - buildings[name].free) * (1 - Math.pow(buildings[name].price_ratio[key], amount)) / (1 - buildings[name].price_ratio[key]);
        resources[key].amount -= cost;
    });
    /* Turn off, add building, turn back on. */
    var build_state = buildings[name].on;
    if (build_state) {
        toggle_building_state(name);
    }
    buildings[name].amount += amount;
    if (build_state) {
        toggle_building_state(name);
    }
    update_building_amount(name);
    /* Update purchasable/not color */
    try {
        var amount_1 = parseInt($("#buy_amount").val());
        if (isNaN(amount_1)) {
            amount_1 = 1;
        }
        Object.keys(buildings[name].base_cost).forEach(function (key) {
            var cost = buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - buildings[name].free) * (1 - Math.pow(buildings[name].price_ratio[key], amount_1)) / (1 - buildings[name].price_ratio[key]);
            if (Math.pow(buildings[name].price_ratio[key], buildings[name].amount + amount_1 - 1 - buildings[name].free) == Infinity) {
                cost = Infinity;
            }
            if (cost > resources[key].amount) {
                throw Error("Not enough resources!");
            }
        });
        $("#building_" + name).removeClass("building_expensive");
    }
    catch (e) {
        $("#building_" + name).addClass("building_expensive");
    }
    /* If in cascade, buy all buildings this one unlocks */
    if (adventure_data["challenge"] == CHALLENGES.CASCADE) {
        UNLOCK_TREE[name].forEach(function (build) {
            try {
                /* And yes, it is recursive. Also buys same amount, so there's probably some interesting stuff that can be done with buy multiple. */
                purchase_building(build);
            }
            finally { }
        });
    }
}
function destroy_building(name, amount) {
    if (amount === void 0) { amount = null; }
    if (amount == null) {
        amount = parseInt($("#buy_amount").val());
    }
    if (isNaN(amount)) {
        amount = 1;
    }
    for (var i = 0; i < amount; i++) {
        if (buildings[name].amount <= 1) {
            add_log_elem("You can't destroy your last building.");
            return; /* Can't sell last building */
        }
        if ($.isEmptyObject(buildings[name].base_cost)) {
            add_log_elem("You can't destroy unbuyable buildings.");
            return;
        }
        /* Remove resource gen */
        var build_state = buildings[name].on;
        if (build_state) {
            toggle_building_state(name);
        }
        buildings[name].amount--;
        if (build_state) {
            toggle_building_state(name);
        }
        /* Refund resources a bit. Get 30% back. */
        Object.keys(buildings[name].base_cost).forEach(function (key) {
            resources[key].amount += 0.3 * buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount - 1 - buildings[name].free);
        });
        $('#building_' + name + " > .building_amount").html(format_num(buildings[name].amount, false));
    }
    /* If in cascade challenge, destroy all unlocked by this. */
    if (adventure_data["challenge"] == CHALLENGES.CASCADE) {
        UNLOCK_TREE[name].forEach(function (build) {
            try {
                destroy_building(build);
            }
            finally { }
        });
    }
}
function purchase_upgrade(name) {
    /* Can't buy upgrades in no upgrade challenge. */
    if (adventure_data["challenge"] == CHALLENGES.NO_UPGRADE) {
        return;
    }
    var upg = remaining_upgrades[name];
    /* Check that they have enough */
    Object.keys(upg.cost).forEach(function (resource) {
        if (resources[resource].amount < upg.cost[resource]) { /* Don't have enough to buy upgrade */
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
function calculate_bag_amount(res) {
    if (adventure_data["perm_resources"] == undefined || adventure_data["perm_resources"][res] == undefined || resources[res].value >= adventure_data["max_bag_value"])
        return 0;
    if (res == "money" && adventure_data["challenge"] == CHALLENGES.POVERTY) {
        return 0;
    }
    var res_gain = adventure_data["perm_resources"][res];
    if (resources[res].value > 0) {
        res_gain = Math.pow(adventure_data["perm_resources"][res], 2 / 3);
    }
    if (adventure_data["challenge"]) {
        if (adventure_data["challenges_completed"].length >= CHALLENGES.METEORS && adventure_data["challenges_completed"][CHALLENGES.METEORS]) {
            res_gain = Math.max(Math.min(res_gain, 10000 / Math.abs(resources[res].value)), Math.pow(res_gain, 4 / 5)); /* If they have meteors, reduce it again, unless it would reduce to lower than what they would get normally. */
        }
        else {
            res_gain = Math.min(res_gain, 10000 / Math.abs(resources[res].value)); /* Otherwise, cap it. */
        }
    }
    if ((res == "money" || res == "gold") && adventure_data["tower_floor"] > 23) {
        res_gain *= Math.log(res_gain / 1000);
    }
    return res_gain;
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
        "Technomancy: Now with meta-bugs",
        "Even the bugs have bugs.",
        "Are you reading this? I bet you're not reading this.",
        "Definitely not ripping off any other games. Not at all.",
        "Now playing: NGU Idle",
        "Now playing: Kittens Game",
        "Now playing: Sandcastle Builder",
        "Now playing: Sharks game",
    ];
    document.title = TITLES.filter(function (item) { return item !== document.title; })[Math.floor(Math.random() * (TITLES.length - 1))];
}
function change_theme(new_theme) {
    var themes = {
        "light": ".bgc {background-color: white;}.fgc {color: black;}.bgc_second {background-color: #CCC;}",
        "dark": ".bgc {background-color: black;}.fgc {color: lightgray;}.bgc_second {background-color: #333;}",
        "halloween": ".bgc {background-color: black;}.fgc {color: darkorange;}.bgc_second {background-color: purple;}",
        "christmas": ".bgc {background-color: #400;}.fgc {color: #0A0;} .bgc_second {background-color: #050;}",
        "crazy": "                                              \
          .bgc, .bgc_second, .fgc {                             \
            animation: strobe 500ms infinite;                  \
          }                                                     \
          @keyframes strobe {                                   \
              16% { background: red; color: blue; }             \
              33% { background: orange; color: purple;}         \
              50% { background: yellow; color: red; }           \
              66% { background: green; color: orange; }         \
              83% { background: blue; color: yellow; }          \
              100% { background: purple; color: green; }        \
              0%  { background: purple; color: green; }         \
          }                                                     \
         ",
        "darkpurple": ".bgc {background-color: #130013;}.fgc {color: #937e89;}.bgc_second {background-color: #332533;}",
    };
    var theme_music = {
        "light": "",
        "dark": "",
        "halloween": "84jesbGuGzo",
        "christmas": "JXjQO0UixxM",
        "crazy": "MTrzTABzLfY",
    };
    if (adventure_data["challenge"] == CHALLENGES.DISCO) {
        new_theme = "crazy";
    }
    /* Make sure the theme exists */
    if (themes[new_theme]) {
        /* Set a <style> field in the document. */
        $("#color_theme").html(themes[new_theme]);
        /* Remember what theme */
        localStorage["theme"] = new_theme;
        /* Play music for it (or stop music if there is none) */
        if (theme_music[new_theme]) {
            setTimeout(function () {
                $("#music").html("<iframe width='0' height='0' src='https://www.youtube.com/embed/" + theme_music[new_theme] + "?autoplay=1&loop=1&playlist=" + theme_music[new_theme] + "&start=1' frameborder='0' allow='autoplay'></iframe>");
            }, 100);
        }
        else {
            setTimeout(function () {
                $("#music").html("");
            }, 100);
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
    groupings["Spells"].splice(groupings["Spells"].indexOf("s_essence"), 1);
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
        if (["s_manastone", "s_mana_refinery", "s_essence", "s_final"].indexOf(build) == -1 && !$("#building_" + build).parent().hasClass("hidden")) {
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
var rules = {};
function setup_rules() {
    /* Clear group name box*/
    $("#rule_names").html("<table></table>");
    if (adventure_data["auto_events"] != undefined) {
        $("#rule_names > table").append("<tr></tr>");
        $("#rule_names tr").last().append("<td style='overflow: auto; max-width: 5em;'>AutoEvent</td>");
        $("#rule_names tr").last().append("<td><span class='clickable'>Edit</span></td>");
        $("#rule_names span").last().click(function () {
            draw_erule();
        });
    }
    Object.keys(rules).forEach(function (rule) {
        $("#rule_names > table").append("<tr></tr>");
        $("#rule_names tr").last().append("<td style='overflow: auto; max-width: 5em;'>" + rule + "</td>");
        /* Can't edit the default filters. */
        $("#rule_names tr").last().append("<td><span class='clickable'>Edit</span></td>");
        $("#rule_names span").last().click(function () {
            draw_rule(rule);
        });
        $("#rule_names tr").last().append("<td><span class='clickable' style='background-color: " + (rules[rule].active ? "green" : "red") + "'>" + (rules[rule].active ? "On" : "Off") + "</span></td>");
        $("#rule_names span").last().click(function () {
            rules[rule].active = !rules[rule].active;
            $(this).html(rules[rule].active ? "On" : "Off");
            $(this).css("background-color", rules[rule].active ? "green" : "red");
        });
        $("#rule_names tr").last().append("<td><span class='clickable'>Delete</span></td>");
        $("#rule_names span").last().click(function () {
            if (confirm("Really delete rule " + rule + "?")) {
                delete rules[rule];
                setup_rules();
                if (rule + " Delete" == $("#rule_data > div").first().text()) {
                    $("#rule_data").html("");
                }
            }
        });
    });
    $("#rule_names").append("<span class='clickable' style='position: relative; left: 6em;'>+</span>");
    $("#rule_names > span").last().click(function () {
        var rule_name = prompt("What will you name your rule?").trim();
        /* New rule and has a name */
        if (rule_name && rules[rule_name] == undefined) {
            if (rules[rule_name] == undefined) {
                rules[rule_name] = {
                    active: false,
                    main_group: "All",
                    on_off: "on",
                    resource: "time",
                    res_comp: ">",
                    res_amt: 0,
                    fail_group: "All",
                    fail_on_off: "on"
                };
            }
            setup_rules();
            draw_rule(rule_name);
        }
    });
}
function draw_rule(name) {
    /* Clear old stuff and say what we're editing. */
    $("#rule_data").html("");
    $("#rule_data").html("<div style='text-align: center; border-bottom: solid 1px;'>" + name + " <span class='clickable'>Delete</span></div>");
    $("#rule_data > div > span").click(function () {
        if (confirm("Really delete rule " + name + "?")) {
            delete rules[name];
            setup_groups();
            $("#rule_data").html("");
        }
    });
    /* Oh god this. It just sets up some nice stuff for us.
        "Turn grouping [group] [on|off] when [resource] is [>|<] [value]"
    */
    $("#rule_data").append("Turn grouping " +
        "<select id='group_select' class='fgc bgc_second'></select>" +
        "<select id='rule_on_off' class='fgc bgc_second'><option>on</option><option>off</option></select> when " +
        "<select id='resource_select' class='fgc bgc_second'> </select> amount <br />is " +
        "<select id='rule_when' class='fgc bgc_second'><option>&gt;</option><option>&lt;</option></select> " +
        "<input  id='rule_amt' type='number' class='fgc bgc_second' style= 'border: solid 1px;'> </input><br />");
    $("#rule_data").append("On failure, turn grouping " +
        "<select id='fail_group_select' class='fgc bgc_second'></select>" +
        "<select id='fail_on_off' class='fgc bgc_second'><option>on</option><option>off</option></select><br /> ");
    $("#rule_data").append("<span class='clickable' style='background-color: green'>Save Rule</span>");
    Object.keys(groupings).forEach(function (group) {
        $("#group_select").append("<option>" + group + "</option>");
        $("#fail_group_select").append("<option>" + group + "</option>");
    });
    Object.keys(resources).forEach(function (res) {
        if (resources[res].amount != 0 || resources_per_sec[res] != 0 || rules[name].resource == res) {
            $("#resource_select").append("<option>" + res.replace(/\_/g, " ") + "</option>");
        }
    });
    /* Show if pending edits exist */
    $("#rule_data > select, input").change(function () { return $("#rule_data > span").last().css("background-color", "red"); });
    /* Save it. */
    $("#rule_data > span").last().click(function () {
        rules[name] = {
            active: rules[name]["active"],
            main_group: $("#group_select").val(),
            on_off: $("#rule_on_off").val(),
            resource: $("#resource_select").val(),
            res_comp: $("#rule_when").val(),
            res_amt: parseInt($("#rule_amt").val()),
            fail_group: $("#fail_group_select").val(),
            fail_on_off: $("#fail_on_off").val()
        };
        $(this).css("background-color", "green");
    });
    /* Set values */
    $("#group_select").val(rules[name]["main_group"]);
    $("#rule_on_off").val(rules[name]["on_off"]);
    $("#resource_select").val(rules[name]["resource"]);
    $("#rule_when").val(rules[name]["res_comp"]);
    $("#rule_amt").val(rules[name]["res_amt"]);
    $("#fail_group_select").val(rules[name]["fail_group"]);
    $("#fail_on_off").val(rules[name]["fail_on_off"]);
}
var erules = [];
function draw_erule() {
    $("#rule_data").html("Note: Titles are matched using <a href='https://www.regular-expressions.info/tutorial.html' target='_blank' class='fgc'>regular expressions.</a><br />");
    erules = erules.filter(function (rule) { return rule[0] != "" || rule[1] != ""; });
    erules.push(["", ""]);
    var i = 0;
    erules.forEach(function (rule) {
        var index = i;
        $("#rule_data").append("<span id='rule_" + i.toString() + "'>Events with title <input type='text' class='fgc bgc_second'></input> will choose option number <input type='number' class='fgc bgc_second'></input></span><br />");
        $("#rule_data #rule_" + i.toString() + " input").first().change(function (e) {
            rule[0] = $(this).val();
        });
        $("#rule_data #rule_" + i.toString() + " input").first().val(rule[0]);
        $("#rule_data #rule_" + i.toString() + " input").last().change(function (e) {
            rule[1] = $(this).val();
        });
        $("#rule_data #rule_" + i.toString() + " input").last().val(rule[1]);
        i++;
    });
    $("#rule_data").append("<span class='clickable'>+</span>");
    $("#rule_data span").last().click(function () {
        draw_erule();
    });
}
function run_rules() {
    Object.keys(rules).forEach(function (rname) {
        var rule = rules[rname];
        if (rule["active"]) { /* It's turned on, so we need to run it. */
            /* Check the condition. Set up a dict of funcs so we can easily compare. */
            var compares = { "<": function (a, b) { return a < b; }, ">": function (a, b) { return a > b; } };
            /* Check if the rule turns out to match. So if the proper comparison with the actual resource (need to get _s back) succeeds...*/
            if (compares[rule["res_comp"]](resources[rule["resource"].replace(/\s/g, "_")].amount, rule["res_amt"])) {
                /* Now we attempt to turn the grouping on/off */
                if (rule["on_off"] == "on") {
                    var failed_1 = false;
                    groupings[rule["main_group"]].forEach(function (build) {
                        /* Turn them all on. Note if we failed. */
                        if (!buildings[build].on && toggle_building_state(build)) {
                            failed_1 = true;
                        }
                    });
                    if (failed_1) {
                        groupings[rule["fail_group"]].forEach(function (build) {
                            /* Turn them all on/off. */
                            if (buildings[build].on) {
                                if (rule["fail_on_off"] == "off") {
                                    toggle_building_state(build);
                                }
                            }
                            else if (rule["fail_on_off"] == "on") {
                                toggle_building_state(build);
                            }
                        });
                    } /* Whew! Not turning stuff on and trying to fail is done. */
                }
                else {
                    groupings[rule["main_group"]].forEach(function (build) {
                        /* Turn them all off. */
                        if (buildings[build].on) {
                            toggle_building_state(build);
                        }
                    });
                }
            } /* End turn grouping on/off*/
        }
    });
}
var build_queue = [];
var autobuild_amount = 0;
var autobuild_repeat = false;
function draw_autobuild() {
    var autobuild_slots = 10;
    if ((adventure_data["tower_floor"] > 25) || adventure_data["tower_ascension"]) {
        autobuild_slots += 10;
    }
    if ((adventure_data["tower_floor"] > 26) || adventure_data["tower_ascension"]) {
        if ((adventure_data["tower_ascension"]) && (adventure_data["tower_floor"] < tower_height() - TOWER_ASCENSION_GROWTH)) {
            autobuild_slots += tower_height() - TOWER_ASCENSION_GROWTH;
        }
        else {
            autobuild_slots += adventure_data["tower_floor"];
        }
    }
    $("#autobuild_items").html("Autobuild slots: " + format_num(build_queue.length) + "/" + format_num(autobuild_slots) + "<br/>");
    if ((adventure_data["tower_floor"] > 24) || adventure_data["tower_ascension"]) {
        $("#autobuild_items").append("Repeat last building: <input type='checkbox' " + (autobuild_repeat ? "checked" : "") + "><br/>");
        $("#autobuild_items input").last().click(function () {
            autobuild_repeat = !autobuild_repeat;
            draw_autobuild();
        });
    }
    var _loop_1 = function (i) {
        var b_name = $("#building_" + build_queue[i] + " .building_name").text();
        var color = i >= autobuild_amount ? "" : "green";
        if (i == build_queue.length - 1 && autobuild_repeat) {
            color = "yellow";
        }
        $("#autobuild_items").append("<span style='color: " + color + "'>" + b_name + "</span><span class='clickable'>Remove</span><br>");
        $("#autobuild_items span").last().click(function () {
            build_queue.splice(i, 1); /* Remove the element in autobuild queue. */
            if (i < autobuild_amount) { /* If it's already build, reduce autobuild amount to not skip a building. */
                autobuild_amount--;
            }
            draw_autobuild(); /* Refresh view */
        });
    };
    for (var i = 0; i < build_queue.length; i++) {
        _loop_1(i);
    }
    if (build_queue.length < autobuild_slots) {
        $("#autobuild_items").append("Add a building to the queue: ");
        Object.keys(buildings).forEach(function (build) {
            /* For each building, if it's visible, not a mana building, and actually buildable (non empty build cost) let them add it. */
            if (!$("#building_" + build).parent().hasClass("hidden") && SPELL_BUILDINGS.indexOf(build) == -1 && !$.isEmptyObject(buildings[build].base_cost)) {
                var b_name = $("#building_" + build + " .building_name").text();
                $("#autobuild_items").append("<span class='clickable'>" + b_name + "</span>");
                $("#autobuild_items span").last().click(function () {
                    build_queue.push(build);
                    draw_autobuild();
                });
            }
        });
    }
}
function run_autobuild() {
    /* We have a building queued and not built */
    if (build_queue.length > autobuild_amount) {
        var to_build = build_queue[autobuild_amount];
        if (!$("#building_" + to_build).parent().hasClass("hidden") && SPELL_BUILDINGS.indexOf(to_build) == -1) { /* Building must be visible to build it. */
            try {
                purchase_building(to_build, 1); /* Attempt to build it. */
                add_log_elem("Autobuilt activated!");
                autobuild_amount++; /* purchase_building() throws an error if it can't build, so this only runs on successful build. */
                if (!$("#autobuild_items").hasClass("hidden")) { /* If autobuild menu is open, refresh it.*/
                    draw_autobuild();
                }
            }
            catch (e) {
                /* do nothing, this is just required if we have a try statement. */
            }
        }
    }
    else if (autobuild_repeat) {
        autobuild_amount = build_queue.length - 1;
    }
}
function prng(seed) {
    if (seed <= 0) {
        seed = 1234567;
    }
    return seed * 16807 % 2147483647;
}
function perm_bag() {
    $("#events_topbar").html("Magic Bag of Folding");
    $("#events_content").html("This is your bag of folding. You put resources in, and then get a fraction of them out every prestige. You currently have " + adventure_data["perm_bag_bits"].toString() + " pieces of mithril cloth. Unlocking space for a new resource takes one piece of cloth. <br/>");
    if (adventure_data["max_bag_value"] == undefined) {
        adventure_data["max_bag_value"] = 50000;
    }
    $("#events_content").append("<span class='clickable'>Fill</span> bag with all possible resources<br/>");
    $("#events_content span").last().click(function () {
        Object.keys(adventure_data["perm_resources"]).forEach(function (res) {
            if (resources[res].value > 0 && resources[res].amount > 0 && resources[res].value <= adventure_data["max_bag_value"]) {
                adventure_data["perm_resources"][res] += resources[res].amount;
                resources[res].amount = 0;
            }
        });
        perm_bag();
    });
    $("#events_content").append("<table></table>");
    Object.keys(resources).forEach(function (res) {
        if (resources[res].value > 0 && resources[res].value <= adventure_data["max_bag_value"] && (resources[res].amount > 0 || adventure_data["perm_resources"][res])) { /* We only can store resources with > 0 value. Also only show resources the player knows about. */
            var rname = (res.charAt(0).toUpperCase() + res.slice(1)).replace("_", " ");
            if (adventure_data["perm_resources"][res] != undefined) { /* This is unlocked for storage*/
                var res_on_p = calculate_bag_amount(res);
                $("#events_content table").append("<tr><td>" + rname + "</td><td>Current Stored: " + format_num(adventure_data["perm_resources"][res], true) + "</td><td>Gained on Prestige: " + format_num(res_on_p, true) + "</td><td><span class='clickable'>Deposit</span> all into bag. </td></tr>");
                $("#events_content span").last().click(function () {
                    adventure_data["perm_resources"][res] += resources[res].amount;
                    resources[res].amount = 0;
                    perm_bag();
                });
            }
            else { /* Still need to unlock it. */
                $("#events_content table").append("<tr><td>" + rname + "</td><td><span class='clickable'>Unlock</span></td></tr>");
                $("#events_content span").last().click(function () {
                    if (adventure_data["perm_bag_bits"] > 0) {
                        adventure_data["perm_bag_bits"]--;
                        adventure_data["perm_resources"][res] = 0;
                        perm_bag();
                    }
                });
            }
        }
    });
    $("#events").removeClass("hidden");
}
var update_handler = 0;
function change_update() {
    clearInterval(update_handler);
    if (localStorage["update_interval"] != 100) {
        localStorage["update_interval"] = 100;
        $("#update_speed_setting").html("Update Slow");
    }
    else {
        localStorage["update_interval"] = 1000;
        $("#update_speed_setting").html("Update Fast");
    }
    update_handler = setInterval(update, parseInt(localStorage["update_interval"]));
}
function change_notation() {
    if (localStorage["notation_sci"] == "true") {
        localStorage["notation_sci"] = false;
        $("#update_notation").html("Suffix Notation");
    }
    else {
        localStorage["notation_sci"] = true;
        $("#update_notation").html("Scientific Notation");
    }
}
function cath_notifications() {
    if (localStorage["cath_notify"] == "true") {
        localStorage["cath_notify"] = false;
        $("#update_cath_setting").html("Cath Notifications Off");
    }
    else {
        localStorage["cath_notify"] = true;
        $("#update_cath_setting").html("Cath Notifications On");
    }
}
function toggle_confirms() {
    if (this._confirm == undefined) {
        this._confirm = window.confirm;
        window.confirm = function () { return true; };
        localStorage["confirm_off"] = true;
        $("#update_confirms").html("Confirms Disabled");
    }
    else {
        window.confirm = this._confirm;
        delete this._confirm;
        localStorage["confirm_off"] = false;
        $("#update_confirms").html("Confirms Enabled");
    }
}
window.onload = function () {
    set_initial_state();
    load();
    if (localStorage["update_interval"] == undefined)
        localStorage["update_interval"] = 100;
    update_handler = setInterval(update, localStorage["update_interval"]);
    /* Settings stuff */
    if (localStorage["update_interval"] != 100) {
        $("#update_speed_setting").html("Update Slow");
    }
    else {
        $("#update_speed_setting").html("Update Fast");
    }
    if (localStorage["notation_sci"]) {
        $("#update_notation").html("Suffix Notation");
    }
    else {
        $("#update_notation").html("Scientific Notation");
    }
    if (localStorage["cath_notify"] == "true") {
        $("#update_cath_setting").html("Cath Notifications On");
    }
    else {
        $("#update_cath_setting").html("Cath Notifications Off");
    }
    if (localStorage["confirm_off"] == "true") {
        $("#update_confirms").html("Confirms Disabled");
        toggle_confirms();
    }
    else {
        $("#update_confirms").html("Confirms Enabled");
    }
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
    /* Give start of prestige rewards */
    if (event_flags["start_buildings"] == undefined) {
        event_flags["start_buildings"] = true;
        if (resources["money"].amount < 10) {
            resources["money"].amount = 10;
        }
        if (buildings["s_manastone"].amount >= 400 || adventure_data["challenge"]) { /* Lets them open adventure/challenge menu right away. */
            resources["fuel"].amount += 0.3;
        }
        /* Give on prestige resources. */
        if (adventure_data["perm_resources"]) {
            Object.keys(adventure_data["perm_resources"]).forEach(function (res) {
                resources[res].amount += calculate_bag_amount(res);
            });
        }
        /* What building each mana gives. */
        var start_buildings = ["bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "furnace", "gold_finder", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "compressor", "", "", "", "", "oil_well", "bank", "bank", "bank", "bank", "oil_well", "", "", "", "", "library", "library", "library", "library", "library", "library", "bank", "bank", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "", "", "", "", "oil_engine", "solar_panel", "solar_panel", "solar_panel", "solar_panel", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "", "", "", "", "skyscraper", "bank", "skyscraper", "bank", "skyscraper", "bank", "skyscraper", "bank", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "bank", "mine", "bank", "logging", "furnace", "gold_finder", "compressor", "paper_mill", "ink_refinery", "paper_mill"];
        /* Add more start buildings if they completed basic challenge. */
        if (adventure_data["challenges_completed"] && adventure_data["challenges_completed"][CHALLENGES.BASIC]) {
            var extra_mana = buildings["s_manastone"].amount - 100; /* How much mana over the 100 they are. */
            if (Math.pow(extra_mana / 10, 0.5) >= 1) { /* They get one at 10 extra, then 40 extra, then 90... */
                var extra_basics = Math.min(25, Math.floor(Math.pow(extra_mana / 10, 0.5))); /* How many they're getting. Cap at 25 to not make the start list way too long. */
                start_buildings = start_buildings.concat(Array(extra_basics).fill("challenge_basic")); /* Add that many to the list. These all get added because each takes much more than 1 mana to get, so we'll definitely loop through it. */
            }
            if (Math.pow(extra_mana / 50, 0.5) >= 1) { /* Quadratic again, but * 50 instead of 10 */
                var extra_basics = Math.min(25, Math.floor(Math.pow(extra_mana / 50, 0.5))); /* How many they're getting. Cap at 25 to not make the start list way too long. */
                start_buildings = start_buildings.concat(Array(extra_basics).fill("challenge_medium")); /* Add that many to the list. These all get added because each takes much more than 1 mana to get, so we'll definitely loop through it. */
            }
            if (Math.pow(extra_mana / 100, 0.5) >= 1) { /* And finally the hundreds. Is this too hard to get? Maybe. */
                var extra_basics = Math.min(25, Math.floor(Math.pow(extra_mana / 100, 0.5))); /* How many they're getting. Cap at 25 to not make the start list way too long. */
                start_buildings = start_buildings.concat(Array(extra_basics).fill("challenge_advanced")); /* Add that many to the list. These all get added because each takes much more than 1 mana to get, so we'll definitely loop through it. */
            }
        }
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
            buildings[bname].free++;
            if (comp_state) { /* Only turn on if it already was on */
                toggle_building_state(bname);
            }
            $("#building_" + bname + "  > .building_amount").html(format_num(buildings[bname].amount, false));
        }
        if (adventure_data["challenges_completed"]) { /* This has been defined */
            /* They have a loan challenge completion.  */
            if (adventure_data["challenges_completed"].length >= CHALLENGES.LOAN && adventure_data["challenges_completed"][CHALLENGES.LOAN]) {
                /* Make sure it's defined to not get fuzzy production. */
                if (buildings["s_challenge"].generation["money"] == undefined) {
                    buildings["s_challenge"].generation["money"] = 0;
                }
                buildings["s_challenge"].generation["money"] += 30; /* +1 money/s */
                resources_per_sec["money"] += 30; /* Previous stuff is for when they reload it. This sets it up until then. */
                resources["money"].changes["Challenge"] = buildings["s_challenge"].generation["money"]; /* Add it to the resource tooltip. */
            }
            /* They have a no upgrades challenge completion and don't have essence unlocked yet. */
            if (adventure_data["challenges_completed"].length >= CHALLENGES.NO_UPGRADE && adventure_data["challenges_completed"][CHALLENGES.NO_UPGRADE] && adventure_data["current_essence"] == undefined) {
                adventure_data["current_essence"] = 1;
                adventure_data["total_essence"] = 1;
            }
            resource_tooltip(); /* Refresh resource tooltips to get the changes we've been adding. */
        }
        if (adventure_data["current_essence"]) {
            toggle_building_state("s_essence", true);
            buildings["s_essence"].amount = adventure_data["current_essence"];
            toggle_building_state("s_essence");
            update_building_amount("s_essence"); /* Update amount shown. */
        }
        if (adventure_data["tower_floor"] > 34 || adventure_data["tower_ascension"] > 1) {
            if (buildings["s_autoessence"].on) {
                toggle_building_state("s_autoessence");
            }
            buildings["s_autoessence"].amount = 100;
            $("#building_s_autoessence").parent().removeClass("hidden");
            update_building_amount("s_autoessence"); /* Previously, there were infinite of these to keep it hidden. Let's update to proper amount. */
        }
        if (adventure_data["omega_upgrades"]) {
            toggle_building_state("s_essence", true);
            Object.keys(buildings["s_essence"].multipliers).forEach(function (res) {
                buildings["s_essence"].multipliers[res] *= 1 + adventure_data["omega_upgrades"][0][2] / 4;
            });
            toggle_building_state("s_essence");
        }
        if (adventure_data["tower_floor"] > 35 && adventure_data["tower_ascension"] >= 2) {
            toggle_building_state("s_essence", true);
            Object.keys(buildings["s_essence"].multipliers).forEach(function (res) {
                buildings["s_essence"].multipliers[res] *= 1 + (0.01 * adventure_data["tower_ascension"]);
            });
            toggle_building_state("s_essence");
        }
    } /* END start of prestige additions */
    if (adventure_data["perm_resources"] != undefined) {
        resources_per_sec["magic_bag"] = 1;
    }
    if (adventure_data["max_mana"] == undefined) {
        adventure_data["max_mana"] = 100000;
    }
    if (adventure_data["max_refine"] == undefined) {
        adventure_data["max_refine"] = 10000;
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
        var challenge_hydrogen_cap = 5;
        if (adventure_data["challenges_completed"] && adventure_data["challenges_completed"].length >= CHALLENGES.METEORS && adventure_data["challenges_completed"][CHALLENGES.METEORS]) {
            challenge_hydrogen_cap = 50;
        }
        if (adventure_data["challenge"] && buildings["hydrogen_mine"].amount > challenge_hydrogen_cap) { /* If they're in a challenge, cap at 5 */
            buildings["hydrogen_mine"].amount = challenge_hydrogen_cap;
        }
        if (comp_state) { /* Only turn on if it already was on */
            toggle_building_state("hydrogen_mine");
        }
        update_building_amount("hydrogen_mine");
    }
    ["mana_purifier", "omega_machine"].forEach(function (build) {
        if (adventure_data[build]) {
            var comp_state = buildings[build].on;
            if (comp_state) {
                toggle_building_state(build);
            }
            buildings[build].amount = adventure_data[build];
            if (comp_state) { /* Only turn on if it already was on */
                toggle_building_state(build);
            }
            $("#building_" + build + "  > .building_amount").html(format_num(buildings[build].amount, false));
        }
    });
    setup_groups();
    setup_rules();
    /* Display a welcome back message in case of update */
    function check_updates() {
        $.ajax({
            url: "changelog.txt",
            async: true,
            success: function (log) {
                /* Find the version number */
                var changelog = log.split("\n");
                for (var i = 0; i < changelog.length; i++) {
                    /* Find first line with a version number */
                    if (changelog[i].match(/v[0-9]+\.[0-9]+\.[0-9]+/)) {
                        /* We need to set version number. So just version line without the : */
                        $("#version").html(changelog[i].replace(/\:.*/, ""));
                        /* Not a new version :( */
                        if (changelog[i] == localStorage["last_version"]) {
                            return;
                        }
                        /* Find the line number corresponding to last version they've seen.  */
                        var last_version_line = changelog.findIndex(function (elem) { return elem == localStorage["last_version"]; });
                        /* Remember they were at this version */
                        localStorage["last_version"] = changelog[i];
                        $("#events").removeClass("hidden");
                        if (last_version_line == -1) {
                            $("#events_topbar").html("Welcome to Technomancy");
                            $("#events_content").html("Welcome to Technomancy! To begin, you should buy a bank by clicking on it. That will let you produce money and unlock further buildings. Press the X in the top right of this window to close it. ");
                        }
                        else {
                            $("#events_topbar").html(changelog[i]);
                            $("#events_content").html("Hey, there's a new version! What's new in this version: <br />" + changelog.splice(1, last_version_line - 2).join("<br/>"));
                        }
                        /* We don't care about other lines. */
                        return;
                    }
                }
            },
        });
    }
    check_updates();
    setInterval(check_updates, 1000 * 60 * 5); /* Check for updates every 5 minutes or so. */
    if (adventure_data["challenges_completed"] && adventure_data["challenges_completed"].length > CHALLENGES.CASCADE && adventure_data["challenges_completed"][CHALLENGES.CASCADE]) {
        $("#autobuild_unlock").removeClass("hidden");
    }
    /* Setup hotkeys */
    var hotkey_mode = 0;
    $(document).keyup(function (e) {
        /* ESC ALWAYS exits. */
        if (e.key == "Escape" || e.key.toLowerCase() == "x") {
            $("#events").addClass("hidden");
            $("#character").addClass("hidden");
            $("#settings").addClass("hidden");
        }
        /* Otherwise, we need to make sure we aren't actually trying to type something */
        if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
            return;
        }
        if (hotkey_mode == 0) {
            if ("1234567890".indexOf(e.key) != -1) {
                if (!$("#events").hasClass("hidden")) {
                    $("#events_content span.clickable")["1234567890".indexOf(e.key)].click();
                }
            }
            else if (e.key.toLowerCase() == "f") {
                if (!$("#refined_mana").hasClass("hidden")) {
                    $("#refined_mana .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "c") {
                if (!$("#purified_mana").hasClass("hidden")) {
                    $("#purified_mana .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "t") {
                if (!$("#time").hasClass("hidden")) {
                    $("#time .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "a") {
                if (!$("#fuel").hasClass("hidden")) {
                    $("#fuel .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "b") {
                if (!$("#magic_bag").hasClass("hidden")) {
                    $("#magic_bag .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "e") {
                if (!$("#essence").hasClass("hidden")) {
                    $("#essence .res_gen").click();
                }
            }
            else if (e.key.toLowerCase() == "r") {
                if (!$("#building_s_mana_refinery").hasClass("hidden")) {
                    $("#building_s_mana_refinery").click();
                }
            }
            else if (e.key == "+") {
                if (!$("#building_s_energyboost").hasClass("hidden")) {
                    purchase_building('s_energyboost');
                }
            }
            else if (e.key == "-") {
                if (!$("#building_s_energyboost").hasClass("hidden")) {
                    destroy_building('s_energyboost');
                }
            }
            else if (e.key == "s") {
                $("#settings").toggleClass("hidden");
            }
        }
        else if (hotkey_mode == 1) {
            /* Potentially add chaining of hotkeys? Maybe for later stuff, but probably good for now. */
        }
    });
    /* Add building prefixes */
    Object.keys(buildings).forEach(function (build) {
        if (buildings[build]["prefix"] != undefined) {
            $("#building_" + build + " .building_prefix").html(buildings[build]["prefix"] + ' ');
        }
    });
    setInterval(function () {
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
                var amount_2 = parseInt($("#buy_amount").val());
                if (isNaN(amount_2)) {
                    amount_2 = 1;
                }
                Object.keys(buildings[build].base_cost).forEach(function (key) {
                    var cost = buildings[build].base_cost[key] * Math.pow(buildings[build].price_ratio[key], buildings[build].amount - buildings[build].free) * (1 - Math.pow(buildings[build].price_ratio[key], amount_2)) / (1 - buildings[build].price_ratio[key]);
                    if (Math.pow(buildings[build].price_ratio[key], buildings[build].amount + amount_2 - 1 - buildings[build].free) == Infinity) {
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
    }, 1000);
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