/// name: Legion Token: Dreadrock
/// desc: Farms Legion Tokens with the Undead Champion Recruitment quest in Dreadrock, until stopped.
/// once: false
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: legion, legion token, dreadrock, undead champion, farm, quests

// Ported from refs/Scripts/Legion/LegionTokens/DreadrockLegionToken.cs,
// which calls CoreLegion.LTDreadrock (refs/Scripts/Legion/CoreLegion.cs:549).
//
// The Skua farm joins the Legion, buys the Undead Champion, registers the
// repeatable quest 4849 (Undead Champion Recruitment) and kills whatever
// stands in Dreadrock r3 until the bag holds the tokens it wants. The quest
// asks for six Dreadrock recruits and pays ten Legion Tokens, so the loop is
// accept, kill six, hand in, accept again.
//
// The farm has no end: there is no goal to reach, the bot keeps handing the
// quest in until it is stopped. Each pass is one cycle, and the host starts
// the next one.
//
// Beatrix has no class swap, so the farm class is left to the player. The
// Undead Champion is the quest's accept item. The reference buys it when it
// is missing, but it is a permanent piece of armor, so this bot asks for it
// instead of spending AdventureCoins on its own.

var QUEST = 4849;
var TOKEN = 6521; // Legion Token.
var RECRUIT = 33883; // Dreadrock Enemy Recruited, the quest's temp item.
var CHAMPION = 5518; // Undead Champion armor, accept item of 4849.

var MAP = "dreadrock";
var CELL = "r3";
var PAD = "Bottom";

var mem = bot.memory;

var tokens = bot.item(TOKEN);
if (tokens == null) return;
if (tokens !== mem.tokens) {
    mem.tokens = tokens;
    bot.log("legion-token-dreadrock: " + tokens + " Legion Tokens");
}

var champion = bot.item(CHAMPION);
if (champion == null) return;
if (champion < 1) {
    bot.fail(
        "quest 4849 needs the Undead Champion armor: run the Join the Legion bot, or buy it in /underworld (shop 216)"
    );
    return;
}

// A finished quest is handed in first: the turn-in is what pays. The pass
// keeps running until the server has taken the quest, so the hand-in is
// never asked for twice.
if (bot.quest.ready(QUEST)) {
    if (!bot.quest.turnIn(QUEST)) return;
    mem.dreadrock = null;
    mem.stalled = 0;
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

var wants = bot.quest.wants(QUEST);
if (wants == null) return;
if (wants.length === 0) return;

var have = 0;
var need = 0;
for (var i = 0; i < wants.length; i++) {
    if (wants[i].id === RECRUIT) {
        have = wants[i].have;
        need = wants[i].need;
        break;
    }
}
if (need === 0) {
    bot.fail("quest 4849 does not ask for Dreadrock recruits");
    return;
}

var short = need - have;
if (short <= 0) {
    // The recruits are in and the client has not offered the hand-in yet.
    // That settles within a tick or two; a longer silence means the quest
    // will never complete, and the farm would sit here doing nothing.
    mem.stalled = (mem.stalled || 0) + 1;
    if (mem.stalled > 100) {
        bot.fail("quest 4849 has its recruits but will not hand in");
        return;
    }
    return;
}
mem.stalled = 0;

// The recruit count is the only truth about the room. Two kill cycles that
// do not move it mean this is not the room that recruits, and the farm would
// kill monsters forever without ever paying out.
var stale = mem.dreadrock != null && mem.dreadrock.have === have && mem.dreadrock.short === short;
mem.dreadrock = {
    have: have,
    short: short,
    stale: stale ? mem.dreadrock.stale + 1 : 0
};
if (mem.dreadrock.stale >= 2) {
    bot.fail("dreadrock " + CELL + " is not giving Dreadrock recruits");
    return;
}

if (!bot.travel(MAP)) return;
if (!bot.moveToCell(CELL, PAD)) return;
if (!bot.kill("", short)) return;
if (!bot.pickDrop("Legion Token")) return;

// One cycle is one pass. The host starts the next one.
return true;
