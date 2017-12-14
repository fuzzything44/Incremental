let event_flags = {};

let events = [
    ({ /* Filler event to make everything else slightly less common. Becomes less important the more eligible events we have. */
        "condition": function () { return true; },
        "run_event": function () {
            add_log_elem("Nothing interesting happened.");
            throw Error("Nope, we're not doing an event.");
        },
        "name": "",
        "rejection": 0,
    }), /* End lack of event */
    ({
        "condition": function () { return buildings["bank"].amount > 3; },
        "run_event": function () {
            /* Gain 0-10m of bank raw money production + 10 money for those with few banks. */
            let money_gain = Math.round(buildings["bank"].amount * buildings["bank"].generation["money"] * 600 * Math.random() + 10);
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they have some big banks and they're on, give some extra */
                money_gain += buildings["big_bank"].generation["money"] * buildings["big_bank"].amount * 400
                money_gain *= 1.3;
            }
            let antique_item = "";
            if (buildings["s_time_magic"].on && Math.random() > .5) {
                antique_item = "antique ";
                money_gain *= 2;
            }

            resources["money"].amount += money_gain;

            let investment_types = ["gold", "beer", "uranium", "uranium", "uranium", "bread", "beds", "wool", "toothpicks", "cookies", "toothpaste", "salad"];
            let invested_in = investment_types[Math.floor(Math.random() * investment_types.length)];
            add_log_elem("You made " + format_num(money_gain, false) + " money from investing!");
            $("#events_content").html("Investing in " + antique_item + invested_in + " paid off! <br />You gained " + format_num(money_gain, false) + " money from that sweet deal!");
            if (buildings["big_bank"].amount > 0 && buildings["big_bank"].on) {
                /* If they got extra */
                $("#events_content").append("<br />Thank your investment bankers for the tip!");
            }
            if (purchased_upgrades.indexOf("uranium_finance") != -1) {
                /* Give them some of what they invested in. */
                switch (invested_in) {
                    case "gold": {
                        resources["gold"].amount += 1000;
                        $("#events_content").append("<br />You embezzled 1000 gold.");
                        break;
                    }
                    case "uranium": {
                        resources["uranium"].amount += 35;
                        if (antique_item != "") {
                            resources["uranium"].amount += 15;
                        }
                        $("#events_content").append("<br />You embezzled some uranium.");
                        break;
                    }
                    case "bread": {
                        resources["stone"].amount += 100000;
                        $("#events_content").append("<br />Man, this bread is as hard as rock.");
                        break;
                    }
                    case "toothpicks": { }
                    case "beds": {
                        resources["wood"].amount += 100000;
                        $("#events_content").append("<br />You turn some extras into wood.");
                        break;
                    }
                } /* End switch*/

            } /* End run_event */
        },
        "name": "Stock Investments Pay Off!",
        "rejection": 10,
    }), /* End stock investments */
    ({ 
        "condition": function () { return true; },
        "run_event": function () {
            let content = "<span>Woah, a meteor just hit in your backyard!</span><br>";
            content += "<span onclick='resources.stone.amount += 50000; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 50000 stone\");' class='clickable'>Gather stone</span><br>";
            if (resources["iron"].amount > 0) {
                content += "<span onclick='resources.iron.amount += 500; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 500 iron\");' class='clickable'>Recover iron</span><br>";
            }
            if (resources["gold"].amount > 0) {
                content += "<span onclick='resources.gold.amount += 150; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 150 gold\");' class='clickable'>Look for gold</span><br>";
            }
            if (resources["energy"].amount > 0) {
                content += "<span onclick='resources_per_sec.energy += 10; setTimeout(() => resources_per_sec[\"energy\"] -= 10, 5 *60000); $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 10 energy for 5 minutes\");' class='clickable'>Capture the heat</span><br>";
            }
            if (buildings["big_mine"].amount >= 3 && buildings["big_mine"].on && Math.random() > .7 && buildings["library"].amount >= 5) {
                if (resources["uranium"].amount > 0) {
                    content += "<span onclick='resources.uranium.amount += 3; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 3 uranium\");' class='clickable'>Wait, what's that?</span><br>";
                } else {
                    content += "<span onclick='resources.diamond.amount += 10; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained 10 diamond\");' class='clickable'>Wait, what's that?</span><br>";
                }
            }
            add_log_elem("A meteor fell!");
            $("#events_content").html(content);

        },
        "name": "Meteor!",
        "rejection": 30,
    }), /* End meteor */
    ({
        "condition": function () { return buildings["s_manastone"].amount < 50; },
        "run_event": function () {
            resources["time"].amount += 300;
            add_log_elem("Time warp.");
            $("#events_content").html("Time warps around you, giving an additional 300 seconds of production.");
        },
        "name": "Timewarp",
        "rejection": 95,
    }), /* End time warping */
    ({
        "condition": function () { return buildings["oil_well"].amount > buildings["oil_well"].free && buildings["oil_well"].base_cost["iron"]; },
        "run_event": function () {
            buildings["oil_well"].free++; /* Make oil cheaper */
            $("#building_oil_well > .tooltiptext").html(gen_building_tooltip("oil_well")); /* Set tooltip */
            add_log_elem("Oil reserve discovered!");
            $("#events_content").html("You found an oil reserve!<br /><i style='font-size: small'>Oil wells are now cheaper</i>");
        },
        "name": "Oil Reserve",
        "rejection": 50,
    }), /* End oil reserve */
    ({
        "condition": function () { return true; },
        "run_event": function () {
            resources["gold"].amount += 35;
            add_log_elem("We're no strangers to love!");
            $("#events_content").html('<iframe id="ytplayer" type="text/ html" width="640" height="360" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" frameborder="0"> </iframe>');
        },
        "name": "Tree Fiddy",
        "rejection": 90,
    }), /* End rickroll */
    ({
        "condition": function () { return buildings["big_mine"].amount >= 1 && buildings["big_mine"].on; },
        "run_event": function () {
            if (typeof event_flags["artifacts_found"] == "undefined") {
                event_flags["artifacts_found"] = 0;
            }
            event_flags["artifacts_found"] += 1;
            let content = "<span>Your strip mines have uncovered an artifact</span><br>";
            let money_amount = (10000 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.money.amount += " + money_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + money_amount + " money\");' class='clickable'>Sell it</span><br>";
            let gold_amount = (100 * event_flags["artifacts_found"]).toString();
            content += "<span onclick='resources.gold.amount += " + gold_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + gold_amount + " gold\");' class='clickable'>Melt it down</span><br>";
            if (resources["refined_mana"].amount > 500) {
                let refined_amount = Math.round(Math.pow(1000, 1.01 - 0.01 * event_flags["artifacts_found"])).toString()
                content += "<span onclick='resources.refined_mana.amount += " + refined_amount + "; $(\"#events\").addClass(\"hidden\"); add_log_elem(\"Gained " + refined_amount + " refined mana\");' class='clickable'>Extract magic</span><br>";
            }
            add_log_elem("You found an artifact!");
            $("#events_content").html(content);

        },
        "name": "Artifact",
        "rejection": 50,
    }), /* End artifact */
    ({
        "condition": function () { return purchased_upgrades.indexOf("better_trades_2") != -1; },
        "run_event": function () {
            if (typeof event_flags["demon_trades"] == "undefined") {
                event_flags["demon_trades"] = 0;
            }
            events[6].rejection = Math.min(50 - event_flags["demon_trades"] * 5, 80); /* The more trades you make, the more likely this is. */
            let content = "<span>Demon Traders have come to visit you.</span><br>";
            if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You bleed as they approach. </span><br />"
            }
            let diamond_gain = format_num(Math.round(300 * Math.max(1, event_flags["demon_trades"] * .5 + 1)), false);
            content += "<span onclick=' " +
                "resources.diamond.amount +=" + diamond_gain + ";" +
                "event_flags[\"demon_trades\"] += 1;" +
                "$(\"#events\").addClass(\"hidden\"); " +
                "add_log_elem(\"Gained " + diamond_gain + " diamond... at what cost?\");'" +
                "class='clickable'>Buy Diamond</span><br>";
            if (event_flags["demon_trades"] > 5) {
                content += "<span onclick='" +
                    "resources.gold.amount += 5000;" +
                    "event_flags[\"demon_trades\"] += 15;" +
                    "$(\"#events\").addClass(\"hidden\"); " +
                    "add_log_elem(\"You sold your soul. I hope you&rsquo;re happy.\");'" +
                    "class='clickable'>Sign Demon Pact</span><br>";
            }
            content += "<span onclick=' " +
                "resources.iron.amount -= 500;" +
                "event_flags[\"demon_trades\"] -= 1;" +
                "$(\"#events\").addClass(\"hidden\"); " +
                "add_log_elem(\"Demons killed by throwing 500 iron bars at them.\");'" +
                "class='clickable'>Fight them!</span><br>";

            add_log_elem("Demons came to trade with you.");
            $("#events_content").html(content);

            /* If they're corrupted enough, potentially skip this and go directly to pact*/
            if (Math.random() < (event_flags["demon_trades"] - 15) / 10) {
                event_flags["demon_trades"] -= 1; /* Reduce corruption */
                force_event(7);
            }
        },
        "name": "Demonic Trading",
        "rejection": 50,
    }), /* End demon trading */
    ({
        "condition": function () { return typeof event_flags["demon_trades"] != "undefined" && event_flags["demon_trades"] > 10; },
        "run_event": function () {
            let content = "<span>Demon Traders have come for you.</span><br>";
            /* Choose a resource */
            let chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            /* Don't choose special resource or money. Make sure they have some (unless it's money. You can always lose money) */
            while (resources[chosen_resource].value == 0 || (resources[chosen_resource].amount == 0 && chosen_resource != "money")) {
                chosen_resource = Object.keys(resources)[Math.floor(Math.random() * Object.keys(resources).length)];
            }
            let resource_loss = Math.ceil(resources[chosen_resource].amount / 2);
            if (buildings["s_goldboost"].on) {
                resource_loss = Math.ceil(resource_loss * 4 / 3);
            }
            content += "<span>They took " + format_num(resource_loss, false) + " " + chosen_resource.replace("_", " ") + " from you.</span><br />";
            if (event_flags["demon_trades"] >= 25) {
                content += "<span style='color: red'>You are still very deep in debt.</span>"
            } else if (event_flags["demon_trades"] >= 15) {
                content += "<span style='color: red'>You are still deep in debt.</span>"
            } else if (event_flags["demon_trades"] >= 10) {
                content += "<span style='color: red'>You are still in debt.</span>"
            }
            resources[chosen_resource].amount -= resource_loss;
            add_log_elem("Demons came for your " + chosen_resource.replace("_", " ") + ".");
            $("#events_content").html(content);

        },
        "name": "Demonic Pact",
        "rejection": 0,
    }), /* End demon stealing */
    ({
        "condition": function () { return typeof event_flags["bribed_politician"] == "undefined" && buildings["big_bank"].amount >= 5 && purchased_upgrades.indexOf("coal_mines") != -1 && buildings["s_manastone"].amount >= 150; },
        "run_event": function () {
            let content = "<span>Business isn't doing well. Regulations are really holding you back.</span><br>";
            if (buildings["bank"].amount >= 180) {
                content += "<span>Why not bribe a politician to change something for you?</span><br />";
                content += "<i>Bribing costs 1,000,000 money and is available once per prestige. Choose wisely.</i><br /><br />";

                /* Bribe investment regulations. Lets them have more money from banks. */
                content += "<span onclick='bribe_finance();' class='clickable'>Remove Financial Regulations</span><i style='text: small'>This provides a massive boost to banks and investment companies.</i><br />";

                /* No environmental regulations. Mines and logging camps much stronger. */
                content += "<span onclick='bribe_environment();' class='clickable'>Remove Environmental Regulations</span><i style='text: small'>This provides a massive boost to mines and logging camps.</i><br />";
            } else {
                content += "Sadly, you don't have the influence needed. <br /><em>(You need 180 banks.)</em>"
            }
            $("#events_content").html(content);

        },
        "name": "Bribe a Politician",
        "rejection": 20,
    }), /* End politician bribing */
    ({
        "condition": function () { return adventure_data.current_location == "kittens/castles" || adventure_data["logicat_level"] >= 5; },
        "perfect_cat": false,
        "run_event": function () {
            enum logic_operands {
                AND, /* (a) AND (b) */
                OR,  /* (a) OR  (b) */
                XOR, /* (a) XOR (b) */
                SET, /* (a) */
                NUM_G, /* Statements in given state > (a) */
                NUM_E, /* Statements in given state == (a) */
                NUM_L, /* Statements in given state < (a) */
            }
            function num_to_name(num: number): string {
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num];
            }
            class logic_statement {
                /* What operation we're doing. */
                operation: logic_operands;

                /* Parameter a data. What statement number it refers to and if it's true or false. */
                /* In the case of NUM_?, how many statements follow that and if they're true or false. */
                param_a: number;
                param_a_truth: boolean;

                /* Parameter b data. */
                param_b: number;
                param_b_truth: boolean;

                statement_list: logic_statement[];
                constructor(state_list: logic_statement[], op: logic_operands = null, a: number = null, a_truth: boolean = null, b: number = null, b_truth: boolean = null) {
                    this.statement_list = state_list;
                    this.operation = op;
                    this.param_a = a;
                    this.param_a_truth = a_truth;
                    this.param_b = b;
                    this.param_b_truth = b_truth;
                }
                init() {
                    /* Not in constructor so statements can reference ones added later. Adds more complexity, yay! */
                    /* Fill in blanks */
                    if (this.operation == null) {
                        /* We need to set an operation */

                        /* So get all possible values */
                        const enumValues = Object.keys(logic_operands).map(n => parseInt(n)).filter(n => !isNaN(n));
                        /* Choose one at random */
                        this.operation = enumValues[Math.floor(Math.random() * enumValues.length)];

                        /* Make t/f counting statements slightly less common by rerolling once */
                        if ([logic_operands.NUM_E, logic_operands.NUM_G, logic_operands.NUM_L].indexOf(this.operation) != -1) {
                            this.operation = enumValues[Math.floor(Math.random() * enumValues.length)];
                        }
                    }

                    /* Param a stuff */
                    if (this.param_a == null) {
                        /* Choose random parameter.*/
                        this.param_a = Math.floor(Math.random() * this.statement_list.length);

                        /* "B: There are less than 0 false statements." */
                        if ([logic_operands.NUM_G, logic_operands.NUM_L].indexOf(this.operation) != -1) {
                            this.param_a = Math.max(1, this.param_a); /* Can't have less than 0. */
                            this.param_a = Math.min(this.statement_list.length - 1, this.param_a); /* Can't have more than exist. */
                        }
                    }
                    if (this.param_a_truth == null) {
                        this.param_a_truth = Math.random() > .5;
                    }

                    /* Param b stuff. We sometimes set without caring about it, but whatever. */
                    if (this.param_b == null) {
                        /* Choose random parameter.*/
                        this.param_b = Math.floor(Math.random() * this.statement_list.length);

                        /* Don't xor statements with themselves. */
                        while (this.operation == logic_operands.XOR && this.param_a == this.param_b) {
                            this.param_b = Math.floor(Math.random() * this.statement_list.length);
                        }
                    }
                    if (this.param_b_truth == null) {
                        this.param_b_truth = Math.random() > .5;
                    }

                }
                /* Checks if this statement is true or false */
                check(puzzle_state: boolean[]): boolean {
                    switch (this.operation) {
                        case logic_operands.AND: {
                            return puzzle_state[this.param_a] == this.param_a_truth && puzzle_state[this.param_b] == this.param_b_truth;
                        }
                        case logic_operands.OR: {
                            return puzzle_state[this.param_a] == this.param_a_truth || puzzle_state[this.param_b] == this.param_b_truth;
                        }
                        case logic_operands.XOR: {
                            /* XOR is same as not equal */
                            return puzzle_state[this.param_a] != puzzle_state[this.param_b];
                        }
                        case logic_operands.SET: {
                            return puzzle_state[this.param_a] == this.param_a_truth;
                        }
                        case logic_operands.NUM_E: {
                            /* Number of elements in given state */
                            let num_in_state = 0;
                            for (let i = 0; i < puzzle_state.length; i++) {
                                if (puzzle_state[i] == this.param_a_truth) { num_in_state++; }
                            }
                            return this.param_a == num_in_state;
                        }
                        case logic_operands.NUM_G: {
                            let num_in_state = 0;
                            for (let i = 0; i < puzzle_state.length; i++) {
                                if (puzzle_state[i] == this.param_a_truth) { num_in_state++; }
                            }
                            return num_in_state > this.param_a;
                        }
                        case logic_operands.NUM_L: {
                            let num_in_state = 0;
                            for (let i = 0; i < puzzle_state.length; i++) {
                                if (puzzle_state[i] == this.param_a_truth) { num_in_state++; }
                            }
                            return num_in_state < this.param_a;
                        }
                    }
                }

                toString(): string {
                    switch (this.operation) {
                        case logic_operands.AND: {
                            return "Statement " + num_to_name(this.param_a) + " is " + this.param_a_truth.toString() + " and statement " + num_to_name(this.param_b) + " is " + this.param_b_truth.toString() + ". <br/>";
                        }
                        case logic_operands.OR: {
                            return "Statement " + num_to_name(this.param_a) + " is " + this.param_a_truth.toString() + " or statement " + num_to_name(this.param_b) + " is " + this.param_b_truth.toString() + ". <br/>";
                        }
                        case logic_operands.XOR: {
                            /* XOR is same as not equal */
                            return "Exactly one of statement " + num_to_name(this.param_a) + " and statement " + num_to_name(this.param_b) + " is " + (Math.random() > .5).toString() + ". <br/>";
                        }
                        case logic_operands.SET: {
                            return "Statement " + num_to_name(this.param_a) + " is " + this.param_a_truth.toString() + ". <br/>";
                        }
                        case logic_operands.NUM_E: {
                            return "There are exactly " + this.param_a.toString() + " " + this.param_a_truth.toString() + " statements. <br/>";
                        }
                        case logic_operands.NUM_G: {
                            return "There are more than " + this.param_a.toString() + " " + this.param_a_truth.toString() + " statements. <br/>";
                        }
                        case logic_operands.NUM_L: {
                            return "There are less than " + this.param_a.toString() + " " + this.param_a_truth.toString() + " statements. <br/>";
                        }
                    }
                }
            }
            function find_solutions(puzzle: logic_statement[]): boolean[][] {
                /* Find all possible states our puzzle could be in. */
                function binaryCombos(n) {
                    var result = [];
                    for (let y = 0; y < Math.pow(2, n); y++) {
                        var combo = [];
                        for (let x = 0; x < n; x++) {
                            //shift bit and and it with 1
                            if ((y >> x) & 1)
                                combo.push(true);
                            else
                                combo.push(false);
                        }
                        result.push(combo);
                    }
                    return result;
                }

                /* Checks single solution and returns if it is valid. */
                function check_solution(puzzle: logic_statement[], state: boolean[]): boolean {
                    /* Go through every logic statement. */
                    for (let statement = 0; statement < puzzle.length; statement++) {
                        /* Check statement */
                        if (puzzle[statement].check(state) != state[statement]) {
                            return false;
                        }
                    }
                    return true;
                }

                /* All found solutions */
                let solutions = [];
                /* List of potential states (which are lists of bools). */
                let solutions_to_check = binaryCombos(puzzle.length);
                for (let i = 0; i < solutions_to_check.length; i++) {
                    if (check_solution(puzzle, solutions_to_check[i])) { solutions.push(solutions_to_check[i]); }
                }
                return solutions;
            }
            let all_statements = [];

            /* Make a core of 3 statements, retrying until we get at least 1 solution */
            do {
                all_statements = []; /* Clear statement list from last try, if there was one. */
                /* Somewhere from 3 to 8 statements. */
                const core_statement_amount = 3 + Math.round(Math.random() * 3) + Math.round(Math.random() * 2);
                for (let i = 0; i < core_statement_amount; i++) {
                    all_statements.push(new logic_statement(all_statements));
                }
                for (let i = 0; i < core_statement_amount; i++) {
                    all_statements[i].init();
                }
            } while (find_solutions(all_statements).length != 1);

            /* I guess re-find solutions, shouldn't be a huge hit seeing as we've done it a few times. */
            let sols = find_solutions(all_statements)[0];
            /* Now to actually add it. */

            let content = "You found a cute kitty... wait, what's it saying?<br /><form id='logicat'><table>";
            for (let i = 0; i < all_statements.length; i++) {
                content += "<tr><td></td><th align='right'>" + num_to_name(i) + ":&nbsp;</td><td align='left'>" + all_statements[i].toString() + "</td></tr>";
                content += "<tr><td></td><td></td><td>" +
                    "<div class='radio-group'>" +
                    "<input type='radio' name='" + i.toString() + "' id='cat_" + i.toString() + "_u' value='unknown' checked><label for='cat_" + i.toString() + "_u'>Unknown</label>" +
                    "<input type='radio' name='" + i.toString() + "' id='cat_" + i.toString() + "_t' value='true'><label for='cat_" + i.toString() + "_t'>True</label>" +
                    "<input type='radio' name='" + i.toString() + "' id='cat_" + i.toString() + "_f' value='false'><label for='cat_" + i.toString() + "_f'>False</label>" +
                    "</div></td></tr>";
            }
            content += "</table></form>";
            $("#events_content").html(content);
            $("#events_content").append("<span class='clickable'>Reset Answers</span><br/>");
            $("#events_content > span").last().click(function () {
                for (let i = 0; i < all_statements.length; i++) {
                    $("#cat_" + i.toString() + "_u").prop("checked", true);
                }
            });

            $("#events_content").append("<span class='clickable'>Submit Answers</span><br/>");
            $("#events_content > span").last().click(() => {
                /* Remove submit/clear answers buttons */
                $("#events_content > span").last().remove();
                $("#events_content > span").last().remove();
                $("#events_content > br").last().remove();
                $("#events_content > br").last().remove();
                /* Hide selectors */
                $("#logicat tr:nth-child(even)").addClass("hidden");

                let num_correct = 0;
                let num_incorrect = 0;
                let check_val = 0;
                $('#logicat td:first-child').each(function () {
                    /* Only every other so we don't try to check the inputs. */
                    if (check_val % 2 == 0) {
                        let answer = $("input:radio[name='" + Math.round(check_val / 2).toString() + "']:checked").val();
                        if (answer == "unknown") {
                            this.innerHTML = "-";
                        } else {
                            answer = (answer == "true"); /* Cast answer to bool */

                            if (answer == sols[Math.round(check_val / 2)]) {
                                this.innerHTML = "<span style='color:green'>\u2714 (" + answer.toString()[0].toUpperCase() + ")</span>";
                                num_correct++;
                            } else {
                                this.innerHTML = "<span style='color:red'>X (" + answer.toString()[0].toUpperCase() + ")</span>";
                                num_incorrect++;
                            }
                        }
                    }
                    check_val++;
                });
                $("#events_content").append("You had " + num_correct.toString() + " correct answers and " + num_incorrect.toString() + " wrong answers. Your total score is " + (num_correct - num_incorrect).toString() + ".<br />");
                let total_points = adventure_data["logicat_points"] + num_correct - num_incorrect;
                /* Level up every 5 points */ 
                if (total_points >= 5) {
                    let levels = Math.floor(total_points / 5);
                
                    for (let i = 0; i < levels && i < 5; i++) { /* Only level up 5 times per cat max. */
                        total_points -= 5; /* Actually spend points for level. */
                        /* Level them up*/
                        adventure_data["logicat_level"] += 1;
                        /* Note no <br /> at the end. */
                        $("#events_content").append("Logikitten level increased to " + format_num(adventure_data["logicat_level"], false) + ". This level rewards: ");

                        /* Base rewards */
                        let reward_list = [
                            { "name": "Temporal Duplication", "effect": function () { resources["time"].amount += 120; }},
                            { "name": "Glass Bottle Cleanup", "effect": function () { resources["glass"].amount -= 20; resources["sand"].amount += 10000; } },
                            { "name": "Nothing :(", "effect": function () { } },
                            {
                                "name": "Blast Furnace in Operation! Gained 2,000 Glass Chips. Gained 500 Glass Blocks.",
                                "effect": function () {
                                    resources["glass"].amount += 2500;
                                }
                            },

                        ];
                        if (adventure_data["sandcastle_boost_unlocked"]) {
                            reward_list.push({ "name": "ONG!", "effect": function () { adventure_data["sandcastle_boost_unlocked"] = 1; }})
                        }
                        /* Fixed level rewards */
                        if (adventure_data["logicat_level"] >= 5 && adventure_data["sandcastle_boost_unlocked"] == undefined) {
                            reward_list = [{
                                "name": "Sandcastles", "effect": function () {
                                    adventure_data["sandcastle_boost_unlocked"] = 1;
                                }
                            }];
                        } else if (adventure_data["logicat_level"] >= 10 && adventure_data["logicat_explore"] == undefined) {
                            reward_list = [{
                                "name": "The DoRD has provided: Starchart", "effect": function () {
                                    adventure_data["logicat_explore"] = 1;
                                }
                            }];
                        } else if (adventure_data["logicat_level"] >= 100 && !count_item("conv_cube", adventure_data.warehouse)) {
                            reward_list = [{
                                "name": "Question Qube", "effect": function () {
                                    adventure_data.warehouse.push({"name": "conv_cube"});
                                }
                            }];
                        }

                        /* Choose random reward from list. */
                        let reward = reward_list[prng(adventure_data["logicat_level"]) % reward_list.length];
                        $("#events_content").append(reward.name + "<br />");
                        reward.effect();
                    } /* End level up loop */

                } /* End level up. */ 
                
                /* Set their point amount. */
                adventure_data["logicat_points"] = total_points;

                /* Perfect answer increases resource production for 3 minutes.*/
                if (num_correct == sols.length && !this.perfect_cat) {
                    this.perfect_cat = true;
                    Object.keys(resources_per_sec).forEach(function (res) {
                        /* Don't double negatives. */
                        let ps_add = 0.5 * Math.max(0, resources_per_sec[res]);
                        if (res == "mana" || resources[res].value < 0) { ps_add = 0; } /* Don't add mana or special resources. Do give other stuff. */

                        resources_per_sec[res] += ps_add;
                        setTimeout(() => resources_per_sec[res] -= ps_add, 60000 * 3);
                    });
                    setTimeout(() => { this.perfect_cat = false, 60000 * 3; add_log_elem("Logikitten bonus wore off."); buildings["logging"].tooltip = "console.log('Logikitten super mode engaged')"});
                    $("#events_content").append("Perfect answer! Production increased.<br />");
                    if (buildings["s_goldboost"].on) {
                        buildings["logging"].tooltip = "�������";
                    }
                }

            });
        },
        "name": "A cu±Ã k¶±t©n",
        "rejection": 5,
    }), /* End logicat */
    ({ /* Filler event to make everything else slightly less common. Becomes less important the more eligible events we have. */
        "condition": function () { return adventure_data["alchemy_ingredients"] != undefined && adventure_data["alchemy_ingredients"]["Carrot"] != undefined; },
        "run_event": function () {
            add_log_elem("You got a CARROT!");
            $("#events_content").html("Oh look! In your garden! You grew a carrot! Yay, you're such a good farmer!");
            adventure_data.alchemy_ingredients["Carrot"]++;
        },
        "name": "Farming",
        "rejection": 75,
    }), /* End carrot */
    ({
        "condition": function () { return adventure_data["rules_unlocked"] && event_flags["crisis_averted"] && event_flags["wanderer_knowledge"] == undefined; },
        "run_event": function () {
            $("#events_content").html("<span>A mysterious traveler has arrived.</span><br>");
            if (buildings["library"].amount > 50) {
                $("#events_content").append("<span>" + (Math.random() > 0 ? "She" : "He") + " is willing to teach you secrets. </span><br />");
                $("#events_content").append("<i>This destroys 50 libraries (cost DOES NOT RESET) and is available once per prestige. Choose wisely.</i><br /><br />");

                /* Magic! */
                if (buildings["s_manastone"].amount % 3 != 0) {
                    $("#events_content").append("<span class='clickable'>Become a Sorceror</span><i style='text: small'>Learn about the Arcane Secrets of the Universe.</i><br>");
                    $("#events_content span").last().click(function () {
                        destroy_building("library", 50);
                        buildings["library"].free -= 50;
                        event_flags["wanderer_knowledge"] = "magic";
                        $("#events").addClass("hidden");
                    });
                }

                /* Alchemy! */
                if (buildings["s_manastone"].amount % 3 != 1) {
                    $("#events_content").append("<span class='clickable'>Become an Alchemist</span><i style='text: small'>Turning lead into gold is only a small part of the potential of alchemists.</i><br>");
                    $("#events_content span").last().click(function () {
                        destroy_building("library", 50);
                        buildings["library"].free -= 50;
                        event_flags["wanderer_knowledge"] = "alchemy";
                        $("#events").addClass("hidden");
                    });
                }

                /* Machines! */
                if (buildings["s_manastone"].amount % 3 != 2) {
                    $("#events_content").append("<span class='clickable'>Become an Inventor</span><i style='text: small'>Your machines will be the wonders of humanity.</i><br>");
                    $("#events_content span").last().click(function () {
                        destroy_building("library", 50);
                        buildings["library"].free -= 50;
                        event_flags["wanderer_knowledge"] = "inventor";
                        $("#events").addClass("hidden");
                    });
                }

            } else {
                $("#events_content").append("The traveler isn't interested. <br /><em>(You need over 50 libraries.)</em>")
            }
        },
        "name": "A Visit",
        "rejection": 80,
    }), /* End wanderer */

];

