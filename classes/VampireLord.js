/// name: Vampire Lord
/// class: Vampire Lord
/// role: AoE DPS
/// version: 1.0
/// author: beatrix
/// desc: Sonar Scream to amplify up to three targets, Ghoul Gouge for damage over time, Devour Blood for damage and sustain, Slash as the filler.
/// tags: dps, farm, solo, aoe, sustain

const me = s.self;
const target = s.target;

if (!me || !me.alive || !target) return null;

const deafened = target.aura("Deafened");
const gouged = target.aura("Gouged");

// Sonar Scream applies Deafened, increasing damage taken by 30% for 8 seconds.
// Keep it active before spending the harder-hitting attacks.
if (s.usable("Sonar Scream") && (!deafened || deafened.remainingMs < 1500)) {
    return "Sonar Scream";
}

// Ghoul Gouge deals 120% hybrid damage and applies a 12-second DoT.
if (s.usable("Ghoul Gouge") && (!gouged || gouged.remainingMs < 2500)) {
    return "Ghoul Gouge";
}

// Devour Blood hits up to three targets, heals for half the damage, and
// reduces enemy damage by 50% for 5 seconds. Use it on cooldown for farming
// sustain; its damage and mitigation also help in solo fights.
if (s.usable("Devour Blood")) return "Devour Blood";

// Aspect of the Bat suppresses the class's debuffs and sharply lowers damage,
// so leave it unused for both farming and DPS.
if (s.usable("Slash")) return "Slash";

return null;
