let TOWER_DATA = [
    { /* Boss 0. "Noodles" */
        "boss": "a noodle",
        "text": "It's just a wet noodle",
        "reward_text": "nothing, sorry",
        reward: function () {

        }
    },
    { /* Boss 1. */
        "boss": "a bowl of spaghetti",
        "text": "That's a lot of noodles!",
        "reward_text": "cheaper essence",
        reward: function () {
            adventure_data["total_essence"] -= 5;
            if (adventure_data["total_essence"] <= 0) {
                for (var i=adventure_data["total_essence"]; i <= 0 ; i++) {
                    buy_essence(1);
                    adventure_data["total_essence"] = 0;
                }
            }
        }
    },
    { /* Boss 2. */
        "boss": "some linguini",
        "text": "These are evil noodles, I tell you. Eviiiil!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a whole lot of time";
            }
            else if (adventure_data["tower_ascension"] < 5) {
                return "a decent amount of time";
            }
            else {
                return "a bit of time";
            }
        },
        reward: function () {
            resources["time"].amount += tower_ascension_scale(1000000, 100000, false); /* That's 1 mil, I think. */
        }
    },
    { /* Boss 3. */
        "boss": "ramen noodles",
        "text": "Seriously, what's with all these noodles?",
        get reward_text() {
            if (adventure_data["tower_ascension"] < 5) {
                return "extra mana";
            }
            else {
                return "a bit of extra mana";
            }
        },
        reward: function () {
            var amt=tower_ascension_scale(250,25,true);
            resources_per_sec["mana"] += amt;
            buildings["s_manastone"].amount += amt;
            update_building_amount("s_manastone");
        }
    },
    { /* Boss 4. */
        "boss": "a guy named Mac",
        "text": "Finally, no more pasta. Oh wait, what's that? Dangit, looks like he has his own block of cheese with him.",
        "reward_text": "extra power",
        reward: function () {
            adventure_data["tower_power"] += 10;
        }
    },
    { /* Boss 5. */
        "boss": "the Flying Spaghetti Monster",
        "text": "Well, it's finally come to kill you. Guess you shouldn't have beaten up all those helpless bowls of pasta.",
        "reward_text": "extra toughness",
        reward: function () {
            adventure_data["tower_toughness"] += 10;
        }
    },
    { /* Boss 6. "Things that rhyme with Trimp" */
        "boss": "a shrimp",
        "text": "This is literally just a normal shrimp. How is it more powerful than the god you just killed?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "600 starting time each prestige";
            }
            else {
                return "some extra starting time each prestige";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"] == undefined) {
                adventure_data["perm_resources"] = {};
            }
            if (adventure_data["perm_resources"]["time"] == undefined) {
                adventure_data["perm_resources"]["time"] = 0;
            }

            adventure_data["perm_resources"]["time"] += tower_ascension_scale(600,10,true);
        }
    },
    { /* Boss 7. */
        "boss": "a chimp",
        "text": "Oh, now you're fighting a monkey. Of course. This is totally normal.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "MORE UPGRADES";
            }
            else {
                return "more upgrades, again";
            }
        },
        reward: function () { }
    },
    { /* Boss 8. */
        "boss": "a blimp",
        "text": "Zeppelin, blimp, airship, dirigible, whatever you want to call it. Okay, I know that those mean slightly different things, but does it really matter if you're about to destroy it?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "another tower";
            }
            else {
                return "the small tower, again";
            }
        },
        reward: function () {
            adventure_data["grind_tower_time"] = 0;
        }
    },
    { /* Boss 9. */
        "boss": "a pimp",
        "text": "He's about to mess up your face with his dope bling. Better fight back.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a few (20) purified mana to start each prestige with";
            }
            else {
                return "a little more purified mana to start each prestige with";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"]["purified_mana"] == undefined) {
                adventure_data["perm_resources"]["purified_mana"] = 0;
            }
            adventure_data["perm_resources"]["purified_mana"] += tower_ascension_scale(20,1,true);
        }
    },
    { /* Boss 10. */
        "boss": "a trimp",
        "text": "Wait, isn't this from a completely different <a href='https://trimps.github.io/' target='_blank' class='fgc'>game</a>?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a new party member";
            }
            else {
                return "a small upgrade to your healer";
            }
        },
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"] = { "power": 10, "health": 5, "action": "heal" };
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(10,2,true);
                adventure_data["tower_healer"]["health"]+=tower_ascension_scale(5,1,true);
            }           
        }
    },
    { /* Boss 11. "Spooky stuff" */
        "boss": "the monster under your bed",
        "text": "It's a completely different species than the monster in your closet.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"].power *= 2;
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(20,5,true);
            }
        }
    },
    { /* Boss 12 */
        "boss": "the monster in your closet",
        "text": "It's a completely different species than the monster under your bed.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"].power *= 1.5;
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(10,3,true);
            }
        }
    },
    { /* Boss 13 */
        "boss": "a vampyre",
        "text": "The y makes it spookier than your regular vampire. It also makes it much more flammable.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "100 fuel every prestige";
            }
            else {
                return "some more fuel each prestige";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"]["fuel"] == undefined) {
                adventure_data["perm_resources"]["fuel"] = 0;
            }
            adventure_data["perm_resources"]["fuel"] += tower_ascension_scale(100,10,true);
        }
    },
    { /* Boss 14 */
        "boss": "a glass of milk",
        "text": "Wait, what's so scary about this?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a lowered cooldown on the tower of grinding";
            }
            else {
                return "the return of a lowered cooldown on the tower of grinding";
            }
        },
        reward: function () { }
    },
    { /* Boss 15 */
        "boss": "mr. skeltal",
        "text": "oh, no. he came to doot doot you because you didn't drink your milk. prepare your weak bones.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "another party member";
            }
            else {
                return "a small upgrade to your warrior";
            }
        },
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"] = { "power": 20, "health": 100, "action": "defend" };
            } else {
                adventure_data["tower_warrior"]["power"]+=tower_ascension_scale(20,4,true);
                adventure_data["tower_warrior"]["health"]+=tower_ascension_scale(100,10,true);
            }           
        }
    },
    { /* Boss 16 "Britain or somewhere" */
        "boss": "some random British dude",
        "text": "How nice, he's offering you some tea. And he just put in the milk before the tea. There's now only one reasonable course of action. KILL HIM!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "spikey kneepads";
            }
            else {
                return "spikey kneepads again";
            }
        },
        reward: function () { }
    },
    { /* Boss 17 */
        "boss": "the same dude, but angrier",
        "text": "Huh, turns out that if you attack someone, the get angry at you. He's really pissed off. And you're in a tower. That seems somehow <a href='https://www.kongregate.com/games/somethingggg/ngu-idle' target='_blank' class='fgc'>familiar</a>. Whatever, time to mercilessly kill him.",
        "reward_text": "an upgrade for your warrior",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"].health *= 1.5;
            } else {
                adventure_data["tower_warrior"].health += tower_ascension_scale(10,2,true);
            }
        }
    },
    { /* Boss 18 */
        "boss": "a guy in a kilt",
        "text": "This is the british guy's brother. He has a kilt and a sweet sword. Good luck.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "his sweet sword";
            }
            else {
                return "his sweet sword, again";
            }
        },
        reward: function () { }
    },
    { /* Boss 19 */
        "boss": "King Arfur",
        "text": "It's an adorable puppy with a sword in it's mouth. Ow! Bad dog!",
        "reward_text": "nothing. Reflect on what you just did.",
        reward: function () { }
    },
    { /* Boss 20 "Money" */
        "boss": "a pile of gold",
        "text": "This is a medium sized pile of gold. Probably big enough to pay off your student loans. ",
        "reward_text": "yet another party upgrade",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"].health = 500;
                adventure_data["tower_healer"].power *= 5;
                adventure_data["tower_healer"].health = 100;
            } else {
                adventure_data["tower_warrior"].health += tower_ascension_scale(500,10,true);
                adventure_data["tower_healer"].power += tower_ascension_scale(150,10,true);
                adventure_data["tower_healer"].health += tower_ascension_scale(100,5,true);
            }
        }
    },
    { /* Boss 21 */
        "boss": "a lawyer",
        "text": "It turns out that gold wasn't yours. You're now being sued. ",
        "reward_text": "a better rate on toughness",
        reward: function () { }
    }, 
    { /* Boss 22 */
        "boss": "a suitcase of gold",
        "text": "You know all that gold you picked up? Well the lawyer put it in his suitcase. Also, the suitcase has legs and isn't happy. ",
        "reward_text": "all the gold in the suitcase, which you use to buy a tavern nearby instead of paying off your loans. Maybe next time",
        reward: function () { }
    }, 
    { /* Boss 23 */
        "boss": "Kombast©™ Cable",
        "text": "This is the greediest company of all and they're here for your money!",
        "reward_text": "a whole lot of gold and money for your magic bag!",
        reward: function () { }
    }, 
    { /* Boss 24 "Exploration?" */
        "boss": "The Entire Continent of America",
        "text": "No, not the people living there. You're fighting the continent itself. How did it fit in the tower? Don't ask.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "an option for autobuild to repeat the last building";
            }
            else {
                return "nothing";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 25 */
        "boss": "Kristoffer Kolumbus",
        "text": "The Legendary Explorer himself! He's rumored to be the original person to find the mystical land of Canadia!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "10 more autobuild spaces";
            }
            else {
                return "nothing";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 26 */
        "boss": "A Very Large Telescope",
        "text": "It's used for finding exoplanets. Also, you're fighting it now. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "an extra autobuild slot for every tower boss you kill";
            } else {
                return "nothing";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 27 */
        "boss": "A globe",
        "text": "What's so tough about just a regular globe? Well, maybe the fact that this one is to scale. 1:1 scale that is. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a lot more mana on every prestige";
            }
            else {
                return "a lot more mana on every prestige, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 28 "fishies" */
        "boss": "a little swimmy fishy",
        "text": "It's just swimming around. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "being able to kill the environment faster";
            }
            else {
                return "being able to kill the environment faster, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 29 */
        "boss": "a little golden swimmy fishy",
        "text": "It's just swimming around. It's also very shiny. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "being able to kill the economy faster";
            }
            else {
                return "being able to kill the economy faster, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 30 */
        "boss": "a little sparkly swimmy fishy",
        "text": "It's just swimming around. It's also very extremely shiny. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "even more mana per prestige";
            }
            else {
                return "even more mana per prestige, again";
            }
        },
        reward: function () { }
    },
    { /* Boss 31 (Ascension I - 1) "mystical stuff" */
        "boss": "A very sparkly mystical bowl of spaghetti",
        "text": "Mmm, magic spaghetti. You get hungry just thinking about it.",
        "reward_text": "a halved cooldown on the tower of grinding!",
        reward: function () { }
    },
    { /* Boss 32 (Ascension I - 2) */
        "boss": "A very sparkly mystical trimp",
        "text": "This isn't as tasty as magic spaghetti. Ugh, more fighting.",
        "reward_text": "Joe's Premium Iron Juice",
        reward: function () { }
    },
    { /* Boss 33 (Ascension I - 3) */
        "boss": "A very sparkly mystical skelton",
        "text": "DOOT DOOT!",
        "reward_text": "A nice fruit punch. Wait, that label doesn't say fruit, it says face!",
        reward: function () { }
    },
    { /* Boss 34 (Ascension I - 4) */
        "boss": "that one guy",
        "text": "Yeah, you know. THAT guy.",
        get reward_text() {
            if (adventure_data["tower_ascension"] == 1) {
                return "the Essence Compressor";
            } else {
                return "nothing";
            }
        },
        reward: function () {
            if (adventure_data["tower_ascension"] == 1) {
                if (buildings["s_autoessence"].on) {
                    toggle_building_state("s_autoessence");
                }
                buildings["s_autoessence"].amount = 100;
                $("#building_s_autoessence").parent().removeClass("hidden");

                update_building_amount("s_autoessence"); /* Previously, there were infinite of these to keep it hidden. Let's update to proper amount. */
            }
        }
    },
    { /* Boss 35 (Ascension II - 1) "test stuff" */
        "boss": "test boss",
        "text": "test text.",
        get reward_text() {
            return "test_reward=\"essence_multiplier *= ascensionCount*0.01\"";
        },
        reward: function () {
        }
    },
    { /* Boss 36 (Ascension II - 2) */
        "boss": "A really annoyed QA guy",
        "text": "He mutters something about not testing in production. It sounds really lame.",
        get reward_text() {
            return "Double Mana Mode";
        },
        reward: function () {
        }
    },
    { /* Boss 37 (Ascension II - 3) */
        "boss": "Hackerman",
        "text": "Oh no, you've been hacked!",
        get reward_text() {
            return "ERROR in tower.ts line ���: undefined is not a function. Enabling grind_tower_bank_mode.";
        },
        reward: function () {
        }
    },
    { /* Boss 38 (Ascension II - 4) */
        "boss": "The Client",
        "text": "Hey, what if you added balloons? No, get rid of those, they're terrible. Hey, what if you had it make my coffee? No, not black coffee, 3 sugars and 2 creams. Why won't it make me a latte? It keeps making my coffee with 3 sugars and 2 creams which is wrong. I found a bug: if I press this button, it makes me a latte when I actually want some tea. Hey, there's no lemon in my tea. Why won't it make me coffee with 2 sugars and 3 creams? Fix that NOW. Okay, new top highest priority item: ...",
        get reward_text() {
            return "a decreased essence price";
        },
        reward: function () {
        }
    },
    { /* Boss 39 (Ascension III - 1) "ninjas" */
        "boss": "a Ninja",
        "text": "...",
        get reward_text() {
            if (adventure_data["omega_machine"]) {
                return "nothing";
            }
            return "the OMEGA MACHINE";
        },
        reward: function () {
            adventure_data["omega_machine"] = 1;
            let build_state = buildings["omega_machine"].on;
            if (build_state) {
                toggle_building_state("omega_machine");
            }
            buildings["omega_machine"].amount = 1;
            if (build_state) { /* Only turn on if it already was on */
                toggle_building_state("omega_machine");
            }
            $("#building_omega_machine  > .building_amount").html(format_num(buildings["omega_machine"].amount, false));
        }
    },
    { /* Boss 40 (Ascension III - 2) */
        "boss": "1,000 ninjas",
        "text": "Fun fact: the more enemies you fight at once, the weaker each one is. Watch any Kung Fu movie for proof.",
        get reward_text() {
            return "a new star chart available at the Cath market";
        },
        reward: function () {
        }
    },
    { /* Boss 41 (Ascension III - 3) */
        "boss": "Jackie Chan",
        "text": "Prepare to get rekt.",
        get reward_text() {
            return "some fuel for your ship";
        },
        reward: function () {
            adventure_data["inventory_fuel"] += 50;
        }
    },
    { /* Boss 42 (Ascension III - 4) */
        "boss": "that dang sneaky fox",
        "text": "Oh no! It's going to sneak into your house! And email your mom or something.",
        get reward_text() {
            if (adventure_data["tower_ascension"] == 3) {
                return "something new at the omega bank";
            }
            return "nothing";
        },
        reward: function () {
            if (adventure_data["omega_upgrades"] == undefined) {
                adventure_data["omega_upgrades"] = [[0, 0, 0]];
            }
        }
    },
    { /* Boss 43 (Ascension IV - 1) "pizza" */
        "boss": "a cheese pizza",
        "text": "Yum!",
        get reward_text() {
            if (adventure_data["tower_nuke"] == undefined) {
                return "the NUKE button";
            }
            return "nothing";
        },
        reward: function () {
            adventure_data["tower_nuke"] = true;
        }
    },
    { /* Boss 44 (Ascension IV - 2) */
        "boss": "a pepperoni pizza",
        "text": "Ooh, I love pepperoni!",
        get reward_text() {
            return "void meteors";
        },
        reward: function () {
        }
    },
    { /* Boss 45 (Ascension IV - 3) */
        "boss": "a limburger and sardine pizza",
        "text": "It smells kind of bad, but if you like it, hey, you do you.",
        get reward_text() {
            return "another AI upgrade";
        },
        reward: function () {
        }
    },
    { /* Boss 46 (Ascension IV - 4) */
        "boss": "a pineapple pizza",
        "text": "KILL THE ABOMINATION! BURN BURN BURN!",
        get reward_text() {
            return "a new event that can happen.";
        },
        reward: function () {
        }
    },
    { /* Boss 47 (Ascension V - 1) "contributors" */
        "boss": "fuzzything44",
        "text": "Hey, wait! That's me! Stop! Ow!",
        "special_chance": 50,
        run_special: function (health, ehealth) {
            if (adventure_data["tower_healer"].current_health > 0) {
                adventure_data["tower_healer"].current_health -= 100;
                return { message: "I'll go attack your healer now. Ha!", damage: 0 };
            } else {

                return { message: "Pow! I just punched you right in your face! That's a lot of damage.", damage: 0, real_damage: 1000 };
            }
        },
        get reward_text() {
            if (adventure_data["auto_upgrade"] == undefined) {
                return "AutoUpgrade (see your settings menu).";
            }
            return "nothing";
        },
        reward: function () {
            if (adventure_data["auto_upgrade"] == undefined) {
                adventure_data["auto_upgrade"] = false;
            }
        },

    },
    { /* Boss 48 (Ascension V - 2) */
        "boss": "/u/raids_made_easy",
        "text": "Do you know why the trading portal sucks? They broke it. They're why. They're the first person to find a ton of bugs and powerful interactions in this game.",
        "special_chance": 30,
        run_special: function (health, ehealth) {
            if (adventure_data["tower_warrior"].current_health > 0) {
                adventure_data["tower_warrior"].current_health = Math.floor(adventure_data["tower_warrior"].current_health / 2);
                return { message: "They use the power of exponents to halve your warrior's health!", damage: 0 };
            } else {
                return { message: "They use the power of exponents to halve your health!", damage: Math.ceil(health / 2) };
            }
        },
        get reward_text() {
            return "spikier kneepads.";
        },
        reward: function () {
        },
    },
    { /* Boss 49 (Ascension V - 3) */
        "boss": "TheFool",
        "text": "Without them, tower ascension may not even exist yet.",
        "special_chance": 0,
        run_special: function (health, ehealth) {
            return { message: "Oof ow ouch my bones", damage: Math.max(25, Math.ceil( health * 0.9 - 500)) };
        },
        get reward_text() {
            if (adventure_data["autobuild_advanced"]) {
                return "nothing";
            }
            return "improved autobuild"; 
        },
        reward: function () {
            adventure_data["autobuild_advanced"] = true;
        }
    },
    { /* Boss 50 (Ascension V - 4) */
        "boss": "Joevdw",
        "text": "The first person to monetarily support this game, along with MANY discoveries of major issues. Also, if this is you I guess this floor is just a mirror or something? Weird.",
        /*"special_chance": 0,
        run_special: function (health, ehealth) {
            return { message: "huh", damage: 1 };
        },*/
        get reward_text() {
            return "a new challenge, yay!"; 
        },
        reward: function () {

        }
    },
    { /* Boss 51 (Ascension VI - 1) "Ye Olde" */
        "boss": "Ye Olde Tavern",
        "text": "Crush the (other) Tavern!",
        get reward_text() {
            return ""; /* Let AI automate manufacturing? */
        },
        reward: function () {

        }
    },
    { /* Boss 52 (Ascension VI - 2)*/
        "boss": "Ye Olde Castle",
        "text": "Crush the Castle!",
        get reward_text() {
            return ""; /* Let AI build hydrogen mines? */
        },
        reward: function () {

        }
    },
    { /* Boss 53 (Ascension VI - 3) */
        "boss": "Ye Olde Angree King",
        "text": "Oops, maybe you shouldn't have crushed that castle.",
        get reward_text() {
            return ""; /* ???  */
        },
        reward: function () {

        }
    },
    { /* Boss 54 (Ascension VI - 4) */
        "boss": "Ye Olde Ye Olde",
        "text": "Things are beyond having to make sense by now, okay?",
        get reward_text() {
            return ""; /* Lootboxes? */
        },
        reward: function () {

        }
    },
    { /* Boss Repeat, for extra levels */
        get boss() {
            return "a " + tower_adj_a[adventure_data["tower_floor"] % tower_adj_a.length]
                   + tower_adj_b[adventure_data["tower_floor"] % tower_adj_b.length]
                   + tower_adj_c[adventure_data["tower_floor"] % tower_adj_c.length]
                   + tower_noun[adventure_data["tower_floor"] % tower_noun.length];
        },
        get text() {
            return tower_rooms[adventure_data["tower_floor"] % tower_rooms.length];
        },
        "reward_text": "nothing but boasting rights",
        reward: function () { }
    },
    { /* Boss Final, for each tower. */
        "boss": "the final tower guardian",
        "text": "It bounces around the room like a demented ferret, hissing and snarling as it goes. ",
        "reward_text": "a new bigger shinier tower; oh and cheaper essence",
        reward: function () { }
    },
]

