/// name: King's Echo
/// desc: Unlocks King's Echo: Alteon's Reforged Armor, Crown, Royal Dragon Sword and Mace via Echo of the King quests, then buys the class.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: king's echo, echo, class, terminatemple, unlock, alteon

// Ported from auqw/Scripts Other/Classes/KingsEcho.cs. The Skua full
// sources in auqw/Skua were used for CoreBots, CoreFarms and CoreAOR
// semantics. Beatrix has no Experience, 13 Lords of Chaos, reputation or
// merge-shop steps, so those prerequisites are checked where checkable
// and otherwise left to the player. The Echo quest chain below keeps the
// C# order: armor, crown, sword, mace, Familial Blessing, Echo, buy.

var CLASS_ITEM = 95742; // King's Echo, shop 2630 in terminatemple.
var ARMOR_ITEM = 95744; // Alteon's Reforged Armor, reward of 10441.
var CROWN_ITEM = 95745; // King Alteon's Crown, reward of 10440.
var SWORD_ITEM = 95760; // Royal Dragon Sword, reward of 10442.
var MACE_ITEM = 96387; // Alden's Mace, shop 2631 in castle.
var LIBERATION = 93592; // Alden's Liberation Armor, accept item for 10441.
var VOUCHER = 61043; // Gold Voucher 500k, 100 for 10441, shop 2036 in alchemyacademy.

function spots(table) {
    var out = {};
    for (var id in table) {
        var row = table[id];
        out[id] = {
            monster: row[0],
            map: row[1],
            cell: row[2],
            pad: row[3],
            drop: row[4]
        };
    }
    return out;
}

// Crown: Purify The Crown (10440). Hunts, no cell.
var CROWN = spots({
    96121: ["Slugwrath", "dreadhaven", "", "", "Whispers of Chaos"],
    96122: ["Queen of Monsters", "queenbattle", "", "", "Calcified Tear"],
    74259: ["Champion of Chaos", "ultradrakath", "", "", "Trace of Chaos"]
});

// Sword: The Path of the King (10442). The Defiler branch is member-only
// and is handled in collectSword, not in this table.
var SWORD = spots({
    96128: ["Sepulchure", "falcontower", "", "", "Endured Against a Fallen Friend"],
    96129: ["", "chaoswar", "r9", "Left", "Endured Against Chaos"],
    96130: ["Volgritian", "naoisegrave", "", "", "Endured Against the Great Dragon"],
    96127: ["Dethrix", "ebondungeon", "", "", "Endured Against the Monster King"]
});

// Armor: The King's Armor (10441). All four golds are "*" runs in the C#.
// Voucher (61043) is a shop buy and is handled in collectArmor.
var ARMOR = spots({
    96125: ["", "camlan", "r9", "Left", "Camlan Gold"],
    96123: ["", "atlaskingdom", "r2", "Left", "Atlas Gold"],
    94980: ["", "thelimacity", "r5", "Center", "Dwarven Gold"],
    96124: ["", "liatarahill", "r9", "Left", "Skye Gold"]
});

function collect(id, table) {
    var wants = bot.quest.wants(id);
    if (wants == null) return;

    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        var spot = table[want.id];
        if (spot == null) {
            bot.fail("quest " + id + " wants item " + want.id + ", which no step gives");
            return;
        }
        if (!bot.travel(spot.map)) return;
        if (!bot.moveToCell(spot.cell, spot.pad)) return;
        if (!bot.kill(spot.monster, want.need - want.have)) return;
        if (spot.drop != "" && !bot.pickDrop(spot.drop)) return;
        return;
    }
}

function work(id, table) {
    if (!bot.quest.active(id)) {
        bot.quest.accept(id);
        return;
    }
    if (bot.quest.ready(id)) {
        bot.quest.turnIn(id);
        return;
    }
    collect(id, table);
}

