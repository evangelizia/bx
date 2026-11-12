/// name: Ninja
/// class: Ninja
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Maintains Thin Air, stacks Rapid Bleed with Shuriken, and uses Shadowblade and Smoke Bomb for damage and debuffs.
/// tags: ninja, dodge, melee, solo, base class

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const vanish = me.aura("Vanish");
if ((!vanish || vanish.remainingMs < 1000) && s.usable("Thin Air")) {
    return "Thin Air";
}

if (!target) return null;

const bleed = target.aura("Rapid Bleed");
const sharpened = me.aura("Sharpened Edge");
const smoke = target.aura("Smoke Bomb");

// Shuriken's Rapid Bleed stacks up to five times. Maintain the stack DoT.
if ((!bleed || bleed.stacks < 5 || bleed.remainingMs < 1200)
    && s.usable("Shuriken")) return "Shuriken";

if ((!sharpened || sharpened.remainingMs < 1500) && s.usable("Shadowblade")) {
    return "Shadowblade";
}

if ((!smoke || smoke.remainingMs < 1200) && s.usable("Smoke Bomb")) {
    return "Smoke Bomb";
}

if (s.usable("Shuriken")) return "Shuriken";
if (s.usable("Shadowblade")) return "Shadowblade";
if (s.usable("Smoke Bomb")) return "Smoke Bomb";

return s.usable("Auto Attack") ? "Auto Attack" : null;