const TOWER_ASCENSION_GROWTH = 4;
let grinding_level = 1;

/* Adjectives and nouns to describe the boss.  Please ensure that the lengths of each set are mutually coprime with all the others. */
/* Also, adjectives must end with a space or be totally empty. */
let tower_adj_a = [ "beautiful ", "ugly ", "", "strange ", "corrupt ", "quaint ", "cute ", ""];
let tower_adj_b = [ "big ", "small ", "baby ", "huge ", ""];
let tower_adj_c = [ "green ", "", "blue ", "purple ", "red ", "striped ", "spotty " ];
let tower_noun = ["fish", "frog", "triffid", "dog", "cat", "dove", "eagle", "goat", "golem"];
/* Room descriptions.  Want to be a multiple of noun length so that the rooms match the noun. */
let tower_rooms = ["It's just swimming around, looking angry. ",
                   "It's hopping mad at you. ",
                   "It's nearly filling the whole room, waiting to strike. ",
                   "It looks like it might just sit if you told it to firmly.  Maybe not. ",
                   "It gives you that look that says it knows that you're just a peasant in its eyes. ",
                   "It flutters around looking innocent.  Maybe it is, maybe it isn't. ",
                   "It soars round and round your head just waiting for you to take another step. ",
                   "It nibbles the vegetation while watching you carefully. ",
                   "It stands guard so still.  Will it move if you try and walk past? "];

