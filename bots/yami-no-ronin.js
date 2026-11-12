/// name: Yami no Ronin
/// desc: Farms the Yami no Ronin class the Legion way: SoulForge Hammer, Folded Steel, the Shadow Katana Blade merge, the Blademaster Sword Scroll and the Yokai Sword Scroll.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: yami no ronin, ynr, class, legion, yokai, dage, darkally, soulforge, unlock, quests

// Ported from refs/Scripts/Legion/YamiNoRonin/0YamiNoRonin.cs and CoreYnR.cs,
// the Legion branch of FoldedSteel and BlademasterSwordScroll.
//
// Six quests, each accepted, farmed and handed in by the client:
//
//   2741  three rare hammers pay the SoulForge Hammer, which opens the
//         merge shop in /underworld
//   7444  Folded Steel: 108 Obsidian Rock merged at two Legion Tokens each,
//         13 Flame-Forged Metal from Chanky's repeatable quest, and three
//         boss drops
//   7409  Yami ten times over, 444 Dark Wisps each
//   7443  Blademaster Sword Scroll: 17,500 Legion Tokens, 50 Aeacus
//         Empowered, 13 Sapphire Orb and a Meditation
//   7445  Yokai Sword Scroll: the blade merge, 888 Perfect Orochi Scales,
//         600 Darkened Essence and the Oni Skull Charm
//   7408  Yami no Ronin, for both scrolls
//
// The Shadow Katana Blade is a merge: 10 Yami, 1 Folded Steel and 15
// Platinum Paragon Medal at a million gold each. The Obsidian Rock comes from
// the same shop, which is why the hammer is here at all.
//
// The gates the reference leaves to the player are asked for up front: the
// /darkally story (7419-7428), the Yokai story up to /shadowfortress
// (6485-6494), rank 10 Yokai for the charm and the blade merge, and Legion
// membership for the token farm.
//
// Legion Tokens come from Dreadrock alone. The reference tries every Paragon
// pet before it, but each of those methods is gated on owning the pet.
//
// Meditation is one of four quests, one per BladeMaster or SwordMaster
// variant. The first owned class picks the quest; with none owned the token
// SwordMaster is bought, as the reference does.
//
// Ultra Aeacus and the Legion Lich Lord are public-room fights in the
// reference. Beatrix chooses the room once per bot install, so turn the
// private-room setting off before starting this one.

var CLASS_ITEM = 53841; // Yami no Ronin, the reward of 7408
var QUEST_CLASS = 7408;

var YOKAI_SCROLL = 53842;
var BLADE_SCROLL = 53844;
var QUEST_YOKAI_SCROLL = 7445;
var QUEST_BLADE_SCROLL = 7443;

var KATANA_BLADE = 54104;
var FOLDED_STEEL = 54103; // the reward of 7444
var QUEST_FOLDED = 7444;

var YAMI = 53846;
var QUEST_YAMI = 7409;
var YAMI_NEED = 10;

var MEDAL = 53907;
var MEDAL_NEED = 15;
var MEDAL_GOLD = 1000000;

var FLAME_METAL = 49041;
var QUEST_FLAME = 6975;
var OBSIDIAN = 16409;
var OBSIDIAN_TOKENS = 2;
var ETERNITY_FLAME = 37050;
var WEAPON_IMPRINT = 50723;
var KATANA_BLUEPRINT = 54102;

var HAMMER = 16407;
var QUEST_HAMMER = 2741;
var STONE_HAMMER = 54;
var IRON_HAMMER = 267;
var ROCK_HAMMER = 392;

var OROCHI_SCALES = 54105;
var DARKENED_ESSENCE = 48556;
var ONI_CHARM = 54106;

var SAPPHIRE_ORB = 46078;
var AEACUS = 48554;
var MEDITATION = 54096;

var TOKEN = 6521;
var QUEST_TOKEN = 4849; // Dreadrock: six kills pay ten tokens
var CHAMPION = 5518;

var BONE_SIGIL = 47472;
var QUEST_SIGIL = 6739;
var SWORDMASTER = 53837;
var SWORDMASTER_TOKENS = 2000;
var MEDITATION_QUESTS = [
    { quest: 7412, item: 22933 }, // BladeMaster, Legion Tokens
    { quest: 7411, item: 22859 }, // BladeMaster, AdventureCoins
    { quest: 7413, item: 53836 }, // SwordMaster, AdventureCoins
    { quest: 7414, item: 53837 } // SwordMaster, Legion Tokens
];

var UNDERWORLD = "underworld";
var SOULFORGE = 577;
var DAGE_SHOP = 238;
var AKIBA_SHOP = 131;

