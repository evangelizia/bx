/// name: Etherstorm Wastes Story
/// desc: Completes the Firestorm, Airstorm, Waterstorm, and Earthstorm story quests.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, etherstorm, firestorm, airstorm, waterstorm, earthstorm

// Ported from refs/Scripts/Story/EtherstormWastes.cs. Quest requirements come
// from refs/Scripts/QuestData.json; map items and monster routes follow the
// reference story methods.

var CHAIN = [
    { id: 1532, actions: {
        10558: { map: "firestorm", monster: "Sulfur Imp" },
        10559: { map: "firestorm", monster: "Sulfur Imp" }
    } },
    { id: 1533, actions: { 10561: { map: "firestorm", monster: "Living Fire" } } },
    { id: 1542, actions: { 10562: { map: "firestorm", item: 784 } } },
    { id: 1543, actions: { 10564: { map: "firestorm", item: 785 } } },
    { id: 1545, actions: { 10565: { map: "firestorm", item: 786 } } },
    { id: 1546, actions: { 10566: { map: "firestorm", monster: "FireStorm Hatchling" } } },
    { id: 1547, actions: { 10567: { map: "firestorm", monster: "Ssikari" } } },
    { id: 1571, actions: { 10690: { map: "airstorm", monster: "Living Air" } } },
    { id: 1572, actions: { 10691: { map: "airstorm", item: 827 } } },
    { id: 1573, actions: { 10692: { map: "airstorm", item: 823 } } },
    { id: 1574, actions: {
        10696: { map: "airstorm", monster: "KingCrystal" },
        10693: { map: "airstorm", monster: "Air Crystal" }
    } },
    { id: 1575, actions: {
        10695: { map: "firestorm", item: 824 },
        10694: { map: "firestorm", monster: "Sulfur Imp" }
    } },
    { id: 1576, actions: { 10699: { map: "airstorm", monster: "Energy Tornado" } } },
    { id: 1577, actions: { 10705: { map: "firestorm", item: 825 } } },
    { id: 1616, actions: {
        10860: { map: "waterstorm", item: 840 },
        10859: { map: "waterstorm", item: 841 }
    } },
    { id: 1617, actions: { 10855: { map: "waterstorm", monster: "Marsh Lurker" } } },
    { id: 1618, actions: { 10856: { map: "waterstorm", item: 842 } } },
    { id: 1619, actions: {
        10857: { map: "waterstorm", item: 843 },
        10861: { map: "waterstorm", monster: "Living Water" },
        10862: { map: "waterstorm", monster: "Living Water" }
    } },
    { id: 1620, actions: {
        10864: { map: "waterstorm", monster: "Fishwing" },
        10863: { map: "waterstorm", monster: "Fishwing" }
    } },
    { id: 1621, actions: {
        10869: { map: "waterstorm", item: 844 },
        10866: { map: "waterstorm", monster: "Fishman Soldier" },
        10867: { map: "waterstorm", monster: "Marsh Lurker" },
        10868: { map: "waterstorm", monster: "Frogdrake" }
    } },
    { id: 1622, actions: { 10870: { map: "waterstorm", monster: "Deep Dweller" } } },
    { id: 1633, actions: {
        10936: { map: "earthstorm", monster: "Wind Elemental" },
        10937: { map: "earthstorm", monster: "Water Elemental" },
        10938: { map: "earthstorm", monster: "Earth Elemental" },
        10935: { map: "earthstorm", monster: "Fire Elemental" }
    } },
    { id: 1634, actions: {
        10963: { map: "earthstorm", item: 860 },
        10939: { map: "earthstorm", monster: "Crystallized Living Fire" },
        10940: { map: "earthstorm", monster: "Sapphire Golem" }
    } },
    { id: 1635, actions: {
        10944: { map: "earthstorm", item: 862 },
        10942: { map: "earthstorm", monster: "Crystalized Jellyfish" },
        10943: { map: "earthstorm", monster: "Diamond Golem" }
    } },
    { id: 1636, actions: {
        10964: { map: "earthstorm", item: 861 },
        10965: { map: "earthstorm", item: 863 },
        10950: { map: "earthstorm", monster: "Shard Spinner" },
        10951: { map: "earthstorm", monster: "Shard Spinner" },
        10952: { map: "earthstorm", monster: "Shard Spinner" },
        10949: { map: "earthstorm", monster: "Shard Spinner" },
        10953: { map: "earthstorm", monster: "Emerald Golem" }
    } },
    { id: 1637, actions: { 10954: { map: "earthstorm", monster: "Ruby Golem" } } },
    { id: 1638, actions: { 10956: { map: "earthstorm", monster: "Amethite" } } },
    { id: 1639, actions: { 10957: { map: "earthstorm", monster: "Arradia" } } }
];

function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants === null) return false;

    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short <= 0) continue;

        var action = step.actions[want.id];
        if (!action) {
            bot.fail("Etherstorm quest " + step.id + " has an unsupported requirement: " + want.id);
            return false;
        }
        if (!bot.travel(action.map)) return false;
        if (action.item) return bot.mapItem(action.item, short, want.id);
        return bot.kill(action.monster, short);
    }

    return bot.quest.ready(step.id) && bot.quest.turnIn(step.id);
}

for (var i = 0; i < CHAIN.length; i++) {
    var step = CHAIN[i];
    var done = bot.quest.done(step.id);
    if (done === null) return;
    if (done) continue;
    if (!work(step)) return;
}

bot.log("etherstorm-wastes: Firestorm through Earthstorm completed");
return true;
