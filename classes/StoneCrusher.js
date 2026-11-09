/// name: StoneCrusher
/// class: StoneCrusher
/// role: Defensive Caster
/// version: 1.0
/// author: beatrix
/// desc: Echoing Earth for haste, crit and mana, Endless Fissure for Aftershock, Stalagmite for Bruised, Land's Embrace to heal and shield.
/// tags: support, healer, caster, tank, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const resonance = me.aura("Resonance");
const shielded = me.aura("Shielded");

// Echoing Earth: 25 mana, 18 s. Applies Resonance and Dissonance to you and
// 6 allies, +30% Haste and Crit for 10 s and improved mana regain, Dissonance
// restores 10 mana per ally buffed. Has a 25% chance to apply Magnitude, which
// adds +275% magical damage for 2 s. Keep it up, it feeds mana and haste.
if (s.usable("Echoing Earth") && (!resonance || resonance.remainingMs < 3000)) {
    return "Echoing Earth";
}

// Land's Embrace: 25 mana, 12 s. Applies Shielded, +50% Damage Resistance for
// you and 6 allies plus a small HoT for 4 s. With Magnitude DR becomes 80%
// and the HoT doubles. Use it when hurt, not on a full bar, to save mana for
// Endless Fissure.
if (me.hpPct < 75 && s.usable("Land's Embrace") && (!shielded || shielded.remainingMs < 4000)) {
    return "Land's Embrace";
}

if (!target) return null;

const bruised = target.aura("Bruised");
const aftershock = target.aura("Aftershock");

// Endless Fissure: 35 mana, 30 s, 300% spell damage. Applies Aftershock, a
// DoT that grows while it is on the target for 30 s. With Magnitude the
// target also loses 40% Crit and Haste for 8 s in a sinkhole. This is the
// main damage and the mana sink, so keep Aftershock up. Shifting Plates and
// Gaia Knowledge passives are automatic.
if (s.usable("Endless Fissure") && (!aftershock || aftershock.remainingMs < 4000)) {
    return "Endless Fissure";
}

// Stalagmite: 15 mana, 6 s, 130% spell damage. Applies Bruised, +8% incoming
// damage per stack up to 5 stacks for 8 s. With Magnitude there is a 50%
// chance to stun for 4 s. Stack it to 5 for the full +40% incoming.
if (s.usable("Stalagmite") && (!bruised || bruised.stacks < 5 || bruised.remainingMs < 4000)) {
    return "Stalagmite";
}

if (s.usable("Endless Fissure")) return "Endless Fissure";
if (s.usable("Stalagmite")) return "Stalagmite";

return s.usable("Auto Attack") ? "Auto Attack" : null;