var YOKAI_RANK = 10;

// One line per phase, once each, so a run measured in hours reads back.
function note(step) {
    bot.memory.seen = bot.memory.seen || {};
    if (bot.memory.seen[step]) return;
    bot.memory.seen[step] = true;
    bot.log("yami-no-ronin: " + step);
}

// One step of a hunt: drain the floor, join, walk, fight. A named monster is
// walked to by the cell the room watch reports, which is the only honest
// source for a boss at the far end of a map. "" fights whatever the given
// cell holds.
//
// The watch answers a tick after the join, so a name that is still unknown is
// not yet a missing monster; twenty quiet ticks are.
function hunt(map, monster, count, cell, pad) {
    if (!bot.pickDrop()) return;
    if (!bot.travel(map)) return;

    if (monster === "") {
        if (cell && !bot.moveToCell(cell, pad)) return;
        bot.kill("", count);
        return;
    }

    var m = bot.roomMonster(monster);
    if (m === null) {
        var key = map + " " + monster;
        if (bot.memory.looking !== key) {
            bot.memory.looking = key;
            bot.memory.lookedAt = 0;
            return;
        }
        bot.memory.lookedAt++;
        if (bot.memory.lookedAt > 20) bot.fail(monster + " is not in /" + map);
        return;
    }
    bot.memory.looking = "";
    if (m.cell && !bot.moveToCell(m.cell, m.pad)) return;
    bot.kill(monster, count);
}

// One purchase per tick. The step counts its own sends per order, so the count
// asked for moves with the bag: one more than held each time. A refused order
// keeps the same number and spends the step's retries.
function buy(map, shop, item, need) {
    var have = bot.item(item);
    if (have === null) return false;
    if (have >= need) return true;
    if (!bot.travel(map)) return false;
    bot.buy(shop, item, have + 1);
    return false;
}

// Legion Tokens, one Dreadrock cycle at a time. Quest 4849 pays ten for six
// kills and the client says when it is ready, so there is no count of ours.
function legionTokens(target) {
    var have = bot.item(TOKEN);
    if (have === null) return false;
    if (have >= target) return true;

    var champion = bot.item(CHAMPION);
    if (champion === null) return false;
    if (champion < 1) {
        bot.fail(
            "quest 4849 needs the Undead Champion armor: run the Join the Legion bot, or buy it in /underworld (shop 216)"
        );
        return false;
    }

    if (bot.quest.ready(QUEST_TOKEN)) {
        if (!bot.quest.turnIn(QUEST_TOKEN)) return false;
        // The hand-in pays ten, and the bag this tick read is the one before it.
        bot.log("yami-no-ronin: " + (have + 10) + " Legion Tokens of " + target);
        return false;
    }
    if (!bot.quest.active(QUEST_TOKEN) && !bot.quest.accept(QUEST_TOKEN)) return false;

    if (!bot.pickDrop()) return false;
    if (!bot.travel("dreadrock")) return false;
    if (!bot.moveToCell("r3", "Bottom")) return false;
    bot.kill("", 1);
    return false;
}

// Quest 2741: three permanent hammers, every one a rare drop.
function hammer() {
    var have = bot.item(HAMMER);
    if (have === null) return false;
    if (have > 0) return true;
    note("SoulForge Hammer");

    if (bot.quest.ready(QUEST_HAMMER)) return bot.quest.turnIn(QUEST_HAMMER);
    if (!bot.quest.active(QUEST_HAMMER) && !bot.quest.accept(QUEST_HAMMER)) return false;

    var wants = bot.quest.wants(QUEST_HAMMER);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var one = wants[i];
        if (one.have >= one.need) continue;
        var short = one.need - one.have;
        if (one.id === STONE_HAMMER) {
            hunt("forest", "Zardman Grunt", short);
            return false;
        }
        if (one.id === IRON_HAMMER) {
            hunt("battleundera", "Skeletal Warrior", short);
            return false;
        }
        if (one.id === ROCK_HAMMER) {
            hunt("bludrut", "Rock Elemental", short);
            return false;
        }
        bot.fail("quest 2741 wants item " + one.id + ", which no step gives");
        return false;
    }
    return false;
}

// Quest 6975 pays one Flame-Forged Metal per turn-in, so it is a loop of one
// kill and one hand-in until the bag holds what the caller asked for.
function flameMetal(need) {
    var have = bot.item(FLAME_METAL);
    if (have === null) return false;
    if (have >= need) return true;

    if (bot.quest.ready(QUEST_FLAME)) return bot.quest.turnIn(QUEST_FLAME);
    if (!bot.quest.active(QUEST_FLAME) && !bot.quest.accept(QUEST_FLAME)) return false;
    hunt(UNDERWORLD, "Frozen Pyromancer", 1);
    return false;
}

