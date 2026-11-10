/// name: Join the Legion
/// desc: Farms 200 Combat Trophies, buys the Undead Warrior, runs quests 789-793, buys the Undead Champion and refunds the Warrior.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: legion, dage, undead warrior, undead champion, bludrutbrawl, combat trophy, quests, join

// Ported from refs/Scripts/Legion/CoreLegion.cs:707 (JoinLegion) and
// refs/Scripts/CoreFarms.cs:1078 (BludrutBrawlBoss).
//
// The armor is bought with AdventureCoins: the Undead Warrior costs 1200 AC
// and sells back for 1080, so a full join costs 120 AC net. The bot refuses
// the purchase when the balance is short and only sells the armor this run
// bought. The 24 hour refund window is the client's, not the bot's business.
//
// The brawl is a PvP map. The client refuses an ordinary cell walk there, so
// the room is crossed by walking to its edge and asking the server for the
// cell's event id. One run clears the three brawlers and the captain, waits
// for the trophies to land and be picked up, then leaves to battleon and
// joins a fresh room. A death drops the player back at the entrance, so the
// run starts over from there.
//
// Quest 792 hands in the 200 trophies, so they have to be in the bag before
// the chain reaches it. Quest 791's Ravaged Champion Soul is not temporary and
// stays in the bag after the turn-in.
//
// Beatrix has no class-swap or enhancement steps, so the solo class and the
// PvP amulet are left to the player.

var CHAIN = 31;

var TROPHY = 4889;
var TROPHY_NAME = "Combat Trophy";
var TROPHY_NEED = 200;

var WARRIOR = 1770;
var WARRIOR_SHOP = 215;
var WARRIOR_PRICE = 1200;
var CHAMPION = 5518;
var CHAMPION_SHOP = 216;
var UNDERWORLD = "underworld";

var BRAWL = "bludrutbrawl-999999";
var HOME = "battleon";

// A cleared room still pays out: the trophies land on the floor a moment
// after each kill and the bag only moves once the pickup is accepted. These
// are tick counts, so the bag has to sit still for a few seconds before the
// room is called done.
var BRAWL_WAIT = 250;
var BRAWL_SETTLE = 40;
var BRAWL_QUIET = 20;

// mtcid, destination cell, and the point to stand on before asking for it.
// The points are the middles of the walk ranges CoreFarms uses.
var ROUTE = [
    { id: 5, cell: "Morale0C", x: 820, y: 264 },
    { id: 4, cell: "Morale0B", x: 818, y: 274 },
    { id: 7, cell: "Morale0A", x: 820, y: 278 },
    { id: 9, cell: "Crosslower", x: 817, y: 272 },
    { id: 15, cell: "Morale1A", x: 819, y: 274, fight: true },
    { id: 23, cell: "Morale1B", x: 816, y: 267, fight: true },
    { id: 25, cell: "Morale1C", x: 833, y: 275, fight: true },
    { id: 28, cell: "Captain1", x: 483, y: 254, fight: true }
];

// The four slain counters of Mourn the Soldiers, and where each is found.
var MOURN = [
    { item: 5544, map: "dwarfhold", monster: "Chaos Drow" },
    { item: 5542, map: "swordhavenundead", monster: "Skeletal Soldier" },
    { item: 5545, map: "pirates", monster: "Fishman Soldier" },
    { item: 5546, map: "willowcreek", monster: "Dwakel Soldier" }
];

function wantFor(id, item) {
    var wants = bot.quest.wants(id);
    if (wants == null) return null;
    for (var i = 0; i < wants.length; i++) {
        if (Number(wants[i].id) === Number(item)) return wants[i];
    }
    return null;
}

// Walk to the monster's own cell, then let combat name it. The room watch
// answers a tick late, and a monster that has not respawned yet keeps the
// step waiting rather than fighting something else.
function hunt(map, monster, count) {
    if (!bot.travel(map)) return false;
    var m = bot.roomMonster(monster);
    if (m == null) return false;
    if (m.cell && !bot.moveToCell(m.cell, m.pad)) return false;
    return bot.kill(monster, count);
}

function brawl() {
    var mem = bot.memory;
    var run = mem.brawl;
    if (run == null) {
        run = mem.brawl = { step: 0, before: null, seen: 0, stable: 0, quiet: 0, waited: 0 };
    }

    if (!bot.travel(BRAWL, "Enter0", "Spawn")) return false;

    // The entrance is where a fresh join and a respawn both land. Once the
    // route has started, seeing it again means the run was cut short, so walk
    // from the first brawler instead of skipping ahead. Never leave the room
    // for this: the client's own death state is not reliable on map load, and
    // reacting to it by joining another map turns the farm into a ping-pong.
    if (run.step > 0 && bot.cell === "Enter0") {
        bot.stopCombat();
        run.step = 0;
        run.before = null;
        run.waited = 0;
        run.stable = 0;
        run.quiet = 0;
        return false;
    }

    // The bag count at the start of the room is the only honest baseline for
    // "did this run pay out". `pickDrop` answers true when there is nothing
    // left to pick, which is also true before the first trophy has landed.
    if (run.before == null) {
        run.before = bot.item(TROPHY);
        if (run.before == null) return false;
        run.seen = run.before;
    }

    if (run.step < ROUTE.length) {
        var r = ROUTE[run.step];
        if (!bot.pvpMove(r.id, r.cell, r.x, r.y)) return false;
        if (r.fight && !bot.kill("", 1)) return false;
        run.step++;
        return false;
    }

    // The room is clear. Keep picking until the trophies stop arriving, then
    // leave. The reference does the same: it waits for the drop, the pickup,
    // and then the server's own inventory update before it counts the run.
    run.waited++;
    var have = bot.item(TROPHY);
    if (have == null) return false;
    if (have > run.before) {
        if (have !== run.seen) {
            run.seen = have;
            run.stable = 0;
        } else {
            run.stable++;
        }
        if (bot.pickDrop(TROPHY_NAME)) {
            run.quiet++;
        } else {
            run.quiet = 0;
        }
        if (run.stable >= BRAWL_SETTLE && run.quiet >= BRAWL_QUIET) {
            if (!bot.travel(HOME)) return false;
            mem.brawl = null;
            return true;
        }
        return false;
    }

    if (run.waited > BRAWL_WAIT) {
        bot.log("join-legion: the room cleared without a Combat Trophy, joining a new one");
        if (!bot.travel(HOME)) return false;
        mem.brawl = null;
        return false;
    }
    bot.pickDrop(TROPHY_NAME);
    return false;
}

