// <reference path ="/jquery-3.2.1.js"/>
var RESOURCE_TYPES = ["money", "stone", "wood", "iron_ore", "coal", "iron", "gold", "diamond", "jewelry"];
var resources = {};
var resources_per_sec = {};
var buildings = {};
var purchased_upgrades = []; /* Names of all purchased upgrades */
var remaining_upgrades = {}; /* All remaining upgrades that need to be purchased */
function set_initial_state() {
    resources = {
        "money": 10,
        "stone": 0,
        "wood": 0,
        "iron_ore": 0,
        "coal": 0,
        "iron": 0,
        "gold": 0,
        "diamond": 0,
        "jewelry": 0,
    };
    resources_per_sec = JSON.parse(JSON.stringify(resources)); /* Not just a simple assignment. We want a deep copy */
    resources_per_sec["money"] = 0;
    buildings = {
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
            "unlocks": ["mine", "logging"],
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
            "unlocks": ["furnace", "gold_finder"],
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
            "unlocks": ["compressor"],
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
                "iron": 1,
                "coal": 1,
                "wood": -5,
                "iron_ore": -3,
            },
            "unlocks": [],
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
                "diamond": 0.1,
                "coal": -10,
            },
            "unlocks": [],
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
                "gold": 0.1,
                "stone": -20,
            },
            "unlocks": ["jeweler"],
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
            "unlocks": ["jewelry_store"],
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
            "unlocks": [],
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
            "image": "images/pickaxe.png",
        },
        "better_compressors": {
            "unlock": function () { return buildings["compressor"].amount >= 3; },
            "purchase": function () {
                var comp_state = buildings["compressor"].on;
                if (comp_state) {
                    toggle_building_state("mine");
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
            "image": "",
        },
    };
}
function save() {
    RESOURCE_TYPES.forEach(function (type) {
        document.cookie = "res-" + type + "=" + resources[type].toString();
    });
    Object.keys(buildings).forEach(function (type) {
        document.cookie = "build-" + type + "=" + JSON.stringify(buildings[type]);
    });
    document.cookie = "upgrades=" + JSON.stringify(purchased_upgrades);
    document.cookie = "save_version=1";
    document.cookie = "expires=Fri, 31 Dec 9999 23:59:59 GMT";
    console.log("Saved");
}
function load() {
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
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
    RESOURCE_TYPES.forEach(function (type) {
        /* Store in temp string because we need to check if it exists */
        var temp_str = getCookie("res-" + type);
        if (temp_str !== "") {
            resources[type] = parseFloat(temp_str);
        }
    });
    console.log("Loading buildings...");
    Object.keys(buildings).forEach(function (type) {
        var temp_str = getCookie("build-" + type);
        if (temp_str !== "") {
            buildings[type] = JSON.parse(temp_str);
            /* Show how many buildings they have and set tooltip properly */
            $('#building_' + type + " > .building_amount").html(buildings[type].amount.toString());
            $('#building_' + type + " > .tooltiptext").html(gen_building_tooltip(type));
        }
    });
    console.log("Loading upgrades...");
    if (getCookie("upgrades") == "") {
        purchased_upgrades = [];
    }
    else {
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
        }
        else {
            $("#toggle_" + name).addClass("building_state_off");
            $("#toggle_" + name).removeClass("building_state_on");
            $("#toggle_" + name).text("Off");
        }
    });
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
var UPDATE_INTERVAL = 35;
function update() {
    /* Update all resources */
    Object.keys(resources).forEach(function (key) {
        resources[key] += resources_per_sec[key] * UPDATE_INTERVAL / 1000;
        /* Formats it so that it says "Resource name: amount" */
        $("#" + key + " span").first().html((key.charAt(0).toUpperCase() + key.slice(1)).replace("_", " ") + ": " + Math.floor(resources[key]).toString() + "<br />");
        /* Same for tooltip */
        $("#" + key + "_per_sec").text("Making " + resources_per_sec[key].toString() + " per second");
    });
    /* Check for negative resources */
    Object.keys(resources).forEach(function (res) {
        if (resources[res] > 0) {
            /* Unhide resources we have */
            $("#" + res).removeClass("hidden");
        }
        if (resources[res] <= 0) {
            /* Check all buildings */
            Object.keys(buildings).forEach(function (build) {
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
            buildings[build].unlocks.forEach(function (unlock) {
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
        }
        catch (e) {
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
            var upg_elem = "<li id=\"upgrade_" + upg_name +
                "\" class=\"upgrade tooltip\" onclick=\"purchase_upgrade('" + upg_name + "')\" style='text-align: center'><span>" +
                remaining_upgrades[upg_name].name + "<br /> <img src='" + remaining_upgrades[upg_name].image + "' alt='' style='width: 3em; height: 3em;' /></span><span class=\"tooltiptext\">" +
                remaining_upgrades[upg_name].tooltip + "</span> </li>";
            $("#upgrades > ul").append(upg_elem);
        }
    });
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
    return gen_text.trim().replace(/.$/, ".") + "<br />" + cost_text.trim().replace(/.$/, ".");
}
function purchase_building(name) {
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
        if (buildings[name].on) {
            resources_per_sec[key] += buildings[name].generation[key];
        }
    });
    buildings[name].amount++;
    $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());
    $('#building_' + name + " > .tooltiptext").html(gen_building_tooltip(name));
}
function purchase_upgrade(name) {
    var upg = remaining_upgrades[name];
    /* Check that they have enough */
    Object.keys(upg.cost).forEach(function (resource) {
        if (resources[resource] < upg.cost[resource]) {
            throw Error("Not enough resources!");
        }
    });
    /* Spend it */
    Object.keys(upg.cost).forEach(function (resource) {
        resources[resource] -= upg.cost[resource];
    });
    /* Do cleanup. Get benefit from having it, remove it from purchasable upgrades, add it to purchased upgrades, remove from page */
    upg.purchase();
    delete remaining_upgrades[name];
    purchased_upgrades.push(name);
    $("#upgrade_" + name).remove();
}
function random_title() {
    var TITLES = ["CrappyClicker v.π²", "Drink Your Ovaltine!", "(!) Not Responding            (I lied)", "17 New Resources That Will Blow Your Mind!", "Ÿ̛̦̯ͬ̔̾̃ͥ͑o͋ͩ̽̓͋̚͘҉̧̰u͚̼̜̞͉͓̹ͦ͒͌̀ ̄͋̉̓҉̖̖̠̤ņ͔̄͟͟e̦̝̻̼̖͖͋̓̔̓͒ͬe̷͈̗̻̘̩̙̖͗ͫͭͮ͌̃́ͬ̔d̥̞ͨ̏͗͆̉ͩ ̨̟̭̻͔̰͓͍̤͍̀ͤͤ̎͐͘͠m͙͈͖̱͍̖̤͑̃͐͋ͪ̐ͯ̏͘ͅȍ̼̭̦͚̥̜͉̥̱ͬ͞r̥̣̰͈̻̰ͮ̓̚e̳͊ͯ͞ ̏ͯ̈́҉̛̮͚̖͈̼g̩͖̙̞̮̟̍ͦͫ̓ͭͥ̀o̧̻̞̰͉̤͇̭̘͓ͨ̆̔ͨl̴͕͉̦̩̟̤̰̃͋̃̉̓͌ͪ͌ͩd̢̨̲̻̿ͫ"];
    document.title = TITLES.filter(function (item) { return item !== document.title; })[Math.floor(Math.random() * (TITLES.length - 1))];
}
window.onload = function () {
    set_initial_state();
    load();
    setInterval(update, UPDATE_INTERVAL);
    setInterval(save, 15000);
    update_upgrade_list();
    setInterval(update_upgrade_list, 500);
    random_title();
    setInterval(random_title, 60000);
};
//# sourceMappingURL=app.js.map