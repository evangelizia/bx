/// name: 13 Lords of Chaos: Kitsune
/// desc: Completes the fourth Lord of Chaos storyline, from the Yokai Boat through Kitsune.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, kitsune, yokai, story, quest

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:414.

var STEPS = [
    { id: 380, map: "yokaiboat", parts: [
        { item: 44425, mapItem: 64, map: "yokaiboat" },
        { item: 44426, monster: "Kappa Ninja", map: "yokaiboat" }
    ] },
    { id: 381, any: true, map: "yokaiboat", cell: "r4", pad: "Spawn" },
    { id: 382, monster: "Ryoku", map: "dragonkoi" },
    { id: 402, map: "hachiko", parts: [
        { item: 2223, monster: "Samurai Nopperabo", map: "hachiko" },
        { item: 2222, monster: "Ninja Nopperabo", map: "hachiko" }
    ] },
    { id: 403, map: "hachiko", parts: [
        { item: 2224, monster: "Samurai Nopperabo", map: "hachiko", cell: "Ox", pad: "Center" }
    ] },
    { id: 405, map: "hachiko", parts: [
        { item: 2225, monster: "Samurai Nopperabo", map: "hachiko", cell: "Tiger", pad: "Center" },
        { item: 2226, monster: "Ninja Nopperabo", map: "hachiko", cell: "Snake", pad: "Center" },
        { item: 2227, monster: "Samurai Nopperabo", map: "hachiko", cell: "Horse", pad: "Center" },
        { item: 2228, monster: "Ninja Nopperabo", map: "hachiko", cell: "Pig", pad: "Center" }
    ] },
    { id: 406, monster: "Dai Tengu", map: "hachiko" },
    { id: 466, mapItem: 90, map: "bamboo" },
    { id: 467, map: "bamboo", parts: [
        { item: 2658, monster: "Tanuki", map: "bamboo" },
        { item: 2659, monster: "Tanuki", map: "bamboo" }
    ] },
    { id: 468, monster: "SoulTaker", map: "bamboo" },
    { id: 469, mapItem: 91, map: "junkyard" },
    { id: 470, map: "junkyard", parts: [
        { item: 2662, monster: "Wild Kara-Kasa", map: "junkyard", cell: "Enter", pad: "Left" },
        { item: 2663, monster: "Wild Bura-Bura", map: "junkyard", cell: "r2", pad: "Left" },
        { item: 2665, monster: "Wild Biwa-Bokuboku", map: "junkyard", cell: "r2", pad: "Left" },
        { item: 2666, monster: "Wild Koto-Furunushi", map: "junkyard", cell: "r3", pad: "Left" },
        { item: 2667, monster: "Wild Bakezouri", map: "junkyard", cell: "Enter", pad: "Left" }
    ] },
    { id: 471, monster: "Onibaba", map: "junkyard" },
    { id: 473, map: "yokairiver", parts: [
        { item: 2689, monster: "Funa-yurei", map: "yokairiver" },
        { item: 2691, monster: "Funa-yurei", map: "yokairiver" },
        { item: 2692, monster: "Funa-yurei", map: "yokairiver" }
    ] },
    { id: 474, kappaCuisine: true },
    { id: 476, monster: "Nure Onna", map: "yokairiver" },
    { id: 477, monster: "Skello Kitty", map: "yokaigrave" },
    { id: 478, map: "yokaigrave", parts: [
        { item: 2700, monster: "Ninja Nopperabo", map: "yokaigrave" },
        { item: 2701, monster: "Samurai Nopperabo", map: "yokaigrave" }
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

        var source = sourceFor(step, want.id);
        if (source == null) {
            bot.fail("quest " + step.id + " has no source for requirement " + want.id);
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

function sourceFor(step, item) {
    for (var i = 0; i < step.parts.length; i++) {
        if (step.parts[i].item === item) return step.parts[i];
    }
    return null;
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

function workKappaCuisine() {
    if (bot.quest.ready(474)) return bot.quest.turnIn(474);
    if (!bot.quest.active(474) && !bot.quest.accept(474)) return false;

    var ingredients = [
        { name: "Dried Nori Leaf", count: 6 },
        { name: "Sumeshi Bundle", count: 3 },
        { name: "Fresh Cucumber", count: 1 }
    ];
    for (var i = 0; i < ingredients.length; i++) {
        var ingredient = ingredients[i];
        var have = bot.item(ingredient.name);
        if (have == null) return false;
        if (have < ingredient.count) {
            return bot.hunt("yokairiver", "Kappa Ninja", 1, "r4", "Left");
        }
    }

    var wants = bot.quest.wants(474);
    if (wants == null) return false;
    for (var j = 0; j < wants.length; j++) {
        var want = wants[j];
        var short = want.need - want.have;
        if (short > 0) {
            if (!bot.travel("yokairiver")) return false;
            bot.mapItem(92, short, want.id);
            return false;
        }
    }
    return bot.quest.ready(474) ? bot.quest.turnIn(474) : false;
}

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    var done = bot.quest.done(step.id);
    if (done == null) return;
    if (done) continue;
    if (step.kappaCuisine) {
        workKappaCuisine();
        return;
    }
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