function tower_ascension_scale( initial, min, round ) {
    if (round) {
        return Math.round(Math.max(initial / (1 + adventure_data["tower_ascension"]), min));
    } else {
        return Math.max(initial / (1 + adventure_data["tower_ascension"]), min);
    }
}

/* Number of floors before final boss. */
function tower_height() {
    return 31 + (adventure_data["tower_ascension"] * TOWER_ASCENSION_GROWTH);
}

function tower_boss_ascension_scale () {
    let asc = adventure_data["tower_ascension"] + 1; /* + 1 to shift it properly. This gives Ascension 0 and I at 1x, then 2x on Ascension II... instead of 1 on Ascensions 0, I, AND II. */
    if (asc < 1) {
        return -5;
    }
    let a = (1 + Math.sqrt(5))/2;
    let b = (1 - Math.sqrt(5))/2;
    return Math.round((Math.pow(a, asc) - Math.pow(b, asc)) / Math.sqrt(5));
}

function essence_cost_multiplier() {
    if (adventure_data["tower_floor"] > 38) {
        return 1.15;
    } else {
        return 1.2;
    }
}
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
    if (adventure_data["tower_ascension"] == undefined) {
        adventure_data["tower_ascension"] = 0;
    }

    $("#events_topbar").html("The Tower of Magic");
    $("#events_content").html("Welcome to the Tower of Magic. Your essence allows you to enter.<br/>");

    if (adventure_data["challenge"] == CHALLENGES.NONE) {
        let essence_cost = Math.round(Math.pow(adventure_data["total_essence"], essence_cost_multiplier()));
        $("#events_content").append("<span class='clickable'>Compress</span> some magic into 1 essence (" + format_num(essence_cost, false) + " Mana Stones)<br/>");
        $("#events_content span").last().click(function () {
            if (buy_essence(1)) {
                tower();
                $("#events_content").prepend("You compress some magic into essence.<br/>")
            } else {
                tower();
                $("#events_content").prepend("You need a more mana stones. Or free up some mana. <br/>")
            }
        });
    }

    $("#events_content").append("You currently have " + format_num(adventure_data["tower_power"], false) + " power. <span class='clickable'>Spend</span> <input id='tower_power_increase' class='fgc bgc_second' type='number' min='0' value='1'> essence at a rate of 1 essence per power.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        let pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        if (isNaN(pow_increase) || pow_increase < 0) { pow_increase = 0; }
        let tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));
        if (isNaN(tough_increase) || tough_increase < 0) { tough_increase = 0; }

        if (buildings["s_essence"].amount > pow_increase) {
            spend_essence(pow_increase);
            adventure_data["tower_power"] += pow_increase;
        }

        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);

    });

    let toughness_per_essence = "";
    if (adventure_data["tower_floor"] > 21) { toughness_per_essence = "5 " }
    $("#events_content").append("You currently have " + format_num(adventure_data["tower_toughness"], false) + " toughness. <span class='clickable'>Spend</span> <input id='tower_tough_increase' class='fgc bgc_second' type='number' min='0' value='1'> essence at a rate of 1 essence per " + toughness_per_essence + "toughness.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        let pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        if (isNaN(pow_increase) || pow_increase < 0) { pow_increase = 0; }
        let tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));
        if (isNaN(tough_increase) || tough_increase < 0) { tough_increase = 0; }

        if (buildings["s_essence"].amount > tough_increase) {

            spend_essence(tough_increase);

            if (adventure_data["tower_floor"] > 21) {
                adventure_data["tower_toughness"] += 5 * tough_increase;
            } else {
                adventure_data["tower_toughness"] += tough_increase;
            }
        }

        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);
    });

    /* They're in a challenge. Disable entering tower */
    if (adventure_data["challenge"] == CHALLENGES.NONE) {
        $("#events_content").append("<span class='clickable'>Enter</span> the tower. (Costs one mana stone). <br/>");
        $("#events_content span").last().click(function () { climb_tower() });
    }

    if (adventure_data["tower_floor"]) {
        $("#events_content").append("You're at tower floor: " + format_num(adventure_data["tower_floor"]) + "<br/>")
    }

    if (adventure_data["grind_tower_time"] != undefined && adventure_data["tower_floor"] > 8) {
        let grind_tower_time = 24 * 60 * 60;
        if (adventure_data["tower_floor"] > 31 && adventure_data["tower_ascension"] /* Don't have the tower guardian also give this */) {
            grind_tower_time /= 2;
        }
        if (adventure_data["tower_floor"] > 14) {
            grind_tower_time -= 60 * 60; /* 1 hour quicker! */
        }

        if (adventure_data["grind_tower_bank"]) {
            $("#events_content").append("You have " + format_num(adventure_data["grind_tower_bank"]) + " entries to the small tower banked.<br/>");
        }
        if (Date.now() - adventure_data["grind_tower_time"] > grind_tower_time * 1000 || document.URL == "http://localhost:8000/") {
            $("#events_content").append("<span class='clickable'>Enter</span> the small tower nearby. (Costs one mana stone, enterable once every 24 hours before upgrades). <br/>");
            $("#events_content span").last().click(function () {
                adventure_data["grind_tower_time"] = Date.now();
                climb_tower(undefined, undefined, true);
            });

            if (adventure_data["tower_floor"] > 37) {
                if (adventure_data["grind_tower_bank"] == undefined) {
                    adventure_data["grind_tower_bank"] = 0;
                }
                $("#events_content").append("<span class='clickable'>Bank</span> your entry instead (and then you can enter quicker sometime later)<br/>");
                $("#events_content span").last().click(function () {
                    adventure_data["grind_tower_bank"]++;
                    adventure_data["grind_tower_time"] = Date.now();
                    tower();
                });
            }

        } else if (adventure_data["grind_tower_bank"]) {
            $("#events_content").append("<span class='clickable'>Enter</span> the small tower nearby. (Using up a bank) <br/>");
            $("#events_content span").last().click(function () {
                adventure_data["grind_tower_bank"]--;
                climb_tower(undefined, undefined, true);
            });
        } else {
            let date = new Date(null)
            let elapsed_time = (Date.now() - adventure_data["grind_tower_time"]) / 1000
            date.setSeconds(grind_tower_time - elapsed_time);
            let dates = date.toISOString().substr(11, 8);
            let result = dates.split(":")
            $("#events_content").append("The small tower is still closed. Come back in " + parseInt(result[0]).toString() + "hours " + parseInt(result[1]).toString() + " minutes<br/>");
        }
    }

    if (adventure_data["tower_floor"] > 22) {
        $("#events_content").append("<span class='clickable'>Enter</span> the tavern");
        $("#events_content span").last().click(function () {
            tavern();
        });
    }

    $("#events").removeClass("hidden");
}

