({
    "unlocked": function () { return buildings["s_manastone"].amount >= 200; },
    "go_again_text": "Enter Gate",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Gate of Reality",
            "run_encounter": function challenge_display() {
                function challenge_info(name, description, requirements, restrictions, reward, completed) {
                    $("#events_content").html(name);
                    if (completed) { $("#events_content").append(" (Completed)") };
                    $("#events_content").append("<table id='challenge_table'></table>");
                    $("#challenge_table").append("<tr><th align='right'>Description:</th><td align='left'>" + description + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Completion Requirements:</th><td align='left'>" + requirements + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Challenge Restrictions:</th><td align='left'>" + restrictions + "</td>");
                    $("#challenge_table").append("<tr><th align='right'>Challenge Reward:</th><td align='left'>" + reward + "</td>");

                    $("#events_content").append("<span class='clickable'>Start!</span>");
                    $("#events_content span").last().click(function () {
                        alert("Sorry, challenges aren't a thing yet.");
                    });
                    $("#events_content").append("<span class='clickable'>Not Yet</span>");
                    $("#events_content span").last().click(challenge_display);
                }
                $("#events_content").html("A gateway exists here. It's older than the one you've been using and much more powerful.<br/>");
                $("#events_content").append("You can use it to travel to alternate worlds, similar to your own.<br/>");
                $("#events_content").append("By conquering other worlds, you can become even stronger.<br/><br/>");

                $("#events_content").append("Challenges</br>");

                if (adventure_data["challenge"] == undefined) {
                    adventure_data["challenge"] = 0;
                }
                if (adventure_data["challenges_completed"] == undefined) {
                    adventure_data["challenges_completed"] = Array(CHALLENGES.TOTAL_AMOUNT).fill(false); /* Completed no challenges. */
                }
                if (adventure_data["challenges_completed"].length < CHALLENGES.TOTAL_AMOUNT) { /* If not enough challenges in here, add them. */
                    adventure_data["challenges_completed"] = adventure_data["challenges_completed"].concat(Array(CHALLENGES.TOTAL_AMOUNT - adventure_data["challenges_completed"].length).fill(false));
                }

                if (adventure_data["challenges_completed"][CHALLENGES.BASIC]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Basic Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info("Basic Challenge", "Go back to 0 mana, get back up to 200. Nothing fancy. Mana is restored when you complete the challenge.", "Get to 200 mana to complete this challenge", "You start back at 0 mana", "Who knows? Got an idea for a reward? Tell me in the discord!", adventure_data["challenges_completed"][CHALLENGES.BASIC]);
                });

                if (adventure_data["challenges_completed"][CHALLENGES.POVERTY]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Poverty Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info("Poverty", "You have taken a vow of poverty and therefore have almost no money.", "Get to 200 mana to complete this challenge", "Go back to 0 mana, and you can't have more than 40 seconds of money production.", "Get a permanant extra 1 money production", adventure_data["challenges_completed"][CHALLENGES.POVERTY]);
                });

                if (adventure_data["challenges_completed"][CHALLENGES.METEORS]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> Meteor Challenge<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info("Meteor Challenge", "Meteors aren't falling just in your backyard anymore. They're falling on your buildings!", "Get to 200 mana to complete this challenge", "Go back to 0 mana. Every so often, a meteor will fall and destroy some of your buildings! Oh no!", "IDK, maybe auto-build? Seems like it could be a good reward.", adventure_data["challenges_completed"][CHALLENGES.METEORS]);
                });

                if (adventure_data["challenges_completed"][CHALLENGES.LOAN]) {
                    $("#events_content").append("<span style='color:green'>\u2714 </span>"); /* If completed, add check mark. */
                }
                $("#events_content").append("<span class='clickable'>Info</span> A Small Loan<br/>");
                $("#events_content span").last().click(function () {
                    challenge_info("A Small Loan", "Be a tycoon of business and grow your empire!", "Get 10 million money to complete this challenge", "Go back to 0 mana. You can't prestige. You start with 1 million money, but lose 30/second. Can you get enough to pay off your loan?", "Once again, I'm out of good ideas for rewards.", adventure_data["challenges_completed"][CHALLENGES.LOAN]);
                });
            }
        }),
    ],
    "connects_to": [],
    "enter_cost": 9,
    "leave_cost": 0,
    "name": "A Gate Between Worlds",
})