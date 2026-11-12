/// name: Prologue Story
/// desc: Completes the Swordhaven Undead and Forest of Chaos prologue quests, 183 to 6219.
/// once: true
/// timeout: 0
/// version: 1.1
/// author: beatrix
/// tags: story, quest, prologue, chaos saga, 13 lords of chaos, swordhaven, forest of chaos

// Ported from refs/Scripts/Story/LordsofChaos/Core13LoC.cs:60 (Prologue).
//
// Thirteen quests across the Swordhaven Undead, Shadowfall, Chaos Crypt,
// Prison, and Forest of Chaos chapters. The first six write slot 20; the
// Shadowfall bridge quest writes slot 43; the last four write slot 42. The
// cutscene transition uses the reference's two direct quest
// packets. ALIGNMENT is 0 (Good); change it only if a different alignment is
// intended for the character.
//
// Every requirement is temporary except the Unlife Insurance Bond bought for
// 6216. Its five prison map-item clicks are sent before buying the bond.

var CHAIN = [
    { id: 183, map: "battleundera", spots: { 869: { monster: "Skeletal Fire Mage" } } },
    { id: 176, map: "swordhavenundead", spots: { 828: { monster: "Skeletal Soldier" } } },
    { id: 177, map: "swordhavenundead", spots: { 829: { monster: "Skeletal Ice Mage" } } },
    { id: 178, map: "swordhavenundead", spots: { 830: { monster: "Undead Giant" } } },
    { id: 179, map: "castleundead", spots: { 831: { item: 38, count: 5 } } },
    { id: 180, map: "castleundead", spots: { 832: { monster: "Skeletal Viking" } } },
    { id: 195, map: "shadowfall", spots: {} },
    { id: 196, map: "chaoscrypt", spots: { 900: { monster: "Chaorrupted Armor" } } },
    { id: 6216, map: "prison", spots: { 42993: { item: 39, count: 5, shop: 1559 } } },
    { id: 6217, map: "chaoscrypt", spots: { 42994: { item: 5662 } } },
    { id: 6218, map: "chaoscrypt", spots: { 901: { monster: "Chaorrupted Knight" } } },
    { id: 6219, map: "forestchaos", spots: {
        42996: { monster: "Chaorrupted Bear" },
        42995: { monster: "Chaorrupted Wolf" } } }
];

var ALIGNMENT = 0;

function shadowfallTransition() {
    if (bot.memory.transition >= 2) return bot.travel("shadowfall");
    if (!bot.travel("castleundead", "King2", "Center")) return false;
    if (!bot.memory.transition) {
        if (!bot.sendPacket("%xt%zm%updateQuest%73922%43%1%")) return false;
        bot.memory.transition = 1;
        return false;
    }
    if (bot.memory.transition === 1) {
        if (!bot.sendPacket("%xt%zm%updateQuest%188220%41%" + ALIGNMENT + "%")) return false;
        bot.memory.transition = 2;
        return false;
    }
    return false;
}

function report(step, wants) {
    bot.memory.beats = (bot.memory.beats || 0) + 1;
    if (bot.memory.beats % 100 !== 0) return;

    var short = [];
    for (var i = 0; i < wants.length; i++) {
        if (wants[i].have < wants[i].need) {
            short.push(wants[i].id + " " + wants[i].have + "/" + wants[i].need);
        }
    }
    bot.log("prologue: " + step.id +
        (short.length ? " wants " + short.join(", ") : " is ready and will not turn in"));
}

function fight(step, spot, short) {
    if (!bot.travel(step.map)) return;
    var found = bot.roomMonster(spot.monster);
    if (found === null) {
        if (bot.memory.lost !== spot.monster) {
            bot.memory.lost = spot.monster;
            bot.log("prologue: no " + spot.monster + " in this room");
        }
        return;
    }
    if (!bot.moveToCell(found.cell, found.pad)) return;
    bot.kill(spot.monster, short);
}

function work(step) {
    if (step.id === 195 && !shadowfallTransition()) return false;
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
        if (spot.item !== undefined) {
            if (!bot.travel(step.map)) return false;
            if (spot.shop !== undefined) {
                if (!bot.memory.prisonMapItems) {
                    if (!bot.mapItem(spot.item, spot.count || want.need, 0)) return false;
                    bot.memory.prisonMapItems = true;
                }
                if (!bot.buy(spot.shop, want.id, 1)) return false;
            } else if (!bot.mapItem(spot.item, spot.count || want.need, 0)) {
                return false;
            }
        } else {
            fight(step, spot, want.need - want.have);
        }
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

bot.log("prologue: Forest of Chaos cleared");
return true;