function climb_tower(health = undefined, ehealth = undefined, grinding = false) {
    if (grinding) {
        $("#events_topbar").html("Small tower floor " + format_num(grinding_level));
    } else {
        if (adventure_data["tower_floor"] >= tower_height()) {
            $("#events_topbar").html("Top of the Tower!");
        } else if (!adventure_data["tower_ascension"]) {
            $("#events_topbar").html("Tower floor " + format_num(adventure_data["tower_floor"]));
        } else {
            function convertToRoman(num: number): string {
                let roman = {
                    M: 1000,
                    CM: 900,
                    D: 500,
                    CD: 400,
                    C: 100,
                    XC: 90,
                    L: 50,
                    XL: 40,
                    X: 10,
                    IX: 9,
                    V: 5,
                    IV: 4,
                    I: 1
                }
                let result: string = '';
                for (let key in roman) {
                    if (num == roman[key]) {
                        return result += key;
                    }
                    if (num > roman[key]) {
                        result = result + (key as any).repeat(Math.floor(num / roman[key]));
                        num = num % roman[key];
                    }
                }
                return result;
            }
            $("#events_topbar").html("Tower ascension " + convertToRoman(adventure_data["tower_ascension"]) + ", floor " + format_num(adventure_data["tower_floor"]));
        }
    }
    if (health == undefined) {
        if (resources_per_sec["mana"] >= 1 || grinding) {
            if (!grinding) {
                resources_per_sec["mana"]--;
                buildings["s_manastone"].amount--;
                update_building_amount("s_manastone");
            }
            health = adventure_data["tower_toughness"];

            if (adventure_data["tower_healer"] != undefined) { /* Give healer health */
                adventure_data["tower_healer"].current_health = adventure_data["tower_healer"].health;
            }
            if (adventure_data["tower_warrior"] != undefined) { /* Give warrior health */
                adventure_data["tower_warrior"].current_health = adventure_data["tower_warrior"].health;
            }
            if (grinding) {
                grinding_level = 1;
                ehealth = Math.pow(grinding_level, 2) * tower_boss_ascension_scale();
            } else {
                ehealth = Math.pow(adventure_data["tower_floor"], 2) * tower_boss_ascension_scale();
            }
        } else {
            $("#events_content").html("It seems you don't have enough mana to attempt fighting this boss. Maybe come back later?<br />");
            $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
            $("#events_content span").last().click(function () { tower(); });
            return;
        }

    }

    let tower_level: number;
    if (grinding) {
        tower_level = grinding_level;
    } else {
        tower_level = adventure_data["tower_floor"];
    }

    if (adventure_data["tower_floor"] > tower_height() && !grinding) {
        $("#events_content").html("You're at the current top of the tower! Oh, also if you're here please message fuzzything44 on the Discord channel.<br/>");
        /* Reset the tower information, increment ascension count and reset cost of essence. */
        /* CURRENT: MAX ASCENSION COUNT IS 5 */
        if (adventure_data["tower_ascension"] < 5) {
            $("#events_content").html("There is a shimmering portal before you.  You sense that stepping through it will replace this tower with a bigger, better and harder one.  It will also make essence much cheaper.<br/>(This is Tower Ascension - you'll start again at floor 0, keeping all your essence and essence spent. 4 new floors will be added to the tower and it'll become more difficult. It also lowers the essence cost back to the base. Some floor rewards will be locked until you reach that floor again. Also, the small tower will become harder and gain floors at the same rate.)<br/>");
            /* Need to modify the message above and the function below for Ascension specific extra upgrades. */
            $("#events_content").append("<span class='clickable'>Step</span> through the portal.<br/>");
            $("#events_content span").last().click(function () {
                adventure_data["tower_floor"] = 0;
                adventure_data["tower_ascension"]++;
                adventure_data["total_essence"] = 1;
                tower();
            });

        }

        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else if (grinding && grinding_level > tower_height()) {
        $("#events_content").html("Congratulations on grinding to the very top of the tower! As a reward, the essence cost has been reduced!<br/>");
        adventure_data["total_essence"] = 0;
        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else {
        let boss_data;

        if (tower_level < tower_height()) {
            if (tower_level < TOWER_DATA.length - 2) {
                boss_data = TOWER_DATA[tower_level];
            } else {
                boss_data = TOWER_DATA[TOWER_DATA.length - 2];
            }
        } else {
            boss_data = TOWER_DATA[TOWER_DATA.length - 1];
        }

        $("#events_content").html("This floor contains " + boss_data.boss + ". " + boss_data.text + "<br/>");
        $("#events_content").append("Your health: " + format_num(health, true) + "<br/>");
        $("#events_content").append("Enemy health: " + format_num(ehealth, true) + "<br/>");

        function fight_enemy(attack) {
            let fight_results_message = "";
            if (attack == "attack") {
                fight_results_message += "You attack!";
            } else if (attack == "dodge") {
                fight_results_message += "You dodge!";
            } else if (attack == "spaz") {
                let spaz_messages = ["You flail around!", "You do the TEACUP EXTERMINATION.", "You start tapdancing.", "You attack! Wait, no. You don't.", "You suddenly become happy."];
                fight_results_message += spaz_messages[Math.floor(Math.random() * spaz_messages.length)];
            }

            let rval = Math.random(); /* Roll random enemy attack. */
            let enemy_attack = "";
            if (rval < 1 / 3) {
                enemy_attack = "attack";
                fight_results_message += " Your enemy attacks!";
            } else if (rval < 2 / 3) {
                enemy_attack = "dodge";
                fight_results_message += " Your enemy defends!";
            } else {
                enemy_attack = "spaz";
                let spaz_messages = ["Your enemy spins in circles for 20 minutes!", "Your enemy does something unspeakable.", "Your enemy pulls out a giant hammer and hits you with it! Oh good, it was foam.", "Your enemy throws a tomato at you.", "... maybe?"];
                fight_results_message += " " + spaz_messages[Math.floor(Math.random() * spaz_messages.length)];
            }

            fight_results_message += "<br/>";

            let winstate = "won"; /* Figure out who won. */
            if (attack == enemy_attack) {
                winstate = "tie";
            } else if ((attack == "attack" && enemy_attack == "dodge") || (attack == "dodge" && enemy_attack == "spaz") || (attack == "spaz" && enemy_attack == "attack")) {
                winstate = "lost";
            }
            let enemy_damage = Math.pow(tower_level, 2) * tower_boss_ascension_scale();

            function damage_player(amt) {
                /* Warrior exists and is defending. And is alive. */
                if (adventure_data["tower_warrior"] != undefined && $("input:radio[name='warrior_action']:checked").val() == "defend" && adventure_data["tower_warrior"].current_health > 0) {
                    adventure_data["tower_warrior"].current_health -= amt;
                    fight_results_message += " Your warrior deflects the damage!";
                } else {
                    health -= amt;
                    /* They have spikey kneepads */
                    if (adventure_data["tower_floor"] > 48) {
                        let knee_dmg = Math.floor(amt / 5) + 5;
                        fight_results_message += " Your super spikey kneepads poke your enemy for " + format_num(knee_dmg) + " damage!";
                        ehealth -= knee_dmg;
                    } else if (adventure_data["tower_floor"] > 16) {
                        fight_results_message += " Your spikey kneepads poke your enemy for 5 damage!";
                        ehealth -= 5;
                    }
                }
            }
            if (winstate == "won") {
                /* Deal damage*/
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it!"

                if (adventure_data["tower_floor"] > 18) {
                    fight_results_message += " And your sweet sword is really good at damaging this guy!";
                    ehealth -= Math.floor(adventure_data["tower_power"] / 3);
                }
            } else if (winstate == "tie") {
                /* Both take damage */
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it! But it also hit you..."
                damage_player(enemy_damage);
            } else {
                fight_results_message += "It hit you. That hurts."
                damage_player(enemy_damage);
            }
            fight_results_message += "<br/>";

            if (boss_data["special_chance"] < Math.random() * 100) {
                let special_attack = boss_data.run_special(health, ehealth);
                fight_results_message += special_attack.message + "<br/>";

                damage_player(special_attack.damage);

                if (special_attack["real_damage"]) {
                    health -= special_attack["real_damage"];
                }

            }

            if (adventure_data["tower_healer"] != undefined) {
                let heal_action = $("input:radio[name='healer_action']:checked").val();
                if (adventure_data["tower_healer"].current_health > 0) {
                    if (heal_action == "heal") {
                        let heal_amount = adventure_data["tower_healer"].power;
                        heal_amount = Math.min(adventure_data["tower_toughness"] - health, heal_amount); /* Can't heal past max health. */
                        health += heal_amount;
                        fight_results_message += "Your healer heals you for " + format_num(heal_amount, false) + " health.";
                    } else { /* It's attack */
                        let heal_damage = Math.round(adventure_data["tower_healer"].power / 2);
                        ehealth -= heal_damage;
                        fight_results_message += "Your healer attacks for " + format_num(heal_damage, false) + " damage.";
                    }
                }

                adventure_data["tower_healer"].action = heal_action;
                fight_results_message += "<br/>";
            }

            if (adventure_data["tower_warrior"] != undefined) {
                let warrior_action = $("input:radio[name='warrior_action']:checked").val();
                if (warrior_action == "attack" && adventure_data["tower_warrior"].current_health > 0) {
                    let warr_damage = Math.round(adventure_data["tower_warrior"].power);
                    ehealth -= warr_damage;
                    fight_results_message += "Your warrior attacks for " + format_num(warr_damage, false) + " damage.";
                } 
                adventure_data["tower_warrior"].action = warrior_action;
                fight_results_message += "<br/>";
            }

            /* Check for deaths. */
            if (health <= 0) {
                if (grinding) {
                    $("#events_content").html("Ouch! You were defeated.<br /> Well, that's all the grinding you can do right now. Come back in 24 hours.<br/>");
                } else {
                    $("#events_content").html("Ouch! You were defeated.<br /><span class='clickable'>Try</span> again? (Costs 1 mana stone)<br/>");
                    $("#events_content span").last().click(function () { climb_tower() });

                }
                $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
                $("#events_content span").last().click(function () { tower(); });
            } else if (ehealth <= 0) {
                if (grinding) {
                    defeat_floor(health);
                } else {
                    defeat_floor();
                }
            } else {
                climb_tower(health, ehealth, grinding);
            }

            $("#events_content").prepend(fight_results_message + "<br/>");

        }
        if (tower_level < tower_height() - TOWER_ASCENSION_GROWTH) {
            $("#events_content").append("<span class='clickable' id='tower_nuke'>Attack</span>");
        } else {
            $("#events_content").append("<span class='clickable'>Attack</span>");
        }
        $("#events_content span").last().click(function () { fight_enemy("attack"); });
        $("#events_content").append("<span class='clickable'>Dodge</span>");
        $("#events_content span").last().click(function () { fight_enemy("dodge"); });
        $("#events_content").append("<span class='clickable'>Spaz</span><br/>");
        $("#events_content span").last().click(function () { fight_enemy("spaz"); });

        if (adventure_data["tower_nuke"] && tower_level < tower_height() - TOWER_ASCENSION_GROWTH) {
            $("#events_content").append("<span class='clickable'>NUKE</span><br/>");
            $("#events_content span").last().click(function nuke() {
                if ($("#tower_nuke").length) {
                    $("#tower_nuke").click();
                    setTimeout(function () { nuke(); }, 1);
                }
            });
        }

        function class_stats(classname) {
            let current = adventure_data["tower_" + classname].current_health;
            let max = adventure_data["tower_" + classname].health;
            let pow = adventure_data["tower_" + classname].power;
            if (current <= 0) {
                return "(DEAD)";
            }
            return "(" + format_num(current) + "/" + format_num(max) + " health, " + format_num(pow) + " power)";
        }
        if (adventure_data["tower_healer"] != undefined) {
            $("#events_content").append("Healer Action " + class_stats("healer") + ": <div class='radio-group'>" +
                "<input type='radio' name='healer_action' id='healer_heal' value='heal'><label for='healer_heal'>Heal</label>" +
                "<input type='radio' name='healer_action' id='healer_attack' value='attack'><label for='healer_attack'>Attack</label>" +
                "</div><br/>");
            $("#healer_" + adventure_data["tower_healer"].action).click();

        }

        if (adventure_data["tower_warrior"] != undefined) {
            $("#events_content").append("Warrior Action " + class_stats("warrior") + ": <div class='radio-group'>" +
                "<input type='radio' name='warrior_action' id='warrior_defend' value='defend'><label for='warrior_defend'>Defend</label>" +
                "<input type='radio' name='warrior_action' id='warrior_attack' value='attack'><label for='warrior_attack'>Attack</label>" +
                "</div><br/>");
            $("#warrior_" + adventure_data["tower_warrior"].action).click();

        }
    }
}

function defeat_floor(health = undefined) {
    $("#events_content").html("Yay, you won! That was a hard battle.<br/>");
    if (health == undefined) {
        var floor = adventure_data["tower_floor"];

        if (floor >= tower_height()) {
            floor = TOWER_DATA.length - 1;
        } else if (floor > TOWER_DATA.length - 2) {
            floor = TOWER_DATA.length - 2;
        }

        if (adventure_data["tower_floor"] == tower_height()) {
            $("#events_content").append("You defeated the final boss of the tower! A mystical portal opens in front of you.<br/>");
        } else {
            $("#events_content").append("For defeating the boss on floor " + format_num(adventure_data["tower_floor"]) + ", you are awarded with " + TOWER_DATA[floor].reward_text + ". You're also a floor higher now. <br/>");
        }
        
        TOWER_DATA[floor].reward();
        adventure_data["tower_floor"]++;
        $("#events_content").append("<span class='clickable' id='tower_nuke'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(); });

        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else {
        let essence_reward = Math.max(1, adventure_data["tower_ascension"]);
        $("#events_content").append("For defeating the boss on floor " + format_num(grinding_level) + ", you are awarded with " + format_num(essence_reward) + " essence<br/>")
        /* Give one essence */
        toggle_building_state("s_essence", true);
        buildings["s_essence"].amount += essence_reward;
        adventure_data["current_essence"] += essence_reward;

        update_building_amount("s_essence");
        toggle_building_state("s_essence");


        grinding_level++;

        $("#events_content").append("<span class='clickable' id='tower_nuke'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(health, Math.pow(grinding_level, 2) * tower_boss_ascension_scale(), true); });

        $("#events_content").append("<span class='clickable'>Back</span> to tower base (ends your run of grinding, so pretty pointless).<br/>");
        $("#events_content span").last().click(function () { tower(); });

    }

}

/* TODO: Add upgrade party, hire new people (when unlocked). */
function tavern() {
    $("#events_topbar").html("A tavern");
    $("#events_content").html("The tavern is pretty empty right now. It's just you, your party, and the bartender. Still, you could buy a drink for a party member.<br/>");

    function buydrink(name: string, pow_increase: number, health_increase: number, size: number = 1) {
        if (buildings["s_essence"].amount > size) {
            spend_essence(size);
            let pow_gain = pow_increase * size;
            let health_gain = health_increase * size;

            adventure_data["tower_" + name].power += pow_gain;
            adventure_data["tower_" + name].health += health_gain;
            $("#events_content").prepend("You buy your " + name + " a drink. They gain " + format_num(pow_gain) + " power and " + format_num(health_gain) + " health!<br/>");
            tavern();
        } else {
            $("#events_content").prepend("You don't have enough essence<br/>");
        }
    }
    $("#events_content").append("You have a healer with you. They have " + format_num(adventure_data["tower_healer"].power) + " power and " + format_num(adventure_data["tower_healer"].health) + " health.<br/>");
    $("#events_content").append("<span class='clickable'>Buy</span> your Healer a drink (1 essence)");
    $("#events_content span").last().click(function () {
        buydrink("healer", 0.5, 1);
    });
    if (buildings["s_essence"].amount > 100) {
        $("#events_content").append(" <span class='clickable'>Buy 10</span>");
        $("#events_content span").last().click(function () {
            buydrink("healer", 0.5, 1, 10);
        });
    }
    if (adventure_data["tower_floor"] > 32) {
        $("#events_content").append("<br/>");
        $("#events_content").append("<span class='clickable'>Buy</span> your Healer some Iron Juice (3 essence)");
        $("#events_content span").last().click(function () {
            buydrink("healer", 0.5, 3, 3);
        });
    }
    if (adventure_data["tower_floor"] > 33) {
        $("#events_content").append("<br/>");
        $("#events_content").append("<span class='clickable'>Buy</span> your Healer some Face Punch (3 essence)");
        $("#events_content span").last().click(function () {
            buydrink("healer", 2, 1, 3);
        });
    }

    $("#events_content").append("<br/>You have a warrior with you. They have " + format_num(adventure_data["tower_warrior"].power) + " power and " + format_num(adventure_data["tower_warrior"].health) + " health.");
    $("#events_content").append("<br/>");
    $("#events_content").append("<span class='clickable'>Buy</span> your Warrior a drink (1 essence)");
    $("#events_content span").last().click(function () {
        buydrink("warrior", 1, 7);
    });
    if (buildings["s_essence"].amount > 100) {
        $("#events_content").append(" <span class='clickable'>Buy 10</span>");
        $("#events_content span").last().click(function () {
            buydrink("warrior", 1, 7, 10);
        });
    }
    if (adventure_data["tower_floor"] > 32) {
        $("#events_content").append("<br/>");
        $("#events_content").append("<span class='clickable'>Buy</span> your Warrior some Iron Juice (3 essence)");
        $("#events_content span").last().click(function () {
            buydrink("warrior", 1, 12, 3);
        });
    }
    if (adventure_data["tower_floor"] > 33) {
        $("#events_content").append("<br/>");
        $("#events_content").append("<span class='clickable'>Buy</span> your Warrior some Face Punch (3 essence)");
        $("#events_content span").last().click(function () {
            buydrink("warrior", 3, 2, 3);
        });
    }
    $("#events_content").append("<br/>");
    $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
    $("#events_content span").last().click(function () { tower(); });

}

function spend_essence(amount) {
    if (adventure_data["current_essence"] > amount) {
        toggle_building_state("s_essence", true);

        buildings["s_essence"].amount -= amount;
        adventure_data["current_essence"] -= amount;

        update_building_amount("s_essence");

        toggle_building_state("s_essence", true);
    }
}

function buy_essence(amount) {
    let essence_cost = Math.round(Math.pow(adventure_data["total_essence"], essence_cost_multiplier()));
    if (buildings["s_manastone"].amount > essence_cost && resources["mana"].amount >= essence_cost) {
        buildings["s_manastone"].amount -= essence_cost;
        resources_per_sec["mana"] -= essence_cost;
        update_building_amount("s_manastone")

        toggle_building_state("s_essence", true);
        buildings["s_essence"].amount++;
        update_building_amount("s_essence");
        toggle_building_state("s_essence");

        adventure_data["current_essence"]++;
        adventure_data["total_essence"]++;

        if (amount > 1) {
            return buy_essence(amount - 1); /* TODO: Switch from recursion sometime later. There's a clean formula for this, but eh. */
        }
        return true;
    } else {
        return false;
    }
    
}
