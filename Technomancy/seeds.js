var SEED_FUNCS = {
    "carrot": function (seed) {
        var harvest = "You harvested " + format_num(seed.quality, false) + " carrots.";
        adventure_data.alchemy_ingredients["Carrot"] += seed.quality;
        /* Chance to get seeds.*/
        if (Math.random() < seed.quality / 10) {
            harvest += "\nYou also got some seeds back!";
            event_flags["seeds"].push({
                "name": "Carrot",
                "desc": "A large, tasty carrot. Just what the doctor ordered!",
                "regrows": false,
                "grow_time": 55 + Math.round(Math.random() * 10),
                "grow_difficulty": 1,
                "quality": 1 + Math.round(Math.random() * 3),
                "harvest": "carrot",
            });
        }
        return harvest;
    },
};
//# sourceMappingURL=seeds.js.map