/// name: Legion Revenant
/// class: Legion Revenant
/// role: Offensive Caster
/// version: 1.1
/// author: beatrix
/// desc: Depraved Empowerment for Depravity, Wicked Purgatory and Atramentous Shade on cooldown for Infinita Nox, Anathema into the stacks, Malevolent Burst mana battery.
/// tags: dps, caster, aoe, farm, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const depravity = me.aura("Depravity");

// Depraved Empowerment: 15 mana, 6 s, you and 6 allies. Applies Depravity for
// 12 s, +30% Dodge, Crit Chance and Outgoing Damage, and Immorality for 12 s,
// +20% Haste, +30% Crit Damage and a HoT every 1 s, plus Arcane Shield, which
// absorbs 30% of Spell Power from non-True damage and drains 8 mana per hit.
// Nothing else multiplies this hard, so it is refreshed ahead of any damage.
if (s.usable("Depraved Empowerment") && (!depravity || depravity.remainingMs < 3000)) {
    return "Depraved Empowerment";
}

if (!target) return null;

// This class has no combo. Every skill wants to be cast as soon as it is
// ready, and the two 12 s auras below sit on 6 s cooldowns, so cooldown play
// keeps them up without a timer. The order seeds Infinita Nox before the nuke:
// 50% per cast from Purgatory, Shade and Anathema for +7% incoming damage,
// 15 stacks, 30 s. Anathema loses no casts to a two tick delay, so the nuke
// lands into whatever is already there.

// Wicked Purgatory: 15 mana, 6 s, 100% spell damage to 3 targets. Applies
// Seared, -15% Crit Chance and -3% per stack, and Enveloped on you, -20%
// incoming damage and -4% per stack, both for 12 s and up to 5 stacks. The
// mitigation half is why it goes before the nuke.
if (s.usable("Wicked Purgatory")) return "Wicked Purgatory";

// Atramentous Shade: 10 mana, 6 s, 85% spell damage to 3 targets, always
// crits and cannot miss. Applies Decay for 2 s and Atramentous Shade for 12 s,
// -25% Dodge and a DoT every 1 s. The recast is both the hit and the refresh.
if (s.usable("Atramentous Shade")) return "Atramentous Shade";

// Anathema: 20 mana, 12 s, 300% spell damage to 3 targets. The nuke, and the
// third Infinita Nox roll. Spend it on cooldown into the debuffs above.
if (s.usable("Anathema")) return "Anathema";

// Malevolent Burst: 0 mana, 1.5 s, 57% spell damage to 3 targets and 15 mana
// back on hit. Rank 0, so it replaces the auto attack and is the mana battery
// that pays for everything above. Shadow Step (+20% Wisdom) and Dark Scholar
// (+40% outgoing magic damage) are passive.
if (s.usable("Malevolent Burst")) return "Malevolent Burst";

return s.usable("Auto Attack") ? "Auto Attack" : null;
