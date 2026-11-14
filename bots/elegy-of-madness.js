/// name: Elegy of Madness Story
/// desc: Completes the whole Astravia saga: Darkon's Garden and all nine Elegy of Madness maps, quests 7485-8733, from Picking Flowers through The World.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, quest, astravia, eridani, darkon, elegy of madness, the world, saga

// The Elegy of Madness region (travelmap region 72) is ten maps driven by four
// quest counters. Each map's giver reads one slot, so progress is four integers,
// not one, and a map is finished when its slot reaches the arc's last iValue:
//
//   slot 352  garden                                  done at 10
//   slot 376  eridani (1-11) -> astravia (12-19) -> astraviacastle (20-29)
//   slot 430  astraviajudge (1-10) -> eridanipast (11-20) -> astraviapast (21-30)
//   slot 454  firstobservatory (1-11) -> genesisgarden (12-21) -> theworld (22-32)
//
// A quest is done when its slot value has reached that quest's iValue, so the
// next objective is the first step whose slot is behind its value. The arcs are
// strictly ordered by the client's own entry locks (eridani needs 352 >= 9,
// astraviajudge needs 376 >= 28, firstobservatory needs 430 >= 28), which is why
// STEPS below runs garden -> 376 -> 430 -> 454 without any explicit hand-off.
//
// Sources come from the live session and the decompiled maps (see
// docs/ASTRAVIA.md). Kill items are temp quest items awarded on the kill and
// auto-removed on turn-in, so nothing is picked up off the ground. Map items are
// real clicks: every getMapItem in these maps is wrapped in
// isQuestInProgress(Q), so the accept below always runs before the click, and
// bot.mapItem takes the absolute bag count while bot.hunt takes a delta.
//
// This bot runs the story only. The eight farm quests pinned at each arc's last
// iValue (7780, 8001, 8257, 8396, 8531, 8602, 8641, 8688) never move a counter
// and are left to the player.

var SLOTS = [352, 376, 430, 454];
var DONE = { 352: 10, 376: 29, 430: 30, 454: 32 };

