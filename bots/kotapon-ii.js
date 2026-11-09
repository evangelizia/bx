/// name: KotaPon II: Get'cha Gear
/// desc: Farm quest 8802 in Eden for one random KotaPon reward per turn-in.
/// once: false
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: farm, quests, kotapon, eden, gachapon

// Ported from refs/Scripts/Other/GachaponMachineQuests.cs, second quest only.
// The Skua original runs Eden.StoryLine() first and loops
// EnsureCompleteChoose(8802) until every Rewards2 item is owned. Beatrix has
// no storyline helper, so a finished Eden story is left to the player: the
// bot checks Protect the Reactor! (8801) and fails with the requirement
// instead of idling. Each pass turns in at most once: farming quest reward
// is endless, so the host restarts the pass in loop mode.
//
// Quest needs from QuestData.json: Eden Resident Token (71749) x10 from
// Cosplayer Anomaly, Klawaii Coin (71780) x1 from Klawaii Machine, both in
// eden. Tokens also drop from Police and SalaryMan Anomaly, but the Skua
// farm uses Cosplayer Anomaly, so this bot does too. Temporary quest items
// need no pickup step; the want count rises on the kill.
//
// The Skua farm hunts without a cell. Beatrix has no auto-jump, so the hunt
// below finds the cell through roomMonster, the name the client is already
// watching, and hops there before killing. An unknown monster pad simply
// falls back to Left or the first valid pad instead of the map centre.

var QUEST = 8802;
var MAP = "eden";
var TOKEN = 71749; // Eden Resident Token.
var COIN = 71780; // Klawaii Coin.

function hunt(monster, short) {
    var m = bot.roomMonster(monster);
    // First watch returns nothing while the snapshot catches up. Stay on
    // this step; do not fall through to the kill of another cell.
    if (m == null) return;
    if (m.cell && !bot.moveToCell(m.cell, m.pad)) return;
    if (!bot.kill(monster, short)) return;
}

if (!bot.travel(MAP)) return;

var reactor = bot.quest.done(8801);
if (reactor == null) return;
if (!reactor) {
    bot.fail("KotaPon II needs Protect the Reactor! (8801) done first");
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

if (bot.quest.ready(QUEST)) {
    if (!bot.quest.turnIn(QUEST)) return;
    bot.log("kotapon-ii: turned in 8802");
    return true;
}

var wants = bot.quest.wants(QUEST);
if (wants == null) return;

for (var i = 0; i < wants.length; i++) {
    var want = wants[i];
    var short = want.need - want.have;
    if (short <= 0) continue;
    if (want.id === TOKEN) {
        hunt("Cosplayer Anomaly", short);
        return;
    }
    if (want.id === COIN) {
        hunt("Klawaii Machine", short);
        return;
    }
    bot.fail("quest 8802 wants item " + want.id + ", which no step gives");
    return;
}

return;
