/// name: Dark Ally Story
/// desc: Completes the /darkally chapter of Shadows of War, quests 7419 to 7428, ending with the Underfiend.
/// once: true
/// timeout: 0
/// version: 1.1
/// author: beatrix
/// tags: story, quest, shadows of war, dark ally, darkally, underfiend, dage, yami no ronin

// Ported from refs/Scripts/Story/ShadowsOfWar/CoreSoW.cs:637 (DarkAlly).
//
// Ten quests, each writing the next value of slot 347, which is the gate the
// /darkalliance chapter and the Yami no Ronin farm ask for. The client only
// lets a quest be taken once the slot holds the value before it, so the chain
// is walked in order and a quest the slot has passed is skipped.
//
// Every requirement is a temporary item the server adds on the kill or the
// click, so there is nothing to pick up: the count is read back out of the
// quest itself.
//
// The reference pins r2/Left for three monsters and scans the map for the
// rest, so a loose one is found through the room watch, which reports the cell
// it stands in. Beatrix has no class swap, so the fight class, and the
// Underfiend, are the player's business.

var MAP = "darkally";

// One row per quest. A spot is a map item to click or a monster to kill, keyed
// by the item it pays for.
var CHAIN = [
    { id: 7419, spots: {
        53850: { item: 7179 },
        53849: { monster: "Shadow", cell: "r2", pad: "Left" } } },
    { id: 7420, spots: {
        53852: { monster: "Underworld Golem" },
        53851: { monster: "Underworld Golem" } } },
    { id: 7421, spots: {
        53853: { item: 7180 },
        53854: { item: 7181 } } },
    { id: 7422, spots: {
        53855: { monster: "Dark Makai", cell: "r2", pad: "Left" } } },
    { id: 7423, spots: {
        53856: { monster: "Shredded Shadow", cell: "r2", pad: "Left" } } },
    { id: 7424, spots: {
        53857: { monster: "Legion Defector" },
        53858: { monster: "Legion Defector" } } },
    { id: 7425, spots: { 53859: { monster: "Frozen Pyromancer" } } },
    { id: 7426, spots: { 53860: { monster: "Underworld Golem" } } },
    { id: 7427, spots: { 53861: { item: 7182 } } },
    { id: 7428, spots: { 53862: { monster: "Underfiend" } } }
];

// One map item. The step counts the bag, so the number asked for is the
// quest's own, not the shortfall.
function gather(spot, want) {
    if (!bot.travel(MAP)) return;
    bot.mapItem(spot.item, want.need, want.id);
}

// One kill run, short of the count by whatever the last run paid. A cell in
// the table is the reference's own; a monster with none is found through the
// room watch, which reports the cell it stands in.
function fight(spot, short) {
    if (!bot.travel(MAP)) return;
    var cell = spot.cell;
    var pad = spot.pad;
    if (!cell) {
        var found = bot.roomMonster(spot.monster);
        if (found === null) {
            if (bot.memory.lost !== spot.monster) {
                bot.memory.lost = spot.monster;
                bot.log("dark-ally: no " + spot.monster + " in this room");
            }
            return;
        }
        cell = found.cell;
        pad = found.pad;
    }
    if (!bot.moveToCell(cell, pad)) return;
    bot.kill(spot.monster, short);
}

// One quest: handed in when the client offers it, taken when it is not being
// carried, and worked one unmet requirement at a time. True only once the
// turn-in has landed, which is when the chain may move on.
function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        var spot = step.spots[want.id];
        if (spot === undefined) {
            bot.fail("quest " + step.id + " wants item " + want.id + ", which no step gives");
            return false;
        }
        if (spot.item !== undefined) gather(spot, want);
        else fight(spot, want.need - want.have);
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

bot.log("dark-ally: the Underfiend is down");
return true;
