function tower() {
    if (adventure_data["tower_floor"] == undefined) {
        adventure_data["tower_floor"] = 0;
    }
    if (adventure_data["tower_power"] == undefined) {
        adventure_data["tower_power"] = 1;
    }
    if (adventure_data["tower_toughness"] == undefined) {
        adventure_data["tower_toughness"] = 1;
    }
    $("#events_topbar").html("The Tower of Magic");
    $("#events_content").html("Welcome to the Tower of Magic. Your essence allows you to enter.<br/>");
    var essence_cost = Math.round(Math.pow(adventure_data["total_essence"], 1.2));
    $("#events_content").append("<span class='clickable'>Compress</span> some magic into 1 essence (" + format_num(essence_cost, false) + " Mana Stones)<br/>");
    $("#events_content span").last().click(function () {
        if (buildings["s_manastone"].amount > essence_cost && resources["mana"].amount >= essence_cost) {
            buildings["s_manastone"].amount -= essence_cost;
            resources_per_sec["mana"] -= essence_cost;
            toggle_building_state("s_essence");
            buildings["s_essence"].amount++;
            toggle_building_state("s_essence");
            adventure_data["current_essence"]++;
            adventure_data["total_essence"]++;
            tower();
            $("#events_content").prepend("You compress some magic into essence.<br/>");
        }
        else {
            $("#events_content").prepend("You need a more mana stones. Or free up some mana. <br/>");
        }
    });
    $("#events_content").append("<span class='clickable'>Enter</span> the tower.");
    $("#events_content span").last().click(function () {
        $("#events_content").html("Sorry, climbing the tower isn't quite ready yet.");
    });
    $("#events").removeClass("hidden");
}
//# sourceMappingURL=tower.js.map