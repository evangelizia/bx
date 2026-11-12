/// name: Doom Vault B Story
/// desc: Completes the /doomvaultb Grim Underdungeon, quests 2972 to 3004, ending with Undead Raxgore.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, doom vault b, doomvaultb, grim underdungeon, undead raxgore, grimskull, heroblade

// Ported from refs/Scripts/Story/DoomVaultB.cs.
//
// Twenty-six quests, each writing the next value of slot 127, which the
// GrimBlade merge and the Gear of Awe relic farm ask for. The client only lets
// a quest be taken once the slot holds the value before it, so the chain is
// walked in order and a quest the slot has passed is skipped. Nothing outside
// the Grim Underdungeon writes slot 127, so a done() answer is honest here.
//
// The reference runs the Doom Vault A gauntlet first, and this bot requires
// it: quest 3008 on slot 126 is checked before anything else.
//
// Twenty-two of the quests kill one monster type by name, which the reference
// also does. Three (2990, 2995, 3000) are dialog links with no requirement at
// all, taken and handed straight back. And one requirement is permanent
// rather than temp - the Grim Key off a Grimmer Shelleton for 2978 - so that
// kill is followed by a pickup, the only one in either Doom Vault chain.
//
// Undead Raxgore is pinned to r26/Left, the reference's own cell, which every
// other script that farms him uses. Every other monster is found through the
// room watch, which reports the cell it stands in. Beatrix has no class swap,
// so the fight class, and Raxgore himself, are the player's business.

var MAP = "doomvaultb";

// One row per quest. A spot is a monster to kill, keyed by the item it pays
// for. A cell on the spot is the reference's own and skips the room watch; a
// drop on the spot is a permanent item picked up after the kill lands.
var CHAIN = [
    { id: 2972, spots: { 18164: { monster: "Grimmer Soldier" } } },
    { id: 2973, spots: { 18167: { monster: "Grimmer Fighter" } } },
    { id: 2975, spots: { 18169: { monster: "Grimmer Lich" } } },
    { id: 2976, spots: { 18171: { monster: "Weeping Spyball" } } },
    { id: 2977, spots: { 18166: { monster: "Grimmer Ectomancer" } } },
    { id: 2978, spots: {
        18152: { monster: "Grimmer Shelleton", drop: "Grim Key" } } },
    { id: 2979, spots: { 18167: { monster: "Grimmer Fighter" } } },
    { id: 2980, spots: { 18168: { monster: "Grimmer Fire Mage" } } },
    { id: 2984, spots: { 18169: { monster: "Grimmer Lich" } } },
    { id: 2985, spots: { 18171: { monster: "Weeping Spyball" } } },
    { id: 2986, spots: { 18167: { monster: "Grimmer Fighter" } } },
    { id: 2987, spots: { 18169: { monster: "Grimmer Lich" } } },
    { id: 2988, spots: { 18167: { monster: "Grimmer Fighter" } } },
    { id: 2989, spots: { 18171: { monster: "Weeping Spyball" } } },
    { id: 2990, spots: {} },
    { id: 2991, spots: { 18170: { monster: "Grimmer Shelleton" } } },
    { id: 2992, spots: { 18164: { monster: "Grimmer Soldier" } } },
    { id: 2993, spots: { 18169: { monster: "Grimmer Lich" } } },
    { id: 2994, spots: { 18169: { monster: "Grimmer Lich" } } },
    { id: 2995, spots: {} },
    { id: 2996, spots: { 18168: { monster: "Grimmer Fire Mage" } } },
    { id: 2997, spots: { 18167: { monster: "Grimmer Fighter" } } },
    { id: 2998, spots: { 18166: { monster: "Grimmer Ectomancer" } } },
    { id: 2999, spots: { 18164: { monster: "Grimmer Soldier" } } },
    { id: 3000, spots: {} },
    { id: 3004, spots: {
        18163: { monster: "Undead Raxgore", cell: "r26", pad: "Left" } } }
];

var aDone = bot.quest.done(3008);
if (aDone === null) return;
if (!aDone) {
    bot.fail("doom-vault-b: Doom Vault A (3008) is not finished; run doom-vault first");
    return;
}

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
    bot.log("doom-vault-b: " + step.id +
        (short.length ? " wants " + short.join(", ") : " is ready and will not turn in"));
}

// One kill run, short of the count by whatever the last run paid. A permanent
// drop is picked before the kill, so the pickup lands the moment the drop
// appears instead of a whole kill run later.
function fight(spot, short) {
    if (!bot.travel(MAP)) return;
    var cell = spot.cell;
    var pad = spot.pad;
    if (!cell) {
        var found = bot.roomMonster(spot.monster);
        if (found === null) {
            if (bot.memory.lost !== spot.monster) {
                bot.memory.lost = spot.monster;
                bot.log("doom-vault-b: no " + spot.monster + " in this room");
            }
            return;
        }
        cell = found.cell;
        pad = found.pad;
    }
    if (!bot.moveToCell(cell, pad)) return;
    if (spot.drop && !bot.pickDrop(spot.drop)) return;
    bot.kill(spot.monster, short);
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

bot.log("doom-vault-b: Undead Raxgore is down");
return true;
