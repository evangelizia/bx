/// name: Forge Weapon: Smite
/// desc: Unlocks Smite: the Sepulchure saga tail and five power pieces.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, smite, weapon, sepulchure, escherion, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:645. Slot 283
// is the Sepulchure saga: its last story quest writes 30 and Smite writes 31,
// so one read covers the prerequisite and the unlock.
//
// Every piece is a permanent item. The power tonic is the only shop buy.

var QUEST = 8740;
var SLOT = 283;
var USES = 30;
var DONE = 31;
var LEVEL = 60;
var REP = 44100;

var SLOT_SHOP = 2116;
var TONIC = 11620;

var PIECES = [
    { id: 47830, need: 3, map: "shadowattack", monster: "Death" },
    { id: 47832, need: 7, go: escherion },
    { id: 30668, need: 50, map: "shadowrealmpast", monster: "Pure Shadowscythe" },
    { id: 55883, need: 25, map: "undergroundlabb", monster: "Ultra Battle Gem" }
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

function hunt(piece, short) {
    if (!bot.travel(piece.map)) return;
    var m = bot.roomMonster(piece.monster);
    if (m === null) return;
    if (!bot.moveToCell(m.cell, m.pad)) return;
    bot.kill(piece.monster, short);
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Smite needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-smite: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Shadowfall Rise (6592) must be finished first");
    return;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 6 (" + REP + ") needed; run forge-rep");
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

for (var i = 0; i < PIECES.length; i++) {
    var piece = PIECES[i];
    var have = bot.item(piece.id);
    if (have === null) return;
    if (have >= piece.need) continue;
    if (!bot.pickDrop()) return;
    if (piece.go) {
        piece.go();
        return;
    }
    hunt(piece, piece.need - have);
    return;
}

var tonic = bot.item(TONIC);
if (tonic === null) return;
if (tonic < 10) {
    if (!bot.travel("alchemyacademy")) return;
    bot.buy(SLOT_SHOP, TONIC, 10);
    return;
}
