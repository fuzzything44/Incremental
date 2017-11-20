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
