class ingredient {
    name: string;
    effect_major;
    effect_time: number;
    effect_strength: number;
    cost;
    /**
     * 
     * @param name: The displayed name of the ingredient
     * @param maj: A function(number) that performs the major effect, 1/s. Paramater is strength.
     * @param time: How long the buff lasts, in seconds.
     * @param str: Strength of the potion.
     * @param costs: A list of costs. Each element is an object with {{type: "resource" OR "adventure", amount: number of items it costs, name: What it is named. Either the resource or item name, requirements: Only if type is "adventure". The other attributes on the item, see count_item() for selection. }}
     */
    constructor(name, maj, time, str, costs) {
        this.name = name;
        this.effect_major = maj;
        this.effect_time = time;
        this.effect_strength = str;
        this.cost = costs;
    }

    verify_costs(): boolean {
        /* Go through all costs */
        for (let i = 0; i < this.cost.length; i++) {
            let cost = this.cost[i]; /* Get the actual cost object. */
            if (cost.type == "adventure") {
                /* Adventure mode cost. So just match an item. */
                if (count_item(cost.name, adventure_data.inventory, cost.requirements) < cost.amount) {
                    return false; /* Not enough items with the specific name and attributes. */
                }
            } else if (cost.type == "resource") {
                /* Resource cost. Pretty easy. */
                if (resources[cost.name].amount < cost.amount) {
                    return false; /* They don't have enough. */
                }
            } else {
                throw "Unknown cost type " + cost.type;
            }
        }
        return true;
    }

    spend_costs() {
        /* Make sure they can actually buy it.*/
        if (!this.verify_costs()) {
            throw "Hmm... they can't buy this.";
        }
        /* Go through all costs */
        for (let i = 0; i < this.cost.length; i++) {
            let cost = this.cost[i]; /* Get the actual cost object. */
            if (cost.type == "adventure") {
                /* Adventure mode cost. So just match an item. */
                for (let j = 0; j < cost.amount; j++) { /* Remove however many of the item from inventory. */
                    adventure_data.inventory.splice(find_item(cost.name, adventure_data.inventory, cost.requirements), 1);
                }
            } else if (cost.type == "resource") {
                /* Resource cost. Pretty easy. */
                resources[cost.name].amount -= cost.amount;
            } else {
                throw "Unknown cost type " + cost.type;
            }
        }
    }
}

let ingredients: ingredient[] = [
    new ingredient("Gold Chalice", function (x) { }, 10, 5, [{ type: "resource", amount: 3, name: "gold" }, { type: "resource", amount: 1, name: "glass_bottle" }]),
    new ingredient("Magic Dust", function (x) { }, 23, 2, [{ type: "adventure", amount: 1, name: "magic_orb", requirements: {}]),
];

/**
 * Sets up alchemy ingredient making.
 */
function alchemy_ingredients() {
    /* Let them see resources*/
    $("#character").addClass("hidden");
    /* Setup basic visuals*/
    $("#events_topbar").html("Alchemy - Ingredient Crafting");
    $("#events_content").html("<table><tbody></tbody></table>");
    /* Table start*/
    $("#events_content tbody").append("<tr style='font-weight: bold;'><td></td><td>&nbsp;&nbsp;Item&nbsp;&nbsp;</td><td>&nbsp;&nbsp;Amount Owned&nbsp;&nbsp;</td><td>&nbsp;&nbsp;Cost to Make&nbsp;&nbsp;</td></tr>");

    /* Go through each ingredient, let them craft it. */
    for (let i = 0; i < ingredients.length; i++) {
        /* Add table row for it. */
        $("#events_content tbody").append("<tr></tr>");
        /* Craft button */
        $("#events_content tr").last().append("<td>" + "<span class='clickable'>Make</span>" + "</td>");
        $("#events_content span").last().click(function () {
            /* TODO: Actually craft it.*/
            alert("Nope. This is actually all in your head. You can't craft this.");
        });
        /* Add item name */
        $("#events_content tr").last().append("<td>" + ingredients[i].name + "</td>");
        /* Add amount. TODO: actually add it. */
        $("#events_content tr").last().append("<td>" + "0" + "</td>");
        /* Add crafting cost */
        $("#events_content tr").last().append("<td></td>");
        Object.keys(ingredients[i].cost).forEach(function (cost) {
            /* Check cost type. */
            if (ingredients[i].cost[cost].type == "resource") {
                /* Add it in the form of 341K steel beam (example) */
                $("#events_content td").last().append(format_num(ingredients[i].cost[cost].amount, true) + " " + ingredients[i].cost[cost].name.replace("_", " "));
            } else {
                let data = ingredients[i].cost[cost].requirements;
                data["name"] = ingredients[i].cost[cost].name;
                $("#events_content td").last().append(format_num(ingredients[i].cost[cost].amount, true) + " " + gen_equipment(data).name);
            }
            $("#events_content td").last().append("<br/>"); /* Append line break for next item. */
        });
    }
}