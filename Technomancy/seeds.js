var SEED_FUNCS = {
    "carrot": function (seed) {
        adventure_data.alchemy_ingredients["Carrot"] += seed.quality;
        return "You harvested " + format_num(seed.quality, false) + " carrots.";
    },
};
//# sourceMappingURL=seeds.js.map