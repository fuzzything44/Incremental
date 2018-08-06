var CHALLENGES = {
    NONE: 0,
    BASIC: 1,
    POVERTY: 2,
    METEORS: 3,
    LOAN: 4,
    CASCADE: 5,
    DISCO: 6,
    NO_UPGRADE: , 7: ,
    TOTAL_AMOUNT: 8
};
function challenge_menu() {
    $("#events_topbar").html("Challenge Progress");
    var number = adventure_data["challenge"];
    var name = CHALLENGE_INFO[number].name;
    var description = CHALLENGE_INFO[number].description;
    var requirements = CHALLENGE_INFO[number].requirements;
    var restrictions = CHALLENGE_INFO[number].restrictions;
    var reward = CHALLENGE_INFO[number].reward;
    $("#events_content").html(name);
    if (adventure_data["challenges_completed"][number]) {
        $("#events_content").append(" (Completed)");
    }
    ;
    $("#events_content").append("<table id='challenge_table'></table>");
    $("#challenge_table").append("<tr><th align='right'>Description:</th><td align='left'>" + description + "</td>");
    $("#challenge_table").append("<tr><th align='right'>Completion Requirements:</th><td align='left'>" + requirements + "</td>");
    $("#challenge_table").append("<tr><th align='right'>Challenge Restrictions:</th><td align='left'>" + restrictions + "</td>");
    $("#challenge_table").append("<tr><th align='right'>Challenge Reward:</th><td align='left'>" + reward + "</td>");
    if (CHALLENGE_INFO[number].test_completed()) {
        $("#events_content").append("You have completed the challenge. Finish the challenge to exit it (and prestige). <br/><span class='clickable'>Finish</span> the challenge!");
        $("#events_content > span").last().click(function () {
            adventure_data["challenge"] = CHALLENGES.NONE; /* No longer in a challenge. */
            adventure_data["challenges_completed"][number] = true; /* Completed challenge!*/
            prestige.run(false, function () {
                buildings["s_manastone"].amount = adventure_data["challenge_mana"]; /* Give back mana*/
            });
        });
    }
    else {
        $("#events_content").append("You haven't completed the challenge yet.<br/><span class='clickable'>Abandon</span> the challenge.");
        $("#events_content > span").last().click(function () {
            if (confirm("Are you sure you want to abandon the challenge?")) {
                adventure_data["challenge"] = CHALLENGES.NONE;
                prestige.run(false, function () {
                    buildings["s_manastone"].amount = adventure_data["challenge_mana"]; /* Give back mana*/
                });
            }
        });
    }
    $("#events").removeClass("hidden");
}
var CHALLENGE_INFO = [
    {
        "name": "Oops",
        "description": "This... shouldn't happen.",
        "requirements": "None",
        "restrictions": "None",
        "reward": "None",
        "test_completed": function () { return false; }
    },
    {
        "name": "Basic Challenge",
        "description": "Go back to 0 mana, get back up to 200. Nothing fancy. Mana is restored when you complete the challenge.",
        "requirements": "Get to 200 mana to complete this challenge.",
        "restrictions": "You start back at 0 mana.",
        "reward": "Who knows? Got an idea for a reward? Tell me in the discord! I'm thinking extra buildings to start with post-100 mana.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "Poverty",
        "description": "You have taken a vow of poverty and therefore have almost no money.",
        "requirements": "Get to 200 mana to complete this challenge",
        "restrictions": "Go back to 0 mana, and you can't have more than 40 seconds of money production.",
        "reward": "Not sure. Probably a multiplier to money gains. Or maybe cost reduction on stuff that costs money. ",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "Meteor Challenge",
        "description": "Meteors aren't falling just in your backyard anymore. They're falling on your buildings!",
        "requirements": "Get to 200 mana to complete this challenge",
        "restrictions": "Go back to 0 mana. Every so often, a meteor will fall and destroy some of your buildings! Oh no!",
        "reward": "IDK, maybe auto-build? Seems like it could be a good reward. Or maybe just better meteor event.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "A Small Loan",
        "description": "Be a tycoon of business and grow your empire!",
        "requirements": "Get 10 million money to complete this challenge",
        "restrictions": "Go back to 0 mana. You can't prestige. You start with 1 million money, but lose 30/second. Can you get enough to pay off your loan?",
        "reward": "1 money/s, probably getting changed to like 10/s or 15/s",
        "test_completed": function () { return resources["money"].amount >= 10000000; }
    },
    {
        "name": "Cascade",
        "description": "Buying a building buys more than just what you chose. Good luck managing your resources.",
        "requirements": "Get 100 mana.",
        "restrictions": "Go back to 0 mana. Whenever you buy a building, you also buy each building that it unlocks, if possible. Same for selling!",
        "reward": "Once again, I'm out of good ideas for rewards. Maybe this gives auto build?",
        "test_completed": function () { return buildings["s_manastone"].amount >= 100; }
    },
    {
        "name": "Disco",
        "description": "A basic challenge, but in the best theme! What's not to love about this?",
        "requirements": "Get 200 mana.",
        "restrictions": "A basic challenge, but it's stuck in disco theme.",
        "reward": "Once again, I'm out of good ideas for rewards. This should be pretty minor though.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "No Upgrade",
        "description": "This will be tough. Upgrades make everything better. Sucks, because you don't get any.",
        "requirements": "Get 200 mana.",
        "restrictions": "Go back to 0 mana. You can't buy any upgrades.",
        "reward": "A feral badger shipped to your house.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
];
//# sourceMappingURL=challenges.js.map