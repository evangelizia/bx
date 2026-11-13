/// name: 13 Lords of Chaos: Escherion
/// desc: Completes the first Lord of Chaos storyline, from Mobius through Escherion.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, escherion, chiral valley, story, quest

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:135.

var STEPS = [
    { id: 245, monster: "Chaos Sp-Eye", map: "mobius" },
    { id: 246, mapItem: 42, map: "mobius" },
    { id: 247, monster: "Fire Imp", map: "mobius" },
    { id: 260, mapItem: 44, map: "mobius" },
    { id: 248, monster: "Cyclops Raider", map: "mobius" },
    { id: 249, monster: "Slugfit", map: "mobius" },
    { id: 250, monster: "Chainsaw Sneevil", map: "faerie" },
    { id: 251, mapItem: 43, map: "faerie" },
    { id: 252, monster: "Chainsaw Sneevil", map: "faerie" },
    { id: 255, monster: "Cyclops Warlord", map: "faerie" },
    { id: 256, monster: "Aracara", map: "faerie" },
    { id: 257, monster: "Gargoyle", map: "cornelis" },
    { id: 261, mapItem: 45, map: "cornelis" },
    { id: 258, monster: "Gargoyle", map: "cornelis" },
    { id: 262, mapItem: 46, map: "cornelis" },
    { id: 259, monster: "Stone Golem", map: "cornelis" },
    { id: 263, mapItem: 47, map: "cornelis" },
    { id: 266, mapItem: 48, map: "mobius" },
    { id: 267, mapItem: 49, map: "mobius" },
    { id: 264, monster: "Cyclops Raider", map: "mobius" },
    { id: 265, monster: "Chainsaw Sneevil", map: "faerie" },
    { id: 268, monster: "Cyclops Raider", map: "relativity" },
    { id: 269, monster: "Fire Imp", map: "relativity" },
    { id: 270, monster: "Head Gargoyle", map: "relativity" },
    { id: 271, mapItems: [50, 51, 52], map: "hydra" },
    { id: 272, monster: "Escherion", map: "escherion" }
];

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    if (bot.quest.done(step.id)) continue;

    if (step.mapItems !== undefined) {
        if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return;
        var wants = bot.quest.wants(step.id);
        if (wants == null) return;
        for (var j = 0; j < wants.length; j++) {
            if (wants[j].have >= wants[j].need) continue;
            if (!bot.travel(step.map)) return;
            if (!bot.mapItem(step.mapItems[j], wants[j].need - wants[j].have, wants[j].id)) return;
            return;
        }
        if (bot.quest.ready(step.id)) bot.quest.turnIn(step.id);
        return;
    }
    if (step.mapItem !== undefined) {
        if (!bot.quest.gather(step.id, step.mapItem, step.map)) return;
        continue;
    }
    if (!bot.quest.farm(step.id, step.monster, step.map)) return;
}

bot.log("chaos-1-escherion: completed quests 245-272");
return true;
