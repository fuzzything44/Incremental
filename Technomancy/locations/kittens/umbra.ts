({
    "unlocked": function () { return true; },
    "go_again_text": "Investigate",
    "encounters": [
        ({
            "condition": function () { return adventure_data["warp_locations"] == undefined; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "A strange gate",
            "run_encounter": function () {
                $("#events_content").html("At the edge of the black hole, you see a circle of light. <br />");
                $("#events_content").append("<span class='clickable'>Enter</span><br />");
                $("#events_content > span").last().click(function () {
                    adventure_data.current_location = "warpgate"; /* Change their location. */
                    adventure_data["warp_locations"] = ["home", "kittens/cath"];
                    $("#events_content").html("You enter the circle. Light stretches around you. Shapes and sounds lose meaning. Only darkness remains.<br/>");
                    $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Continue</span>");
                });
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Leave</span>");
            },
        }), /* Find warp gate. */
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 4,
            "title": "Black Hole",
            "run_encounter": function umbra_throw_away() {
                /* Secretly count items thrown away */
                if (adventure_data["umbra_throwaway"] == undefined) { adventure_data["umbra_throwaway"] = 0; }

                $("#events_content").html("You fly up to the black hole. Would you like to throw away any items in your ship?<br />");

                $("#events_content").append("<span>Destroy Fuel: <input id='remove_fuel' type='number' min='1'/><span class='clickable'>Remove</span></span><br />");
                $("#events_content > span > span").last().click(function () {
                    let fuel_to_remove = parseInt($("#remove_fuel").val())
                    if (isNaN(fuel_to_remove)) { fuel_to_remove = 0; }
                    if (fuel_to_remove < 0) { fuel_to_remove = 0; }
                    /* Check to make sure they can remove that much */
                    if (adventure_data.inventory_fuel < fuel_to_remove) {
                        fuel_to_remove = adventure_data.inventory_fuel;
                    }
                    adventure_data.inventory_fuel -= fuel_to_remove;
                    adventure_data["umbra_throwaway"] += fuel_to_remove * .5;
                    update_inventory();
                });
                for (let i = 0; i < adventure_data.inventory.length; i++) {
                    $("#events_content").append("<span class='clickable'>Remove</span> " + gen_equipment(adventure_data.inventory[i]).name + "<br />");
                    $("#events_content > span").last().click(function (e) {
                        /* Remove item from inventory */
                        adventure_data.inventory.splice(i, 1);
                        update_inventory();
                        adventure_data["umbra_throwaway"] += 1;
                        umbra_throw_away();
                    });
                }
                $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Leave</span>");
            },
        }), /* Trash items. */
        ({
            "condition": function () { return adventure_data["umbra_throwaway"] > 5; },
            "types": ["noncombat"],
            "weight": 4,
            "title": "Black Hole",
            "run_encounter": function () {
                /* Secretly count items thrown away */
                $("#events_content").html("You threw stuff into the black hole a few times! <br />");
                $("#events_content").append("It seems that it's managed to compress into some ball of magic. Interesting.<br />");

                if (event_flags["alchemist_ingredients"] != undefined && event_flags["alchemist_ingredients"]["potato"] && Math.random() > 0.5) {
                    $("#events_content").append("Oh hey, there's also a potato right next to that orb! Unexpected.<br/>");
                    adventure_data["alchemy_ingredients"]["Potato"]++;
                }

                $("#events_content").append(exit_button("Done"));
                const elements = ["time", "energy", "space", "force"];
                adventure_data.warehouse.push({ "name": "magic_orb", "elem": elements[Math.floor(Math.random() * elements.length)] });
                adventure_data["umbra_throwaway"] -= 5;
            },
        }), /* They trashed a bunch of stuff. */

        ({
            "condition": function () { return adventure_data["has_gravstorage"] == undefined; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "Thoughts on Gravity",
            "run_encounter": function () {
                $("#events_content").html("Hmm... you could compress the stuff in your storage and fit more in there...<br />");
                adventure_data["has_gravstorage"] = true;
                adventure_data.inventory_size += 5;
                update_inventory();
                $("#events_content").append(exit_button("Done"));

            },
        }), /* Ship storage boost */
        ({
            "condition": function () { return resources["fuel"].amount > 1000 && adventure_data["umbra_throwaway"] > 25; },
            "types": ["noncombat"],
            "weight": 2,
            "title": "Tiny Black Hole",
            "run_encounter": function () {
                $("#events_content").html("You found out how to compress stuff to incredible levels.<br />");
                $("#events_content").append("<span class='clickable'>Compress</span> 1000 fuel.<br />");
                $("#events_content span").last().click(function () {
                    if (resources["fuel"].amount >= 1000) {
                        resources["fuel"].amount -= 1000;
                        resources["void"].amount++;
                        adventure_data["umbra_throwaway"] -= 10;
                        $("#events_content").html("You compress fuel into a ball of incredibly dense matter. You gained 1 void.<br />");
                        $("#events_content").append(exit_button("Done"));
                    }
                });
                $("#events_content").append(exit_button("Done"));
            },
        }), /* Get void */


    ],
    "connects_to": ["kittens/cath", "kittens/castles"],
    "enter_cost": 6,
    "leave_cost": 2,
    "name": "Umbra",
})