// Ordered by slot, then iValue. `items` maps each turn-in item id to where it
// comes from; `cell` is only set for targets that are hard to find by name.
var STEPS = [
    // ---- garden, slot 352 -------------------------------------------------
    { slot: 352, id: 7485, value: 1, map: "garden", items: {
        54528: { mapItem: 7324 } } },
    { slot: 352, id: 7486, value: 2, map: "garden", items: {
        54529: { monster: "Creature 343" } } },
    { slot: 352, id: 7487, value: 3, map: "garden", items: {
        54530: { mapItem: 7325 } } },
    { slot: 352, id: 7488, value: 4, map: "garden", items: {
        54531: { monster: "Creature 83" } } },
    { slot: 352, id: 7489, value: 5, map: "garden", items: {
        54532: { monster: "Creature 343" } } },
    { slot: 352, id: 7490, value: 6, map: "garden", items: {
        54533: { monster: "Creature 72" } } },
    { slot: 352, id: 7491, value: 7, map: "garden", items: {
        54534: { monster: "Creature 83" } } },
    { slot: 352, id: 7492, value: 8, map: "garden", items: {
        54535: { monster: "Creature 35" },
        54536: { mapItem: 7326 } } },
    { slot: 352, id: 7493, value: 9, map: "garden", items: {
        54537: { mapItem: 7327 } } },
    { slot: 352, id: 7494, value: 10, map: "garden", items: {
        54538: { monster: "Creature 12" } } },

    // ---- eridani, slot 376 1-11 -------------------------------------------
    { slot: 376, id: 7769, value: 1, map: "eridani", items: {
        57308: { monster: "Maggot-Like Creature" },
        57309: { mapItem: 7783 } } },
    { slot: 376, id: 7770, value: 2, map: "eridani", items: {
        57310: { monster: "Maggot-Like Creature" } } },
    { slot: 376, id: 7771, value: 3, map: "eridani", items: {
        57311: { monster: "Rat-Like Creature", cell: "r10" } } },
    { slot: 376, id: 7772, value: 4, map: "eridani", items: {
        57312: { monster: "Bat-Like Creature", cell: "r10" } } },
    { slot: 376, id: 7773, value: 5, map: "eridani", items: {
        57313: { monster: "Wolf-Like Creature" } } },
    { slot: 376, id: 7774, value: 6, map: "eridani", items: {
        57327: { monster: "Maggot-Like Creature" },
        57314: { monster: "Rat-Like Creature" },
        57326: { monster: "Bat-Like Creature" },
        57315: { mapItem: 7784 } } },
    { slot: 376, id: 7775, value: 7, map: "eridani", items: {
        57316: { monster: "Wolf-Like Creature" },
        57317: { mapItem: 7785 } } },
    { slot: 376, id: 7776, value: 8, map: "eridani", items: {
        57318: { monster: "Creature 15", cell: "r4" },
        57319: { monster: "Creature 16", cell: "r5" },
        57320: { monster: "Creature 34", cell: "r8" } } },
    { slot: 376, id: 7777, value: 9, map: "eridani", items: {
        57321: { monster: "Creature 30", cell: "r7" },
        57322: { monster: "Creature 31", cell: "r3" } } },
    { slot: 376, id: 7778, value: 10, map: "eridani", items: {
        57323: { monster: "Door", cell: "r10" },
        57324: { mapItem: 7786 } } },
    { slot: 376, id: 7779, value: 11, map: "eridani", items: {
        57325: { monster: "Creature 6", cell: "r11" } } },

    // ---- astravia, slot 376 12-19 -----------------------------------------
    { slot: 376, id: 7993, value: 12, map: "astravia", items: {
        60187: { monster: "Monstrous Dove" } } },
    { slot: 376, id: 7994, value: 13, map: "astravia", items: {
        60188: { monster: "Drago's Spy" } } },
    { slot: 376, id: 7995, value: 14, map: "astravia", items: {
        60189: { mapItem: 8264 },
        60199: { mapItem: 8265 },
        60200: { mapItem: 8266 },
        60190: { monster: "Astravian Mercenary" } } },
    { slot: 376, id: 7996, value: 15, map: "astravia", items: {
        60191: { monster: "Creature 27", cell: "r6" } } },
    { slot: 376, id: 7997, value: 16, map: "astravia", items: {
        60192: { monster: "Creature 28" } } },
    { slot: 376, id: 7998, value: 17, map: "astravia", items: {
        60193: { monster: "Ti", cell: "r9" } } },
    { slot: 376, id: 7999, value: 18, map: "astravia", items: {
        60194: { monster: "Creature 27" } } },
    { slot: 376, id: 8000, value: 19, map: "astravia", items: {
        60195: { monster: "The Moon", cell: "r10" } } },

    // ---- astraviacastle, slot 376 20-29 -----------------------------------
    // 8247/8248/8250/8251 ask for "any creature in r3"; Creature 27 is the
    // reliable one there.
    { slot: 376, id: 8247, value: 20, map: "astraviacastle", items: {
        63014: { monster: "Creature 27", cell: "r3" } } },
    { slot: 376, id: 8248, value: 21, map: "astraviacastle", items: {
        63015: { mapItem: 8891 },
        63016: { monster: "Creature 27", cell: "r3" } } },
    { slot: 376, id: 8249, value: 22, map: "astraviacastle", items: {
        63017: { mapItem: 8892 },
        63018: { monster: "Creature 20", cell: "r6" } } },
    { slot: 376, id: 8250, value: 23, map: "astraviacastle", items: {
        63019: { mapItem: 8893 },
        63020: { monster: "Creature 27", cell: "r3" } } },
    { slot: 376, id: 8251, value: 24, map: "astraviacastle", items: {
        63021: { monster: "Creature 27", cell: "r3" },
        63022: { mapItem: 8894 } } },
    { slot: 376, id: 8252, value: 25, map: "astraviacastle", items: {
        63023: { monster: "Creature 20", cell: "r6" } } },
    { slot: 376, id: 8253, value: 26, map: "astraviacastle", items: {
        63024: { monster: "Astravian Royal Guard", cell: "r2" } } },
    { slot: 376, id: 8254, value: 27, map: "astraviacastle", items: {
        63025: { mapItem: 8895 },
        63026: { monster: "Storage Spider", cell: "r8" } } },
    { slot: 376, id: 8255, value: 28, map: "astraviacastle", items: {
        63027: { mapItem: 8896 } } },
    { slot: 376, id: 8256, value: 29, map: "astraviacastle", items: {
        63028: { monster: "The Sun", cell: "r11" } } },

    // ---- astraviajudge, slot 430 1-10 -------------------------------------
    { slot: 430, id: 8386, value: 1, map: "astraviajudge", items: {
        65357: { mapItem: 9275 } } },
    { slot: 430, id: 8387, value: 2, map: "astraviajudge", items: {
        65358: { monster: "Hand" } } },
    { slot: 430, id: 8388, value: 3, map: "astraviajudge", items: {
        65359: { monster: "Trumpeter" } } },
    { slot: 430, id: 8389, value: 4, map: "astraviajudge", items: {
        65360: { monster: "Juror", cell: "r4" } } },
    { slot: 430, id: 8390, value: 5, map: "astraviajudge", items: {
        65361: { monster: "Trumpeter" },
        65362: { mapItem: 9276 } } },
    { slot: 430, id: 8391, value: 6, map: "astraviajudge", items: {
        65363: { mapItem: 9277 },
        65364: { monster: "Hand" } } },
    { slot: 430, id: 8392, value: 7, map: "astraviajudge", items: {
        65365: { monster: "Trumpeter" } } },
    { slot: 430, id: 8393, value: 8, map: "astraviajudge", items: {
        65366: { monster: "Juror", cell: "r4" } } },
    { slot: 430, id: 8394, value: 9, map: "astraviajudge", items: {
        65367: { monster: "Shades", cell: "r10" },
        65368: { mapItem: 9278 } } },
    { slot: 430, id: 8395, value: 10, map: "astraviajudge", items: {
        65369: { monster: "La", cell: "r11" } } },

    // ---- eridanipast, slot 430 11-20 --------------------------------------
    { slot: 430, id: 8521, value: 11, map: "eridanipast", items: {
        68187: { mapItem: 9681 } } },
    { slot: 430, id: 8522, value: 12, map: "eridanipast", items: {
        68188: { monster: "Bandit" },
        68189: { monster: "Dog" } } },
    { slot: 430, id: 8523, value: 13, map: "eridanipast", items: {
        68190: { mapItem: 9676 } } },
    { slot: 430, id: 8524, value: 14, map: "eridanipast", items: {
        68191: { monster: "Bandit" } } },
    { slot: 430, id: 8525, value: 15, map: "eridanipast", items: {
        68192: { monster: "Bat" },
        68193: { mapItem: 9677 } } },
    { slot: 430, id: 8526, value: 16, map: "eridanipast", items: {
        68194: { mapItem: 9678 },
        68195: { mapItem: 9679 } } },
    { slot: 430, id: 8527, value: 17, map: "eridanipast", items: {
        68196: { monster: "Bat" },
        68197: { monster: "Dog" } } },
    { slot: 430, id: 8528, value: 18, map: "eridanipast", items: {
        68198: { monster: "Bandit" } } },
    { slot: 430, id: 8529, value: 19, map: "eridanipast", items: {
        68199: { monster: "Suki", cell: "r10" } } },
    { slot: 430, id: 8530, value: 20, map: "eridanipast", items: {
        68200: { mapItem: 9680 },
        68201: { monster: "Bandit" } } },

    // ---- astraviapast, slot 430 21-30 -------------------------------------
    { slot: 430, id: 8592, value: 21, map: "astraviapast", items: {
        69228: { mapItem: 10017 },
        69229: { mapItem: 10018 } } },
    { slot: 430, id: 8593, value: 22, map: "astraviapast", items: {
        69230: { monster: "Astravian Soldier" } } },
    { slot: 430, id: 8594, value: 23, map: "astraviapast", items: {
        69231: { mapItem: 10019 } } },
    { slot: 430, id: 8595, value: 24, map: "astraviapast", items: {
        69232: { monster: "Panicked Citizen" } } },
    { slot: 430, id: 8596, value: 25, map: "astraviapast", items: {
        69233: { mapItem: 10020 },
        69234: { monster: "Astravian Soldier" } } },
    { slot: 430, id: 8597, value: 26, map: "astraviapast", items: {
        69235: { monster: "Regulus", cell: "r6" } } },
    { slot: 430, id: 8598, value: 27, map: "astraviapast", items: {
        69236: { monster: "Titania", cell: "r7" } } },
    { slot: 430, id: 8599, value: 28, map: "astraviapast", items: {
        69237: { monster: "Aurola", cell: "r8" } } },
    { slot: 430, id: 8600, value: 29, map: "astraviapast", items: {
        69238: { mapItem: 10021 } } },
    { slot: 430, id: 8601, value: 30, map: "astraviapast", items: {
        69239: { monster: "Forsaken Husk", cell: "r11" } } },

    // ---- firstobservatory, slot 454 1-11 ----------------------------------
    { slot: 454, id: 8630, value: 1, map: "firstobservatory", items: {
        69738: { mapItem: 10083 } } },
    { slot: 454, id: 8631, value: 2, map: "firstobservatory", items: {
        69739: { monster: "Astra Scorpio" } } },
    { slot: 454, id: 8632, value: 3, map: "firstobservatory", items: {
        69740: { monster: "Astra Leo" } } },
    { slot: 454, id: 8633, value: 4, map: "firstobservatory", items: {
        69741: { mapItem: 10084 },
        69742: { monster: "Ancient Turret" } } },
    { slot: 454, id: 8634, value: 5, map: "firstobservatory", items: {
        69743: { mapItem: 10085 } } },
    { slot: 454, id: 8635, value: 6, map: "firstobservatory", items: {
        69744: { monster: "Ancient Creature" } } },
    { slot: 454, id: 8636, value: 7, map: "firstobservatory", items: {
        69745: { mapItem: 10086 },
        69746: { mapItem: 10087 } } },
    { slot: 454, id: 8637, value: 8, map: "firstobservatory", items: {
        69747: { monster: "Ancient Creature" },
        69755: { monster: "Ancient Turret" } } },
    { slot: 454, id: 8638, value: 9, map: "firstobservatory", items: {
        69748: { mapItem: 10088 },
        69749: { mapItem: 10089 } } },
    { slot: 454, id: 8639, value: 10, map: "firstobservatory", items: {
        69756: { mapItem: 10090 } } },
    { slot: 454, id: 8640, value: 11, map: "firstobservatory", items: {
        69750: { monster: "Empress Finger", cell: "r10a" } } },

    // ---- genesisgarden, slot 454 12-21 ------------------------------------
    { slot: 454, id: 8678, value: 12, map: "genesisgarden", items: {
        70394: { mapItem: 10196 } } },
    { slot: 454, id: 8679, value: 13, map: "genesisgarden", items: {
        70395: { monster: "Drago's Soldier" } } },
    { slot: 454, id: 8680, value: 14, map: "genesisgarden", items: {
        70396: { mapItem: 10197 },
        70397: { mapItem: 10198 },
        70398: { mapItem: 10199 } } },
    { slot: 454, id: 8681, value: 15, map: "genesisgarden", items: {
        70399: { monster: "Drago's Soldier" } } },
    { slot: 454, id: 8682, value: 16, map: "genesisgarden", items: {
        70400: { mapItem: 10200 },
        70401: { mapItem: 10201 } } },
    { slot: 454, id: 8683, value: 17, map: "genesisgarden", items: {
        70402: { mapItem: 10202 } } },
    { slot: 454, id: 8684, value: 18, map: "genesisgarden", items: {
        70403: { monster: "Ancient Creature" },
        70404: { monster: "Plant Beast" } } },
    { slot: 454, id: 8685, value: 19, map: "genesisgarden", items: {
        70405: { monster: "Ancient Turret" },
        70406: { mapItem: 10203 } } },
    { slot: 454, id: 8686, value: 20, map: "genesisgarden", items: {
        70407: { monster: "Undead Humanoid", cell: "r9" } } },
    { slot: 454, id: 8687, value: 21, map: "genesisgarden", items: {
        70408: { monster: "Ancient Mecha", cell: "r11" } } },

    // ---- theworld, slot 454 22-32 -----------------------------------------
    { slot: 454, id: 8723, value: 22, map: "theworld", items: {
        70946: { mapItem: 10289 } } },
    { slot: 454, id: 8724, value: 23, map: "theworld", items: {
        70947: { monster: "Nothingness" } } },
    { slot: 454, id: 8725, value: 24, map: "theworld", items: {
        70948: { monster: "Re", cell: "r4" } } },
    { slot: 454, id: 8726, value: 25, map: "theworld", items: {
        70949: { monster: "Fa", cell: "r5" } } },
    { slot: 454, id: 8727, value: 26, map: "theworld", items: {
        70950: { monster: "Ti", cell: "r6" } } },
    { slot: 454, id: 8728, value: 27, map: "theworld", items: {
        70951: { monster: "So", cell: "r7" } } },
    { slot: 454, id: 8729, value: 28, map: "theworld", items: {
        70952: { monster: "Nothingness" } } },
    { slot: 454, id: 8730, value: 29, map: "theworld", items: {
        70953: { monster: "So", cell: "r7" } } },
    { slot: 454, id: 8731, value: 30, map: "theworld", items: {
        70954: { monster: "So", cell: "r7" } } },
    { slot: 454, id: 8732, value: 31, map: "theworld", items: {
        70955: { monster: "Darkon", cell: "r8" } } },
    { slot: 454, id: 8733, value: 32, map: "theworld", items: {
        70956: { monster: "Encore Darkon", cell: "r9" } } }
];

