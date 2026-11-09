/// name: Dragonslayer
/// class: Dragonslayer
/// role: Tank Melee
/// version: 1.0
/// author: beatrix
/// desc: Dragon's Bane to enable Cindered Scales, Infected Wound and Incapacitated, then Incapacitate, Impale, Scorched Steel for Charred and mana.
/// tags: dps, dragon, tank, melee, solo

const me = s.self;
const target = s.target;

if (!me || !me.alive || !target) return null;

const bane = target.aura("Dragonbane");
const charred = target.aura("Charred");
const cindered = target.aura("Cindered Scales");
const impaled = target.aura("Impaled");
const infected = target.aura("Infected Wound");
const weakened = target.aura("Weakened");
const incapacitated = target.aura("Incapacitated");

// Dragon's Bane: 50 mana, 2 s, 120% physical damage, can't miss. On Dragonkin,
// inflicts Dragonbane for 10 s, consumed by the next skill. That next skill
// gets a stronger bonus: Cindered Scales on Scorched Steel, Infected Wound
// on Impale, Incapacitated plus a 3 s stun on Incapacitate. Spend it first
// while it is up.
if (bane && s.usable("Incapacitate")) return "Incapacitate";
if (bane && s.usable("Impale")) return "Impale";
if (bane && s.usable("Scorched Steel")) return "Scorched Steel";

if (s.usable("Dragon's Bane") && (!bane || bane.remainingMs < 3000)) {
    return "Dragon's Bane";
}

// Scorched Steel: 0 mana, 4 s, 100% physical damage. Restores 5 mana on hit
// and applies Charred, reducing Damage Resistance by 15% for 15 s. With
// Dragonbane present it also applies Cindered Scales for another 15% DR.
// Keep it up for mana and DR.
if ((!charred || charred.remainingMs < 4000 || (bane && !cindered)) && s.usable("Scorched Steel")) {
    return "Scorched Steel";
}

// Impale: 0 mana, 10 s, 160% physical damage. Applies Impaled, a DoT that
// heals you over time for 15 s. With Dragonbane it applies Infected Wound, a
// stronger DoT, and if Infected Wound is already on the target you gain 15%
// Haste and Crit Chance for 15 s. Keep the DoT up.
const impaleNeedsRefresh =
    (!impaled && !infected) ||
    (infected && infected.remainingMs < 4000) ||
    (impaled && !infected && bane);
if (impaleNeedsRefresh && s.usable("Impale")) return "Impale";

// Incapacitate: 0 mana, 12 s, 200% physical damage. Applies Weakened,
// reducing outgoing damage by 15% for 15 s. With Dragonbane it applies
// Incapacitated for another 15% reduction plus a 3 s stun. Highest damage
// skill so it doubles as filler when its debuff is up.
const incapacitateNeedsRefresh =
    (!weakened && !incapacitated) ||
    (incapacitated && incapacitated.remainingMs < 4000) ||
    (weakened && !incapacitated && bane);
if (incapacitateNeedsRefresh && s.usable("Incapacitate")) return "Incapacitate";

// Passives do the rest: Aggression adds 10% hit and physical damage,
// Resolute adds 10% Damage Resistance, Veteran Slayer adds damage to
// Dragonkin and 10% Endurance at rank 10. Those never need casting, so
// anything left is filler: biggest hit first.
if (s.usable("Incapacitate")) return "Incapacitate";
if (s.usable("Impale")) return "Impale";
if (s.usable("Scorched Steel")) return "Scorched Steel";

return s.usable("Auto Attack") ? "Auto Attack" : null;
