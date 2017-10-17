({
    "unlocked": function () { return true; },
    "go_again_text": "Terminate!",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 10,
            "title": "Brrrr....",
            "run_encounter": function () {
                $("#events_content").html("Wow, this planet is cold. You need to constantly keep your engines running to keep warm. <br />");
                $("#events_content").append("<span class='clickable'>Run Them! (2)</span>");
                $("#events_content > span").last().click(function () {
                    if (adventure_data.inventory_fuel >= 2) {
                        adventure_data.inventory_fuel -= 2;
                        resources["water"].amount += 30000;
                        update_inventory();
                        $("#events_content").html("You run the engines and manage to keep warm. Oh, it looks like you melted some ice. <br /> Gained 30000 water.<br />");

                    } else {
                        $("#events_content").html("You don't have enough fuel... you sit in the cold and almost freeze. You should get out of here!<br/>");
                    }
                    $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>");
                });
                $("#events_content").append("<span class='clickable'>Don't</span>");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You freeze to death. Well, not quite but it isn't fun. <br /><span class='clickable' onclick='start_adventure()'>Done</span>");
                });
            },
        }),
        ({
            "condition": function () { return adventure_data["has_cryostorage"] == undefined; },
            "types": ["noncombat"],
            "weight": 2,
            "title": "Cryostorage",
            "run_encounter": function () {
                $("#events_content").html("You find some strange blueprints here showing how to freeze things, making them take up less space. You can now store 5 more items. <br />");
                adventure_data["has_cryostorage"] = true;
                adventure_data.inventory_size += 5;
                update_inventory();
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>");

            },
        }),
        ({
            "condition": function () { return adventure_data["cath_discovery"] == undefined; },
            "types": ["noncombat"],
            "weight": 3,
            "title": "Small Probe...",
            "run_encounter": function () {
                $("#events_content").html("There's a small probe crashed into the planet here. Where did it come from? <br />");
                adventure_data["cath_discovery"] = 0;
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Interesting</span>");
            },
        }),
        ({
            "condition": function () { return adventure_data["cath_discovery"] != undefined && adventure_data["cath_discovery"] < 3; },
            "types": ["noncombat"],
            "weight": 10,
            "title": "Investigating the probe",
            "run_encounter": function () {
                if (adventure_data["cath_discovery"] == 0) {
                    $("#events_content").html("Wow, there's a ton of probes over at this area! They all seem to be the same design as the last one. You salvage them for fuel.<br />Gained 30 fuel<br />");
                    resources["fuel"].amount += 30;
                } else if (adventure_data["cath_discovery"] == 1) {
                    $("#events_content").html("While investigating the crashed probes you find an abandoned observatory. You can see the sky! <br />");
                } else if (adventure_data["cath_discovery"] == 2) {
                    $("#events_content").html("Analyzing the trajectory of the probes, you look where you think they cam from using an undamaged telescope in the observatory. Oh wow, you can see a planet there! <br /><em>Cath unlocked!</em><br />");
                }
                adventure_data["cath_discovery"] += 1;
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Continue onwards.</span>");
            },
        }),
    ],
    "connects_to": ["moon", "kittens/cath"],
    "enter_cost": 3,
    "leave_cost": 3,
    "name": "Terminus",
})