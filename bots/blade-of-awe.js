/// name: Blade of Awe
/// desc: Runs the five Awe quests in order, farms Blade of Awe reputation to rank 6, then buys the Blade of Awe.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: blade, awe, sword, reputation, quests, escherion

// Ported from refs/Scripts/Good/GearOfAwe/BladeOfAwe.cs, which calls
// Farm.BladeofAweREP(6, true): UnlockBoA in CoreFarms.cs, then rank 6 off
// Find the Hilt!, then the sword from the museum shop. Beatrix has no
// class-swap or boost steps, so those are left to the player.
//
// The five legs share chain 123 and are repeatable. quest.done stays true
// after the first turn-in, so the chain value is the gate and each leg is
// accepted, fought and handed in by hand in the order it unlocks.
//
// The Found! items are ordinary drops, not temporary quest items the server
// adds, so every leg picks its drop up after the kill.
//
// Escherion takes no damage while the Staff of Inversion is alive, and the
// staff returns, so the fight names whichever is standing.

var CHAIN = 123;
var LEGS = [
    { id: 2933, value: 1, map: "j6", cell: "R4", pad: "Left",
      monster: "Sketchy Dragon", drop: "Stonewrit Found!" },
    { id: 2934, value: 2, map: "gilead", cell: "r4", pad: "Left",
      monster: "Fire Elemental", drop: "Handle Found!" },
    { id: 2935, value: 3, map: "castleundead", cell: "Enter", pad: "Left",
      monster: "Skeletal Viking", drop: "Hilt Found!" },
    { id: 2936, value: 4, map: "hydra", cell: "Boss", pad: "Left",
      monster: "Hydra Head", drop: "Blade Found!" },
    { id: 2937, value: 5, map: "escherion", cell: "Boss", pad: "Left",
      monster: "Escherion", drop: "Runes Found!" }
];

// Rank 6 gates the sword. The Hilt leg repeats and is the top-up once the
// chain is done.
var RANK = 6;
var HILT = 2935;
var SHOP = 631;
var SWORD = 17585;

function fight(leg) {
    if (!bot.pickDrop(leg.drop)) return;

    if (leg.id !== 2937) {
        bot.kill(leg.monster, 1);
        return;
    }

    var staff = bot.monster("Staff of Inversion");
    if (staff != null && staff.alive) {
        bot.kill("Staff of Inversion", 1);
        return;
    }
    bot.kill("Escherion", 1);
}

function step(leg) {
    if (!bot.quest.active(leg.id)) {
        if (!bot.travel(leg.map)) return;
        if (!bot.moveToCell(leg.cell, leg.pad)) return;
        if (!bot.quest.accept(leg.id)) return;
        bot.log("blade-of-awe: accepted " + leg.id);
        return;
    }

    if (bot.quest.ready(leg.id)) {
        bot.quest.turnIn(leg.id);
        return;
    }

    if (!bot.travel(leg.map)) return;
    if (!bot.moveToCell(leg.cell, leg.pad)) return;
    fight(leg);
}

function farmRank() {
    var faction = bot.rep("Blade of Awe");
    if (faction == null) return false;

    if (bot.memory.rank !== faction.rank) {
        bot.memory.rank = faction.rank;
        bot.log("blade-of-awe: rank " + faction.rank);
    }
    if (faction.rank >= RANK) return true;

    if (!bot.travel("castleundead")) return false;
    if (!bot.moveToCell("Enter", "Left")) return false;

    if (!bot.quest.active(HILT)) {
        bot.quest.accept(HILT);
        return false;
    }

    if (!bot.pickDrop("Hilt Found!")) return false;
    if (bot.quest.ready(HILT)) {
        bot.quest.turnIn(HILT);
        return false;
    }
    bot.kill("Skeletal Viking", 1);
    return false;
}

// The first item() call only asks for the count; the answer is one snapshot
// away, and a blade already in the bag is a finished run.
var sword = bot.item(SWORD);
if (sword == null) return;
if (sword > 0) {
    bot.log("blade-of-awe: Blade of Awe already held");
    return true;
}

var chain = bot.quest.value(CHAIN);
if (chain == null) return;

for (var i = 0; i < LEGS.length; i++) {
    if (chain >= LEGS[i].value) continue;
    step(LEGS[i]);
    return;
}

if (!farmRank()) return;

if (!bot.travel("museum")) return;
if (!bot.buy(SHOP, SWORD)) return;
bot.log("blade-of-awe: bought Blade of Awe");
return true;
