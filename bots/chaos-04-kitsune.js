/// name: 13 Lords of Chaos: Kitsune
/// desc: Completes the fourth Lord of Chaos storyline, from the Yokai Boat through Kitsune.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, kitsune, yokai, story, quest

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:414.

var STEPS = [
    { id: 380, map: "yokaiboat", parts: [
        { mapItem: 64, map: "yokaiboat" },
        { monster: "Kappa Ninja", map: "yokaiboat" }
    ] },
    { id: 381, any: true, map: "yokaiboat", cell: "r4", pad: "Spawn" },
    { id: 382, monster: "Ryoku", map: "dragonkoi" },
    { id: 402, map: "hachiko", parts: [
        { monster: "Samurai Nopperabo", map: "hachiko" },
        { monster: "Ninja Nopperabo", map: "hachiko" }
    ] },
    { id: 403, map: "hachiko", parts: [
        { monster: "Samurai Nopperabo", map: "hachiko", cell: "Ox", pad: "Center" }
    ] },
    { id: 405, map: "hachiko", parts: [
        { monster: "Samurai Nopperabo", map: "hachiko", cell: "Tiger", pad: "Center" },
        { monster: "Ninja Nopperabo", map: "hachiko", cell: "Snake", pad: "Center" },
        { monster: "Samurai Nopperabo", map: "hachiko", cell: "Horse", pad: "Center" },
        { monster: "Ninja Nopperabo", map: "hachiko", cell: "Pig", pad: "Center" }
    ] },
    { id: 406, monster: "Dai Tengu", map: "hachiko" },
    { id: 466, mapItem: 90, map: "bamboo" },
    { id: 467, map: "bamboo", parts: [
        { monster: "Tanuki", map: "bamboo" },
        { monster: "Tanuki", map: "bamboo" }
    ] },
    { id: 468, monster: "SoulTaker", map: "bamboo" },
    { id: 469, mapItem: 91, map: "junkyard" },
    { id: 470, map: "junkyard", parts: [
        { monster: "Wild Kara-Kasa", map: "junkyard", cell: "Enter", pad: "Left" },
        { monster: "Wild Bura-Bura", map: "junkyard", cell: "r2", pad: "Left" },
        { monster: "Wild Biwa-Bokuboku", map: "junkyard", cell: "r2", pad: "Left" },
        { monster: "Wild Koto-Furunushi", map: "junkyard", cell: "r3", pad: "Left" },
        { monster: "Wild Bakezouri", map: "junkyard", cell: "Enter", pad: "Left" }
    ] },
    { id: 471, monster: "Onibaba", map: "junkyard" },
    { id: 473, map: "yokairiver", parts: [
        { monster: "Funa-yurei", map: "yokairiver" },
        { monster: "Funa-yurei", map: "yokairiver" },
        { monster: "Funa-yurei", map: "yokairiver" }
    ] },
    { id: 474, map: "yokairiver", parts: [
        { monster: "Kappa Ninja", map: "yokairiver", cell: "r4", pad: "Left" },
        { monster: "Kappa Ninja", map: "yokairiver", cell: "r4", pad: "Left" },
        { monster: "Kappa Ninja", map: "yokairiver", cell: "r4", pad: "Left" },
        { mapItem: 92, map: "yokairiver" }
    ] },
    { id: 476, monster: "Nure Onna", map: "yokairiver" },
    { id: 477, monster: "Skello Kitty", map: "yokaigrave" },
    { id: 478, map: "yokaigrave", parts: [
        { monster: "Ninja Nopperabo", map: "yokaigrave" },
        { monster: "Samurai Nopperabo", map: "yokaigrave" }
    ] },
    { id: 479, monster: "Neko Mata", map: "yokaigrave" },
    { id: 481, monster: "O-dokuro", map: "odokuro" },
    { id: 484, monster: "O-Dokuro's Head", map: "yokaiwar" },
    { id: 488, monster: "Kitsune", map: "kitsune" }
];

function workMixed(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short <= 0) continue;

        var source = step.parts[i];
        if (source === undefined) {
            bot.fail("quest " + step.id + " has an unmapped requirement at position " + i);
            return false;
        }
        if (!bot.travel(source.map)) return false;
        if (source.mapItem !== undefined) {
            bot.mapItem(source.mapItem, short, want.id);
            return false;
        }
        return bot.hunt(source.map, source.monster, short, source.cell, source.pad);
    }
    return bot.quest.ready(step.id) ? bot.quest.turnIn(step.id) : false;
}

function workAny(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;
    var wants = bot.quest.wants(step.id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var short = wants[i].need - wants[i].have;
        if (short <= 0) continue;
        if (!bot.travel(step.map, step.cell, step.pad)) return false;
        return bot.kill("*", short);
    }
    return bot.quest.ready(step.id) ? bot.quest.turnIn(step.id) : false;
}

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    var done = bot.quest.done(step.id);
    if (done == null) return;
    if (done) continue;
    if (step.parts !== undefined) {
        workMixed(step);
        return;
    }
    if (step.any) {
        workAny(step);
        return;
    }
    if (step.mapItem !== undefined) {
        bot.quest.gather(step.id, step.mapItem, step.map);
        return;
    }
    bot.quest.farm(step.id, step.monster, step.map);
    return;
}

bot.log("chaos-04-kitsune: completed quests 380-488");
return true;
