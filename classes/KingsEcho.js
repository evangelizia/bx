/// name: King's Echo
/// class: King's Echo
/// role: Offensive Caster
/// version: 1.0
/// author: beatrix
/// desc: Bolt of Authority for Residual Energy, Liberation Mace for Censure, CORVAK! to spend stacks and refill mana, King's Shield when hurt.
/// tags: dps, caster, tank, solo, endgame

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const energy = me.aura("Residual Energy");
const stacks = energy ? energy.stacks : 0;

// King's Shield: 50 mana, 5 s. Two seconds of invulnerability and Focus,
// then Royal Resolve: 50% Damage Resistance and a HoT for 6 s. The
// invulnerability cannot repeat until CORVAK! is used, so hold it for
// when you are hurt, not on a full bar. This is the emergency button.
if (me.hpPct < 55 && s.usable("King's Shield")) return "King's Shield";

// CORVAK!: consumes missing mana for 300-1260% magic damage, refills mana
// completely, and infuses Residual Energy into Dragon Sword for 20 s.
// Cast it in the high-stack, low-mana window, and whenever mana is too
// low to keep casting. It re-enables the next Shield's invulnerability.
if (s.usable("CORVAK!")
    && ((stacks >= 6 && me.mp < 40) || me.mp < 20 || stacks >= 8)) {
    return "CORVAK!";
}

if (!target) return null;

const censure = target.aura("Censure");

// Liberation Mace: 0 mana, 3 s, 250% magical damage. Applies Censure,
// -20% Damage Resistance, Crit Chance and Dodge for 10 s. While Royal
// Resolve is active it applies Overthrown instead, -8% outgoing damage
// per stack up to 4. Keep Censure up.
if (s.usable("Liberation Mace") && (!censure || censure.remainingMs < 3000)) {
    return "Liberation Mace";
}

// Bolt of Authority: 25 mana, 3 s, 110% magic damage. Applies Residual
// Energy, stacking to 8 for 10 s. Each stack makes Dragon Sword hit harder,
// and CORVAK! spends them all at once. Stack it to 8 before spending,
// unless mana is already low.
if (s.usable("Bolt of Authority") && stacks < 8) return "Bolt of Authority";

// Filler: spend stacks first, then damage, then Dragon Sword.
if (s.usable("CORVAK!")) return "CORVAK!";
if (s.usable("Liberation Mace")) return "Liberation Mace";
if (s.usable("Bolt of Authority")) return "Bolt of Authority";

return s.usable("Auto Attack") ? "Auto Attack" : null;
