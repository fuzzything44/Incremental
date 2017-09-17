// <reference path ="/jquery-3.2.1.js"/>

var resources = {};
var resources_per_sec = {};
var buildings = {};
var purchased_upgrades = []; /* Names of all purchased upgrades */
var remaining_upgrades = {}; /* All remaining upgrades that need to be purchased */
const UNLOCK_TREE = { /* What buildings unlock */
    "s_manastone": [],

    "bank": ["mine", "logging"],
    "mine": ["furnace", "gold_finder"],
    "logging": ["compressor"],
    "furnace": [],
    "compressor": ["oil_well"],
    "gold_finder": ["jeweler"],
    "jeweler": ["jewelry_store"],
    "jewelry_store": [],
    "oil_well": ["oil_engine"],
    "oil_engine": ["paper_mill", "ink_refinery"],
    "paper_mill": ["money_printer"],
    "ink_refinery": [],
    "money_printer": [],
};
const SPECIAL_RESOURCES = ["energy", "mana"]; /* These are special and buildings will provide static amounts of them */
function set_initial_state() {
    resources = {
        "energy": 0, /* TODO: Have a better system for energy and mana, treat them separately and have buildings provide static changes to them */
        "mana" : 0,

        "money": 10,
        "stone": 0,
        "wood": 0,
        "iron_ore": 0,
        "coal": 0,
        "iron": 0,
        "gold": 0,
        "diamond": 0,
        "jewelry": 0,
        "oil": 0,
        "paper": 0,
        "ink": 0,
    };
    resources_per_sec = JSON.parse(JSON.stringify(resources)) /* Not just a simple assignment. We want a deep copy */
    resources_per_sec["money"] = 0;
    buildings = {
        "s_manastone": {
            "on": true,
            "amount": 0,
            "base_cost": { "mana": Infinity },
            "price_ratio": { "mana" : 1 },
            "generation": {
                "mana": 1,
            },
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
        },
    };
    purchased_upgrades = [];
    remaining_upgrades = {
        "better_mines": {
            "unlock": function () { return buildings["mine"].amount >= 3; },
            "purchase": function () { /* When bought, turn all mines off, increase generation, and turn them back on again. Turns off first to get generation from them properly calculated */
                let mines_state = buildings["mine"].on;
                if (mines_state) {
                    toggle_building_state("mine");

                }
                buildings["mine"]["generation"]["stone"] *= 2;
                buildings["mine"]["generation"]["iron_ore"] *= 5;
                if (mines_state) { /* Only turn on if it already was on */
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
            "unlock": function () { return buildings["mine"].amount >= 3 && buildings["compressor"].amount >= 1 && resources["coal"] < 50; },
            "purchase": function () { /* When bought, turn all mines off, increase generation, and turn them back on again. Turns off first to get generation from them properly calculated */
                let mines_state = buildings["mine"].on;
                if (mines_state) {
                    toggle_building_state("mine");

                }
                buildings["mine"]["generation"]["coal"] = 0.2;
                if (mines_state) { /* Only turn on if it already was on */
                    toggle_building_state("mine");
                }
                $("#building_mine > .tooltiptext").html(gen_building_tooltip("mine"));
            },
            "cost": {
                "money": 100,
                "stone": 10,
            },
            "tooltip": "Mines produce coal.<br /> Costs 100 money, 100 wood.",
            "name": "Coal Mining <br />",
            "image": "pickaxe.png",
        },
        "better_compressors": {
            "unlock": function () { return buildings["compressor"].amount >= 1; },
            "purchase": function () { /* When bought, turn all compressors off, increase generation, and turn them back on again. Turns off first to get generation from them properly calculated */
                let comp_state = buildings["compressor"].on;
                if (comp_state) {
                    toggle_building_state("compressor");

                }
                buildings["compressor"]["generation"]["coal"] *= 0.7;
                if (comp_state) { /* Only turn on if it already was on */
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
            "unlock": function () { return buildings["compressor"].amount >= 1 && resources["oil"] > 20; },
            "purchase": function () { /* When bought, turn all compressors off, increase generation, and turn them back on again. Turns off first to get generation from them properly calculated */
                let comp_state = buildings["compressor"].on;
                if (comp_state) {
                    toggle_building_state("compressor");
                }
                buildings["compressor"]["generation"]["coal"] *= 0.9;
                if (comp_state) { /* Only turn on if it already was on */
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
            "unlock": function () { return resources["money"] >= 2500 && buildings["bank"].amount > 20; },
            "purchase": function () { /* When bought, turn all mines off, increase generation, and turn them back on again. Turns off first to get generation from them properly calculated */
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

    };
}

function prestige() {
    /* Calculate mana gain */
    /* First turn off all spells. TODO when spells exist */
    let total_mana = resources["mana"] + Math.log((resources["money"] + resources["stone"] * .5 + resources["wood"] * .5 + resources["gold"] * 75 + resources["diamond"] * 100 + resources["jewelry"] * 400) / 10000 + 1);
    total_mana = Math.max(0, Math.floor(total_mana)); /* Bound mana nicely as nonnegative integer */
    if (total_mana == 0) {
        alert("You wouldn't gain any mana from resetting now!");
        return;
    }
    if (confirm("You will lose all resources and all buildings but have " + total_mana.toString() + " mana after reset. Proceed?")) {
        set_initial_state();
        resources_per_sec["mana"] = total_mana;
        buildings["s_manastone"].amount = total_mana;
        $("#building_s_manastone span:nth-child(2)").html(total_mana.toString());
        $("#spells").removeClass("hidden");
    }
}

function save() {
    Object.keys(resources).forEach(function (type) {
        document.cookie = "res-" + type + "=" + resources[type].toString() + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    });
    Object.keys(buildings).forEach(function (type) {
        document.cookie = "build-" + type + "=" + JSON.stringify(buildings[type]) +";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    });
    document.cookie = "upgrades=" + JSON.stringify(purchased_upgrades) + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    $('#save_text').css('opacity', '1'); setTimeout(() => $('#save_text').css({ 'opacity': '0', 'transition': 'opacity 1s' }), 1000);
    console.log("Saved");
}

function load() {
    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
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
        let temp_str = getCookie("res-" + type);
        if (temp_str !== "") {
            resources[type] = parseFloat(temp_str);
        }
    });
    console.log("Loading buildings...");
    Object.keys(buildings).forEach(function (type) {
        let temp_str = getCookie("build-" + type);
        if (temp_str !== "") {
            buildings[type] = JSON.parse(temp_str);
            /* Show how many buildings they have and set tooltip properly */
            $('#building_' + type + " > .building_amount").html(buildings[type].amount.toString());
            $('#building_' + type + " > .tooltiptext").html(gen_building_tooltip(type));

        }
    });
    if (buildings["s_manastone"].amount > 0) {
        $("#spells").removeClass("hidden");
    }
    console.log("Loading upgrades...");
    if (getCookie("upgrades") == "") {
        purchased_upgrades = [];
    } else {
        purchased_upgrades = JSON.parse(getCookie("upgrades"));
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
        } else {
            $("#toggle_" + name).addClass("building_state_off");
            $("#toggle_" + name).removeClass("building_state_on");
            $("#toggle_" + name).text("Off");
        }
    });
}

function toggle_building_state(name: string) {
    if (buildings[name].on) { /* Turn it off */
        buildings[name].on = false;
        /* Go through each resource it generates... */
        Object.keys(buildings[name].generation).forEach(function (key) {
            /* And decrease production by that much */
            resources_per_sec[key] -= buildings[name].amount * buildings[name].generation[key];
        });
        $("#toggle_" + name).addClass("building_state_off");
        $("#toggle_" + name).removeClass("building_state_on");
        $("#toggle_" + name).text("Off");
    } else { /* Turn it on */
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


const UPDATE_INTERVAL = 35;
function update() {
    /* Update all resources */
    Object.keys(resources).forEach(function (key) {
        if (SPECIAL_RESOURCES.indexOf(key) == -1) {
            /* Don't add special resources */
            resources[key] += resources_per_sec[key] * UPDATE_INTERVAL / 1000;
        } else { /* We have as much of specialty resources as we generate */
            resources[key] = resources_per_sec[key];
        }
        /* Formats it so that it says "Resource name: amount" */
        $("#" + key + " span").first().html((key.charAt(0).toUpperCase() + key.slice(1)).replace("_", " ") + ": " + Math.max(0, Math.floor(resources[key])).toString() + "<br />");
        /* Same for tooltip */
        $("#" + key + "_per_sec").text("Making " + (Math.round(resources_per_sec[key] * 10) /10).toString() + " per second");
    });
    /* Check for negative resources */
    Object.keys(resources).forEach(function (res) { /* Loop through all resources, res is current checked resource */
        if (resources[res] > 0) {
            /* Unhide resources we have */
            $("#" + res).removeClass("hidden");
        }
        if (resources[res] < 0) {
            /* Check all buildings */
            Object.keys(buildings).forEach(function (build) { /* Loop through all buildings, build is current checked building */
                /* Check resource gen */
               if (buildings[build].generation[res] < 0 && buildings[build].on && buildings[build].amount > 0) {
                   toggle_building_state(build);
               }
            });
        }
    });
    /* Unhide buildings */
    Object.keys(buildings).forEach(function (build) {
        if (buildings[build].amount > 0) {
            UNLOCK_TREE[build].forEach(function (unlock) {
                $("#building_" + unlock).parent().removeClass("hidden");
            });
        }

        try {
            Object.keys(buildings[build].base_cost).forEach(function (key) {
                if (buildings[build].base_cost[key] * Math.pow(buildings[build].price_ratio[key], buildings[build].amount) > resources[key]) {
                    throw Error("Not enough resources!");
                }
            });
            $("#building_" + build).removeClass("building_expensive");
        } catch (e) {
            $("#building_" + build).addClass("building_expensive");
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
            let upg_elem: string = "<li id=\"upgrade_" + upg_name +
                "\" class=\"upgrade tooltip\" onclick=\"purchase_upgrade('" + upg_name + "')\" style='text-align: center'><span>" +
                remaining_upgrades[upg_name].name + "<br /> <img src='images/" + remaining_upgrades[upg_name].image + "' alt='' style='width: 3em; height: 3em; float: bottom;' /></span><span class=\"tooltiptext\">" +
                remaining_upgrades[upg_name].tooltip + "</span> </li>";
            $("#upgrades > ul").append(upg_elem);
        }
    });
}

function gen_building_tooltip(name: string) {
    let gen_text: string = "Generates ";
    /* Add resource gen, update how much each one generates. */
    Object.keys(buildings[name].generation).forEach(function (key) {
        gen_text += Math.round((buildings[name].generation[key]) * 10) / 10 + " " + key.replace("_", " ") + " per second, "
    });

    let cost_text: string = "Costs ";
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        cost_text += Math.ceil(buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount)).toString();
        cost_text += " " + key + ", ";
    });

    return gen_text.trim().replace(/.$/, ".") + "<br />" + cost_text.trim().replace(/.$/, ".");
}

function purchase_building(name: string) {
    /* Make sure they have enough to buy it */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Checking money");
        if (buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount) > resources[key]) {
            throw Error("Not enough resources!");
        }
    });

    /* Spend money to buy */
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        console.log("Spending money");
        resources[key] -= buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount); 
    });

    /* Add resource gen */
    Object.keys(buildings[name].generation).forEach(function (key) {
        if (buildings[name].on) { /* Only add resources per sec if on */
            resources_per_sec[key] += buildings[name].generation[key];
        }
    });

    buildings[name].amount++;
    $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());

    $('#building_' + name + " > .tooltiptext").html(gen_building_tooltip(name));


}

