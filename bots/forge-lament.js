/// name: Forge Cape: Lament
/// desc: Unlocks Lament: the three hearts, after checking the Third Spell and Sloth stories.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, lament, sepulchure, ashfallcamp, sloth, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1269.
// Penitence writes slot 468 value 4 and this quest writes 5, so one read
// covers the prerequisite and the unlock.
//
// The Heart of the Sun is the Third Spell story's reward and the Sloth map
// is the Seven Deadly Dragons story's, so both are checked and named rather
// than ported. The Sloth map's plague needs the temporary HazMat suit, which
// a bot has no way to wear: keep it on before starting the run.

var QUEST = 8823;
var SLOT = 468;
var USES = 4;
var DONE = 5;
var LEVEL = 90;
var REP = 202500;

var SUN = 30903;
var DOOM = 30628;
var FLAME = 40377;
var BLOOD = 40756;

var SLOTH_SLOT = 244;
var SLOTH_DONE = 16;

var DOOM_SPOT = { map: "sepulchurebattle", monster: "ULTRA Sepulchure" };
var FLAME_SPOT = { map: "ashfallcamp", monster: "Smoldur" };
var BLOOD_SPOT = { map: "sloth", monster: "Mutated Plague" };

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

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Lament needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-lament: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Penitence (8822) must be finished first; run forge-penitence");
    return;
}

var sun = bot.item(SUN);
if (sun === null) return;
if (sun < 1) {
    bot.fail("Heart of the Sun (30903) needed; the Third Spell story must be finished first");
    return;
}

var sloth = bot.quest.value(SLOTH_SLOT);
if (sloth === null) return;
if (sloth < SLOTH_DONE) {
    bot.fail("Seven Deadly Dragons Sloth story (5959) must be finished first");
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

if (!drop(DOOM, 1, DOOM_SPOT)) return;
if (!drop(FLAME, 10, FLAME_SPOT)) return;
drop(BLOOD, 3, BLOOD_SPOT);
