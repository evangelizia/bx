/// name: Legion Revenant
/// class: Legion Revenant
/// role: Offensive Caster
/// version: 1.0
/// author: beatrix
/// desc: Depraved Empowerment for Depravity, Anathema nuke, Wicked Purgatory for Seared, Atramentous Shade for Decay, Malevolent Burst filler for mana.
/// tags: dps, caster, aoe, farm, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const depravity = me.aura("Depravity");

// Depraved Empowerment: 15 mana, 6 s. Applies Depravity to you and 6 allies,
// +30% Dodge, Crit Chance and Outgoing Damage, and Immorality with +20%
// Haste, +30% Crit Damage and a HoT, plus Arcane Shield reducing non-True
// damage taken 30% of your Spell Power for 12 s. Keep it up for damage and
// survival, refresh before it drops.
if (s.usable("Depraved Empowerment") && (!depravity || depravity.remainingMs < 3000)) {
    return "Depraved Empowerment";
}

if (!target) return null;

const seared = target.aura("Seared");
const enveloped = me.aura("Enveloped");
const decay = target.aura("Decay") || target.aura("Consumed");

// Anathema: 20 mana, 12 s, 300% spell damage to 3 targets, 50% to secondary
// targets. The nuke, also a 50% chance to apply Infinita Nox, +7% incoming
// damage per stack up to 15 stacks for 30 s. Spend it on cooldown.
if (s.usable("Anathema")) return "Anathema";

// Wicked Purgatory: 15 mana, 6 s, 100% spell damage to 3 targets. Applies
// Seared, -15% Crit Chance plus 3% per stack up to 5 stacks for 12 s, and
// Enveloped on you, -20% incoming damage plus 4% per stack up to 5 stacks for
// 12 s. Also a 50% chance to apply Infinita Nox. Stack it for mitigation.
if (s.usable("Wicked Purgatory")
    && (!seared || seared.stacks < 5 || seared.remainingMs < 4000
        || !enveloped || enveloped.stacks < 5 || enveloped.remainingMs < 4000)) {
    return "Wicked Purgatory";
}

// Atramentous Shade: 10 mana, 6 s, 85% spell damage to 3 targets, always
// crits and cannot miss. Applies Decay and Consumed, -25% Dodge plus a DoT
// every 1 s for 12 s. Also a 50% chance to apply Infinita Nox. Keep the DoT up.
if (s.usable("Atramentous Shade") && (!decay || decay.remainingMs < 4000)) {
    return "Atramentous Shade";
}

// Malevolent Burst: 0 mana, 1.5 s, 57% spell damage to 3 targets, recovers
// 15 mana on hit. Rank 0 means it is the auto replacement, plus Shadow Step
// +20% Wisdom and Dark Scholar +40% magical damage are automatic passives.
// Filler and mana battery.
if (s.usable("Malevolent Burst")) return "Malevolent Burst";

return s.usable("Auto Attack") ? "Auto Attack" : null;
