/// name: Chrono Assassin
/// class: Chrono Assassin
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Relapse for Deadlock and Reverse Time, Shift for Push Time, Convert for Condense Time, Hysteria in Reverse for Corrupt.
/// tags: dps, dodge, melee, solo
// Chrono Assassin: Dodge Melee. Shift, Relapse and Convert stack for
// Push Time, Deadlock and Condense Time. At max Deadlock, Relapse gives
// Reverse Time with a HoT. While Reverse Time is up, Shift, Convert and
// Hysteria turn into damage: Temporal Blades plus Pull Time, Depress Time
// and Corrupt Time, so the Reverse window is the spend window.
const me = s.self;
const target = s.target;

if (!me || !me.alive || !target) return null;

const deadlock = me.aura("Deadlock");
const reverse = me.aura("Reverse Time");
const pushTime = me.aura("Push Time");
const condense = me.aura("Condense Time") || me.aura("Cause");
const temporal = me.aura("Temporal Blades");
const pull = target.aura("Pull Time");
const depress = target.aura("Depress Time");
const corrupt = target.aura("Corrupt Time");

// Hysteria: 30 mana, 20 s, magical. The target hits itself for 6 s. Without
// Reverse Time it applies Enhance Time, raising the target's Damage
// Resistance. With Reverse Time it gives Temporal Blades and Corrupt Time,
// which raises the damage the target takes for 12 s. Only spend it in
// Reverse, where it is damage instead of a shield.
if (reverse && s.usable("Hysteria") && (!corrupt || corrupt.remainingMs < 4000)) {
    return "Hysteria";
}

// Shift while Reverse Time is up: 12 mana, 5 s, physical. Applies Temporal
// Blades, +30% outgoing damage, and Pull Time, -15% opponent Haste and Dodge
// for 12 s. Use it first in Reverse to open the debuff window.
if (reverse && s.usable("Shift") && (!temporal || !pull || pull.remainingMs < 4000)) {
    return "Shift";
}

// Convert while Reverse Time is up: 12 mana, 4 s, physical. Applies Temporal
// Blades and Depress Time, -15% opponent Crit Chance and Crit Damage for
// 12 s. Pair it with Shift so both timing debuffs are up together.
if (reverse && s.usable("Convert") && (!temporal || !depress || depress.remainingMs < 4000)) {
    return "Convert";
}

// Relapse: 6 mana, 3 s, hybrid. Applies Deadlock to you for 12 s. At max
// stacks it consumes itself and applies Reverse Time with a moderate HoT
// for 10 s. This is the core builder: stack it whenever Deadlock is low
// and Reverse is not already running.
if (!reverse && s.usable("Relapse") && (!deadlock || deadlock.stacks < 5)) {
    return "Relapse";
}

// Shift: 12 mana, 5 s, physical. Applies Push Time, +8% Dodge and Haste for
// 12 s, stacks to 5. While Reverse is up it turns into the Pull Time
// debuff above. Stack it to 5 outside Reverse for evasion and haste.
if (s.usable("Shift") && (!pushTime || pushTime.stacks < 5 || pushTime.remainingMs < 4000)) {
    return "Shift";
}

// Convert: 12 mana, 4 s, physical. Applies Condense Time, +10% Crit Chance
// and Crit Damage for 12 s, stacks to 5. While Reverse is up it turns into
// the Depress Time debuff above. Stack it to 5 outside Reverse for crits.
if (s.usable("Convert") && (!condense || condense.stacks < 5 || condense.remainingMs < 4000)) {
    return "Convert";
}

// Prediction and Anticipation are passive: +10% Hit and Crit, +12% Dodge.
// No casting needed. Anything left is filler: Relapse first, then the
// stackers.
if (s.usable("Relapse")) return "Relapse";
if (s.usable("Shift")) return "Shift";
if (s.usable("Convert")) return "Convert";

return s.usable("Auto Attack") ? "Auto Attack" : null;