// One step per tick: hand in what is ready, otherwise accept, fill the first
// unmet objective, and yield. `true` means "this step is done", not "the pass
// is done" — the caller returns either way so the next tick re-reads progress.
function work(step) {
    if (bot.quest.ready(step.id)) return bot.quest.turnIn(step.id);
    if (!bot.quest.active(step.id) && !bot.quest.accept(step.id)) return false;

    var wants = bot.quest.wants(step.id);
    if (wants == null) return false;
    for (var i = 0; i < wants.length; i++) {
        var want = wants[i];
        var short = want.need - want.have;
        if (short <= 0) continue;

        var source = step.items[want.id];
        if (source === undefined) {
            bot.fail("quest " + step.id + " wants item " + want.id + ", which no step gives");
            return false;
        }
        if (source.mapItem !== undefined) {
            // The click only counts while the quest is active (the accept above
            // ensures that), and mapItem tracks the bag's absolute count, so the
            // full need goes in, not the delta.
            if (!bot.travel(step.map)) return false;
            return bot.mapItem(source.mapItem, want.need, want.id);
        }
        // hunt travels, walks to the monster's cell (or the known one) and kills
        // the delta, so a partly-filled objective resumes without recounting.
        return bot.hunt(step.map, source.monster, short, source.cell, undefined);
    }

    return bot.quest.ready(step.id) ? bot.quest.turnIn(step.id) : false;
}

var values = {};
for (var s = 0; s < SLOTS.length; s++) {
    var value = bot.quest.value(SLOTS[s]);
    if (value == null) return; // the watch lands on a later tick
    values[SLOTS[s]] = value;
}

var slot = 0;
for (var t = 0; t < SLOTS.length; t++) {
    if (values[SLOTS[t]] < DONE[SLOTS[t]]) {
        slot = SLOTS[t];
        break;
    }
}
if (slot === 0) {
    bot.log("elegy-of-madness: saga complete (352=10, 376=29, 430=30, 454=32)");
    return true;
}

for (var n = 0; n < STEPS.length; n++) {
    var step = STEPS[n];
    if (step.slot !== slot) continue;
    if (values[slot] >= step.value) continue;
    if (!work(step)) return;
    return;
}

return;
