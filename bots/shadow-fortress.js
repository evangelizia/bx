/// name: Shadow Fortress Story
/// desc: Completes the /shadowfortress chapter of the Yokai saga, quests 6485 to 6494, ending with Jaaku.
/// once: true
/// timeout: 0
/// version: 1.2
/// author: beatrix
/// tags: story, quest, yokai, shadow fortress, shadowfortress, orochi, jaaku, yami no ronin

// Ported from refs/Scripts/Story/Yokai.cs:297, the shadowfortress half of the
// Yokai saga.
//
// Ten quests, each writing the next value of slot 278, which is the gate the
// Yami no Ronin farm and the Praxis unlock ask for. The client only lets a
// quest be taken once the slot holds the value before it, so the chain is
// walked in order and a quest the slot has passed is skipped.
//
//   6485  Calm the Spirits      eight Restless Spirits
//   6486  Disarm the Samurai    eight Shadow Samurai
//   6487  Find the Throne Room  map item 5973
//   6488  Shadow Essences       seven off Living Shadows, map item 5974
//   6489  New Recruits          eight Shadow Samurai
//   6490  Shadow Heads          seven off Creeping Shadows, map item 5975 x7
//   6491  A Head has Woken      the 7th Head of Orochi
//   6492  Get to the Roof       map items 5976 and 5979
//   6493  Find Jaaku!           the 6th head down to the 1st, map item 5977
//   6494  Defeat Jaaku!         Jaaku
//
// Every requirement is a temporary item the server adds on the kill or the
// click, so there is nothing to pick up: the count is read back out of the
// quest itself.
//
// The reference names no cell for any of these, so a monster is found through
// the room watch, which reports the cell it stands in. The six heads of 6493
// and Jaaku carry r12 as a fallback, since that is the cell the Orochi scales
// farm kills in and the watch only reports what the room has loaded.
//
// What the reference leaves unsaid, and this bot with it. Slot 278 value 10 is
// written by 6494, but also by the repeatable Orochi quest 7924, which only
// asks for value 9: a character that farmed scales first reads as finished
// here with Jaaku still standing. 6494 is taken by monster map id 31 in the
// reference, which Beatrix cannot ask for, so if a room holds two Jaaku this
// kills whichever the cell lists first. And 6492 wants two map items without
// saying which pays which, so both are clicked and the client's own ready
// answer ends it.
//
// Beatrix has no class swap, so the fight class, and the two bosses, are the
// player's business.

var MAP = "shadowfortress";

// 6492 asks for two map items and the reference clicks both without saying
// which pays which, so both are clicked and the client's own ready answer
// decides when the quest is done.
var ROOF = [5976, 5979];

// One row per quest. A spot is a map item to click or a monster to kill, keyed
// by the item it pays for. A cell on the row is where to fight when the room
// watch comes back empty: r12 is the roof the Orochi scales farm kills on.
var CHAIN = [
    { id: 6485, spots: { 44777: { monster: "Restless Spirit" } } },
    { id: 6486, spots: { 44778: { monster: "Shadow Samurai" } } },
    { id: 6487, spots: { 44779: { item: 5973 } } },
    { id: 6488, spots: {
        44780: { monster: "Living Shadow" },
        44781: { item: 5974 } } },
    { id: 6489, spots: { 44782: { monster: "Shadow Samurai" } } },
    { id: 6490, spots: {
        44784: { monster: "Creeping Shadow" },
        44783: { item: 5975 } } },
    { id: 6491, spots: { 44785: { monster: "7th Head of Orochi" } } },
    { id: 6492, spots: {
        44786: { items: ROOF },
        44796: { items: ROOF } } },
    { id: 6493, cell: "r12", pad: "Top", spots: {
        44787: { monster: "6th Head of Orochi" },
        44788: { monster: "5th Head of Orochi" },
        44789: { monster: "4th Head of Orochi" },
        44790: { monster: "3rd Head of Orochi" },
        44791: { monster: "2nd Head of Orochi" },
        44792: { monster: "1st Head of Orochi" },
        44793: { item: 5977 } } },
    { id: 6494, cell: "r12", pad: "Top", spots: {
        44794: { monster: "Jaaku" } } }
];

// One map item, counted by the tracker item it pays - or, when the pairing is
// unknown, every click the quest asks for, counted by the quest being ready.
function gather(spot, want) {
    if (!bot.travel(MAP)) return;
    if (spot.items) {
        for (var i = 0; i < spot.items.length; i++) bot.mapItem(spot.items[i], 1, 0);
        return;
    }
    bot.mapItem(spot.item, want.need, want.id);
}

// One kill run, short of the count by whatever the last run paid. The room
// watch reports the cell a monster stands in; the row's cell is where to look
// when the watch comes back empty.
function fight(step, spot, short) {
    if (!bot.travel(MAP)) return;
    var found = bot.roomMonster(spot.monster);
    var cell = found === null ? step.cell : found.cell;
    var pad = found === null ? step.pad : found.pad;
    if (!cell) {
        if (bot.memory.lost !== spot.monster) {
            bot.memory.lost = spot.monster;
            bot.log("shadow-fortress: no " + spot.monster + " in this room");
        }
        return;
    }
    if (!bot.moveToCell(cell, pad)) return;
    bot.kill(spot.monster, short);
}

// Say what a quest still wants every hundred ticks - ten seconds - so a step
// that is not landing shows up in the log instead of clicking quietly forever.
function report(step, wants) {
    bot.memory.beats = (bot.memory.beats || 0) + 1;
    if (bot.memory.beats % 100 !== 0) return;

    var short = [];
    for (var i = 0; i < wants.length; i++) {
        if (wants[i].have < wants[i].need) {
            short.push(wants[i].id + " " + wants[i].have + "/" + wants[i].need);
        }
    }
    bot.log("shadow-fortress: " + step.id +
        (short.length ? " wants " + short.join(", ") : " is ready and will not turn in"));
}

// One quest: handed in when the client offers it, taken when it is not being
// carried, and worked one unmet requirement at a time. True only once the
// turn-in has landed, which is when the chain may move on.
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
        if (spot.monster === undefined) gather(spot, want);
        else fight(step, spot, want.need - want.have);
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

bot.log("shadow-fortress: Jaaku is down");
return true;
