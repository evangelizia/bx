/// name: Warrior
/// class: Warrior
/// role: Tank Melee
/// version: 1.0
/// author: beatrix
/// desc: Uses On Guard for defense, Prepared Strike for guaranteed critical attacks, and cycles the Warrior strikes.
/// tags: warrior, tank, melee, solo, base class

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const guard = me.aura("On Guard");
const prepared = me.aura("Prepared Strike");

// On Guard grants 50% damage resistance for five seconds. Keep its defensive
// window up while engaged, with an early cast when health is already low.
if ((!guard || guard.remainingMs < (me.hpPct < 55 ? 1500 : 500))
    && s.usable("On Guard")) return "On Guard";

if (!target) return null;

const shred = target.aura("Armor Shred");
if ((!shred || shred.remainingMs < 1200) && s.usable("Decisive Strike")) {
    return "Decisive Strike";
}

// Prepared Strike empowers the next two auto attacks. Let the buff be spent
// before refreshing it; when On Guard is active those attacks deal double.
if (!prepared && s.usable("Prepared Strike")) return "Prepared Strike";

if (s.usable("Imbalancing Strike")) return "Imbalancing Strike";

if (prepared && s.usable("Auto Attack")) return "Auto Attack";
if (s.usable("Decisive Strike")) return "Decisive Strike";

return s.usable("Auto Attack") ? "Auto Attack" : null;
