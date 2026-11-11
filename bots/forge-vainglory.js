/// name: Forge Cape: Vainglory
/// desc: Unlocks Vainglory: the five Awe relics and their shard quests.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, vainglory, awe, relics, museum, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1166 and
// refs/Scripts/Good/GearOfAwe/CoreAwe.cs:33. Absolution writes slot 468
// value 1 and this quest writes 2, so one read gates both.
//
// Which Awe pass to buy decides which quest variant drops the shards:
// Guardian (29403) for Guardian accounts, Legendary (29402) for members, and
// the Armor pass (29404) for everyone else. The reputation gate follows the
// quest: 44100, 0 and 302500. This is the same intAQ check the reference
// makes in CoreAwe.GetAweRelic, and Beatrix exposes it as bot.guardian.

var QUEST = 8744;
var SLOT = 468;
var USES = 1;
var DONE = 2;
var LEVEL = 90;
var REP = 202500;
var RELIC_SHOP = 1129;
var PASS_SHOP = 1130;
var PASS_GUARDIAN = 29403;
var PASS_MEMBER = 29402;
var PASS_ARMOR = 29404;
var GUARDIAN_SHOP = 53;

var PIECES = [
    { relic: 29395, fragment: 29388, quest: 4160, need: 15, map: "gravestrike", monster: "Ultra Akriloth" },
    { relic: 29396, fragment: 29389, quest: 4163, need: 10, map: "aqlesson", monster: "Carnax" },
    { relic: 29397, fragment: 29390, quest: 4166, need: 15, map: "bloodtitan", monster: "Ultra Blood Titan" },
    { relic: 29398, fragment: 29391, quest: 4169, need: 25, map: "alteonbattle", monster: "ULTRA Alteon" },
    { relic: 29399, fragment: 29392, quest: 4172, need: 10, map: "bosschallenge", monster: "Mutated Void Dragon" }
];

function collect(piece, quest) {
    var fragment = bot.item(piece.fragment);
    if (fragment === null) return false;
    if (fragment >= piece.need) {
        if (!bot.travel("museum")) return false;
        bot.buy(RELIC_SHOP, piece.relic, 1);
        return false;
    }
    if (!bot.quest.active(quest)) {
        bot.quest.accept(quest);
        return false;
    }
    if (bot.quest.ready(quest)) {
        bot.quest.turnIn(quest);
        return false;
    }
    var wants = bot.quest.wants(quest);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have >= want.need) return false;
    if (!bot.pickDrop()) return false;
    if (!bot.travel(piece.map)) return false;
    var m = bot.roomMonster(piece.monster);
    if (m === null) return false;
    if (!bot.moveToCell(m.cell, m.pad)) return false;
    bot.kill(piece.monster, want.need - want.have);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Vainglory needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-vainglory: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Absolution (8743) must be finished first; run forge-absolution");
    return;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 9 (" + REP + ") needed; run forge-rep");
    return;
}

var guardian = bot.guardian;
if (guardian === null) return;
var member = bot.member;
if (member === null) return;

var pass;
var passShop;
var passMap;
var offset;
var aweRep;
if (guardian) {
    pass = PASS_GUARDIAN;
    passShop = GUARDIAN_SHOP;
    passMap = "tower";
    offset = 1;
    aweRep = 44100;
} else if (member) {
    pass = PASS_MEMBER;
    passShop = PASS_SHOP;
    passMap = "museum";
    offset = 0;
    aweRep = 0;
} else {
    pass = PASS_ARMOR;
    passShop = PASS_SHOP;
    passMap = "museum";
    offset = 2;
    aweRep = 302500;
}

if (aweRep > 0) {
    var awe = bot.rep("Blade of Awe");
    if (awe === null) return;
    if (awe.rep < aweRep) {
        bot.fail("Blade of Awe " + aweRep + " reputation needed; run blade-of-awe");
        return;
    }
}

var held = bot.item(pass);
if (held === null) return;
if (held < 1) {
    if (!bot.travel(passMap)) return;
    bot.buy(passShop, pass, 1);
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
    var relic = bot.item(PIECES[i].relic);
    if (relic === null) return;
    if (relic > 0) continue;
    collect(PIECES[i], PIECES[i].quest + offset);
    return;
}
