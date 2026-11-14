/// name: 13 Lords of Chaos: Wolfwing
/// desc: Completes the fifth Lord of Chaos storyline, from Darkovia Grave through Wolfwing.
/// once: true
/// timeout: 90
/// tags: chaos, lord of chaos, wolfwing, darkovia, story, quest

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:553.

var STEPS = [
    { id: 494, mapItem: 97, map: "darkoviagrave" },
    { id: 495, monster: "Skeletal Fire Mage", map: "darkoviagrave" },
    { id: 496, monster: "Rattlebones", map: "darkoviagrave" },
    { id: 497, monster: "Albino Bat", map: "darkoviagrave" },
    { id: 498, monster: "Blightfang", map: "darkoviagrave" },
    { id: 516, prepareDireSituation: true },
    { id: 517, map: "darkoviaforest", parts: [
        { item: 2891, monster: "Blood Maggot", map: "darkoviaforest" },
        { item: 2892, monster: "Blood Maggot", map: "darkoviaforest" },
        { item: 2893, monster: "Blood Maggot", map: "darkoviaforest" }
    ] },
    { id: 518, monster: "Lich of the Stone", map: "darkoviaforest" },
    { id: 519, monster: "Blood Maggot", map: "safiria" },
    { id: 520, monster: "Albino Bat", map: "safiria" },
    { id: 521, monster: "Chaos Lycan", map: "safiria" },
    { id: 522, monster: "Twisted Paw", map: "safiria" },
    { id: 534, monster: "Dire Wolf", map: "lycan" },
    { id: 535, map: "lycan", parts: [
        { item: 3748, monster: "Lycan Knight", map: "lycan" },
        { item: 3747, monster: "Lycan", map: "lycan" }
    ] },
    { id: 536, monster: "Chaos Vampire Knight", map: "lycan" },
    { id: 537, monster: "Sanguine", map: "lycan" },
    { id: 552, auto: true },
    { id: 564, searchAndReport: true },
    { id: 565, monster: "Werepyre", map: "chaoscave" },
    { id: 566, monster: "Werepyre", map: "chaoscave", cell: "r3", pad: "Left" },
    { id: 567, monster: "DracoWerePyre", map: "chaoscave", cell: "r5", pad: "Left" },
    { id: 597, auto: true, goodAlignment: true }
];

var RED_AXE = {
    id: 515,
    parts: [
        { item: 2885, monster: "Spider", map: "greenguardeast" },
        { item: 2886, monster: "Wolf", map: "greenguardeast" },
        { item: 2887, monster: "Slime", map: "greenguardwest" },
        { item: 2888, monster: "Frogzard", map: "greenguardwest" },
        { item: 2889, monster: "Big Bad Boar", map: "greenguardwest", cell: "West12", pad: "Up" }
    ]
};

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

function workDireSituation() {
    var lilRed = bot.quest.done(514);
    if (lilRed == null) return false;

    if (!lilRed) {
        if (!bot.quest.active(514) && !bot.quest.accept(514)) return false;
        if (bot.quest.ready(514)) return bot.quest.turnIn(514);
        if (bot.quest.ready(515)) {
            bot.memory.awaitingRedAxe = true;
            return bot.quest.turnIn(515);
        }
        if (bot.memory.awaitingRedAxe) {
            bot.pickDrop("Red's Big Wolf Slaying Axe");
            return false;
        }
        if (!bot.quest.active(515) && !bot.quest.accept(515)) return false;
        return workMixed(RED_AXE);
    }

    bot.memory.awaitingRedAxe = false;
    return bot.quest.farm(516, "Dire Wolf", "darkoviaforest");
}

function workSearchAndReport() {
    if (bot.quest.ready(564)) return bot.quest.turnIn(564);
    if (!bot.quest.active(564) && !bot.quest.accept(564)) return false;

    if (!bot.memory.wolfwingEdvardDefeated) {
        if (!bot.hunt("lycanwar", "Edvard", 1, "Boss", "Left")) return false;
        bot.memory.wolfwingEdvardDefeated = true;
        return false;
    }

    var wants = bot.quest.wants(564);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short > 0) {
            if (!bot.travel("chaoscave")) return false;
            bot.mapItem(107, short, want.id);
            return false;
        }
    }
    return bot.quest.ready(564) ? bot.quest.turnIn(564) : false;
}

function workAlignmentQuest() {
    if (bot.quest.done(597)) return true;
    if (!bot.memory.wolfwingGoodAlignment) {
        if (bot.roomId == null) return false;
        if (!bot.sendPacket("%xt%zm%updateQuest%" + bot.roomId + "%41%1%")) return false;
        bot.memory.wolfwingGoodAlignment = true;
        return false;
    }
    if (bot.quest.ready(597)) return bot.quest.turnIn(597);
    if (!bot.quest.active(597)) return bot.quest.accept(597);
    return false;
}

var alternateFinal = bot.quest.done(598);
if (alternateFinal == null) return;
if (alternateFinal) return true;

for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    var done = bot.quest.done(step.id);
    if (done == null) return;
    if (done) continue;

    if (step.prepareDireSituation) {
        workDireSituation();
        return;
    }
    if (step.searchAndReport) {
        workSearchAndReport();
        return;
    }
    if (step.goodAlignment) {
        workAlignmentQuest();
        return;
    }
    if (step.auto) {
        if (bot.quest.ready(step.id)) bot.quest.turnIn(step.id);
        else if (!bot.quest.active(step.id)) bot.quest.accept(step.id);
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
    bot.quest.farm(step.id, step.monster, step.map, step.cell, step.pad);
    return;
}

bot.log("chaos-05-wolfwing: completed quests 494-597");
return true;
