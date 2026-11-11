/// name: Nulgath's Roulette of Misfortune
/// desc: Loops quest 2566 until stopped: Mana Energy from the Mana Golem, Charged Mana Energy from the Mana Falcon, then the hand-in.
/// once: false
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: nulgath, nation, larvae, roulette, misfortune, farm, quests, elemental

// Ported from refs/Scripts/Nation/CoreNation.cs:893, NulgathsRouletteofMisfortune.
// The C# farms ten Mana Energy and then spends one per hand-in; the bot has no
// goal and no batch, so it reads what the quest is short of and fights that
// monster. The definition and the bag counts say which item is missing, and
// the tracker says when to hand in, so nothing is counted by hand.
//
// Quest 2566 asks for one Mana Energy for Nulgath (permanent, so it counts
// from the bag) and five Charged Mana Energy for Nulgath (temporary, so it
// only exists while the quest is active). The golem and the falcon sit in
// different cells of /elemental, and the reference walks r5 and r3 to them.

var QUEST = 2566;
var MAP = "elemental";
var PET = "Nulgath Larvae";
var MANA = 6135; // Mana Energy for Nulgath.
var MANA_NAME = "Mana Energy for Nulgath";
var CHARGED = 15385; // Charged Mana Energy for Nulgath.

// Mana comes first: it is the item the falcon legs spend, and the reference
// keeps a stack of it before turning the wheel.
var SPOTS = [
    { id: MANA, monster: "Mana Golem", cell: "r5", pad: "Left" },
    { id: CHARGED, monster: "Mana Falcon", cell: "r3", pad: "Left" }
];

function wantOf(wants, id) {
    for (var i = 0; i < wants.length; i++) {
        if (wants[i].id === id) return wants[i];
    }
    return null;
}

var larvae = bot.item(PET);
if (larvae === null) return;
if (larvae < 1) {
    bot.fail("quest 2566 is offered by the Nulgath Larvae pet; run the Hire Nulgath Larvae bot first");
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

// The hand-in before another kill: a ready quest is a finished pass.
if (bot.quest.ready(QUEST)) {
    if (!bot.quest.turnIn(QUEST)) return;
    var done = (bot.memory.turnedIn || 0) + 1;
    bot.memory.turnedIn = done;
    bot.log("roulette: turn-in " + done);
    return true;
}

var wants = bot.quest.wants(QUEST);
if (wants == null) return;

// Drain a Mana Energy the last golem left on the floor. The call is free when
// nothing is waiting, and the bag count is not fresh until the pickup lands.
if (!bot.pickDrop(MANA_NAME)) return;

for (var i = 0; i < SPOTS.length; i++) {
    var spot = SPOTS[i];
    var want = wantOf(wants, spot.id);
    if (want == null || want.have >= want.need) continue;

    if (!bot.travel(MAP)) return;
    if (!bot.moveToCell(spot.cell, spot.pad)) return;
    bot.kill(spot.monster, want.need - want.have);
    return;
}
