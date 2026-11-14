/// name: Tower of Doom Questline
/// desc: Climbs the Tower of Doom for Zoshi, defeating the ten Dread bosses from Dread Klunk to Slugbutter (quests 3475-3484).
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, tower of doom, towerofdoom, zoshi, dread, bosses

// Zoshi (towerofdoom, Enter) offers the ten boss quests gated on slot 159:
// each turn-in sets the slot to that quest's iValue, so the chain is walked
// in order and is done at 10. Every turn-in is a temp "Defeated" quest item
// awarded on the kill, so there is nothing to pick up.
//
// Each boss lives on its own map -- Klunk in towerofdoom, then towerofdoom2
// through towerofdoom10 -- always in r10. The tower defends itself: entering
// a floor whose floor below was not cleared this session teleports you to
// Prison, so each floor's three monsters are killed in order on the way up.
// Floor 1 is r1 in the first tower and Enter in the later ones. Once the
// chain is complete (slot 159 >= 10) every floor stays open.
//
// Turning in quests 3479 and 3484 plays a cutscene that moves the player to
// Cut1; the next travel overrides it, so nothing special is needed.
//
// After the chain Zoshi keeps the repeatables: 3485 (Eternity Blade raffle
// drop from any boss) and 3508 (Snowball: Dread Teeth from the top five
// bosses plus a Dread Talon from the Mutated Void Dragon in bosschallenge,
// for the WyrmHunter set). Bosses and trash also drop Monster Trophies, the
// currency of the Monster Hunter merge shop 858.

var CHAIN_SLOT = 159;

var STEPS = [
    { id: 3475, map: "towerofdoom",   boss: "Dread Klunk",   first: "r1" },
    { id: 3476, map: "towerofdoom2",  boss: "Dread Arradia", first: "Enter" },
    { id: 3477, map: "towerofdoom3",  boss: "Dread Moganth", first: "Enter" },
    { id: 3478, map: "towerofdoom4",  boss: "Dread Kathool", first: "Enter" },
    { id: 3479, map: "towerofdoom5",  boss: "Creel",         first: "Enter" },
    { id: 3480, map: "towerofdoom6",  boss: "Dread Terror",  first: "Enter" },
    { id: 3481, map: "towerofdoom7",  boss: "Dread Warrior", first: "Enter" },
    { id: 3482, map: "towerofdoom8",  boss: "Dread Avatar",  first: "Enter" },
    { id: 3483, map: "towerofdoom9",  boss: "Dread Fang",    first: "Enter" },
    { id: 3484, map: "towerofdoom10", boss: "Slugbutter",    first: "Enter" }
];

var progress = bot.quest.value(CHAIN_SLOT);
if (progress == null) return;
if (progress >= STEPS.length) {
    bot.log("tower-of-doom: chain complete; Zoshi keeps repeatables 3485 (Eternity Blade) and 3508 (Snowball, WyrmHunter set), and the tower drops Monster Trophies for merge shop 858");
    return true;
}

var step = STEPS[progress];
if (bot.quest.ready(step.id)) {
    bot.quest.turnIn(step.id);
    return;
}
if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return;

if (bot.memory.step !== step.id) {
    bot.memory.step = step.id;
    bot.memory.floor = 0;
}

if (!bot.travel(step.map)) return;

var cells = [step.first];
for (var f = 2; f <= 9; f++) cells.push("r" + f);

if (bot.memory.floor < cells.length) {
    if (!bot.moveToCell(cells[bot.memory.floor], "Left")) return;
    if (!bot.kill(3)) return;
    bot.memory.floor++;
    return;
}

if (!bot.moveToCell("r10", "Left")) return;
bot.kill(step.boss, 1);
return;
