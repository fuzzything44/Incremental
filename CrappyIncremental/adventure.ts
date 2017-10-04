let adventure_data = {

};

/* Sets up the adventure pane */
function start_adventure() {
    $("#character").removeClass("hidden");
    $("#events").removeClass("hidden");
    $("#events_topbar").html("Adventure!");
    $("#events_content").html("Welcome to Adventure Mode! <br /> I\'m glad you want to adventure, but this feature is still a long ways from being finished. Please message me on discord if you manage to get this far though! <br />");
    $("#events_content").append("<span style='color: red'>Note: Until this announcement is removed, adventure mode gives nothing and takes nothing. Progress on it will not be saved between reloads. It exists purely for testing purposes.</span><br />");
    $("#events_content").append("<span class='clickable' onclick='setup_combat()'>Start adventure!</span>");
}

function setup_combat() {
    $("#events_topbar").html("Combat Test");
    $("#events_content").html("<div id='combat' style='height: 30em; width: 40em; margin: auto;'></div>")
    $("#combat").html("<div id='combat_attack' style='height: 15em; border: solid white 1px;'>Attack</div>")
    $("#combat").append("<div id='combat_stats' style='height: 15em; border: solid white 1px;'>Stats</div>")
    $("#combat").append("<div id='combat_counter' style='width: 4em; height: 1.5em; border: solid white 1px; background: #444; position: relative; top: -16em;'>0</div>")

    $("#combat_stats").html("<div id='combat_energy' style='position: relative; top: 1em; height: 14em; width: 2em;'></div>");

    /* Setup energy */
    $("#combat_energy").html("<img src='images/power.png' alt='' style='width: 1.5em; height: 1.5em;' />")

    for (let i = 0; i < 10; i++) {
        $("#combat_energy").append("<div id='combat_energy_" + i.toString() + "' class='energy_box_off'></div>");
    }
    $("#combat_energy_9").toggleClass('energy_box_off energy_box_disabled');
    $("#combat_energy_0").toggleClass('energy_box_off energy_box_on');

    $("#combat_stats").append("<div style='position: relative; top: -14em; width: 30em; margin: auto;'>Stats. So this contains all your power usage and resources. Above is combat where you attack and see your shield level. The number in the box to the left is how many actions you have left before the enemy acts. The green/grey/red boxes to the left are your energy: green is available, gray is used, and red is locked.</div>");

   // $("#combat").append("<div id='combat_shield' style='position: relative; height: 12em; top: -12em;    width: 2em; background-color: blue;'></div>");

}