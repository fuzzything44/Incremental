var ingredient = (function () {
    /**
     *
     * @param name: The displayed name of the ingredient
     * @param maj: A function(number) that performs the major effect, 1/s. Paramater is strength.
     * @param desc: The description shown if it's used as the major potion ingredient.
     * @param time: How long the buff lasts, in seconds.
     * @param str: Strength of the potion.
     * @param costs: A list of costs. Each element is an object with {{type: "resource" OR "adventure", amount: number of items it costs, name: What it is named. Either the resource or item name, requirements: Only if type is "adventure". The other attributes on the item, see count_item() for selection. }}
     * @param maj_name: Major name. If a potion is named Brightly Glowing Potion of Power, this is Power
     * @param time_name: Time name. If a potion is named Brightly Glowing Potion of Power, this is Glowing
     * @param str_name: Strength name. If a potion is named Brightly Glowing Potion of Power, this is Brightly
     */
    function ingredient(name, maj, ending, desc, time, str, costs, maj_name, time_name, str_name) {
        this.name = name;
        this.effect_func = maj;
        this.ending_func = ending;
        this.effect_desc = desc;
        this.effect_time = time;
        this.effect_strength = str;
        this.cost = costs;
        this.major_name = maj_name;
        this.time_name = time_name;
        this.strength_name = str_name;
    }
    ingredient.prototype.verify_costs = function () {
        /* Can't buy if no costs. They need to find it! */
        if (this.cost.length == 0) {
            return false;
        }
        /* Go through all costs */
        for (var i = 0; i < this.cost.length; i++) {
            var cost = this.cost[i]; /* Get the actual cost object. */
            if (cost.type == "adventure") {
                /* Adventure mode cost. So just match an item. */
                if (count_item(cost.name, adventure_data.inventory, cost.requirements) < cost.amount) {
                    return false; /* Not enough items with the specific name and attributes. */
                }
            }
            else if (cost.type == "resource") {
                /* Resource cost. Pretty easy. */
                if (resources[cost.name].amount < cost.amount) {
                    return false; /* They don't have enough. */
                }
            }
            else {
                throw "Unknown cost type " + cost.type;
            }
        }
        return true;
    };
    ingredient.prototype.spend_costs = function () {
        /* Make sure they can actually buy it.*/
        if (!this.verify_costs()) {
            throw "Hmm... they can't buy this.";
        }
        /* Go through all costs */
        for (var i = 0; i < this.cost.length; i++) {
            var cost = this.cost[i]; /* Get the actual cost object. */
            if (cost.type == "adventure") {
                /* Adventure mode cost. So just match an item. */
                for (var j = 0; j < cost.amount; j++) {
                    adventure_data.inventory.splice(find_item(cost.name, adventure_data.inventory, cost.requirements), 1);
                }
            }
            else if (cost.type == "resource") {
                /* Resource cost. Pretty easy. */
                resources[cost.name].amount -= cost.amount;
            }
            else {
                throw "Unknown cost type " + cost.type;
            }
        }
    };
    return ingredient;
}());
/**
 * Only add ingredients to the end, as potions rely on this order staying the same.
 */
