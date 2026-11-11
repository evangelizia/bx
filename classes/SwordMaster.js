/// name: SwordMaster
/// class: SwordMaster
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Uke Negashi for permanent Evasion, Nukiuchi and Sever for guaranteed Vitals, Spinning Dragon and Precise Cut, Bladefury for crit, Nukitsuke filler.
/// tags: dps, dodge, melee, solo, legion

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const evasion = me.aura("Evasion");

// Uke Negashi: 10 mana, 25 s. Grants Evasion, +25% Dodge and +15% Crit Chance
// for 25 s, and resets Technique. Duration matches the cooldown, so Evasion
// can be held permanently: refresh it the moment it drops. Dodge is the
// class's mana and healing engine under the Rogue model, so this goes first.
if (s.usable("Uke Negashi") && (!evasion || evasion.remainingMs < 3000)) {
    return "Uke Negashi";
}

if (!target) return null;

// Technique is passive: every 5 s the next skill to hit applies Vitals, a DoT
// scaled by that skill's damage, and lands that skill's chance effects for
// free. The order below puts the strongest proc first, so whichever skill is
// ready when Vitals can be applied seeds the biggest DoT and keeps its
// guaranteed effect.

// Nukiuchi: 20 mana, 10 s, 500% physical. The nuke. Its 50% stun for 2 s and
// 50% Spinning Dragon, which zeroes the target's next attack, both become
// certain under Technique. Cast it on cooldown, ahead of Sever so the Vitals
// DoT is seeded by the largest strike.
if (s.usable("Nukiuchi")) return "Nukiuchi";

// Sever: 15 mana, 9 s, 240% physical. Cuts the target's Outgoing Damage by
// 70% for 5 s, the class's main mitigation, and has a 35% chance of Precise
// Cut, -30% Damage Resistance for 5 s. Keep it cycling; the debuff is worth
// more than the cooldown it leaves.
if (s.usable("Sever")) return "Sever";

// Bladefury: 0 mana, 5 s, 60% physical to 4 targets. A 25% chance per target
// hit to apply Bladefury, +15% Crit Chance and +50% Crit Damage for 5 s. Free
// damage, the crit buff and the AoE, so it fills every gap the two above
// leave. Keen Reflexes (+25% Dodge, +20% Crit Damage) and Tanden (+20%
// Outgoing Damage) are passive and need no casting.
if (s.usable("Bladefury")) return "Bladefury";

return s.usable("Auto Attack") ? "Auto Attack" : null;
