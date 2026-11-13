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
    { id: 308, monster: "Wolf", map: "greenguardeast" },
    { id: 309, monster: "Slime", map: "greenguardwest" },
    { id: 310, monster: "Frogzard", map: "greenguardwest" },
    { id: 311, monster: "Spider", map: "greenguardeast" },
    { id: 515, map: "greenguardeast", pre: [514], parts: [
        { monster: "Spider", map: "greenguardeast" },
        { monster: "Wolf", map: "greenguardeast" },
        { monster: "Slime", map: "greenguardwest" },
        { monster: "Frogzard", map: "greenguardwest" },
        { monster: "Big Bad Boar", map: "greenguardwest", cell: "West12", pad: "Up" }
    ] },
    { id: 514, auto: true },
    { id: 516, monster: "Dire Wolf", map: "darkoviaforest" },
    { id: 517, map: "darkoviaforest", parts: [
        { monster: "Blood Maggot", map: "darkoviaforest" },
        { monster: "Blood Maggot", map: "darkoviaforest" },
        { monster: "Blood Maggot", map: "darkoviaforest" }
    ] },
    { id: 518, monster: "Lich of the Stone", map: "darkoviaforest" },
    { id: 519, monster: "Blood Maggot", map: "safiria" },
    { id: 520, monster: "Albino Bat", map: "safiria" },
    { id: 521, monster: "Chaos Lycan", map: "safiria" },
    { id: 522, monster: "Twisted Paw", map: "safiria" },
    { id: 534, monster: "Dire Wolf", map: "lycan" },
    { id: 535, map: "lycan", parts: [
        { monster: "Lycan Knight", map: "lycan" },
        { monster: "Lycan", map: "lycan" }
    ] },
    { id: 536, monster: "Chaos Vampire Knight", map: "lycan" },
    { id: 537, monster: "Sanguine", map: "lycan" },
    { id: 552, auto: true },
    { id: 564, map: "lycanwar", parts: [
        { monster: "Edvard", map: "lycanwar", cell: "Boss", pad: "Left" },
        { mapItem: 107, map: "chaoscave" }
    ] },
    { id: 565, monster: "Werepyre", map: "chaoscave" },
    { id: 566, monster: "Werepyre", map: "chaoscave", cell: "r3", pad: "Left" },
    { id: 567, monster: "DracoWerePyre", map: "chaoscave", cell: "r5", pad: "Left" },
    { id: 597, auto: true, goodAlignment: true }
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

    if (step.pre !== undefined) {
        for (var p = 0; p < step.pre.length; p++) {
            if (!bot.quest.active(step.pre[p]) && !bot.quest.accept(step.pre[p])) return;
        }
        workMixed(step);
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

bot.log("chaos-05-wolfwing: completed quests 308-597");
return true;
