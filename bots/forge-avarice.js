/// name: Forge Cape: Avarice
/// desc: Unlocks Avarice: fifty Indulgence from the Circles of Fate and fifty Penance from the war shop.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: forge, enhancement, cape, avarice, legion, sevencircles, indulgence, penance, quests

// Ported from refs/Scripts/Legion/HeadOfTheLegionBeast.cs:309 and 533. The
// Seven Circles War story has to be finished first; the repeatable quests it
// leaves behind are the only source of the materials.
//
// Indulgence is one turn-in of 7978: 25 Souls of Limbo and one of each
// essence from the four bosses. Penance is bought from the war shop for one
// of each war essence and fifteen Souls of Heresy.
//
// A buy spends what the bag holds, so the batch is farmed first and only ten
// Penance are asked for at a time: 150 souls sit under the 300 soul stack and
// the buy never outruns its materials.

var QUEST = 8745;
var SLOT = 468;
var USES = 2;
var DONE = 3;
var LEVEL = 90;
var REP = 202500;
var WAR_SLOT = 395;
var WAR_DONE = 19;
var SHOP = 1984;
var NEED = 50;
var BATCH = 10;
var SOULS_COST = 15;

var INDULGENCE = 59992;
var PENANCE = 60040;
var WRATH = 60054;
var VIOLENCE = 60056;
var TREACHERY = 60057;
var SOULS = 60055;

var FATE = 7978;
var Q_WRATH = 7979;
var Q_VIOLENCE = 7985;
var Q_TREACHERY = 7988;
var Q_SOULS = 7983;

var FATE_SPOTS = {
    59991: { map: "sevencircles", cell: "r2", pad: "Left", monster: "Limbo Guard" },
    59989: { map: "sevencircles", cell: "r6", pad: "Left", monster: "Gluttony" },
    59934: { map: "sevencircles", cell: "r4", pad: "Left", monster: "Luxuria" },
    59990: { map: "sevencircles", cell: "r8", pad: "Left", monster: "Avarice" }
};

var ESSENCES = [
    { item: WRATH, quest: Q_WRATH, map: "sevencircleswar", cell: "Enter", pad: "Spawn", monster: "*" },
    { item: VIOLENCE, quest: Q_VIOLENCE, map: "sevencircleswar", cell: "r9", pad: "Left", monster: "Violence Guard" },
    { item: TREACHERY, quest: Q_TREACHERY, map: "sevencircleswar", cell: "r13", pad: "Left", monster: "Treachery Guard" }
];

var SOUL_SPOT = { map: "sevencircleswar", cell: "r7", pad: "Left", monster: "*" };

function fight(where, count) {
    if (!bot.pickDrop()) return false;
    if (!bot.travel(where.map)) return false;
    if (!bot.moveToCell(where.cell, where.pad)) return false;
    return bot.kill(where.monster, count);
}

function fate() {
    var have = bot.item(INDULGENCE);
    if (have === null) return false;
    if (have >= NEED) return true;
    if (!bot.quest.active(FATE)) {
        bot.quest.accept(FATE);
        return false;
    }
    if (bot.quest.ready(FATE)) {
        bot.quest.turnIn(FATE);
        return false;
    }
    var wants = bot.quest.wants(FATE);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;
        var spot = FATE_SPOTS[want.id];
        if (spot === undefined) {
            bot.fail("Circles of Fate wants item " + want.id + ", which no step gives");
            return false;
        }
        fight(spot, want.need - want.have);
        return false;
    }
    return false;
}

function essence(spot, target) {
    var have = bot.item(spot.item);
    if (have === null) return false;
    if (have >= target) return true;
    if (!bot.quest.active(spot.quest)) {
        bot.quest.accept(spot.quest);
        return false;
    }
    if (bot.quest.ready(spot.quest)) {
        bot.quest.turnIn(spot.quest);
        return false;
    }
    var wants = bot.quest.wants(spot.quest);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have < want.need) fight(spot, want.need - want.have);
    return false;
}

function souls(target) {
    var have = bot.item(SOULS);
    if (have === null) return false;
    if (have >= target) return true;
    if (!bot.quest.active(Q_SOULS)) {
        bot.quest.accept(Q_SOULS);
        return false;
    }
    if (bot.quest.ready(Q_SOULS)) {
        bot.quest.turnIn(Q_SOULS);
        return false;
    }
    var wants = bot.quest.wants(Q_SOULS);
    if (wants === null || wants.length === 0) return false;
    var want = wants[0];
    if (want.have < want.need) fight(SOUL_SPOT, want.need - want.have);
    return false;
}

function penance() {
    var have = bot.item(PENANCE);
    if (have === null) return false;
    if (have >= NEED) return true;
    var batch = Math.min(NEED - have, BATCH);
    for (var i = 0; i < ESSENCES.length; i++) {
        if (!essence(ESSENCES[i], batch)) return false;
    }
    if (!souls(batch * SOULS_COST)) return false;
    if (!bot.travel("sevencircleswar")) return false;
    bot.buy(SHOP, PENANCE, have + batch);
    return false;
}

var lvl = bot.level;
if (lvl === null) return;
if (lvl < LEVEL) {
    bot.fail("Avarice needs level " + LEVEL + " (have " + lvl + ")");
    return;
}

var chain = bot.quest.value(SLOT);
if (chain === null) return;
if (chain >= DONE) {
    bot.log("forge-avarice: already unlocked");
    return true;
}
if (chain < USES) {
    bot.fail("Vainglory (8744) must be finished first; run forge-vainglory");
    return;
}

var war = bot.quest.value(WAR_SLOT);
if (war === null) return;
if (war < WAR_DONE) {
    bot.fail("Seven Circles War story (7989) must be finished first");
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

if (!fate()) return;
penance();
