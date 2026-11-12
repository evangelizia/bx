/// name: Doom Vault Story
/// desc: Completes the /doomvault gauntlet, quests 2952 to 3008, ending with the Ghost King Angler.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, doom vault, doomvault, grimskull, angler, raxgore, heroblade

// Ported from refs/Scripts/Story/DoomVault.cs.
//
// Eighteen quests, each writing the next value of slot 126, which continues
// into the two HeroBlade builds (3001 and 3002) and gates Doom Vault B in the
// reference. The client only lets a quest be taken once the slot holds the
// value before it, so the chain is walked in order and a quest the slot has
// passed is skipped. Nothing outside this gauntlet writes slot 126, so a
// done() answer is honest here.
//
// The reference kills by monster map id, which Beatrix cannot ask for, so the
// names come from the AQW wiki drop tables: Soldier Slain off Grim Soldier,
// Fighter Slain off Grim Fighter, Mage Slain off Grim Fire Mage, Shelleton
// Slain and the Princess Key off Grim Shelleton, Spyball Slain off Flying
// Spyball, Ectomancer Slain off Grim Ectomancer, Grim Soul off Grim Souldier
// (the spelling is the monster's own), Lich Slain off Grim Lich, King Slayer
// off Ghost King Angler, and Hand of the Princess and Angler Slain off
// Princess Angler. The room watch reports the first of a name in map load
// order, which is the story's own order, so the instance it picks is one the
// chain has already walked to.
//
// Every requirement is a temporary item the server adds on the kill, so there
// is nothing to pick up: the count is read back out of the quest itself.
//
// What the reference leaves unsaid, and this bot with it. Two Princess
// Anglers share a name, so the two quests that kill one pin the reference's
// own cells, r14/Left and r24, instead of trusting the watch. Both Fallen
// statue types drop both the Stone Key and Raxgore's Key and the reference
// gives only map ids, so each key quest tries Fallen Emperor Statue first and
// Fallen Light Statue second: a "moving to rX never arrived" failure on 2968
// or 3007 is that order needing a swap. And Beatrix has no class swap and no
// cutscene handling, so the fight class, and the Ghost King Angler, are the
// player's business.

var MAP = "doomvault";

// One row per quest. A spot is a monster to kill, keyed by the item it pays
// for. A cell on the spot is the reference's own and skips the room watch;
// a monsters list is tried in order until the watch sees one.
var CHAIN = [
    { id: 2952, spots: { 18018: { monster: "Grim Soldier" } } },
    { id: 2953, spots: { 18019: { monster: "Grim Fighter" } } },
    { id: 2954, spots: { 18020: { monster: "Grim Fire Mage" } } },
    { id: 2955, spots: { 18021: { monster: "Grim Shelleton" } } },
    { id: 2965, spots: { 18022: { monster: "Flying Spyball" } } },
    { id: 2966, spots: {
        18023: { monster: "Princess Angler", cell: "r14", pad: "Left" } } },
    { id: 2967, spots: { 18024: { monster: "Grim Ectomancer" } } },
    { id: 2968, spots: {
        18025: { monsters: ["Fallen Emperor Statue", "Fallen Light Statue"] } } },
    { id: 2969, spots: { 18026: { monster: "Grim Souldier" } } },
    { id: 2970, spots: { 18027: { monster: "Grim Shelleton" } } },
    { id: 2971, spots: {
        18028: { monster: "Princess Angler", cell: "r24" } } },
    { id: 2974, spots: { 18029: { monster: "Grim Fire Mage" } } },
    { id: 2981, spots: { 18030: { monster: "Grim Lich" } } },
    { id: 2982, spots: { 18031: { monster: "Grim Fighter" } } },
    { id: 2983, spots: { 18032: { monster: "Grim Ectomancer" } } },
    { id: 3006, spots: { 18033: { monster: "Grim Shelleton" } } },
    { id: 3007, spots: {
        18034: { monsters: ["Fallen Emperor Statue", "Fallen Light Statue"] } } },
    { id: 3008, spots: { 18035: { monster: "Ghost King Angler" } } }
];

// Say what a quest still wants every hundred ticks - ten seconds - so a step
// that is not landing shows up in the log instead of fighting quietly forever.
function report(step, wants) {
    bot.memory.beats = (bot.memory.beats || 0) + 1;
    if (bot.memory.beats % 100 !== 0) return;

    var short = [];
    for (var i = 0; i < wants.length; i++) {
        if (wants[i].have < wants[i].need) {
            short.push(wants[i].id + " " + wants[i].have + "/" + wants[i].need);
        }
    }
    bot.log("doom-vault: " + step.id +
        (short.length ? " wants " + short.join(", ") : " is ready and will not turn in"));
}

// One kill run, short of the count by whatever the last run paid.
function fight(spot, short) {
    if (!bot.travel(MAP)) return;
    var names = spot.monsters || [spot.monster];
    var name = spot.monster;
    var cell = spot.cell;
    var pad = spot.pad;
    if (!cell) {
        cell = null;
        for (var i = 0; i < names.length; i++) {
            var found = bot.roomMonster(names[i]);
            if (found === null) continue;
            name = names[i];
            cell = found.cell;
            pad = found.pad;
            break;
        }
        if (cell === null) {
            if (bot.memory.lost !== names[0]) {
                bot.memory.lost = names[0];
                bot.log("doom-vault: no " + names.join(" or ") + " in this room");
            }
            return;
        }
    }
    if (!bot.moveToCell(cell, pad)) return;
    bot.kill(name, short);
}

// One quest: handed in when the client offers it, taken when it is not being
// carried, and worked one unmet requirement at a time. True only once the
// turn-in has landed, which is when the chain may move on.
function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants === null) return false;
    report(step, wants);
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        var spot = step.spots[want.id];
        if (spot === undefined) {
            bot.fail("quest " + step.id + " wants item " + want.id + ", which no step gives");
            return false;
        }
        fight(spot, want.need - want.have);
        return false;
    }
    return false;
}

for (var i = 0; i < CHAIN.length; i++) {
    var step = CHAIN[i];
    var done = bot.quest.done(step.id);
    if (done === null) return;
    if (done) continue;
    if (!work(step)) return;
}

bot.log("doom-vault: the Ghost King Angler is down");
return true;
