/// name: Shadow Battleon EXP
/// version: 1.0
/// author: beatrix
/// desc: Keeps Shadow Hunt 9421 and 9422 active, hands in what is ready, farms Doomed Troll otherwise.
/// tags: farm, exp, quests, shadowbattleon
/// timeout: 0

const MAP = "shadowbattleon";
const MONSTER = "Doomed Troll";
const QUESTS = [9421, 9422];
// Both quests count medals from the same troll, so one pass is one kill and
// one pickup. The hand-in is checked before the kill: a ready quest is worth
// more than another medal stack, and the pickup drains leftovers first so a
// drop is never wasted on a stack that is already full.
const DROPS = ["Shadow Hunt Medal", "Mega Shadow Hunt Medal"];

if (!bot.travel(MAP)) return;

// One accept at a time: the step machine answers true only once the tracker
// holds the quest, so the next line runs on a later tick.
for (let i = 0; i < QUESTS.length; i++) {
    const id = QUESTS[i];
    if (!bot.quest.active(id) && !bot.quest.accept(id)) return;
}

for (let i = 0; i < QUESTS.length; i++) {
    const id = QUESTS[i];
    if (bot.quest.ready(id) && bot.quest.turnIn(id)) return true;
}

// A named pickup waits only for that name, so calling both drains whichever
// medals are on the floor and costs nothing when neither is.
for (let i = 0; i < DROPS.length; i++) {
    if (!bot.pickDrop(DROPS[i])) return;
}

if (!bot.kill(MONSTER, 1)) return;

for (let i = 0; i < DROPS.length; i++) {
    if (!bot.pickDrop(DROPS[i])) return;
}

return true;