/* Literally only for testing purposes. */
function force_event(id: number) {
    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        if (id >= events.length) { throw "Error forcing event: No such event exists.";}
        let chosen_event = events[id];
        if (!chosen_event.condition()) {
            console.error("Warning: Prerequisites not satisfied!");
        }

        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}

function handle_event(set_timer: boolean = true) {
    /* Reset our handle_event timeout */
    if (set_timer) {
        let to_next_event = 2 * 60000 + Math.random() * 60000 * 2;
        if (purchased_upgrades.indexOf("more_events") != -1) {
            to_next_event *= .7;
        }
        if (time_on && purchased_upgrades.indexOf("time_use_boost") != -1) {
            to_next_event *= .5;
        }
        setTimeout(handle_event, to_next_event);
    }    
    /* Must have some mana to get events */
    if (buildings["s_manastone"].amount < 1) { return; }

    /* Only start a new event if the old one finished. */
    if ($("#events").hasClass("hidden")) {
        /* Check which events can even show up */
        let valid_events = [];
        events.forEach(function (e) {
            if (e.condition()) {
                valid_events.push(e);
            }
        });

        /* No possible events. How sad. */
        if (!valid_events.length) { return; }


        /* Choose random valid event */
        let chosen_event = valid_events[Math.floor(Math.random() * valid_events.length)];
        /* Keep choosing until we get an event that rolls true. This lets us make some events more likely than others */
        while (chosen_event.rejection > Math.random() * 100) { chosen_event = valid_events[Math.floor(Math.random() * valid_events.length)] }

        /* Set name */
        $("#events_topbar").html(chosen_event.name);
        /* Run event function */
        chosen_event.run_event();
        /* Only show our event box when we're done */
        $("#events").removeClass("hidden");
    }
}


