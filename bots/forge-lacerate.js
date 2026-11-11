/// name: Forge Weapon: Lacerate
/// desc: Unlocks Lacerate: the dagger pre-quests, the five keepsakes and the two boss drops.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, lacerate, weapon, greenguardwest, graveyard, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:568. Slot 10
// is the whole chain: 90, 91 and 92 write values 1 to 3 and the enhancement
// writes 4, so one read decides where the run resumes.
//
// The pre-quests hand out temporary items, so their legs cannot be read from
// the bag. Each leg is remembered until the turn-in clears it. The keepsakes
// and the two main drops are permanent, so those count from the bag.

var QUEST = 8739;
var SLOT = 10;
var DONE = 4;
var LEVEL = 40;
var REP = 22500;

var NINJA = [
    { map: "pirates", monster: "Shark Bait", count: 12 }
];

var WALLETS = [
    { map: "greenguardwest", cell: "West1", pad: "Left", monster: "Kittarian", count: 2 },
    { map: "greenguardwest", cell: "West9", pad: "Left", monster: "River Fishman", count: 2 },
    { map: "greenguardwest", cell: "West10", pad: "Left", monster: "Slime", count: 2 },
    { map: "greenguardwest", cell: "West3", pad: "Left", monster: "Frogzard", count: 2 },
    { map: "greenguardwest", cell: "West12", pad: "Up", monster: "Big Bad Boar", count: 1 }
];

var HITJOB = [
    { map: "greenguardwest", monster: "Breken the Vile", count: 1 },
    { map: "greenguardwest", monster: "Ogug Stoneaxe", count: 1 }
];

var CLEAVER = [
    { map: "warhorc", monster: "Horc Master", count: 1 }
];

var STONE = [
    { map: "greenguardeast", item: 54, count: 7 },
    { map: "greenguardeast", monster: "Spider", count: 1 }
];

var AXE = [
    { map: "farm", item: 55, count: 4 },
    { map: "farm", monster: "Mosquito", count: 1 }
];

var ORB = [
    { map: "well", monster: "Gell Oh No", count: 1 },
    { map: "greendragon", monster: "Greenguard Dragon", count: 1 },
    { map: "deathgazer", monster: "Deathgazer", count: 1 },
    { map: "trunk", monster: "GreenGuard Basilisk", count: 1 }
];

function owned(id) {
    var have = bot.item(id);
    return have === null ? null : have > 0;
}

function legDone(leg) {
    if (!bot.travel(leg.map)) return false;
    if (leg.item !== undefined) return bot.mapItem(leg.item, leg.count, 0);
    if (leg.cell) {
        if (!bot.moveToCell(leg.cell, leg.pad)) return false;
    } else {
        var m = bot.roomMonster(leg.monster);
        if (m === null) return false;
        if (!bot.moveToCell(m.cell, m.pad)) return false;
    }
    return bot.kill(leg.monster, leg.count);
}

function legs(id, list) {
    if (!bot.quest.active(id)) {
        bot.quest.accept(id);
        bot.memory["leg" + id] = 0;
        return;
    }
    if (bot.quest.ready(id)) {
        bot.quest.turnIn(id);
        bot.memory["leg" + id] = 0;
        return;
    }

    var at = bot.memory["leg" + id] || 0;
    if (at >= list.length) return;
    if (!legDone(list[at])) return;
    bot.memory["leg" + id] = at + 1;
}

function drop(id, map, monster) {
    var have = bot.item(id);
    if (have === null) return false;
    if (have >= 1) return true;
    if (!bot.pickDrop()) return false;
    if (!bot.travel(map)) return false;
    var m = bot.roomMonster(monster);
    if (m === null) return false;
    if (!bot.moveToCell(m.cell, m.pad)) return false;
    bot.kill(monster, 1);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Lacerate needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-lacerate: already unlocked");
    return true;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 5 (" + REP + ") needed; run forge-rep");
    return;
}

if (chain < 1) {
    legs(90, NINJA);
    return;
}
if (chain < 2) {
    legs(91, WALLETS);
    return;
}
if (chain < 3) {
    legs(92, HITJOB);
    return;
}

var cleaver = owned(1196);
if (cleaver === null) return;
if (!cleaver) {
    legs(279, CLEAVER);
    return;
}

var stone = owned(1532);
if (stone === null) return;
if (!stone) {
    legs(316, STONE);
    return;
}

var axe = owned(1581);
if (axe === null) return;
if (!axe) {
    legs(301, AXE);
    return;
}

var orb = owned(1576);
if (orb === null) return;
if (!orb) {
    legs(318, ORB);
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

if (!drop(62, "graveyard", "Big Jack Sprat")) return;
drop(369, "river", "Kuro");
