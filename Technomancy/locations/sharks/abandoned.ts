({
    "unlocked": function () {
        /* Must have groupings unlocked  */
        return false && !!adventure_data["groupings_unlocked"];
    },
    "go_again_text": "Explore",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 7,
            "title": "A Dying World",
            "run_encounter": function () {
                $("#events_content").html("The tar here is choking out all life.<br />");
                $("#events_content").append("Only machines will remain. All will be lost.<br/><br/>");
                $("#events_content").append("There is nothing you can do. Only watch.<br/>");

                if (resources_per_sec["mana"] >= 50 && adventure_data["rules_unlocked"] == undefined) {
                    $("#events_content").append("<span class='clickable'>Watch</span> the machines.<i>This will destroy some of your mana stones. Click with care. </i><br/>");
                    $("#events_content span").last().click(function () {
                        /* Remove mana. */
                        resources_per_sec["mana"] -= 50;
                        buildings["s_manastone"].amount -= 50;
                        /* Redraw manastone amount. */
                        $("#building_s_manastone > .building_amount").html(format_num(buildings["s_manastone"].amount, false));
                        /* And unlock production control...*/
                        adventure_data["rules_unlocked"] = true;
                        $("#pc_box").parent().removeClass("hidden");
                        $("#events_content").html("The machines continue their functions, even as the tar in the ocean grows and obscures them from your view and clogs your engine.");

                        adventure_data["ship"].engine = null;
                        update_inventory();
                    });
                }
            }
        }),
        ({
            "condition": function () { return false; },
            "types": [],
            "weight": 3,
            "title": "Self-Replication",
            "run_encounter": function () {
                /* TODO: add maybe a building that self-replicates or something? */
            },
        }),
    ],
    "connects_to": ["sharks/haven"],
    "enter_cost": 8,
    "leave_cost": 3,
    "name": "Abandoned World",
})