/// name: Apprentice of Awe
/// desc: Completes The Dawn of Lore and buys the Apprentice of Awe armor.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: awe, armor, boost, museum, treasurehunter

// The reference scripts don't cover Trissa's quests. Ported from the
// The Dawn of Lore requirements in refs/Scripts/QuestData.json and the
// AQW Wiki Trissa's Quests page.

var QUEST = 8035;
var SHOP = 1994;
var ARMOR = "Apprentice of Awe";

var have = bot.item(ARMOR);
if (have === null) return;
if (have > 0) return true;

if (bot.level === null) return;
if (bot.level < 25) {
    bot.fail("Level 25 is required for The Dawn of Lore");
    return;
}

var done = bot.quest.done(QUEST);
if (done === null) return;
if (done) {
    if (!bot.travel("museum")) return;
    if (!bot.buyName(SHOP, ARMOR)) return;
    return true;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;
if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
    return;
}

var wants = bot.quest.wants(QUEST);
if (wants === null) return;

var targets = {
    60665: { map: "uppercity", monster: "Chaos Egg" },
    60666: { map: "lycanwar", monster: "Edvard" },
    60667: { map: "yokaiwar", monster: "O-Dokuro" },
    1121: { map: "cornelis", monster: "Stone Golem", drop: "Block Head" }
};

for (var i = 0; i < wants.length; i++) {
    var want = wants[i];
    if (want.need - want.have <= 0) continue;

    var target = targets[want.id];
    if (!target) {
        bot.fail("The Dawn of Lore has an unsupported requirement: " + want.id);
        return;
    }

    if (target.drop) {
        var owned = bot.item(want.id);
        if (owned === null) return;
        if (owned > 0) continue;
        if (!bot.pickDrop(target.drop)) return;
    }

    if (!bot.travel(target.map)) return;
    if (target.drop && !bot.pickDrop(target.drop)) return;
    bot.kill(target.monster, want.need - want.have);
    return;
}