function obsidianRock(need) {
    var have = bot.item(OBSIDIAN);
    if (have === null) return false;
    if (have >= need) return true;

    if (!hammer()) return false;
    if (!legionTokens((need - have) * OBSIDIAN_TOKENS)) return false;
    return buy(UNDERWORLD, SOULFORGE, OBSIDIAN, need);
}

function foldedSteel() {
    var have = bot.item(FOLDED_STEEL);
    if (have === null) return false;
    if (have > 0) return true;
    note("Folded Steel");

    if (bot.quest.ready(QUEST_FOLDED)) return bot.quest.turnIn(QUEST_FOLDED);
    if (!bot.quest.active(QUEST_FOLDED) && !bot.quest.accept(QUEST_FOLDED)) return false;

    var wants = bot.quest.wants(QUEST_FOLDED);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var one = wants[i];
        if (one.have >= one.need) continue;
        var short = one.need - one.have;
        if (one.id === FLAME_METAL) {
            flameMetal(one.need);
            return false;
        }
        if (one.id === OBSIDIAN) {
            obsidianRock(one.need);
            return false;
        }
        if (one.id === ETERNITY_FLAME) {
            hunt("fotia", "Amia the Cult Leader", short);
            return false;
        }
        if (one.id === WEAPON_IMPRINT) {
            hunt("doomvaultb", "Undead Raxgore", short, "r26", "Left");
            return false;
        }
        if (one.id === KATANA_BLUEPRINT) {
            hunt("shadowfortress", "Jaaku", short);
            return false;
        }
        bot.fail("quest 7444 wants item " + one.id + ", which no step gives");
        return false;
    }
    return false;
}

// Quest 7409 pays one Yami per 444 Dark Wisps.
function yami() {
    var have = bot.item(YAMI);
    if (have === null) return false;
    if (have >= YAMI_NEED) return true;
    note("Yami");

    if (bot.quest.ready(QUEST_YAMI)) return bot.quest.turnIn(QUEST_YAMI);
    if (!bot.quest.active(QUEST_YAMI) && !bot.quest.accept(QUEST_YAMI)) return false;

    var wants = bot.quest.wants(QUEST_YAMI);
    if (wants === null || wants.length === 0) return false;
    var one = wants[0];
    if (one.have >= one.need) return false;
    hunt("darkally", "", one.need - one.have, "r2", "Left");
    return false;
}

function katanaBlade() {
    var have = bot.item(KATANA_BLADE);
    if (have === null) return false;
    if (have > 0) return true;
    note("Shadow Katana Blade");

    if (!hammer()) return false;
    if (!foldedSteel()) return false;
    if (!yami()) return false;
    return buy(UNDERWORLD, SOULFORGE, KATANA_BLADE, 1);
}

// Quest 6739 pays a Bone Sigil for five Legion Gladiators. The counter is a
// temp item, so the client's own ready answer drives the loop.
function boneSigil() {
    var have = bot.item(BONE_SIGIL);
    if (have === null) return false;
    if (have > 0) return true;

    if (bot.quest.ready(QUEST_SIGIL)) return bot.quest.turnIn(QUEST_SIGIL);
    if (!bot.quest.active(QUEST_SIGIL) && !bot.quest.accept(QUEST_SIGIL)) return false;
    hunt("legionarena", "Legion Gladiator", 1);
    return false;
}

function meditation() {
    var have = bot.item(MEDITATION);
    if (have === null) return false;
    if (have > 0) return true;

    var quest = 0;
    for (var i = 0; i < MEDITATION_QUESTS.length; i++) {
        var owned = bot.item(MEDITATION_QUESTS[i].item);
        if (owned === null) return false;
        if (owned > 0) {
            quest = MEDITATION_QUESTS[i].quest;
            break;
        }
    }

    if (quest === 0) {
        note("buying SwordMaster for its Meditation quest");
        if (!legionTokens(SWORDMASTER_TOKENS)) return false;
        buy(UNDERWORLD, DAGE_SHOP, SWORDMASTER, 1);
        return false;
    }

    if (bot.quest.ready(quest)) return bot.quest.turnIn(quest);
    if (!bot.quest.active(quest) && !bot.quest.accept(quest)) return false;
    boneSigil();
    return false;
}

