/// name: Blade of Awe Reputation
/// desc: Repeats Find the Hilt! in Castle Undead to farm Blade of Awe reputation to rank 10.
/// once: false
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: blade, awe, reputation, rep, rank, farm

// Ported from refs/Scripts/Farm/REP/BladeofAweREP.cs and its
// CoreFarms.BladeofAweREP implementation. The reference unlocks the Blade of
// Awe quest chain first; this bot requires that chain's Hilt quest (2935) to
// be unlocked and reports the prerequisite instead of silently stalling.

var RANK = 10;
var QUEST = 2935;

var faction = bot.rep("Blade of Awe");
if (faction === null) return;
if (faction.rank >= RANK) return true;

if (!bot.travel("castleundead")) return;
if (!bot.moveToCell("Enter", "Left")) return;

if (!bot.quest.active(QUEST)) {
    if (!bot.quest.accept(QUEST)) {
        bot.fail("Blade of Awe quest 2935 is locked; complete the Blade of Awe quest chain first");
        return;
    }
    return;
}

if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
    return;
}

if (!bot.pickDrop("Hilt Found!")) return;
bot.kill("Skeletal Viking", 1);