var ingredients = [
    new ingredient("Gold Leaf", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        resources["money"].amount += resources_per_sec["gold"] * 10;
    }, function () {
    }, "Helps you get more money!", 30, 2, [
        { type: "resource", amount: 75, name: "gold" },
        { type: "resource", amount: 1, name: "glass_bottle" },
        { type: "resource", amount: 500, name: "water" }
    ], "Wealth", "Glowing", "Softly"),
    new ingredient("Magic Dust", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
    }, function () {
    }, "Does nothing.", 120, 7, [
        { type: "adventure", amount: 1, name: "magic_orb", requirements: {} }
    ], "Disgust", "Shimmering", "Brightly"),
    new ingredient("Explodium", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
            player_data["weapon_1"].extra_damage += Math.floor(1 + power / 5);
        }
        else {
            resources["hydrogen"].amount *= 1 - 0.05 * power;
        }
    }, function () {
    }, "Gives extra damage, but at a constant upkeep cost.", 30, 2, [
        { type: "resource", amount: 1000, name: "hydrogen" },
        { type: "resource", amount: 50, name: "uranium" },
        { type: "resource", amount: 10, name: "fuel" }
    ], "Fire", "Fizzing", "Loud,"),
    new ingredient("Powder", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
            var castle_cost = 5000000 * Math.pow(0.9, 1 + 0.75 * power);
            if (resources["sand"].amount > castle_cost) {
                resources["sand"].amount -= castle_cost;
                resources["sandcastle"].amount++;
            }
        }
        else {
            resources["sand"].amount += resources_per_sec["sand"] * Math.pow(2 + 0.05 * adventure_data["current_potion"].time, 1 + 0.05 * power);
        }
    }, function () {
    }, "More sand to build more castles.", 20, 5, [
        { type: "resource", amount: 1, name: "sandcastle" },
        { type: "resource", amount: 500000, name: "sand" },
    ], "the Earth", "Bubbling", "Occasionally"),
    new ingredient("Ferrous Oxide", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
            if (player_data["shields"] < 5) {
                player_data["shields"]++;
            }
            else if (player_data["power_shields"] < 5) {
                player_data["power_shields"]++;
            }
        }
        else {
        }
    }, function () {
    }, "A tough iron coating to protect.", 70, 3, [
        { type: "resource", amount: 500000, name: "iron" },
        { type: "resource", amount: 5000, name: "water" },
    ], "Strength", "Unmoving", "Solidly"),
    new ingredient("Crystallized Thought", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
            player_data["actions"] += 2;
            player_data["actions_per_turn"] += 2;
        }
        else {
            if (adventure_data["current_potion"].applied_effect == undefined) {
                resources_per_sec["research"] += 25;
                resources_per_sec["book"] += 1;
                adventure_data["current_potion"].applied_effect = true;
            }
        }
    }, function () {
        resources_per_sec["research"] -= 25; /* Take away the production we gave. */
        resources_per_sec["book"] -= 1;
    }, "Increases thought power and speed of action.", 120, 8, [
        { type: "resource", amount: 5000, name: "book" },
        { type: "resource", amount: 50, name: "research" },
        { type: "resource", amount: 5000, name: "diamond" },
        { type: "resource", amount: 10000, name: "glass" },
        { type: "adventure", amount: 1, name: "conv_key", requirements: {} },
    ], "the Mind", "Shifting", "Slowly"),
    new ingredient("Liquid Flame", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
        }
        else {
            if (adventure_data["current_potion"].applied_effect == undefined) {
                resources_per_sec["glass"] += 25 * power;
                resources_per_sec["wood"] += -50 * power;
                resources_per_sec["oil"] += -10 * power;
                resources_per_sec["sand"] += -50 * power;
                resources_per_sec["iron_ore"] += -30 * power;
                resources_per_sec["iron"] += 10 * power;
                adventure_data["current_potion"].applied_effect = true;
            }
        }
    }, function () {
        var power = adventure_data["current_potion"].power;
        resources_per_sec["glass"] -= 25 * power;
        resources_per_sec["wood"] -= -50 * power;
        resources_per_sec["oil"] -= -10 * power;
        resources_per_sec["sand"] -= -50 * power;
        resources_per_sec["iron_ore"] -= -30 * power;
        resources_per_sec["iron"] -= 10 * power;
    }, "Melts and burns.", 50, 4, [
        { type: "resource", amount: 50, name: "book" },
        { type: "resource", amount: 10000, name: "wood" },
        { type: "resource", amount: 5000, name: "coal" },
    ], "Burninating", "Burning", "Hot,"),
    new ingredient("Carrot", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
        }
        else {
            if (adventure_data["current_potion"].applied_effect == undefined) {
                resources_per_sec["gold"] += 25 * power;
                resources_per_sec["diamond"] += 5 * power;
                adventure_data["current_potion"].applied_effect = true;
            }
        }
    }, function () {
        var power = adventure_data["current_potion"].power;
        resources_per_sec["gold"] -= 25 * power;
        resources_per_sec["diamond"] -= 5 * power;
    }, "You have good vision.", 150, 9, [], "Sight", "Still", "Fine"),
    new ingredient("Space Carrot", function (power, on_combat) {
        if (on_combat === void 0) { on_combat = false; }
        if (on_combat) {
        }
        else {
            if (adventure_data["current_potion"].applied_effect == undefined) {
                resources_per_sec["uranium"] += power;
                resources_per_sec["fuel"] += 0.1 * power;
                adventure_data["current_potion"].applied_effect = true;
            }
        }
    }, function () {
        var power = adventure_data["current_potion"].power;
        resources_per_sec["uranium"] -= power;
        resources_per_sec["fuel"] -= 0.1 * power;
    }, "You have good space vision.", 180, 10, [], "Space Sight", "Super Still", "Very Fine"),
];
/**
 * Sets up alchemy ingredient making.
 */
