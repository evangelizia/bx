/// name: Yami no Ronin
/// class: Yami no Ronin
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Yami no Maku DoT, Tachi for Ichi Ni San, Jigen Kogeki timed to the DoT, Kettou to heal and build Flash.
/// tags: dps, dodge, melee, solo, endgame
const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const flash = me.aura("Flash");
const ichi = me.aura("Ichi");
const ni = me.aura("Ni");
const san = me.aura("San");

if (!target) return null;

const yami = target.aura("Yami") || target.aura("Yami no Maku");

// Yami no Maku: 20 mana, 8 s, physical. Applies Yami, a DoT that grows
// stronger for 10 s, and can apply Spinning Dragon, which zeroes the
// target's next hit. Always hits. Keep the DoT up: Jigen Kogeki scales off
// its remaining time.
if (s.usable("Yami no Maku") && (!yami || yami.remainingMs < 4000)) {
    return "Yami no Maku";
}

// Tachi: 3 mana, 3 s, physical. Three strikes that always hit. The first
// applies Ichi, +20% outgoing damage for 10 s. The second applies Ni, +20%
// physical outgoing damage for 8 s. The third applies San, +150% crit
// damage for 6 s. The effects do not refresh, so use it when any is missing.
if ((!ichi || !ni || !san) && s.usable("Tachi")) return "Tachi";

// Jigen Kogeki: 20 mana, 6 s, hybrid. Strong unavoidable damage. With Yami
// on the target it deals massive damage based on Yami's remaining time:
// less time left means more damage. It consumes Flash, Revealed, Ichi, Ni
// and San. Spend it when Yami is about to expire and the build-up is ready.
const flashStacks = flash ? flash.stacks : 0;
if (yami && yami.remainingMs < 4000 && ichi && ni && san && flashStacks >= 5
    && s.usable("Jigen Kogeki")) {
    return "Jigen Kogeki";
}

// Kettou: 3 mana, 3 s, physical. Strong damage plus lifesteal based on the
// damage dealt. It also applies 1 stack of Flash. Take it when hurt, and
// otherwise use it to build Flash for a timed Jigen Kogeki.
if (me.hpPct < 55 && s.usable("Kettou")) return "Kettou";

// Batto is the auto attack and builds Flash. Hisome, Gouyuu and Sokudo are
// passive: +80% Dodge, +35% outgoing damage, +15% Haste and Crit. Anything
// left is filler: timed Jigen first, then the build-up.
if (yami && yami.remainingMs < 4000 && s.usable("Jigen Kogeki")) return "Jigen Kogeki";
if (s.usable("Tachi")) return "Tachi";
if (s.usable("Kettou")) return "Kettou";

return s.usable("Auto Attack") ? "Auto Attack" : null;
