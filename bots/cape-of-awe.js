/// name: Cape of Awe
/// desc: Farms a Cape Relic from Binky and buys the Cape of Awe.
/// once: true
/// timeout: 0
/// version: 1.2
/// author: beatrix
/// tags: cape, awe, boost, experience, reputation, farm

// Ported from refs/Scripts/Good/GearOfAwe/CapeOfAwe.cs and CoreAwe.GetAweRelic.
// The standard non-member path requires level 55 and Blade of Awe rank 10.

var member = bot.member;
if (member === null) return;
var QUEST = member ? 4178 : 4180;
var PASS = member ? 29402 : 29404;
var FRAGMENT = 29394;

var haveCape = bot.item("Cape of Awe");
if (haveCape === null) return;
if (haveCape > 0) return true;

var fragmentById = bot.item(FRAGMENT);
var fragmentByName = bot.item("Cape Fragment");
if (fragmentById === null && fragmentByName === null) return;
var fragment = Math.max(fragmentById || 0, fragmentByName || 0);
if (fragment >= 1) {
    if (!bot.travel("museum")) return;
    if (!bot.buyName(1129, "Cape Relic")) return;
    return;
}

if (!member) {
    if (bot.level === null) return;
    if (bot.level < 55) {
        bot.fail("Level 55 is required for Cape of Awe quest 4180");
        return;
    }

    var faction = bot.rep("Blade of Awe");
    if (faction === null) return;
    if (faction.rank < 10) {
        bot.fail("Blade of Awe rank 10 is required; run Blade of Awe Reputation first");
        return;
    }
}

var relic = bot.item("Cape Relic");
if (relic === null) return;
if (relic > 0) {
    if (!bot.travel("museum")) return;
    if (!bot.buyName(1129, "Cape of Awe")) return;
    return true;
}

var pass = bot.item(PASS);
if (pass === null) return;
if (pass <= 0) {
    if (!bot.travel("museum")) return;
    if (!bot.buy(1130, PASS)) return;
    return;
}

if (!bot.travel("doomvault")) return;
if (!bot.moveToCell("r5", "Left")) return;

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

var shard = bot.item("Cape Shard");
if (shard === null) return;
if (shard <= 0) {
    if (!bot.pickDrop("Cape Shard")) return;
    bot.kill("Binky", 1);
    return;
}

if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
    return;
}

if (!bot.pickDrop("Cape Shard")) return;
bot.kill("Binky", 1);
