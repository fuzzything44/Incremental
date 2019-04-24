const CHALLENGES = {
    NONE: 0,
    BASIC: 1,
    POVERTY: 2,
    METEORS: 3,
    LOAN: 4,
    CASCADE: 5,
    DISCO: 6,
    NO_UPGRADE: 7,
    FORCED_PRESTIGE: 8,
    UDM: 9,
    TOTAL_AMOUNT: 10
};
function challenge_menu() {
    $("#events_topbar").html("Challenge Progress");
    let number = adventure_data["challenge"];
    let name = CHALLENGE_INFO[number].name;
    let description = CHALLENGE_INFO[number].description;
    let requirements = CHALLENGE_INFO[number].requirements;
    let restrictions = CHALLENGE_INFO[number].restrictions;
    let reward = CHALLENGE_INFO[number].reward;
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
            if (adventure_data["challenge"] == CHALLENGES.NO_UPGRADE && adventure_data["challenge_mana"] < 500) {
                adventure_data["challenge_mana"] += 200;
            }
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
let CHALLENGE_INFO = [
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
        "reward": "Start with more extra buildings.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "Poverty",
        "description": "You have taken a vow of poverty and therefore have almost no money.",
        "requirements": "Get to 200 mana to complete this challenge",
        "restrictions": "Go back to 0 mana, and you can't have more than 20 seconds of money production.",
        "reward": "Financial crisis will progress quicker.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "Meteor Challenge",
        "description": "Meteors aren't falling just in your backyard anymore. They're falling on your buildings!",
        "requirements": "Get to 200 mana to complete this challenge",
        "restrictions": "Go back to 0 mana. Every so often, a meteor will fall and destroy some of your buildings! Oh no!",
        "reward": "Increases items allowed in a challenge.",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "A Small Loan",
        "description": "Be a tycoon of business and grow your empire!",
        "requirements": "Get 10 million money to complete this challenge",
        "restrictions": "Go back to 100 mana. You can't prestige. You start with 1 million money, but lose 30/second. Can you get enough to pay off your loan?",
        "reward": "30 money/s boost.",
        "test_completed": function () { return resources["money"].amount >= 10000000; }
    },
    {
        "name": "Cascade",
        "description": "Buying a building buys more than just what you chose. Good luck managing your resources.",
        "requirements": "Get 100 mana.",
        "restrictions": "Go back to 0 mana. Whenever you buy a building, you also buy each building that it unlocks, if possible. Same for selling!",
        "reward": "Auto-Build (starts with 10 slots)",
        "test_completed": function () { return buildings["s_manastone"].amount >= 100; }
    },
    {
        "name": "Disco",
        "description": "A basic challenge, but in the best theme! What's not to love about this?",
        "requirements": "Get 200 mana.",
        "restrictions": "A basic challenge, but it's stuck in disco theme.",
        "reward": "1 uranium/s",
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "No Upgrade",
        "description": "This will be tough. Upgrades make everything better. Sucks, because you don't get any. It is HIGHLY suggested that you get the Magic Bag before attempting this. Don't know what that is? Maybe take bigger risks and talk to the wanderer.",
        "requirements": "Get 200 mana.",
        "restrictions": "Go back to 0 mana. You can't buy any upgrades.",
        get reward() {
            return "You can gain essence." + (buildings["s_manastone"].amount < 500 ? " Also, 200 mana!" : "");
        },
        "test_completed": function () { return buildings["s_manastone"].amount >= 200; }
    },
    {
        "name": "3 Minute Challenge",
        "description": "You prestige at least every 3 minutes. No less. Time to learn how to use all this fancy automation stuff!",
        "requirements": "Get 500 mana.",
        "restrictions": "Go back to 0 mana. If your prestige has lasted over 3 minutes, you prestige.",
        get reward() {
            return "Faster convolution cube actions.";
        },
        "test_completed": function () { return buildings["s_manastone"].amount >= 500; }
    },
    {
        "name": "UDM Challenge",
        "description": "Pain. Lots of it. Thought poverty/meteors/No Upgrades sucked? This is worse.",
        "requirements": "Get 500 mana.",
        "restrictions": "Go back to 0 mana. Essence is capped lower than other challenges. And there's meteors. And poverty. And events happen less, which might actually be a good thing. And no upgrades. And more stuff.",
        get reward() {
            return "???";
        },
        "test_completed": function () { return buildings["s_manastone"].amount >= 500; }
    },
];
//# sourceMappingURL=challenges.js.map