/// name: Gold Farm
/// desc: Honor Hall for members, Battle Ground E for F2P, Berserker Bunny below 61.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: gold, battle ground e, honor hall, berserker bunny

// Ported from auqw/Scripts Farm/GoldFarm.cs. Farm.Gold in CoreFarms.cs
// runs the three methods in order until the gold target. Beatrix has no
// boost or class-swap steps, so those are left to the player. Quests are
// kept active and turned in as soon as they are ready, the same way
// RegisterQuests does in Skua.

var GOAL = 100000000;
var BUNNY = 34417; // Berserker Bunny, reward of 236, sold in greenguardwest.

function keepQuests(ids) {
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!bot.quest.active(id) && !bot.quest.accept(id)) return false;
    }
    return true;
}

function turnInReady(ids) {
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (bot.quest.ready(id)) {
            bot.quest.turnIn(id);
            return true;
        }
    }
    return false;
}

function honorHall() {
    if (!bot.travel("honorhall")) return;
    if (!bot.moveToCell("r1", "Center")) return;
    if (!keepQuests([3992, 3993])) return;
    if (turnInReady([3992, 3993])) return;
    if (!bot.kill("Ice Demon", 1)) return;
}

function battleGroundE() {
    if (!bot.travel("battlegrounde")) return;
    if (!bot.moveToCell("r2", "center")) return;
    if (!keepQuests([3991, 3992])) return;
    if (turnInReady([3991, 3992])) return;
    if (!bot.kill("", 1)) return;
}

function berserkerBunny() {
    if (!bot.travel("greenguardwest")) return;
    if (!bot.moveToCell("West12", "Up")) return;
    if (!bot.quest.active(236)) {
        bot.quest.accept(236);
        return;
    }
    if (bot.quest.ready(236)) {
        bot.quest.turnIn(236);
        return;
    }
    var bunnies = bot.item(BUNNY);
    if (bunnies == null) return;
    if (bunnies > 0) {
        bot.sell(BUNNY, bunnies);
        return;
    }
    if (!bot.kill("", 1)) return;
}

var gold = bot.gold;
if (gold == null) return;
if (gold >= GOAL) {
    bot.log("gold-farm: done at " + gold + " gold");
    return true;
}

var member = bot.member;
if (member == null) return;
var level = bot.level;
if (level == null) return;

// HonorHall (3992, 3993) pays 30k per 20 kills for members, Battle Ground E
// (3991, 3992) pays 17k for anyone 61+. Below 61 the bunny loop farms Were
// Eggs into Berserker Bunnies and sells them.
var method = member && level >= 61 ? "honorhall"
    : level >= 61 ? "battlegrounde" : "berserkerbunny";
if (bot.memory.method !== method) {
    bot.log("gold-farm: " + method + " (" + gold + "/" + GOAL + " gold)");
    bot.memory.method = method;
}

if (method === "honorhall") {
    honorHall();
    return;
}
if (method === "battlegrounde") {
    battleGroundE();
    return;
}
berserkerBunny();
return;
