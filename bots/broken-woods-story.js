/// name: Broken Woods Story
/// desc: Completes the Queen of Monsters story segment from Time for a Dose through Smash the Hive (quests 5866-5873).
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, broken woods, brokenwoods, queen of monsters, qom

// Ported from refs/Scripts/Story/QueenofMonsters/CoreQOM.cs. The preceding
// Queen of Monsters quests are not included; quest slot 238 must have reached
// value 16 before this segment can start. The source's two Broken Woods map
// items are collected by their quest item IDs so either requirement can be
// resumed independently.

var CHAIN_SLOT = 238;
var FIRST_VALUE = 17;
var LAST_VALUE = 24;

var STEPS = [
    { id: 5866, value: 17, items: {
        40194: { map: "brokenwoods", monster: "Urstrix" },
        40195: { map: "brokenwoods", monster: "SpiderWing" }
    } },
    { id: 5867, value: 18, items: {
        40196: { map: "pines", monster: "LeatherWing" },
        40197: { map: "brokenwoods", monster: "SpiderWing" },
        40198: { map: "brokenwoods", monster: "Urstrix" },
        40199: { map: "brightoak", monster: "Hootbear" }
    } },
    { id: 5868, value: 19, items: {
        40200: { map: "brokenwoods", mapItem: 5296 },
        40201: { map: "brokenwoods", mapItem: 5297 },
        40202: { map: "brokenwoods", monster: "Fungal Lord" }
    } },
    { id: 5869, value: 20, items: {
        40203: { map: "brokenwoods", monster: "Extrikiti" }
    } },
    { id: 5870, value: 21, items: {
        40204: { map: "brokenwoods", monster: "Urstrix" },
        40205: { map: "brokenwoods", monster: "SpiderWing" }
    } },
    { id: 5871, value: 22, items: {
        40206: { map: "charredpath", monster: "Ravenous Parasite" },
        40207: { map: "charredpath", monster: "Plague Spreader" }
    } },
    { id: 5872, value: 23, items: {
        40208: { map: "arcangrove", monster: "Seed Spitter" },
        40209: { map: "poisonforest", monster: "Treeant" },
        1749: { map: "embersea", shop: 1100 }
    } },
    { id: 5873, value: 24, items: {
        40210: { map: "brokenwoods", monster: "Hive" }
    } }
];

function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short <= 0) continue;

        var source = step.items[want.id];
        if (source === undefined) {
            bot.fail("quest " + step.id + " wants item " + want.id + ", which no step gives");
            return false;
        }
        if (!bot.travel(source.map)) return false;
        if (source.mapItem !== undefined) {
            bot.mapItem(source.mapItem, short, want.id);
            return false;
        }
        if (source.shop !== undefined) {
            bot.buy(source.shop, want.id, short);
            return false;
        }

        var monster = bot.roomMonster(source.monster);
        if (monster == null) return false;
        if (monster.cell && !bot.moveToCell(monster.cell, monster.pad)) return false;
        bot.kill(source.monster, short);
        return false;
    }

    return bot.quest.ready(step.id) ? bot.quest.turnIn(step.id) : false;
}

var progress = bot.quest.value(CHAIN_SLOT);
if (progress == null) return;
if (progress < FIRST_VALUE) {
    bot.fail("Broken Woods story needs the Queen of Monsters quest chain at slot 238 value 16 first");
    return;
}

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    if (progress >= step.value) continue;
    if (!work(step)) return;
    return;
}

if (progress < LAST_VALUE) return;
bot.log("broken-woods-story: completed quests 5866-5873");
return true;
