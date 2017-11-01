({
    "unlocked": function () { return true; },
    "go_again_text": "ERROR - You shouldn't be here.",
    "encounters": [
        ({
            "condition": function () { return false; },
            "types": [],
            "weight": 0,
            "title": "Test global",
            "run_encounter": function () {
                $("#events_content").html("Oops");
                return;
            }
        }),
    ],
    "connects_to": [],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "How did you see this?",
});
//# sourceMappingURL=global.js.map