function blademasterScroll() {
    var have = bot.item(BLADE_SCROLL);
    if (have === null) return false;
    if (have > 0) return true;
    note("Blademaster Sword Scroll");

    if (bot.quest.ready(QUEST_BLADE_SCROLL)) return bot.quest.turnIn(QUEST_BLADE_SCROLL);
    if (!bot.quest.active(QUEST_BLADE_SCROLL) && !bot.quest.accept(QUEST_BLADE_SCROLL)) return false;

    var wants = bot.quest.wants(QUEST_BLADE_SCROLL);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var one = wants[i];
        if (one.have >= one.need) continue;
        var short = one.need - one.have;
        if (one.id === SAPPHIRE_ORB) {
            hunt("frozenlair", "Legion Lich Lord", short, "r3", "Left");
            return false;
        }
        if (one.id === TOKEN) {
            legionTokens(one.need);
            return false;
        }
        if (one.id === AEACUS) {
            hunt("judgement", "Ultra Aeacus", short, "r10a", "Spawn");
            return false;
        }
        if (one.id === MEDITATION) {
            meditation();
            return false;
        }
        bot.fail("quest 7443 wants item " + one.id + ", which no step gives");
        return false;
    }
    return false;
}

function yokaiScroll() {
    var have = bot.item(YOKAI_SCROLL);
    if (have === null) return false;
    if (have > 0) return true;
    note("Yokai Sword Scroll");

    if (bot.quest.ready(QUEST_YOKAI_SCROLL)) return bot.quest.turnIn(QUEST_YOKAI_SCROLL);
    if (!bot.quest.active(QUEST_YOKAI_SCROLL) && !bot.quest.accept(QUEST_YOKAI_SCROLL)) return false;

    var wants = bot.quest.wants(QUEST_YOKAI_SCROLL);
    if (wants === null) return false;
    for (var i = 0; i < wants.length; i++) {
        var one = wants[i];
        if (one.have >= one.need) continue;
        var short = one.need - one.have;
        if (one.id === KATANA_BLADE) {
            katanaBlade();
            return false;
        }
        if (one.id === OROCHI_SCALES) {
            hunt("shadowfortress", "", short, "r12", "Top");
            return false;
        }
        if (one.id === ONI_CHARM) {
            buy("akiba", AKIBA_SHOP, ONI_CHARM, 1);
            return false;
        }
        if (one.id === DARKENED_ESSENCE) {
            hunt("shadowrealmpast", "", short, "Enter", "Spawn");
            return false;
        }
        bot.fail("quest 7445 wants item " + one.id + ", which no step gives");
        return false;
    }
    return false;
}

var owned = bot.item(CLASS_ITEM);
if (owned === null) return;
if (owned > 0) {
    bot.log("yami-no-ronin: already owned");
    return true;
}

var darkally = bot.quest.done(7428);
if (darkally === null) return;
if (!darkally) {
    bot.fail("the /darkally story (7419-7428) must be finished first");
    return;
}

var fortress = bot.quest.done(6494);
if (fortress === null) return;
if (!fortress) {
    bot.fail("the Yokai story up to /shadowfortress (6485-6494) must be finished first");
    return;
}

var yokai = bot.rep("Yokai");
if (yokai === null) return;
if (yokai.rank < YOKAI_RANK) {
    bot.fail("Yokai rank " + YOKAI_RANK + " needed (have " + yokai.rank + ")");
    return;
}

var legion = bot.quest.done(793);
if (legion === null) return;
if (!legion) {
    bot.fail("the Legion must be joined first (run the Join the Legion bot)");
    return;
}

// The medal price is the one cost that cannot be farmed here, so it is asked
// for before the long farms rather than after them.
var medals = bot.item(MEDAL);
if (medals === null) return;
var gold = bot.gold;
if (gold === null) return;
var price = (MEDAL_NEED - medals) * MEDAL_GOLD;
if (price > 0 && gold < price) {
    bot.fail(
        "Platinum Paragon Medal x" + MEDAL_NEED + " needs " + price + " gold (have " + gold + ")"
    );
    return;
}

// Accepted first, so a quest the character cannot take fails now instead of
// after hours of farming.
if (!bot.quest.active(QUEST_CLASS) && !bot.quest.accept(QUEST_CLASS)) return;

if (!katanaBlade()) return;
if (!blademasterScroll()) return;
if (!yokaiScroll()) return;

if (!bot.quest.ready(QUEST_CLASS)) {
    note("both scrolls held; the client will not hand in 7408 yet");
    return;
}
if (!bot.quest.turnIn(QUEST_CLASS)) return;

bot.log("yami-no-ronin: class unlocked");
return true;
