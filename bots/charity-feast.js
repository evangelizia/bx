/// name: CharityFeast Questline
/// desc: Completes the Thanksgiving CharityFeast war event for Hans, quests 10938 to 10947, from Pumpkin Pop through King Mellori.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, charityfeast, thanksgiving, event, war, hans, serenity, unseelie

// CharityFeast (events/thanksgiving/2026/town-charityfeastr2.swf) is a war
// event: every quest carries iWar 1 and its turn-in items are temp quest items
// the client awards on a kill or a click, so there are no drop tables and
// nothing to pick up. Hans_NPC offers the whole chain, gated on the event
// progress counter at quest slot 659 (the client's getQuestValue(659)):
//
//   progress < 6   quests 10938-10943 (Pumpkin Pop .. Tricky Nixie)
//   progress >= 6  quests 10944-10946 (Undead Minyans .. Feast of Thrills)
//   progress >= 9  quest  10947       (King Mellori)
//   progress >= 10 the repeatable United Unseelie 10948/10949
//
// Completing a quest advances the counter to that quest's iValue, so the ten
// one-time quests are walked in order and the pass ends at progress 10. The
// repeatable pair (and the Harvest Menu shop 2811 it funds with Hans' Chore
// Vouchers) is left to the player; this bot only finishes the story.
//
// Objectives come from two places, both read off the decompiled map:
//   monsters  Pumpkin Blossom Fae (r2), Uninvited Guest (r3),
//             Fall Fae Queen (r4), Masked Skeleton (r5),
//             Sluagh Warrior (r6), Sluagh King (r7)
//   map items 16408 Food Delivery, 16409 Talk to Aria, 16410 Talk to Yulgar,
//             16411 Find Ingredients List
// The map items only award while quest 10942 is active, which the accept below
// guarantees before any gather runs.

var MAP = "charityfeast";
var CHAIN_SLOT = 659;
var LAST_VALUE = 10;

// Turn-in item id -> how to fill it. `monster` hunts (and auto-locates the
// cell/pad); `mapItem` clicks a placed object into `want.id`.
var SOURCES = {
    104950: { monster: "Pumpkin Blossom Fae" }, // Magical Pumpkin Seeds
    104951: { monster: "Uninvited Guest" },     // Confiscated Cravat
    104952: { mapItem: 16408 },                 // Food Delivery (Villagers)
    104953: { monster: "Pumpkin Blossom Fae" }, // Pumpkin Rind
    104954: { monster: "Uninvited Guest" },     // Embroidered Handkerchief
    104955: { mapItem: 16409 },                 // Talk to Aria
    104956: { mapItem: 16410 },                 // Talk to Yulgar
    104957: { mapItem: 16411 },                 // Find Ingredients List
    104958: { monster: "Fall Fae Queen" },      // Nixie's Amber
    104959: { monster: "Masked Skeleton" },     // Strange Mask
    104960: { monster: "Sluagh Warrior" },      // Sluagh Antler
    104961: { monster: "Masked Skeleton" },     // Chipped Mask
    104962: { monster: "Sluagh Warrior" },      // Sluagh Feather
    104963: { monster: "Sluagh King" }          // Sluagh King Defeated
};

// The ten one-time quests in chain (iValue) order: index i has value i + 1.
var STEPS = [10938, 10939, 10940, 10941, 10942, 10943, 10944, 10945, 10946, 10947];

// One atomic step per tick: hand in what is ready, otherwise accept, fill the
// first unmet objective, and yield. Mirrors the broken-woods-story driver.
function work(id) {
    if (bot.quest.ready(id)) return bot.quest.turnIn(id);
    if (!bot.quest.active(id) && !bot.quest.accept(id)) return false;

    var wants = bot.quest.wants(id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short <= 0) continue;

        var src = SOURCES[want.id];
        if (src === undefined) {
            bot.fail("quest " + id + " wants item " + want.id + ", which no source gives");
            return false;
        }
        if (src.mapItem !== undefined) {
            // mapItem tracks the absolute bag count, so pass the full need, not
            // the delta; a kill counts its own, so hunt takes the delta.
            if (!bot.travel(MAP)) return false;
            return bot.mapItem(src.mapItem, want.need, want.id);
        }
        return bot.hunt(MAP, src.monster, short);
    }

    return bot.quest.ready(id) ? bot.quest.turnIn(id) : false;
}

var progress = bot.quest.value(CHAIN_SLOT);
if (progress == null) return;
if (progress >= LAST_VALUE) {
    bot.log("charity-feast: completed quests 10938-10947; Hans now offers the repeatable United Unseelie (10948/10949) for Hans' Chore Vouchers, spendable in Harvest Menu shop 2811");
    return true;
}

for (var i = 0; i < STEPS.length; i++) {
    if (progress >= i + 1) continue;
    if (!work(STEPS[i])) return;
    return;
}
return;