function purchase_upgrade(name: string) {
    let upg = remaining_upgrades[name];

    /* Check that they have enough */
    Object.keys(upg.cost).forEach(function (resource) {
        if (resources[resource] < upg.cost[resource]) { /* Don't have enough to buy upgrade */
            throw Error("Not enough resources!");
        }
    });

    /* Spend it */
    Object.keys(upg.cost).forEach(function (resource) {
        resources[resource] -= upg.cost[resource];
    });

    /* Do cleanup. Get benefit from having it, remove it from purchasable upgrades, add it to purchased upgrades, remove from page */
    purchased_upgrades.push(name);
    delete remaining_upgrades[name]
    $("#upgrade_" + name).remove();
    upg.purchase();
}

function random_title() {
    const TITLES = ["CrappyIdle v.π²", "Drink Your Ovaltine!", "(!) Not Responding            (I lied)", "17 New Resources That Will Blow Your Mind!", "Ÿ̛̦̯ͬ̔̾̃ͥ͑o͋ͩ̽̓͋̚͘u͚̼̜̞͉͓̹ͦ͒͌̀ ̄͋̉̓҉̖̖̠̤ņ͔̄͟͟e̦̝̻̼̖͖͋̓̔̓͒ͬe̷͈̗̻̘̩̙̖͗ͫͭͮ͌̃́ͬ̔d̥̞ͨ̏͗͆̉ͩ ̨̟̭̻͔̰͓͍̤͍̀ͤͤ̎͐͘͠m͙͈͖̱͍̖̤͑̃͐͋ͪ̐ͯ̏͘ͅȍ̼̭̦͚̥̜͉̥̱ͬ͞r̥̣̰͈̻̰ͮ̓̚e̳͊ͯ͞ ̏ͯ̈́҉̛̮͚̖͈̼g̩͖̙̞̮̟̍ͦͫ̓ͭͥ̀o̧̻̞̰͉̤͇̭̘͓ͨ̆̔ͨl̴͕͉̦̩̟̤̰̃͋̃̉̓͌ͪ͌ͩd̢̨̲̻̿ͫ"];
    document.title = TITLES.filter(item => item !== document.title)[Math.floor(Math.random() * (TITLES.length - 1))];

}
window.onload = () => {
    set_initial_state();
    load();
    setInterval(update, UPDATE_INTERVAL);
    setInterval(save, 30000);

    update_upgrade_list();
    setInterval(update_upgrade_list, 500);

    random_title();
    setInterval(random_title, 60000);
};

function hack(level: number) {
    Object.keys(resources).forEach(function (r) { resources[r] = level });
}