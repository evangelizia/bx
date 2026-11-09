/// name: LightCaster
/// class: LightCaster
/// role: Offensive Caster
/// version: 1.0
/// author: beatrix
/// desc: Lingering Light for In The Spotlight, Burned by Light for sun DoT, Light Blast for Blinded, Illuminate for heal and Illuminated.
/// tags: dps, caster, healer, support, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const illuminated = me.aura("Illuminated");

// Illuminate: 20 mana, 12 s. Heals you and 6 allies for 300% spell damage and
// applies Illuminated, +15% outgoing damage, Crit Chance, Crit Damage, Hit
// Chance, Dodge, Haste and Damage Resistance for 12 s. Cast when hurt and
// keep it up for the buff, it is both heal and DPS.
if (s.usable("Illuminate")
    && (me.hpPct < 55 || !illuminated || illuminated.remainingMs < 3000)) {
    return "Illuminate";
}

if (!target) return null;

const spotlight = target.aura("In The Spotlight");
const blinded = target.aura("Blinded by Light");
const burned = target.aura("Burned by Light");

// Lingering Light: 10 mana, 4 s, 100% spell damage. Applies In The Spotlight,
// +3% incoming damage per stack up to 50 stacks, lasts 10 s if not restacked.
// Stack it first, every later skill hits harder into it.
const spotlightNeedsStack =
    !spotlight || spotlight.stacks < 50 || spotlight.remainingMs < 4000;
if (spotlightNeedsStack && s.usable("Lingering Light")) return "Lingering Light";

// Burned by Light: 35 mana, 15 s, 500% spell damage on impact plus a DoT of
// 350% spell damage over 10 s. Big mana sink, so hold it until Spotlight is
// worth amplifying, then keep the DoT up. Passives Mentally Bright, Speed of
// Light and Power of the Sun are automatic.
if (s.usable("Burned by Light") && (!burned || burned.remainingMs < 4000)) {
    return "Burned by Light";
}

// Light Blast: 15 mana, 4 s, 350% spell damage, guaranteed to hit and cannot
// crit. Applies Blinded by Light, -5% chance to hit per stack up to 5 stacks
// for 12 s. Filler nuke and mitigation.
if (s.usable("Light Blast") && (!blinded || blinded.stacks < 5 || blinded.remainingMs < 4000)) {
    return "Light Blast";
}

if (s.usable("Burned by Light")) return "Burned by Light";
if (s.usable("Light Blast")) return "Light Blast";
if (s.usable("Lingering Light")) return "Lingering Light";

return s.usable("Auto Attack") ? "Auto Attack" : null;
