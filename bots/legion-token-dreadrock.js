/// name: Legion Token: Dreadrock
/// desc: Farms Legion Tokens with the Undead Champion Recruitment quest in Dreadrock, until stopped.
/// once: false
/// timeout: 0
/// version: 1.2
/// author: beatrix
/// tags: legion, legion token, dreadrock, undead champion, farm, quests

// Ported from refs/Scripts/Legion/LegionTokens/DreadrockLegionToken.cs,
// which calls CoreLegion.LTDreadrock (refs/Scripts/Legion/CoreLegion.cs:549).
//
// The farm is one loop with one question: can the quest be handed in? The
// client answers it itself (World.canTurnInQuest, the same item counts the
// quest tracker shows), so a ready quest is turned in and anything else keeps
// killing. No goal, no counter, no state across steps.
//
// Quest 4849 asks for six Dreadrock Enemy Recruited, a temp item the client
// adds to the bag on each kill, and pays ten Legion Tokens. The tokens are a
// turn-in reward, not a drop, so there is nothing to pick up.
//
// Beatrix has no class swap, so the farm class is left to the player. The
// Undead Champion is the quest's accept item. The reference buys it when it
// is missing, but it is a permanent piece of armor, so this bot asks for it
// instead of spending AdventureCoins on its own.

var QUEST = 4849;
var TOKEN = 6521; // Legion Token.
var CHAMPION = 5518; // Undead Champion armor, accept item of 4849.

var MAP = "dreadrock";
var CELL = "r3";
var PAD = "Bottom";

var tokens = bot.item(TOKEN);
if (tokens == null) return;

var champion = bot.item(CHAMPION);
if (champion == null) return;
if (champion < 1) {
    bot.fail(
        "quest 4849 needs the Undead Champion armor: run the Join the Legion bot, or buy it in /underworld (shop 216)"
    );
    return;
}

// The hand-in is the only thing that pays, so it comes before another kill.
// The step answers true once the client has stopped offering it, which is
// also the tick the reward is in the bag.
if (bot.quest.ready(QUEST)) {
    if (!bot.quest.turnIn(QUEST)) return;
    bot.log("legion-token-dreadrock: " + tokens + " Legion Tokens");
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

// One kill per step, so the turn-in is checked between kills and the sixth
// recruit ends the cycle without a count of our own.
if (!bot.travel(MAP)) return;
if (!bot.moveToCell(CELL, PAD)) return;
if (!bot.kill("", 1)) return;
