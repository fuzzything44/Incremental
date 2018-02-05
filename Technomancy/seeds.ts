const SEED_FUNCS = { /* What do they get when harvesting? Returns the message they get on harvest. */
    "carrot": function (seed) { 
        adventure_data.alchemy_ingredients["Carrot"] += seed.quality;
        return "You harvested " + format_num(seed.quality, false) + " carrots.";
    },

};