/// name: 13 Lords of Chaos: Tibicenas
/// desc: The seventh Lord of Chaos, the Sandsea up to Tibicenas.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, sandsea, tibicenas

// Ported from hibiki-scripts bots/chaos-7-tibicenas.js for the Beatrix bot API.
// Only the header gains tags; the body is unchanged. No extra step is needed:
// travel, moveToCell, kill, quest.* and mapItem already exist in beatrix.

// The Sandsea runs one slot from Sandport to the djinn realm.
var CHAIN = 36;

// Which monster pays each item a quest asks for. Sell-Sword Sell-Outs is the
// one quest that wants two, and the two live in different cells.
function spots(table) {
    var out = {};
    for (var id in table) {
        var row = table[id];
        out[id] = { monster: row[0], map: row[1], cell: row[2], pad: row[3] };
    }
    return out;
}

var SELLSWORD = spots({
    6686: ["Horc Sell-Sword", "sandport", "r5", "Left"],
    29373: ["Sell-Sword Leader", "sandport", "r6", "Right"]
});

function collect(id, table) {
    var wants = bot.quest.wants(id);
    if (wants == null) return;

    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        var spot = table[want.id];
        if (spot == null) {
            bot.fail("quest " + id + " wants item " + want.id + ", which no step gives");
            return;
        }
        if (!bot.travel(spot.map)) return;
        if (!bot.moveToCell(spot.cell, spot.pad)) return;
        bot.kill(spot.monster, want.need - want.have);
        return;
    }
}

function work(id, table) {
    if (!bot.quest.active(id)) {
        if (bot.quest.done(id)) return;
        bot.quest.accept(id);
        return;
    }
    if (bot.quest.ready(id)) {
        bot.quest.turnIn(id);
        return;
    }
    collect(id, table);
}

var chain = bot.quest.value(CHAIN);
if (chain == null) return;

// Sandport and Starboard
if (chain < 1) return bot.quest.gather(930, 251, "sandport");
if (chain < 2) return bot.quest.farm(931, "Sandshark", "sandport", "r1", "Right");
if (chain < 3) return bot.quest.farm(932, "Tomb Robber", "sandport", "r3", "Right");
if (chain < 4) return bot.quest.farm(933, "Tomb Robber", "sandport", "r3", "Right");
if (chain < 5) return work(934, SELLSWORD);

// The Pyramid
if (chain < 6) return bot.quest.farm(967, "Golden Scarab", "pyramid", "r2", "Right");
if (chain < 7) return bot.quest.farm(968, "Anubis Deathguard", "pyramid", "r3", "Right");
if (chain < 8) return bot.quest.farm(969, "Mummy", "pyramid", "r4", "Left");
if (chain < 9) return bot.quest.farm(970, "Golden Scarab", "pyramid", "r2", "Right");
if (chain < 10) return bot.quest.gather(971, 304, "pyramid");

// The Wanders
if (chain < 11) return bot.quest.farm(972, "Kalestri Worshiper", "wanders", "r2", "Down");
if (chain < 12) return bot.quest.farm(973, "Kalestri Hound", "wanders", "r3", "Down");
if (chain < 13) return bot.quest.farm(974, "Kalestri Hound", "wanders", "r3", "Down");
if (chain < 14) return bot.quest.farm(975, "Lotus Spider", "wanders", "r5", "Right");
if (chain < 15) return bot.quest.gather(976, 306, "wanders");
if (chain < 16) return bot.quest.farm(977, "Lotus Spider", "wanders", "r5", "Right");
if (chain < 17) return bot.quest.farm(978, "Sek-Duat", "wanders", "Boss", "Left");

// The Sand Castle
if (chain < 18) return bot.quest.gather(995, 361, "sandcastle");
if (chain < 19) return bot.quest.farm(996, "War Hyena", "sandcastle", "r2", "Down");
if (chain < 20) return bot.quest.farm(997, "War Mummy", "sandcastle", "r3", "Right");
if (chain < 21) return bot.quest.farm(998, "War Hyena", "sandcastle", "r2", "Down");
if (chain < 22) return bot.quest.farm(999, "Chaos Sphinx", "sandcastle", "r7", "Left");

// The Djinn Realm and the Oasis it feeds
if (chain < 23) return bot.quest.farm(1000, "Lamia", "djinn", "r2", "Right");
if (chain < 24) return bot.quest.farm(1001, "Desert Vase", "sandsea", "r6", "Left");
if (chain < 25) return bot.quest.farm(1002, "Bupers Camel", "sandsea", "Enter", "Spawn");
if (chain < 26) return bot.quest.farm(1003, "Harpy", "djinn", "r3", "Right");
if (chain < 27) return bot.quest.gather(1004, 370, "djinn");
if (chain < 28) return bot.quest.farm(1005, "Tibicenas", "djinn", "r5", "Up");

bot.log("chaos-7-tibicenas: done");
return true;
