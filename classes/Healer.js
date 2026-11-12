/// name: Healer
/// class: Healer
/// role: Defensive Caster
/// version: 1.0
/// author: beatrix
/// desc: Heals when hurt, keeps Energy Flow active, and uses Holy and Heartbeat for damage.
/// tags: healer, support, caster, solo, base class

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

if (me.hpPct < 65 && s.usable("Healing Word")) return "Healing Word";
if (!target) return null;

const flow = target.aura("Energy Flow");
if ((!flow || flow.remainingMs < 1800) && s.usable("Energy Flow")) {
    return "Energy Flow";
}

// Holy deals 350% damage and 2.5x damage to undead; use it whenever ready.
if (s.usable("Holy")) return "Holy";

// Heartbeat scales partly with current HP, so favor the heavier heal spell
// first when injured and retain Heartbeat as the regular attack.
if (s.usable("Heartbeat")) return "Heartbeat";

return s.usable("Auto Attack") ? "Auto Attack" : null;
