/// name: Burning Blade Of Abezeth
/// desc: Runs the thirty Celestial Arena fights in order, then merges the Burning Blade Of Abezeth from Champion Sashes and Gold Vouchers.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: burning blade, abezeth, celestial arena, champion sash, merge, quests, sword

// Ported from refs/Scripts/Other/Weapons/BurningBladeOfAbezeth.cs and
// refs/Scripts/Story/QueenofMonsters/Extra/CelestialArena.cs. Beatrix has no
// class-swap or enhancement steps, so those are left to the player.
//
// The thirty arena quests write chain 249, values 1 through 30, in quest-id
// order, so the chain value is the id minus 6012. Each quest wants one
// temporary "<boss> Defeated" item that the server adds on the kill, so there
// is no pickup step; the quest is handed in as soon as the client offers it.
//
// Every arena map holds its bosses on screen cells r1 through r10, in the
// order the quests are written. The bot asks the room for the boss cell and
// falls back to the screen the chain value names until that answer arrives.
//
// The merge costs Champion Sash x20 and Gold Voucher 500k x3. Champion Sash is
// a guaranteed Aranx drop that stacks to 20, so twenty kills always cover the
// price and no item id is needed. Each voucher costs 500k gold from the Gebo
// Shop; the bot buys only the shortfall.

var CHAIN = 249;

// Quest ids 6013..6042 map to chain values 1..30.
function arena(map, firstId, monsters) {
    var out = [];
    for (var i = 0; i < monsters.length; i++) {
        var id = firstId + i;
        out.push({ id: id, value: id - 6012, map: map, monster: monsters[i] });
    }
    return out;
}

var LEGS = []
    .concat(arena("celestialarenab", 6013, [
        "Slork Construct",
        "Azkorath Construct",
        "Blessed Inquisitor",
        "Lich Ravager Construct",
        "Ring Guardian Construct",
        "Serepthys Construct",
        "Yaomo Construct",
        "Cerberus Construct",
        "Infernal Warrior Construct",
        "Infernal Warlord Construct"
    ]))
    .concat(arena("celestialarenac", 6023, [
        "Conquest Construct",
        "War Construct",
        "Death Construct",
        "Famine Construct",
        "Diabolical Warlord Construct",
        "Undead Raxgore Construct",
        "Blessed Karok",
        "Kezeroth Construct",
        "Shadow Lord Construct",
        "Desolich Construct"
    ]))
    .concat(arena("celestialarenad", 6033, [
        "Queen of Hope",
        "Malxas Construct",
        "Blessed Gladius",
        "High Celestial Priest",
        "Blessed Enfield",
        "Avatar of Spirits",
        "Avatar of Time",
        "Avatar of Life",
        "Fallen Abezeth",
        "Aranx"
    ]));

var SASH_MAP = "celestialarenad";
var SASH_MONSTER = "Aranx";
var SASH_DROP = "Champion Sash";
var SASH_KILLS = 20;

var VOUCHER = 61043;
var VOUCHER_MAP = "alchemyacademy";
var VOUCHER_SHOP = 2036;
var VOUCHER_PRICE = 500000;
var VOUCHER_NEED = 3;

var SHOP_MAP = "celestialarena";
var SHOP = 1474;
var SWORD = 41453;

function fight(leg) {
    // The first roomMonster call only registers the name; until the answer
    // lands, the chain value still names the screen the boss stands on.
    var screen = "r" + (((leg.value - 1) % 10) + 1);
    var m = bot.roomMonster(leg.monster);
    var cell = m != null && m.cell ? m.cell : screen;
    var pad = m != null && m.pad ? m.pad : "Left";
    if (!bot.moveToCell(cell, pad)) return;
    bot.kill(leg.monster, 1);
}

function step(leg) {
    if (!bot.quest.active(leg.id)) {
        if (!bot.quest.accept(leg.id)) return;
        bot.log("burning-blade: accepted " + leg.id + " " + leg.monster);
        return;
    }

    if (bot.quest.ready(leg.id)) {
        bot.quest.turnIn(leg.id);
        return;
    }

    if (!bot.travel(leg.map)) return;
    fight(leg);
}

function farmSash() {
    if (!bot.travel(SASH_MAP)) return false;
    // Drain the drop from the previous kill before deciding to kill again,
    // including the twentieth drop after the last kill.
    if (!bot.pickDrop(SASH_DROP)) return false;

    var kills = bot.memory.sash || 0;
    if (kills >= SASH_KILLS) return true;

    var m = bot.roomMonster(SASH_MONSTER);
    if (m == null) return false;
    if (m.cell && !bot.moveToCell(m.cell, m.pad)) return false;
    if (!bot.kill(SASH_MONSTER, 1)) return false;

    kills++;
    bot.memory.sash = kills;
    bot.log("burning-blade: " + SASH_DROP + " " + kills + "/" + SASH_KILLS);
    return false;
}

function ensureVouchers() {
    var have = bot.item(VOUCHER);
    if (have == null) return false;
    if (have >= VOUCHER_NEED) return true;

    var short = VOUCHER_NEED - have;
    var gold = bot.gold;
    if (gold == null) return false;
    if (gold < short * VOUCHER_PRICE) {
        bot.fail(
            "Burning Blade Of Abezeth needs " + short + " more Gold Voucher 500k (" +
            short * VOUCHER_PRICE + " gold)"
        );
        return false;
    }

    if (!bot.travel(VOUCHER_MAP)) return false;
    if (!bot.buy(VOUCHER_SHOP, VOUCHER, VOUCHER_NEED)) return false;
    bot.log("burning-blade: bought Gold Voucher 500k to " + VOUCHER_NEED);
    return true;
}

// The first item() call only asks for the count; the answer is one snapshot
// away, and a blade already in the bag is a finished run.
var sword = bot.item(SWORD);
if (sword == null) return;
if (sword > 0) {
    bot.log("burning-blade: Burning Blade Of Abezeth already held");
    return true;
}

var chain = bot.quest.value(CHAIN);
if (chain == null) return;

for (var i = 0; i < LEGS.length; i++) {
    if (chain >= LEGS[i].value) continue;
    step(LEGS[i]);
    return;
}

if (!farmSash()) return;
if (!ensureVouchers()) return;

if (!bot.travel(SHOP_MAP)) return;
if (!bot.buy(SHOP, SWORD)) return;
bot.log("burning-blade: bought Burning Blade Of Abezeth");
return true;