/* Continuous events */
function setup_events() {
    /* Financial collapse. */
    setInterval(function () {
        if (event_flags["to_money_decrease"] == undefined) {
            event_flags["to_money_decrease"] = 60 * 15; /* 15 min to first loss. */
        }
        if (event_flags["crisis_averted"] == undefined) {
            event_flags["crisis_averted"] = false;
        }
        /* Appear at X50-X00 range */
        if (buildings["s_manastone"].amount >= 250 && buildings["s_manastone"].amount % 100 >= 50 && event_flags["bribed_politician"] == "money" && !event_flags["crisis_averted"]) {
            event_flags["to_money_decrease"]--;
            if (purchased_upgrades.indexOf("time_use_boost") != -1 && time_on) {
                event_flags["to_money_decrease"] -= 9; /* Decrease faster! */
            }
            /* Time for them to lose some. If it's the first loss, immediately break whatever they're doing (even adventuring) and tell them. */
            if (event_flags["to_money_decrease"] <= 0) {
                if (buildings["bank"].base_cost["money"] == 10) {
                    $("#events_topbar").html("Financial Collapse!");
                    $("#events_content").html("Oh no!<br />You're on the verge of total financial collapse!<br />Your banks and investment companies will slowly start producing less and costing less. This will continue until you fix it or prestige.<br />");
                    $("#events").removeClass("hidden");
                }
                /* Decrease it. Banks.*/
                let comp_state = buildings["bank"].on;
                if (comp_state) {
                    toggle_building_state("bank");
                }

                buildings["bank"]["generation"]["money"] *= 0.7;
                /* Yes, this happens. It gets small enough that rounding errors make it weird. */
                if (buildings["bank"].base_cost["money"] * 0.7 == buildings["bank"].base_cost["money"]) {
                    buildings["bank"].base_cost["money"] = 0;
                }

                if (comp_state) { /* Only turn on if it already was on */
                    toggle_building_state("bank");
                }
                buildings["bank"].base_cost["money"] *= 0.7;
                /* Decrease investment companies. */
                comp_state = buildings["big_bank"].on;
                if (comp_state) {
                    toggle_building_state("big_bank");
                }

                buildings["big_bank"]["generation"]["money"] *= 0.5;
                if (comp_state) { /* Only turn on if it already was on */
                    resources["manager"].amount = resources_per_sec["manager"];
                    toggle_building_state("big_bank");
                }
                buildings["big_bank"].base_cost["money"] *= 0.5;



                /* Decrease faster as we go on. */
                if (buildings["bank"].base_cost["money"] > 1) {
                    event_flags["to_money_decrease"] = 60 * 5;
                } else if (buildings["bank"].base_cost["money"] > 0.01) {
                    event_flags["to_money_decrease"] = 60 * 3;
                } else if (buildings["bank"].base_cost["money"] > 0.0001) {
                    event_flags["to_money_decrease"] = 60;
                } else if (buildings["bank"].base_cost["money"] > 0.00000001) {
                    event_flags["to_money_decrease"] = 30;
                } else if (buildings["bank"].base_cost["money"] > 0.00000000001) {
                    event_flags["to_money_decrease"] = 15;
                } else {
                    event_flags["to_money_decrease"] = 1; /* Every second! */
                }
            }
        }
    }, 1000);

    /* Environmental Collapse */
    let prev_division = 1;
    setInterval(function () {
        if (event_flags["to_oil_decrease"] == undefined) {
            event_flags["to_oil_decrease"] = 60 * 15; /* 15 min to first loss. */
            event_flags["sludge_level"] = 0;
        }
        if (event_flags["crisis_averted"] == undefined) {
            event_flags["crisis_averted"] = false;
        }
        /* Appear in X00-X50 range. */
        if (buildings["s_manastone"].amount >= 300 && buildings["s_manastone"].amount % 100 < 50 && event_flags["bribed_politician"] == "environment") {
            event_flags["to_oil_decrease"]--;
            if (purchased_upgrades.indexOf("time_use_boost") != -1 && time_on) {
                event_flags["to_oil_decrease"] -= 9; /* Decrease faster! */
            }
            /* Time for them to lose some. If it's the first loss, immediately break whatever they're doing (even adventuring) and tell them. */
            if (event_flags["to_oil_decrease"] <= 0) {
                if (event_flags["sludge_level"] == 0) {
                    $("#events_topbar").html("Environmental Disaster!");
                    $("#events_content").html("Oh no!<br />Your oil engines are generating some weird waste. <br />This really isn't good.<br />");
                    $("#events").removeClass("hidden");
                    event_flags["sludge_level"] = 1;
                    event_flags["to_oil_decrease"] = 60 * 10; /* 10 minutes to next loss. */
                } else if (event_flags["sludge_level"] < 10) {
                    event_flags["sludge_level"] += 1;
                    event_flags["to_oil_decrease"] = 60 * 5; /* 5 minutes to next loss. */
                } else if (event_flags["sludge_level"] < 20) {
                    event_flags["sludge_level"] += 1;
                    event_flags["to_oil_decrease"] = 60 * 3; /* 3 minutes to next loss. */
                }

                /* Increase/decrease sludge level based on oil stuff, then increase/decrease production modifiers based off of that. 
                        This means we'll need some arbitrary formulas.

                    Important points of sludge -> amt. / by:
                        Sludge    |   Division
                      ------------+------------
                                0 | 1
                              100 | 1.1 (+0.1)
                              200 | 1.3 (+0.2)
                              300 | 1.6 (+0.3)
                              400 | 2.0 (+0.4)
                    AKA 1 + ((s)(s + 1)/2)/10 where s is sludge/100.
                    So division increases quadratically with sludge

                    Sludge amount: Decrease exponentially, then get an amount added for every oil user.
                        So -5% + 3 * oil well + 15 * oil engine + 7 * ink refinery with each one being on making the -5% worse.
                */
                /* Undo previous */
                let sludge_increase = 0;

                /* Sludge increasers. The more on, the less natural reduction does. */
                if (buildings["oil_well"].on) {
                    sludge_increase += buildings["oil_well"].amount * 3 + Math.floor(event_flags["sludge_level"] * 0.01);
                }
                if (buildings["oil_engine"].on) {
                    sludge_increase += buildings["oil_engine"].amount * 15 + Math.floor(event_flags["sludge_level"] * 0.02);
                }
                if (buildings["ink_refinery"].on) {
                    sludge_increase += buildings["ink_refinery"].amount * 7 + Math.floor(event_flags["sludge_level"] * 0.01);
                }
                if (!event_flags["crisis_averted"] && event_flags["to_oil_decrease"] < 0) { /* Stop increase if crisis averted or still starting. */
                    event_flags["sludge_level"] += sludge_increase + 1;
                    event_flags["sludge_level"] = Math.floor(event_flags["sludge_level"] * 0.95); /* Natural sludge reduction. */
                }
                /* Reset if crisis fixed */
                if (event_flags["crisis_averted"]) {
                    event_flags["sludge_level"] = -1;
                }
                /* Calc new */
                let s = event_flags["sludge_level"] / 100;
                let new_division = 1 + (s * (s + 1) / 2) / 10;

                /* Set visible sludge. */
                resources_per_sec["sludge"] = event_flags["sludge_level"];

                /* Implement division factors. */
                Object.keys(resources).forEach(function (res) {
                    resources[res].mult *= prev_division / new_division;
                });
                prev_division = new_division;
            }
        }
    }, 1000);

    /* Potions */
    /* Clear this flag because it's used for /s gains which are lost on reset. */
    if (adventure_data["current_potion"] != undefined && adventure_data["current_potion"]["applied_effect"] != undefined) {
        delete adventure_data["current_potion"]["applied_effect"];
    }
    setInterval(function () {
        if (adventure_data["current_potion"]) {
            $("#potion").removeClass("hidden");
            $("#current_potion").html(adventure_data["current_potion"].name);
            $("#potion_time").html(format_num(adventure_data["current_potion"].time, false));
            $("#potion_effect").html(adventure_data["current_potion"].effect);
            /* Run the potion effect, decrement time left, remove buff if needed. */
            /* Note that we actually go to the item instead of the main ingredient. This makes it easier to add non-alchemy potions in the future. */
            gen_equipment(adventure_data["current_potion"].data).effect(adventure_data["current_potion"].power);
            adventure_data["current_potion"].time--;
            if (adventure_data["current_potion"].time <= 0) {
                gen_equipment(adventure_data["current_potion"].data).stop();
                delete adventure_data["current_potion"];
            }
        } else {
            $("#potion").addClass("hidden")
        }
    }, 1000);
}