function quest789() {
    if (!bot.quest.active(789) && !bot.quest.accept(789)) return false;
    if (bot.quest.ready(789)) return bot.quest.turnIn(789);
    var want = wantFor(789, 5541); // Black Knight's Eternal Contract
    if (want == null || want.have >= want.need) return false;
    return hunt("greenguardwest", "Black Knight", want.need - want.have);
}

function quest790() {
    if (!bot.quest.active(790) && !bot.quest.accept(790)) return false;
    if (bot.quest.ready(790)) return bot.quest.turnIn(790);
    for (var i = 0; i < MOURN.length; i++) {
        var want = wantFor(790, MOURN[i].item);
        if (want == null) return false;
        if (want.have < want.need) {
            return hunt(MOURN[i].map, MOURN[i].monster, want.need - want.have);
        }
    }
    return false;
}

function quest791() {
    if (!bot.quest.active(791) && !bot.quest.accept(791)) return false;
    if (bot.quest.ready(791)) return bot.quest.turnIn(791);
    var want = wantFor(791, 5547); // Ravaged Champion Soul
    if (want == null || want.have >= want.need) return false;
    return hunt("battleunderb", "Undead Champion", want.need - want.have);
}

function quest792() {
    if (!bot.quest.active(792) && !bot.quest.accept(792)) return false;
    return bot.quest.ready(792) ? bot.quest.turnIn(792) : false;
}

function quest793() {
    if (!bot.quest.active(793) && !bot.quest.accept(793)) return false;
    if (bot.quest.ready(793)) return bot.quest.turnIn(793);
    var want = wantFor(793, 5548); // King's Guard Slain
    if (want == null || want.have >= want.need) return false;
    return hunt("prison", "King Alteon's Knight", want.need - want.have);
}

function buyWarrior() {
    var ac = bot.ac;
    if (ac == null) return false;
    if (ac < WARRIOR_PRICE) {
        bot.fail("Undead Warrior costs " + WARRIOR_PRICE + " AC and the character holds " + ac);
        return false;
    }
    if (!bot.travel(UNDERWORLD)) return false;
    if (!bot.buy(WARRIOR_SHOP, WARRIOR)) return false;
    bot.memory.bought = true;
    bot.log("join-legion: bought Undead Warrior");
    return true;
}

function finishJoin() {
    var champion = bot.item(CHAMPION);
    if (champion == null) return false;

    if (champion <= 0) {
        if (!bot.travel(UNDERWORLD)) return false;
        if (!bot.buy(CHAMPION_SHOP, CHAMPION)) return false;
        bot.log("join-legion: bought Undead Champion");
        return false;
    }

    var warrior = bot.item(WARRIOR);
    if (warrior == null) return false;
    if (warrior > 0) {
        // Wear the champion before the warrior leaves the bag, so the
        // character is never left without armor.
        if (!bot.equip(CHAMPION)) return false;
        if (!bot.memory.bought) {
            bot.log("join-legion: Undead Warrior was here before the run, leaving it");
            return true;
        }
        if (!bot.sell(WARRIOR, warrior)) return false;
        bot.log("join-legion: sold Undead Warrior back");
        return false;
    }

    bot.log("join-legion: joined the Legion");
    return true;
}

// Chain slot 31 counts the quests: 1 through 5 in order.
var chain = bot.quest.value(CHAIN);
if (chain == null) return;

if (chain >= 5) {
    finishJoin();
    return;
}

var warrior = bot.item(WARRIOR);
if (warrior == null) return;

if (warrior <= 0) {
    // Trophies first, then the 1200 AC purchase.
    var trophies = bot.item(TROPHY);
    if (trophies == null) return;
    if (trophies < TROPHY_NEED) {
        brawl();
        return;
    }
    buyWarrior();
    return;
}

// The armor is on. 200 trophies must be in the bag before 792 can be handed
// in, and 792 sits at the end of the chain.
var have = bot.item(TROPHY);
if (have == null) return;
if (chain < 4 && have < TROPHY_NEED) {
    brawl();
    return;
}

if (chain < 1) {
    quest789();
    return;
}
if (chain < 2) {
    quest790();
    return;
}
if (chain < 3) {
    quest791();
    return;
}
if (chain < 4) {
    quest792();
    return;
}
quest793();
