/// name: Forge Weapon Enhancement
/// desc: Unlocks the Forge weapon enhancement by farming the four Chaos Lord helms.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, weapon, escherion, vath, kitsune, wolfwing, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:542. Beatrix
// has no experience, reputation-boost or class-swap steps, so the level, the
// reputation and the four story runs are checked here rather than shared.
//
// Every helm is one boss drop and the drops are not guaranteed, so the loop
// picks up whatever is waiting, kills once and reads the bag again.

var QUEST = 8738;
var SLOT = 21;
var USES = 26;
var DONE = 27;
var LEVEL = 30;
var REP = 10000;

var HELMS = [
    { id: 1173, go: escherion },
    { id: 1763, go: vath },
    { id: 2242, go: kitsune },
    { id: 4853, go: wolfwing }
];

function escherion() {
    if (!bot.travel("escherion")) return;
    if (!bot.moveToCell("Boss", "Left")) return;
    var staff = bot.roomMonster("Staff of Inversion");
    if (staff !== null && staff.alive) {
        bot.kill("Staff of Inversion", 1);
        return;
    }
    bot.kill("Escherion", 1);
}

function vath() {
    if (!bot.travel("stalagbite")) return;
    if (!bot.moveToCell("r2", "Left")) return;
    var guard = bot.roomMonster("Stalagbite");
    if (guard !== null && guard.alive) {
        bot.kill("Stalagbite", 1);
        return;
    }
    bot.kill("Vath", 1);
}

function kitsune() {
    if (!bot.travel("kitsune")) return;
    if (!bot.moveToCell("Boss", "Left")) return;
    var fox = bot.roomMonster("Kitsune");
    if (fox !== null && fox.aura("Shapeshifted")) {
        bot.stopCombat();
        return;
    }
    bot.kill("Kitsune", 1);
}

function wolfwing() {
    if (!bot.travel("wolfwing")) return;
    var m = bot.roomMonster("Wolfwing");
    if (m === null) return;
    if (!bot.moveToCell(m.cell, m.pad)) return;
    bot.kill("Wolfwing", 1);
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Forge Weapon needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-weapon: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Escherion story (272) must be finished first");
    return;
}

var story = bot.quest.value(22);
if (story === null) return;
if (story < 35) {
    bot.fail("Vath story (363) must be finished first");
    return;
}

story = bot.quest.value(25);
if (story === null) return;
if (story < 22) {
    bot.fail("Kitsune story (488) must be finished first");
    return;
}

story = bot.quest.value(26);
if (story === null) return;
if (story < 23) {
    bot.fail("Wolfwing story (597 or 598) must be finished first");
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

for (var i = 0; i < HELMS.length; i++) {
    var have = bot.item(HELMS[i].id);
    if (have === null) return;
    if (have >= 1) continue;
    if (!bot.pickDrop()) return;
    HELMS[i].go();
    return;
}
