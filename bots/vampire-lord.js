/// name: Vampire Lord
/// desc: Farms Blood Moon Tokens in /bloodmoon and buys the Vampire Lord class.
/// once: false
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: class, mogloween, seasonal, vampire, vampire lord

// Ported from refs/Scripts/Seasonal/Mogloween/VampireLord(Class).cs.
// Quest data lists Black Blood Vial (41652) and Moon Stone (41653) as the
// repeatable turn-in requirements, rewarding 1 token for non-members and 2
// for members. The Skua farm gathers 99 and 33 respectively before turn-in;
// this version follows quest wants and completes each turn-in as soon as ready.

var MAP = "bloodmoon";
var member = bot.member;
if (member === null) return;
var QUEST = member ? 6060 : 6059;
var TOKEN = 41654;
var CLASS = 41575;

function hunt(name, count) {
    var m = bot.roomMonster(name);
    if (m === null) return;
    if (m.cell && !bot.moveToCell(m.cell, m.pad || "Left")) return;
    if (!bot.kill(name, count)) return;
}

var owned = bot.item(CLASS);
if (owned === null) return;
if (owned > 0) return true;

if (!bot.travel(MAP)) return;

var tokens = bot.item(TOKEN);
if (tokens === null) return;
if (tokens >= 300) {
    if (!bot.buyName(1477, "Vampire Lord")) return;
    owned = bot.item(CLASS);
    if (owned !== null && owned > 0) return true;
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;
if (bot.quest.ready(QUEST)) {
    bot.quest.turnIn(QUEST);
    return;
}

var wants = bot.quest.wants(QUEST);
if (wants === null) return;
for (var i = 0; i < wants.length; i++) {
    var want = wants[i];
    var need = want.need - want.have;
    if (need <= 0) continue;
    if (want.id === 41652) {
        hunt("Black Unicorn", need);
        return;
    }
    if (want.id === 41653) {
        hunt("Lycan Guard", need);
        return;
    }
    bot.fail("Blood Moon quest wants unexpected item " + want.id);
    return;
}
