/// name: Oracle
/// class: Oracle
/// role: Power Caster
/// version: 1.0
/// author: beatrix
/// desc: Uses Group Divination to heal, Foresight to empower auto attacks, and Edited Timeline to cripple the target.
/// tags: oracle, healer, caster, support, solo

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

if (me.hpPct < 65 && s.usable("Group Divination")) return "Group Divination";

const foresight = me.aura("Foresight");
if (!foresight && s.usable("Foresight")) return "Foresight";

if (!target) return null;

const blocked = target.aura("Blocked");
const ignored = target.aura("Ignored");

// Edited Timeline applies an 80% reduction to either physical or magical
// damage. The game's judgment is random, so refresh the mitigation whenever
// the previous result expires.
if ((!blocked || blocked.remainingMs < 1200) && (!ignored || ignored.remainingMs < 1200)
    && s.usable("Edited Timeline")) return "Edited Timeline";

// Group Divination is the class's heal; Foretell is a targeted ally buff and
// is deliberately not cast on the hostile target in this solo policy.
if (foresight && s.usable("Auto Attack")) return "Auto Attack";
if (s.usable("Foresight")) return "Foresight";
if (s.usable("Edited Timeline")) return "Edited Timeline";

return s.usable("Auto Attack") ? "Auto Attack" : null;