function alchemy_ingredients() {
    /* Let them see resources*/
    $("#character").addClass("hidden");
    /* Setup basic visuals*/
    $("#events_topbar").html("Alchemy - Ingredient Crafting");
    $("#events_content").html("<span class='clickable' onclick='alchemy_mix()'>Mix</span> Potions<table><tbody></tbody></table>");
    /* Table start*/
    $("#events_content tbody").append("<tr style='font-weight: bold;'><td></td><td>&nbsp;&nbsp;Item&nbsp;&nbsp;</td><td>&nbsp;&nbsp;Amount Owned&nbsp;&nbsp;</td><td>&nbsp;&nbsp;Cost to Make&nbsp;&nbsp;</td></tr>");
    var _loop_1 = function (i) {
        var index = i;
        /* Make sure that the ingredient exists. If not, add it. This lets us add ingredients later. */
        if (adventure_data.alchemy_ingredients[ingredients[i].name] == undefined) {
            adventure_data.alchemy_ingredients[ingredients[i].name] = 0;
        }
        /* If they can't buy it, don't show as a crafting option. */
        if (ingredients[i].cost.length == 0) {
            return "continue";
        }
        /* Add table row for it. */
        $("#events_content tbody").append("<tr></tr>");
        /* Craft button */
        $("#events_content tr").last().append("<td>" + "<span class='clickable'>Make</span>" + "</td>");
        $("#events_content span").last().click(function () {
            if (ingredients[index].verify_costs()) {
                ingredients[index].spend_costs();
                adventure_data.alchemy_ingredients[ingredients[index].name]++;
            }
            alchemy_ingredients();
        });
        /* Add item name */
        $("#events_content tr").last().append("<td>" + ingredients[i].name + "</td>");
        /* Add amount. */
        $("#events_content tr").last().append("<td>" + format_num(adventure_data.alchemy_ingredients[ingredients[i].name], false) + "</td>");
        /* Add crafting cost */
        $("#events_content tr").last().append("<td>&nbsp;</td>");
        Object.keys(ingredients[i].cost).forEach(function (cost) {
            /* Check cost type. */
            if (ingredients[i].cost[cost].type == "resource") {
                /* Add it in the form of 341K steel beam (example) */
                $("#events_content td").last().append(format_num(ingredients[i].cost[cost].amount, true) + " " + ingredients[i].cost[cost].name.replace("_", " "));
            }
            else {
                var data = ingredients[i].cost[cost].requirements;
                data["name"] = ingredients[i].cost[cost].name;
                $("#events_content td").last().append(format_num(ingredients[i].cost[cost].amount, true) + " " + gen_equipment(data).name);
            }
            $("#events_content td").last().append("<br/>&nbsp;"); /* Append line break for next item. */
        });
    };
    /* Go through each ingredient, let them craft it. */
    for (var i = 0; i < ingredients.length; i++) {
        _loop_1(i);
    }
}
var alchemy_first = null;
var alchemy_time = null;
var alchemy_power = null;
function add_ingredient(item) {
    if (alchemy_first == null) {
        alchemy_first = item;
        $("#ingredient_message").html("You add the " + item + ". Your potion bubbles.<br />Choose an ingredient to burn under your potion.");
    }
    else if (alchemy_time == null) {
        if (item == alchemy_first) {
            $("#ingredient_message").prepend("You can't re-use ingredients in a potion.<br/>");
            return;
        }
        alchemy_time = item;
        $("#ingredient_message").html("You burn the " + item + " under your " + alchemy_first + ". Your potion turns a bright shade of " + ["green", "red", "blue"][Math.floor(Math.random() * 3)] + ".<br />Choose an ingredient to stir into the potion and finalize it.");
    }
    else if (alchemy_power == null) {
        if (item == alchemy_first || item == alchemy_time) {
            $("#ingredient_message").prepend("You can't re-use ingredients in a potion.<br/>");
            return;
        }
        alchemy_power = item;
        $("#ingredient_message").html("You add the " + item + " to the potion containing " + alchemy_first + ", being heated by burning " + alchemy_time + ". The color darkens and " + ["swirls", "sparks"][Math.random() > 0.5 ? 0 : 1] + " appear.<br /><span class='clickable'>Mix</span> your potion and finish it!");
        $("#ingredient_message span").click(function () {
            if (resources["glass_bottle"].amount < 1) {
                $("#ingredient_message").prepend("You have no bottle to store your potion in!<br/>");
            }
            else {
                /* Remove resources */
                adventure_data.alchemy_ingredients[alchemy_first]--;
                adventure_data.alchemy_ingredients[alchemy_time]--;
                adventure_data.alchemy_ingredients[alchemy_power]--;
                resources["glass_bottle"].amount--;
                /* Find ingredient indices. */
                var first_index = null;
                var time_index = null;
                var power_index = null;
                for (var i = 0; i < ingredients.length; i++) {
                    if (ingredients[i].name == alchemy_first) {
                        first_index = i;
                        break;
                    }
                }
                for (var i = 0; i < ingredients.length; i++) {
                    if (ingredients[i].name == alchemy_time) {
                        time_index = i;
                        break;
                    }
                }
                for (var i = 0; i < ingredients.length; i++) {
                    if (ingredients[i].name == alchemy_power) {
                        power_index = i;
                        break;
                    }
                }
                var item_1 = {
                    name: "potion",
                    /* Format name to be someting like Brightly Glowing Potion of Power. */
                    disp_name: ingredients[power_index].strength_name + " " + ingredients[time_index].time_name + " Potion of " + ingredients[first_index].major_name,
                    major: first_index,
                    time: time_index,
                    power: power_index,
                };
                alchemy_mix();
                if (adventure_data.inventory.length + adventure_data.inventory_fuel < adventure_data.inventory_size) {
                    $("#events_content").prepend("You store the potion on your ship.<br/>");
                    adventure_data.inventory.push(item_1);
                    update_inventory();
                }
                else {
                    $("#events_content").prepend("You store the potion in your warehouse. Don't ask how you got it there.<br/>");
                    adventure_data.warehouse.push(item_1);
                }
            }
        });
    }
    else {
        $("#events_content").prepend("You have no more ingredient space.<br/>");
    }
}
function alchemy_mix() {
    $("#character").removeClass("hidden");
    $("#events_topbar").html("Alchemy - Potion Mixing");
    $("#events_content").html("<span class='clickable' onclick='alchemy_ingredients()'>Refine</span> ingredients<br/>");
    alchemy_first = null;
    alchemy_time = null;
    alchemy_power = null;
    /* Alchemy ingredients go here. */
    $("#events_content").append("You have:<br/>");
    $("#events_content").append("<ul style='line-height: 3.3ex;'></ul>");
    ingredients.forEach(function (item) {
        /* They have some of it. */
        if (adventure_data.alchemy_ingredients[item.name]) {
            $("#events_content ul").append("<li class='bgc_second fgc clickable' style='display: inline; float: none;'>" + item.name.replace(/\s/g, "&nbsp;") + "&nbsp;(" + format_num(adventure_data.alchemy_ingredients[item.name], false) + ")</li> ");
            $("#events_content li").last().click(function () {
                add_ingredient(item.name);
            });
        }
    });
    $("#events_content").append("<div id='ingredient_message'>You have not started a potion.<br/>Choose an ingredient for your potion's identity.</div>");
    /* Okay, now that we have all our ingredients, we can add handlers for doing stuff with them. */
}
//# sourceMappingURL=alchemy.js.map