function collectArmor(id) {
    var wants = bot.quest.wants(id);
    if (wants == null) return;

    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        if (want.id === VOUCHER) {
            var gold = bot.gold;
            if (gold == null) return;
            var needGold = (want.need - want.have) * 500000;
            if (gold < needGold) {
                bot.fail("need " + needGold + " gold for Gold Voucher 500k vouchers");
                return;
            }
            if (!bot.travel("alchemyacademy")) return;
            if (!bot.buy(2036, VOUCHER, 100)) return;
            return;
        }

        var spot = ARMOR[want.id];
        if (spot == null) {
            bot.fail("quest " + id + " wants item " + want.id + ", which no step gives");
            return;
        }
        if (!bot.travel(spot.map)) return;
        if (!bot.moveToCell(spot.cell, spot.pad)) return;
        if (!bot.kill(spot.monster, want.need - want.have)) return;
        if (spot.drop != "" && !bot.pickDrop(spot.drop)) return;
        return;
    }
}

function workArmor(id) {
    if (!bot.quest.active(id)) {
        bot.quest.accept(id);
        return;
    }
    if (bot.quest.ready(id)) {
        bot.quest.turnIn(id);
        return;
    }
    collectArmor(id);
}

function collectSword(id) {
    var wants = bot.quest.wants(id);
    if (wants == null) return;

    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        if (want.have >= want.need) continue;

        if (want.id === 96126) {
            var member = bot.member;
            if (member == null) return;
            var map = member ? "shattersword" : "infernalarena";
            var monster = member ? "Graveclaw the Defiler" : "Destructive Defiler";
            if (!bot.travel(map)) return;
            if (!bot.kill(monster, want.need - want.have)) return;
            if (!bot.pickDrop("Endured Against the Defiler")) return;
            return;
        }

        var spot = SWORD[want.id];
        if (spot == null) {
            bot.fail("quest " + id + " wants item " + want.id + ", which no step gives");
            return;
        }
        if (!bot.travel(spot.map)) return;
        if (!bot.moveToCell(spot.cell, spot.pad)) return;
        if (!bot.kill(spot.monster, want.need - want.have)) return;
        if (spot.drop != "" && !bot.pickDrop(spot.drop)) return;
        return;
    }
}

function workSword(id) {
    if (!bot.quest.active(id)) {
        bot.quest.accept(id);
        return;
    }
    if (bot.quest.ready(id)) {
        bot.quest.turnIn(id);
        return;
    }
    collectSword(id);
}

var owned = bot.item(CLASS_ITEM);
if (owned == null) return;
if (owned >= 1) {
    bot.log("King's Echo already owned");
    return true;
}

var lvl = bot.level;
if (lvl == null) return;
if (lvl < 80) {
    bot.fail("King's Echo needs level 80 (have " + lvl + ")");
    return;
}

var saga = bot.quest.done(9851);
if (saga == null) return;
if (!saga) {
    bot.fail("Rumbling of Cold Thunder saga (9851) must be done first");
    return;
}

var liberation = bot.item(LIBERATION);
if (liberation == null) return;
if (liberation < 1) {
    bot.fail("Alden's Liberation Armor required before Alteon's Reforged Armor");
    return;
}

var armor = bot.item(ARMOR_ITEM);
if (armor == null) return;
if (armor < 1) {
    workArmor(10441);
    return;
}

var crown = bot.item(CROWN_ITEM);
if (crown == null) return;
if (crown < 1) {
    if (!bot.memory.queenSet) {
        bot.quest.set(426, 33);
        bot.memory.queenSet = true;
        return;
    }
    work(10440, CROWN);
    return;
}

var sword = bot.item(SWORD_ITEM);
if (sword == null) return;
if (sword < 1) {
    workSword(10442);
    return;
}

var mace = bot.item(MACE_ITEM);
if (mace == null) return;
if (mace < 1) {
    if (!bot.travel("castle")) return;
    if (!bot.buy(2631, MACE_ITEM, 1)) return;
    return;
}

if (!bot.quest.gather(10438, 15048, "terminatemple")) return;

var echo = bot.quest.done(10439);
if (echo == null) return;
if (!echo) {
    if (!bot.quest.active(10439)) {
        bot.quest.accept(10439);
        return;
    }
    bot.quest.turnIn(10439);
    return;
}

if (!bot.travel("terminatemple")) return;
if (!bot.buy(2630, CLASS_ITEM, 1)) return;

bot.log("kings-echo: done");
return true;
