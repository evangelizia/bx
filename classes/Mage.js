/// name: Mage
/// class: Mage
/// role: Caster
/// version: 1.0
/// author: beatrix
/// desc: Maintains Scorched and Frozen Blood, detonates Scorched with Explosion, and uses Arcane Shield when needed.
/// tags: caster, mage, farm, solo, base class

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const shield = me.aura("Arcane Shield");
if (me.hpPct < 70 && (!shield || shield.remainingMs < 1500)
    && s.usable("Arcane Shield")) return "Arcane Shield";

if (!target) return null;

const scorched = target.aura("Scorched");
const frozen = target.aura("Frozen Blood");

// Explosion detonates and consumes Scorched, so spend it near the end of its
// duration rather than applying Fireball and immediately consuming the DoT.
if (scorched && scorched.remainingMs < 1800 && s.usable("Explosion")) {
    return "Explosion";
}

if (!scorched && !frozen && s.usable("Ice Shard")) return "Ice Shard";
if (!scorched && s.usable("Fireball")) return "Fireball";

if (s.usable("Explosion")) return "Explosion";
if (s.usable("Fireball")) return "Fireball";
if (s.usable("Ice Shard")) return "Ice Shard";

return s.usable("Auto Attack") ? "Auto Attack" : null;
