/// name: SoulForge Hammer
/// desc: Unlocks the Soul Forge merge shop: quest 2741's three hammers from /forest, /battleundera and /bludrut.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: legion, soulforge, hammer, underworld, dage, merge, unlock, quests

// Ported from refs/Scripts/Legion/CoreLegion.cs:213 (SoulForgeHammer) and its
// wrapper at refs/Scripts/Legion/LegionMaterials/SoulForgeHammer.cs.
//
// Dage's quest 2741 wants three permanent hammers and pays the SoulForge
// Hammer, item 16407. Holding it opens the merge shop in /underworld (577),
// which is why SoulForgeMerge, DageChallengeMerge and the two Sin of the
// Underworld scripts all run this first.
//
// The reference buys the Iron Hammer from swordhaven shop 179 when
// CheckInventory(319) is true, but no item 319 exists: that was meant to be
// the 319 gold price, so the branch has never run. The Skeletal Warrior drop
// is the only route it has ever taken, and it is the one taken here.
//
// Every piece is a rare drop, so each step is one kill and then a drain of the
// floor before the next. A run that stops midway leaves the quest and its
// drops in place: the three hammers are permanent, not temporary.

var QUEST = 2741;
var HAMMER = 16407;

// Forest3/Left is where the Grunts stand when the room watch has not answered
// yet. The other two maps have no cell worth guessing.
var ITEMS = [
    {
        id: 54,
        name: "Zardman's StoneHammer",
        map: "forest",
        monster: "Zardman Grunt",
        cell: "Forest3",
        pad: "Left"
    },
    {
        id: 267,
        name: "Iron Hammer",
        map: "battleundera",
        monster: "Skeletal Warrior",
        cell: "",
        pad: ""
    },
    {
        id: 392,
        name: "Elemental Rock Hammer",
        map: "bludrut",
        monster: "Rock Elemental",
        cell: "",
        pad: ""
    }
];

function want(id) {
    var wants = bot.quest.wants(QUEST);
    if (wants == null) return null;
    for (var i = 0; i < wants.length; i++) {
        if (Number(wants[i].id) === id) return wants[i];
    }
    return null;
}

// A drop waiting on the floor is the next step, so it is drained before
// another kill. pickDrop answers true when the floor is clear.
function hunt(item) {
    if (!bot.travel(item.map)) return;
    if (!bot.pickDrop(item.name)) return;

    var m = bot.roomMonster(item.monster);
    var cell = m != null && m.cell ? m.cell : item.cell;
    var pad = m != null && m.pad ? m.pad : item.pad;
    if (cell && !bot.moveToCell(cell, pad)) return;
    if (!bot.kill(item.monster, 1)) return;
    bot.log("soulforge: killed " + item.monster);
}

var hammer = bot.item(HAMMER);
if (hammer == null) return;
if (hammer > 0) {
    bot.log("soulforge: SoulForge Hammer already held");
    return true;
}

// The hand-in is the only step that pays, and the client's own answer decides
// it, so it comes before another kill.
if (bot.quest.ready(QUEST)) {
    if (!bot.quest.turnIn(QUEST)) return;
    bot.log("soulforge: turned in quest " + QUEST);
    return;
}

if (!bot.quest.active(QUEST) && !bot.quest.accept(QUEST)) return;

for (var i = 0; i < ITEMS.length; i++) {
    var one = want(ITEMS[i].id);
    if (one == null) return;
    if (one.have < one.need) {
        hunt(ITEMS[i]);
        return;
    }
}
