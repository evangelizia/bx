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
var ARMOR = 58177;
var NPC_CELL = "Crossroad";
var NPC_PAD = "Left";
var DARKOVIA = 26;
var EDVARD_OPEN = 17;

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
    if (!bot.buy(SHOP, ARMOR)) return;
    return true;
}

if (!bot.quest.active(QUEST)) {
    if (!bot.travel("museum")) return;
    if (!bot.moveToCell(NPC_CELL, NPC_PAD)) return;
    if (!bot.quest.accept(QUEST)) return;
    return;
}

if (bot.quest.ready(QUEST)) {
    if (!bot.travel("museum")) return;
    if (!bot.moveToCell(NPC_CELL, NPC_PAD)) return;
    bot.quest.turnIn(QUEST);
    return;
}

var wants = bot.quest.wants(QUEST);
if (wants === null) return;

var targets = {
    60665: { map: "uppercity", cell: "r3", pad: "Right", monster: "Chaos Egg" },
    60666: { map: "lycanwar", cell: "Boss", pad: "Right", monster: "Edvard", chain: true },
    60667: { map: "odokuro", cell: "Boss", pad: "Right", monster: "O-dokuro" },
    1121: { map: "cornelis", cell: "Side5", pad: "Left", monster: "Stone Golem", drop: "Block Head" }
};

for (var i = 0; i < wants.length; i++) {
    var want = wants[i];
    if (want.need - want.have <= 0) continue;

    var target = targets[want.id];
    if (!target) {
        bot.fail("The Dawn of Lore has an unsupported requirement: " + want.id);
        return;
    }

    if (target.chain) {
        var story = bot.quest.value(DARKOVIA);
        if (story === null) return;
        if (story < EDVARD_OPEN) {
            bot.fail("Darkovia quest chain must reach 17 to fight Edvard (current: " + story + ")");
            return;
        }
    }

    if (!bot.travel(target.map)) return;
    if (!bot.moveToCell(target.cell, target.pad)) return;

    if (target.drop) {
        var owned = bot.item(want.id);
        if (owned === null) return;
        if (owned > 0) continue;
        if (!bot.kill(target.monster, 1)) return;
        if (!bot.pickDrop(target.drop)) return;
        return;
    }

    bot.kill(target.monster, want.need - want.have);
    return;
}
