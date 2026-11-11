/// name: Forge Helm: Vim to Pneuma
/// desc: Runs the four ether helm enhancement quests in order, buying each starter class and farming Ethereal Essence.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, helm, vim, examen, anima, pneuma, ether, classhalla, quests

// Ported from refs/Scripts/Enhancement/UnlockForgeEnhancements.cs:1334-1500.
// Slot 472 is the chain: 8828 writes 1 and the four ether quests write 2 to
// 5, so one read names the stage.
//
// Each quest accepts only while its own starter class is owned, so the class
// is bought first. The reference also ranks the class to ten; nothing in the
// quest data asks for the rank, so this bot only buys it and leaves the bag
// space alone.

var SLOT = 472;
var DONE = 5;
var LEVEL = 70;
var REP = 78400;

var ESSENCE = 71878;

var STAGES = [
    { value: 2, quest: 8824, cls: 15652, shop: 172, need: 250 },
    { value: 3, quest: 8825, cls: 15651, shop: 176, need: 250 },
    { value: 4, quest: 8826, cls: 15654, shop: 170, need: 650 },
    { value: 5, quest: 8827, cls: 15653, shop: 174, need: 650 }
];

function ether(need) {
    var have = bot.item(ESSENCE);
    if (have === null) return false;
    if (have >= need) return true;
    if (!bot.pickDrop()) return false;
    if (!bot.travel("towerofdoom10")) return false;
    if (!bot.moveToCell("r8", "Left")) return false;
    bot.kill("", need - have);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Vim needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-vim-pneuma: already unlocked");
    return true;
}
if (chain < 1) {
    bot.fail("Forge Helm (8828) must be unlocked first; run forge-helm");
    return;
}

var rep = bot.rep("Blacksmithing");
if (rep === null) return;
if (rep.rep < REP) {
    bot.fail("Blacksmithing rank 7 (" + REP + ") needed; run forge-rep");
    return;
}

var stage = null;
for (var i = 0; i < STAGES.length; i++) {
    if (STAGES[i].value > chain) {
        stage = STAGES[i];
        break;
    }
}
if (stage === null) return true;

if (!bot.quest.active(stage.quest)) {
    var owned = bot.item(stage.cls);
    if (owned === null) return;
    if (owned < 1) {
        if (!bot.travel("classhalla")) return;
        bot.buy(stage.shop, stage.cls, 1);
        return;
    }
    bot.quest.accept(stage.quest);
    return;
}

if (bot.quest.ready(stage.quest)) {
    bot.quest.turnIn(stage.quest);
    return;
}

ether(stage.need);
