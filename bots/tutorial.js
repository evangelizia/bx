/// name: Tutorial Achievements
/// desc: Awards the ten tutorial achievements from /oaklore, matching the reference Tutorial Story bot.
/// once: true
/// timeout: 0
/// version: 1.0
/// author: beatrix
/// tags: story, tutorial, achievements, oaklore

// Ported from refs/Scripts/Story/Tutorial.cs. The reference explicitly sets
// tutorial achievements 22 through 31 in category ia0; it does not play the
// tutorial actions. Already-earned achievements are skipped.

var ACHIEVEMENTS = [
    [22, "Combat"],
    [23, "Interact"],
    [24, "Quest"],
    [25, "Skill"],
    [26, "Shop"],
    [27, "Enhance"],
    [28, "Rest"],
    [29, "World"],
    [30, "Emotes"],
    [31, "Travel"]
];

if (!bot.travel("oaklore")) return;

var index = bot.memory.achievementIndex || 0;
if (bot.memory.pendingAchievement !== undefined) {
    var pending = bot.achievement(bot.memory.pendingAchievement);
    if (pending === null || !pending) return;
    bot.memory.achievementIndex = index + 1;
    bot.memory.pendingAchievement = undefined;
    index++;
}

while (index < ACHIEVEMENTS.length) {
    var achievement = ACHIEVEMENTS[index];
    var earned = bot.achievement(achievement[0]);
    if (earned === null) return;
    if (!earned) {
        if (bot.roomId === null) return;
        var packet = "%xt%zm%setAchievement%" + bot.roomId +
            "%ia0%" + achievement[0] + "%1%";
        if (!bot.sendPacket(packet)) return;
        bot.memory.pendingAchievement = achievement[0];
        bot.log("tutorial: set " + achievement[1]);
        return;
    }
    index++;
    bot.memory.achievementIndex = index;
}

bot.log("tutorial: all ten achievements earned");
return true;
