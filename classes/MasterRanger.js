/// name: Master Ranger
/// class: Master Ranger
/// role: Dodge Bow
/// version: 1.0
/// author: beatrix
/// desc: Mark For Death to Death Mark, Scorching Arrow DoT, Explosive Bolt consume, Vampiric Shot heal, Rapid Fire filler.
/// tags: dps, bow, farm, solo, ranger, aoe

const me = s.self;
const target = s.target;

if (!me || !me.alive || !target) return null;

const deathMark = target.aura("Death Mark");
const scorching = target.aura("Scorching Arrow");

// Mark For Death: 0 mana, 1.5 s, hits 2 targets. Applies Death Mark, +5%
// incoming damage per stack up to 6 stacks, lasts 10 s, and gains Mark to
// empower other skills. Stack it to 6 first, everything scales from here.
if (s.usable("Mark For Death")
    && (!deathMark || deathMark.stacks < 6 || deathMark.remainingMs < 3000)) {
    return "Mark For Death";
}

// Vampiric Shot: 10 mana, 9 s, hits 2 targets, moderate damage plus a HoT on
// you for 10 s, both scaled by Mark stacks and not consuming them. Take it
// when hurt, even before the stacks are full.
if (me.hpPct < 55 && s.usable("Vampiric Shot")) return "Vampiric Shot";

// Scorching Arrow: 15 mana, 3 s, hits 2 targets. Launches a flaming arrow
// and burns them over time for 10 s. The DoT is increased for each Mark stack
// and does not consume them. Keep it up once the marks are worth amplifying.
if (s.usable("Scorching Arrow") && (!scorching || scorching.remainingMs < 4000)) {
    return "Scorching Arrow";
}

// Explosive Bolt: 25 mana, 9 s, hits 2 targets. Detonates for high damage on
// the primary target, minor to one nearby target, increased per Mark stack
// and consumes them. Spend it at 6 stacks for the full damage. Ranger Secrets
// (+15% Dodge, +7% Haste) and Target Vitals (+15% Crit, +10% Hit) are passive.
if (deathMark && deathMark.stacks >= 6 && s.usable("Explosive Bolt")) {
    return "Explosive Bolt";
}

if (s.usable("Rapid Fire")) return "Rapid Fire";
if (s.usable("Mark For Death")) return "Mark For Death";

return s.usable("Auto Attack") ? "Auto Attack" : null;
