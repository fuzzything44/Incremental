// <reference path ="/jquery-3.2.1.js"/>
var RESOURCE_TYPES = ["money", "stone", "wood", "iron_ore", "coal", "iron", "gold", "diamond", "jewelry"];
var resources = {
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
var resources_per_sec = {
    "money": 0,
    "stone": 0,
    "wood": 0,
    "iron_ore": 0,
    "coal": 0,
    "iron": 0,
    "gold": 0,
    "diamond": 0,
    "jewelry": 0,
};
var buildings = {
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
function save() {
    RESOURCE_TYPES.forEach(function (type) {
        document.cookie = "res-" + type + "=" + resources[type].toString();
    });
    Object.keys(buildings).forEach(function (type) {
        document.cookie = "build-" + type + "=" + JSON.stringify(buildings[type]);
    });
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
            /* Show how many buildings they have */
            $('#building_' + type + " > .building_amount").html(buildings[type].amount.toString());
        }
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
    buildings[name].amount++;
    $('#building_' + name + " > .building_amount").html(buildings[name].amount.toString());
    var gen_text = "Generates ";
    /* Add resource gen, update how much each one generates. */
    Object.keys(buildings[name].generation).forEach(function (key) {
        if (buildings[name].on) {
            resources_per_sec[key] += buildings[name].generation[key];
        }
        gen_text += Math.round((buildings[name].generation[key]) * 10) / 10 + " " + key.replace("_", " ") + " per second, ";
    });
    var cost_text = "Costs ";
    Object.keys(buildings[name].base_cost).forEach(function (key) {
        cost_text += Math.ceil(buildings[name].base_cost[key] * Math.pow(buildings[name].price_ratio[key], buildings[name].amount)).toString();
        cost_text += " " + key + ", ";
    });
    $('#building_' + name + " > .tooltiptext").html(gen_text.trim().replace(/.$/, ".") + "<br />" +
        cost_text.trim().replace(/.$/, "."));
}
function random_title() {
    var TITLES = ["CrappyClicker v.π²", "Drink Your Ovaltine!", "(!) Not Responding            (I lied)", "17 New Resources That Will Blow Your Mind!", "Ÿ̛̦̯ͬ̔̾̃ͥ͑o͋ͩ̽̓͋̚͘҉̧̰u͚̼̜̞͉͓̹ͦ͒͌̀ ̄͋̉̓҉̖̖̠̤ņ͔̄͟͟e̦̝̻̼̖͖͋̓̔̓͒ͬe̷͈̗̻̘̩̙̖͗ͫͭͮ͌̃́ͬ̔d̥̞ͨ̏͗͆̉ͩ ̨̟̭̻͔̰͓͍̤͍̀ͤͤ̎͐͘͠m͙͈͖̱͍̖̤͑̃͐͋ͪ̐ͯ̏͘ͅȍ̼̭̦͚̥̜͉̥̱ͬ͞r̥̣̰͈̻̰ͮ̓̚e̳͊ͯ͞ ̏ͯ̈́҉̛̮͚̖͈̼g̩͖̙̞̮̟̍ͦͫ̓ͭͥ̀o̧̻̞̰͉̤͇̭̘͓ͨ̆̔ͨl̴͕͉̦̩̟̤̰̃͋̃̉̓͌ͪ͌ͩd̢̨̲̻̿ͫ"];
    document.title = TITLES.filter(function (item) { return item !== document.title; })[Math.floor(Math.random() * (TITLES.length - 1))];
}
window.onload = function () {
    load();
    setInterval(update, UPDATE_INTERVAL);
    setInterval(save, 15000);
    random_title();
    setInterval(random_title, 60000);
};
//# sourceMappingURL=app.js.map