/* Functions because putting all of this in an onclick is too much. */
function bribe_finance() {
    if (resources["money"].amount < 1000000) {
        return;
    }
    /* Pay bribe */
    resources["money"].amount -= 1000000;
    /* Boost banks */
    let build_state = buildings["bank"].on;
    if (build_state) {
        toggle_building_state("bank");
    }
    buildings["bank"].generation["money"] *= 50;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("bank");
    }

    /* Boost investments */
    build_state = buildings["big_bank"].on;
    if (build_state) {
        toggle_building_state("big_bank");
    }
    buildings["big_bank"].generation["money"] *= 10;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("big_bank");
    }

    /* Boost printers */
    build_state = buildings["money_printer"].on;
    if (build_state) {
        toggle_building_state("money_printer");
    }
    buildings["money_printer"].generation["money"] *= 3;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("money_printer");
    }
    event_flags["bribed_politician"] = "money";

    $("#events").addClass("hidden");
    add_log_elem("Removed all financial regulations.");
}

function bribe_environment() {
    if (resources["money"].amount < 1000000) {
        return;
    }
    /* Pay bribe */
    resources["money"].amount -= 1000000;

    /* Boost mines */
    let build_state = buildings["mine"].on;
    if (build_state) {
        toggle_building_state("mine");
    }
    buildings["mine"].generation["coal"] *= 10;
    buildings["mine"].generation["stone"] *= 10;
    buildings["mine"].generation["iron_ore"] *= 10;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("mine");
    }

    /* Boost logging */
    build_state = buildings["logging"].on;
    if (build_state) {
        toggle_building_state("logging");
    }
    buildings["logging"].generation["wood"] *= 25;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("logging");
    }

    /* Boost oil */
    build_state = buildings["oil_well"].on;
    if (build_state) {
        toggle_building_state("oil_well");
    }
    buildings["oil_well"].generation["oil"] *= 2;
    if (build_state) { /* Only turn on if it already was on */
        toggle_building_state("oil_well");
    }

    event_flags["bribed_politician"] = "environment";
    $("#events").addClass("hidden");
    add_log_elem("Removed all environmental regulations.");
}