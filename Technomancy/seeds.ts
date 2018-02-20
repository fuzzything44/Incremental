const SEED_FUNCS = { /* What do they get when harvesting? Returns the message they get on harvest. */
    "carrot": function (seed) { 
        let harvest = "You harvested " + format_num(seed.quality, false) + " carrots.";
        adventure_data.alchemy_ingredients["Carrot"] += seed.quality;

        /* Chance to get seeds.*/
        if (Math.random() < seed.quality / 10) {
            harvest += "\nYou also got some seeds back!";
            event_flags["seeds"].push({
                "name": "Carrot",
                "desc": "A large, tasty carrot. Just what the doctor ordered!",

                "regrows": false, /* Is it instantly planted again for free when harvested? */
                "grow_time": 55 + Math.round(Math.random() * 10), /* How long it takes to grow. */
                "grow_difficulty": 1, /* How difficult it is to grow this. Increases resources required. */
                "quality": 1 + Math.round(Math.random() * 3), /* How much we get on harvest/other stuff. While growing, this can be increased with special items. */
                "harvest": "carrot", /* What do they get when harvesting? Returns the message they get on harvest. */
            });
        }
        return harvest;
    },

};