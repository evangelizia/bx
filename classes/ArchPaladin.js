/// name: ArchPaladin
/// class: ArchPaladin
/// role: Support Bruiser
/// version: 1.1
/// author: beatrix
/// desc: Hymn when hurt, Righteous Seal for mitigation, Eden held until the seal fades for double damage, Commandment spammed for damage and stacks.
/// tags: support, healer, tank, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

// Hymn of Light: 40 mana, 10 s, 7 allies. Heals 380% hybrid, always crits, and
// grants +20% END and Defense for 15 s. A heal first: at full health the buff
// is not worth the cast or the mana.
if (me.hpPct < 55 && s.usable("Hymn of Light")) return "Hymn of Light";

if (!target) return null;

const seal = target.aura("Righteous Seal");

// Righteous Seal: 20 mana, 25 s, 135% hybrid. The target deals 90% less damage
// for 7 s, and undead are stunned for 3 s. The opener against anything that
// hits back, and the setup for Eden.
if (!seal && s.usable("Righteous Seal")) return "Righteous Seal";

// Sacred Magic: Eden: 40 mana, 25 s, 550% spell damage to 3 targets, doubled
// to 1100% while the target is sealed. It consumes the seal and leaves Broken
// Seal, -15% outgoing damage for 25 s. Hold it until the seal is about to
// fade: the seal keeps almost all of its 7 s of mitigation instead of one
// tick, and the matching 25 s cooldowns stay lined up for the next cycle.
if (seal && seal.remainingMs < 3000 && s.usable("Sacred Magic: Eden")) {
    return "Sacred Magic: Eden";
}

// Commandment: 10 mana, 5 s, 150% weapon damage to 3 targets, 375% against
// undead. Applies Divine, Commandment and Eminent, -10% Dodge and Defense and
// -5% Hit, outgoing damage and Crit Chance per stack, six stacks for 10 s.
// This is the spam skill: even at six stacks a cast beats the auto attack and
// refreshes the stacks, so it is used on every cooldown, not just to refresh.
if (s.usable("Commandment")) return "Commandment";

// Restitution (-20% incoming damage), Blessed by Light (+100% END, +10% Hit)
// and Righteous Judgement (+20% outgoing damage, +15% Haste) are passive.
return s.usable("Auto Attack") ? "Auto Attack" : null;
