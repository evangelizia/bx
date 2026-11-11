/// name: Forge Cape: Absolution
/// desc: Unlocks Absolution: the Good reputation gate, the Slimed Sigils and the two rift shop items.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, absolution, good, reputation, charredpath, therift, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1134. Good
// reputation needs an alignment change, which Beatrix has no step for, so a
// player below rank 10 is told instead of farmed.
//
// The sigils are the rift shop's currency: 100 for the armor and 50 for the
// sword, so the farm target is 150 minus whatever is already owned. Quest
// 5807 is written to slot 237 before the sigils drop, the same as the
// reference does with UpdateQuest.

var QUEST = 8743;
var SLOT = 468;
var DONE = 1;
var LEVEL = 90;
var REP = 202500;
var GOOD = 302500;

var SIGIL = 39095;
var ARMOR = 39091;
var SWORD = 39094;
var SHOP = 1399;
var TREES_SLOT = 237;
var TREES_VALUE = 6;

var PLAGUE = { map: "charredpath", cell: "r5", pad: "Left", monster: "Plague Spreader" };

function owned(id) {
    var have = bot.item(id);
    return have === null ? null : have > 0;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Absolution needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-absolution: already unlocked");
    return true;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 9 (" + REP + ") needed; run forge-rep");
    return;
}

var armor = owned(ARMOR);
if (armor === null) return;
var sword = owned(SWORD);
if (sword === null) return;

if (!armor || !sword) {
    var good = bot.rep("Good");
    if (good === null) return;
    if (good.rep < GOOD) {
        bot.fail("Good rank 10 (" + GOOD + ") needed for the rift shop; the bot cannot change alignment");
        return;
    }
}

var target = 150;
if (armor) target -= 100;
if (sword) target -= 50;

var sigil = bot.item(SIGIL);
if (sigil === null) return;

if (sigil < target) {
    if (!bot.memory.trees) {
        bot.memory.trees = true;
        bot.quest.set(TREES_SLOT, TREES_VALUE);
        return;
    }
    if (!bot.pickDrop()) return;
    if (!bot.travel(PLAGUE.map)) return;
    if (!bot.moveToCell(PLAGUE.cell, PLAGUE.pad)) return;
    bot.kill(PLAGUE.monster, 1);
    return;
}

if (!armor) {
    if (!bot.travel("therift")) return;
    bot.buy(SHOP, ARMOR, 1);
    return;
}

if (!sword) {
    if (!bot.travel("therift")) return;
    bot.buy(SHOP, SWORD, 1);
    return;
}

if (!bot.quest.active(QUEST)) {
    bot.quest.accept(QUEST);
    return;
}

if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
}
