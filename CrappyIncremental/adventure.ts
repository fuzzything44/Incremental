let adventure_data = {

};

/* Sets up the adventure pane */
function start_adventure() {
    $("#character").removeClass("hidden");
    $("#events").removeClass("hidden");
    $("#events_topbar").html("Adventure!");
    $("#events_content").html("Welcome to Adventure Mode! <br /> I\'m glad you want to adventure, but this feature is still a long ways from being finished. Please message me on discord if you manage to get this far though! <br />");
    $("#events_content").append("<span style='color: red'>Note: Until this announcement is removed, adventure mode gives nothing and takes nothing. Progress on it will not be saved between reloads. It exists purely for testing purposes.</span><br />");
    $("#events_content").append("<span class='clickable' onclick='simulate_combat()'>Start adventure!</span>");
}

function simulate_combat() {
    $("#events_topbar").html("Combat Test");
    $("#events_content").html("<div id='combat_energy' style='position: relative; height: 100%; left: 3em; top: 0; width: 2em; background-color: green;'></div>");
}