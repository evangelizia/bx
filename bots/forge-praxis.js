/// name: Forge Weapon: Praxis
/// desc: Unlocks Praxis: three shop armors, Ektorax, the Yami farm, the Orochi tokens and the shadowfortress merge.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, weapon, praxis, ectocave, darkally, shadowfortress, yami, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:671. Quest
// 7924 is the last Yokai quest before Praxis, so slot 278 value 10 is the
// prerequisite and value 11 is the unlock.
//
// Yami comes from the repeatable DarkAlly quest 7409 and the DragonSoul
// Shinobi from the shadowfortress merge, which spends Dragon Shinobi Tokens
// from the repeatable Orochi quest 7924.

var QUEST = 9171;
var SLOT = 278;
var USES = 10;
var DONE = 11;
var LEVEL = 60;
var REP = 44100;

var HASHASHIN = 1760;
var THIEF = 48216;
var CHUNIN = 59325;
var ROGUE = 25169;
var YAMI = 53846;
var SHINOBI = 59465;

var TOKEN = 20561;
var TOKENS = 100;
var TOKEN_QUEST = 7924;

var DARK_SLOT = 347;
var DARK_DONE = 10;
var YAMI_QUEST = 7409;

var BUYS = [
    { id: HASHASHIN, shop: 69, map: "yulgar" },
    { id: THIEF, shop: 439, map: "thespan" },
    { id: CHUNIN, shop: 95, map: "dragonkoiz" }
];

function owned(id) {
    var have = bot.item(id);
    return have === null ? null : have > 0;
}

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

function yami() {
    var have = bot.item(YAMI);
    if (have === null) return false;
    if (have >= 3) return true;
    var story = bot.quest.value(DARK_SLOT);
    if (story === null) return false;
    if (story < DARK_DONE) {
        bot.fail("Shadows of War DarkAlly story (7428) must be finished first");
        return false;
    }
    if (!bot.quest.active(YAMI_QUEST)) {
        bot.quest.accept(YAMI_QUEST);
        return false;
    }
    if (bot.quest.ready(YAMI_QUEST)) {
        bot.quest.turnIn(YAMI_QUEST);
        return false;
    }
    var wants = bot.quest.wants(YAMI_QUEST);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have >= want.need) return false;
    if (!bot.pickDrop()) return false;
    if (!bot.travel("darkally")) return false;
    if (!bot.moveToCell("r2", "Left")) return false;
    bot.kill("*", want.need - want.have);
    return false;
}

function tokens() {
    var have = bot.item(TOKEN);
    if (have === null) return false;
    if (have >= TOKENS) return true;
    if (!bot.quest.active(TOKEN_QUEST)) {
        bot.quest.accept(TOKEN_QUEST);
        return false;
    }
    if (bot.quest.ready(TOKEN_QUEST)) {
        bot.quest.turnIn(TOKEN_QUEST);
        return false;
    }
    var wants = bot.quest.wants(TOKEN_QUEST);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have >= want.need) return false;
    if (!bot.pickDrop()) return false;
    if (!bot.travel("shadowfortress")) return false;
    var m = bot.roomMonster("1st Head of Orochi");
    if (m === null) return false;
    if (!bot.moveToCell(m.cell, m.pad)) return false;
    bot.kill("1st Head of Orochi", want.need - want.have);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Praxis needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-praxis: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Yokai saga (7924) must be finished first");
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

for (var i = 0; i < BUYS.length; i++) {
    var bought = owned(BUYS[i].id);
    if (bought === null) return;
    if (bought) continue;
    if (!bot.travel(BUYS[i].map)) return;
    bot.buy(BUYS[i].shop, BUYS[i].id, 1);
    return;
}

if (!drop(ROGUE, 1, { map: "ectocave", monster: "Ektorax" })) return;
if (!yami()) return;
if (!tokens()) return;

var shinobi = owned(SHINOBI);
if (shinobi === null) return;
if (!shinobi) {
    if (!bot.travel("shadowfortress")) return;
    bot.buy(1968, SHINOBI, 1);
}
