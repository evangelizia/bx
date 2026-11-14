/// name: 13 Lords of Chaos: Vath
/// desc: Completes the second Lord of Chaos storyline, from the Pines through Vath.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, vath, dwarfhold, story, quest

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:228.

var STEPS = [
    { id: 319, mapItem: 56, map: "tavern" },
    { id: 320, monster: "Pine Grizzly", map: "pines" },
    { id: 321, monster: "Red Shell Turtle", map: "pines" },
    { id: 322, monster: "Twistedtooth", map: "pines" },
    { id: 324, monster: "Red Shell Turtle", map: "pines" },
    { id: 325, monster: "Pine Grizzly", map: "pines" },
    { id: 326, monster: "LeatherWing", map: "pines" },
    { id: 327, monster: "Pine Troll", map: "pines" },
    { id: 323, auto: true },
    { id: 344, mapItem: 60, map: "dwarfhold" },
    { id: 331, monster: "Ore Balboa", map: "mountainpath" },
    { id: 332, monster: "Vultragon", map: "mountainpath" },
    { id: 333, monster: "Chaos Drow", map: "dwarfhold" },
    { id: 334, monster: "Glow Worm", map: "dwarfhold" },
    { id: 335, monster: "Albino Bat", map: "dwarfhold" },
    { id: 336, monster: "Chaotic Draconian", map: "dwarfhold" },
    { id: 337, mapItem: 59, map: "dwarfhold" },
    { id: 338, monster: "Chaos Drow", map: "dwarfhold" },
    { id: 339, monster: "Chaotic Draconian", map: "dwarfhold" },
    { id: 340, monster: "Albino Bat", map: "dwarfhold" },
    { id: 343, auto: true },
    { id: 341, monster: "Amadeus", map: "dwarfhold" },
    { id: 346, mapItem: 61, map: "uppercity" },
    { id: 347, monster: "Drow Assassin", map: "uppercity" },
    { id: 348, monster: "Chaotic Draconian", map: "uppercity" },
    { id: 349, monster: "Chaos Egg", map: "uppercity" },
    { id: 350, monster: "Terradactyl", map: "uppercity" },
    { id: 351, monster: "Rhino Beetle", map: "uppercity" },
    { id: 352, monster: "Cave Lizard", map: "uppercity" },
    { id: 353, map: "dwarfprison", parts: [
        { item: 1695, monster: "Balboa" },
        { item: 1697, monster: "Chaos Drow" },
        { item: 1696, monster: "Albino Bat" }
    ] },
    { id: 354, useThermite: true },
    { id: 355, monster: "Warden Elfis", map: "dwarfprison" },
    { id: 357, bigBadaBoom: true },
    { id: 362, mapItem: 62, map: "roc" },
    { id: 363, mapItem: 63, map: "stalagbite" }
];

function workMixed(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var short = wants[i].need - wants[i].have;
        if (short <= 0) continue;
        var source = sourceFor(step, wants[i].id);
        if (source == null) {
            bot.fail("quest " + step.id + " has no source for requirement " + wants[i].id);
            return false;
        }
        return bot.hunt(step.map, source.monster, short);
    }
    return bot.quest.ready(step.id) ? bot.quest.turnIn(step.id) : false;
}

function sourceFor(step, item) {
    for (var i = 0; i < step.parts.length; i++) {
        if (step.parts[i].item === item) return step.parts[i];
    }
    return null;
}

function useThermite() {
    if (bot.quest.ready(354)) return bot.quest.turnIn(354);
    if (!bot.quest.active(354) && !bot.quest.accept(354)) return false;
    if (!bot.travel("vath")) return false;
    if (!bot.moveToCell("CutCap", "Left")) return false;
    return bot.quest.ready(354) ? bot.quest.turnIn(354) : false;
}

function workBigBadaBoom() {
    if (bot.quest.ready(357)) return bot.quest.turnIn(357);

    var teeEnTee = bot.item("Tee-En-Tee");
    if (teeEnTee == null) return false;

    if (teeEnTee < 1) {
        var explosiveQuest = { id: 356, map: "dwarfprison", parts: [
            { item: 1700, monster: "Albino Bat" },
            { item: 1701, monster: "Chaos Drow" },
            { item: 1702, monster: "Balboa" }
        ] };
        if (bot.quest.ready(356)) {
            bot.memory.awaitingTeeEnTee = true;
            return bot.quest.turnIn(356);
        }
        if (bot.memory.awaitingTeeEnTee) return false;
        return workMixed(explosiveQuest);
    }

    bot.memory.awaitingTeeEnTee = false;
    if (!bot.travel("dwarfprison")) return false;
    if (!bot.quest.active(357)) return bot.quest.accept(357);
    return bot.quest.ready(357) ? bot.quest.turnIn(357) : false;
}

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    var done = bot.quest.done(step.id);
    if (done == null) return;
    if (done) continue;

    if (step.auto) {
        if (bot.quest.ready(step.id)) bot.quest.turnIn(step.id);
        else if (!bot.quest.active(step.id)) bot.quest.accept(step.id);
        return;
    }
    if (step.useThermite) {
        useThermite();
        return;
    }
    if (step.bigBadaBoom) {
        workBigBadaBoom();
        return;
    }
    if (step.parts !== undefined) {
        workMixed(step);
        return;
    }
    if (step.mapItem !== undefined) {
        bot.quest.gather(step.id, step.mapItem, step.map);
        return;
    }
    bot.quest.farm(step.id, step.monster, step.map);
    return;
}

bot.log("chaos-02-vath: completed quests 319-363");
return true;
