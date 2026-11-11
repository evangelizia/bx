/// name: Forge Reputation
/// desc: Farms Blacksmithing reputation to rank 10, the highest gate the forge enhancement quests ask for.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: blacksmithing, reputation, forge, enhancement, quests, greenguard, hydrachallenge

// Ported from refs/Scripts/CoreFarms.cs:2079 (BlacksmithingREP), non-gold
// path. Beatrix has no reputation boost step, so this is the plain grind.
//
// Quest 2777 carries the first four ranks and 8736 the rest, the same split
// CoreFarms uses. 2777's socks are temporary, so the tracker is the only
// progress there is and the legs are remembered per turn-in. 8736's pieces
// are permanent, so the bag gives the shortfall.
//
// The target is rank 10, the highest gate any forge quest asks for, so one
// run covers every enhancement.

var RANK4 = 10000;
var RANK10 = 302500;

var SOCKS = 2777;
var MACHINING = 8736;

var FEET = [
    { map: "greenguardeast", monster: "Wolf", count: 2 },
    { map: "greenguardwest", monster: "Slime", count: 5 }
];

var PARTS = {
    43797: { map: "hydrachallenge", monster: "Hydra Head 25" },
    7990: { map: "maul", monster: "Creature Creation" },
    23690: { map: "towerofdoom", monster: "Dread Klunk" }
};

function hunt(where, count) {
    if (!bot.travel(where.map)) return false;
    if (where.cell) {
        if (!bot.moveToCell(where.cell, where.pad)) return false;
    } else {
        var m = bot.roomMonster(where.monster);
        if (m === null) return false;
        if (!bot.moveToCell(m.cell, m.pad)) return false;
    }
    return bot.kill(where.monster, count);
}

function socks() {
    if (!bot.quest.active(SOCKS)) {
        bot.quest.accept(SOCKS);
        bot.memory.sockLeg = 0;
        return;
    }
    if (bot.quest.ready(SOCKS)) {
        bot.quest.turnIn(SOCKS);
        bot.memory.sockLeg = 0;
        return;
    }

    var at = bot.memory.sockLeg || 0;
    if (at >= FEET.length) return;
    if (!hunt(FEET[at], FEET[at].count)) return;
    bot.memory.sockLeg = at + 1;
}

function machining() {
    if (!bot.quest.active(MACHINING)) {
        bot.quest.accept(MACHINING);
        return;
    }
    if (bot.quest.ready(MACHINING)) {
        bot.quest.turnIn(MACHINING);
        return;
    }

    var wants = bot.quest.wants(MACHINING);
    if (wants === null) return;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;
        var part = PARTS[want.id];
        if (part === undefined) {
            bot.fail("Monster Machining wants item " + want.id + ", which no step gives");
            return;
        }
        if (!bot.pickDrop()) return;
        hunt(part, want.need - want.have);
        return;
    }
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;

if (bot.memory.rank !== rep.rank) {
    bot.memory.rank = rep.rank;
    bot.log("forge-rep: rank " + rep.rank + " (" + rep.rep + ")");
}

if (rep.rep >= RANK10) {
    bot.log("forge-rep: Blacksmithing is rank 10");
    return true;
}

if (rep.rep < RANK4) {
    socks();
    return;
}

machining();
