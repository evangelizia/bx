/// name: Mazumi Story and Ninja
/// desc: Completes Mazumi's quests 90 to 92 and buys the Ninja class.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, mazumi, ninja, class, greenguard west

// Ported from refs/Scripts/Story/Mazumi.cs. The three quests advance slot 10
// through 1 to 3. Hit Job (92) is followed by the reference's class purchase:
// Ninja from Class Hall shop 178. The native buyName API resolves the class by
// its shop name, so this bot does not guess an item ID.

var CHAIN = [
    { id: 90, map: "pirates", spots: {
        435: { monster: "Fishman Soldier" } } },
    { id: 91, map: "greenguardwest", spots: {
        42651: { monster: "Kittarian" },
        42652: { monster: "River Fishman" },
        42653: { monster: "Slime" },
        42654: { monster: "Frogzard", cell: "West3", pad: "Up" },
        42655: { monster: "Big Bad Boar", cell: "West12", pad: "Up" } } },
    { id: 92, map: "greenguardwest", spots: {
        42649: { monster: "Breken the Vile" },
        42650: { monster: "Ogug Stoneaxe" } } }
];

function report(step, wants) {
    bot.memory.beats = (bot.memory.beats || 0) + 1;
    if (bot.memory.beats % 100 !== 0) return;

    var short = [];
    for (var i = 0; i < wants.length; i++) {
        if (wants[i].have < wants[i].need) {
            short.push(wants[i].id + " " + wants[i].have + "/" + wants[i].need);
        }
    }
    bot.log("mazumi-ninja: " + step.id +
        (short.length ? " wants " + short.join(", ") : " is ready and will not turn in"));
}

function fight(step, spot, short) {
    if (!bot.travel(step.map)) return;
    var cell = spot.cell;
    var pad = spot.pad;
    if (!cell) {
        var found = bot.roomMonster(spot.monster);
        if (found === null) {
            if (bot.memory.lost !== spot.monster) {
                bot.memory.lost = spot.monster;
                bot.log("mazumi-ninja: no " + spot.monster + " in this room");
            }
            return;
        }
        cell = found.cell;
        pad = found.pad;
    }
    if (!bot.moveToCell(cell, pad)) return;
    bot.kill(spot.monster, short);
}

function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants === null) return false;
    report(step, wants);
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        var spot = step.spots[want.id];
        if (spot === undefined) {
            bot.fail("quest " + step.id + " wants item " + want.id + ", which no step gives");
            return false;
        }
        fight(step, spot, want.need - want.have);
        return false;
    }
    return false;
}

for (var i = 0; i < CHAIN.length; i++) {
    var step = CHAIN[i];
    var done = bot.quest.done(step.id);
    if (done === null) return;
    if (done) continue;
    if (!work(step)) return;
}

var ninja = bot.item("Ninja");
if (ninja === null) return;
if (ninja > 0) {
    bot.log("mazumi-ninja: Ninja is already owned");
    return true;
}
if (!bot.travel("classhalla")) return;
if (!bot.buyName(178, "Ninja")) return;

bot.log("mazumi-ninja: Ninja class acquired");
return true;
