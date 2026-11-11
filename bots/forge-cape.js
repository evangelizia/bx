/// name: Forge Cape Enhancement
/// desc: Unlocks the Forge cape enhancement by farming four pairs of wings.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, lostruins, infernalspire, kitsune, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1101. The
// cape quest shares slot 25 with the Kitsune story, so one read covers both
// the prerequisite (value 22) and the unlock (value 23).
//
// The wings are ordinary boss drops, not guaranteed, so every pass picks up
// what is waiting and kills once.

var QUEST = 8758;
var SLOT = 25;
var USES = 22;
var DONE = 23;
var LEVEL = 30;
var REP = 10000;

var WINGS = [
    { id: 31040, map: "lostruinswar", monster: "Diabolical Warlord" },
    { id: 31044, map: "lostruins", monster: "Infernal Warlord" },
    { id: 36468, map: "infernalspire", monster: "Azkorath" },
    { id: 36473, map: "infernalspire", monster: "Malxas" }
];

function hunt(where) {
    if (!bot.travel(where.map)) return false;
    var m = bot.roomMonster(where.monster);
    if (m === null) return false;
    if (!bot.moveToCell(m.cell, m.pad)) return false;
    bot.kill(where.monster, 1);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Forge Cape needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-cape: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Kitsune story (488) must be finished first");
    return;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 4 (" + REP + ") needed; run forge-rep");
    return;
}

if (!bot.quest.active(QUEST)) {
    bot.quest.accept(QUEST);
    return;
}

if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
    return;
}

for (var i = 0; i < WINGS.length; i++) {
    var have = bot.item(WINGS[i].id);
    if (have === null) return;
    if (have >= 1) continue;
    if (!bot.pickDrop()) return;
    if (!hunt(WINGS[i])) return;
    return;
}
