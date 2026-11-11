/// name: Forge Cape: Penitence
/// desc: Unlocks Penitence: the Night Mare Scythe and three Legion boss drops.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, penitence, doomvault, frozenlair, icewing, underlair, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1232.
// Avarice writes slot 468 value 3 and this quest writes 4, so one read
// covers the prerequisite and the unlock.
//
// The scythe is a repeatable quest reward from Yulgar's lost one, so that
// loop turns the quest in until the reward finally lands. The other three
// pieces are ordinary drops, picked up one kill at a time.

var QUEST = 8822;
var SLOT = 468;
var USES = 3;
var DONE = 4;
var LEVEL = 90;
var REP = 202500;

var SCYTHE = 21743;
var ORB = 46078;
var BARDICHE = 46326;
var SCALE = 49891;
var YULGAR = 3270;
var LOST = { map: "doomvault", cell: "r5", pad: "Left", monster: "Binky" };

function drop(id, need, where) {
    var have = bot.item(id);
    if (have === null) return false;
    if (have >= need) return true;
    if (!bot.pickDrop()) return false;
    if (!bot.travel(where.map)) return false;
    var m = bot.roomMonster(where.monster);
    if (m === null) return false;
    if (!bot.moveToCell(m.cell, m.pad)) return false;
    bot.kill(where.monster, 1);
    return false;
}

function scythe() {
    var have = bot.item(SCYTHE);
    if (have === null) return false;
    if (have >= 1) return true;
    if (!bot.quest.active(YULGAR)) {
        bot.quest.accept(YULGAR);
        return false;
    }
    if (bot.quest.ready(YULGAR)) {
        bot.quest.turnIn(YULGAR);
        return false;
    }
    var wants = bot.quest.wants(YULGAR);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have >= want.need) return false;
    if (!bot.pickDrop()) return false;
    if (!bot.travel(LOST.map)) return false;
    if (!bot.moveToCell(LOST.cell, LOST.pad)) return false;
    bot.kill(LOST.monster, 1);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Penitence needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-penitence: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Avarice (8745) must be finished first; run forge-avarice");
    return;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 9 (" + REP + ") needed; run forge-rep");
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

if (!scythe()) return;
if (!drop(ORB, 100, { map: "frozenlair", monster: "Legion Lich Lord" })) return;
if (!drop(BARDICHE, 1, { map: "icewing", monster: "Warlord Icewing" })) return;
drop(SCALE, 13, { map: "underlair", monster: "ArchFiend DragonLord" });
