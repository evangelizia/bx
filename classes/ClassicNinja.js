/// name: Classic Ninja
/// class: Classic Ninja
/// role: Full Hybrid
/// version: 1.0
/// author: beatrix
/// desc: Maintains Thin Air, uses Shadowblade to suppress enemy accuracy, then Shadowburns for a stun.
/// tags: ninja, classic, dodge, hybrid, solo

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

// Thin Air adds 5% Haste and Dodge each time the Ninja is hit for 30 seconds.
// It is a non-refreshable ramp, so cast it once when absent.
if (!me.aura("Thin Air") && s.usable("Thin Air")) return "Thin Air";

if (!target) return null;

const shadow = target.aura("Shadowblade");

// Shadowblade removes all target hit chance for six seconds. Shadowburn stuns
// for three seconds only while that debuff is active; otherwise it returns
// mana, so it remains useful between Shadowblade windows.
if (!shadow && s.usable("Shadowblade")) return "Shadowblade";
if (shadow && s.usable("Shadowburn")) return "Shadowburn";

if (s.usable("Crosscut")) return "Crosscut";
if (s.usable("Shadowburn")) return "Shadowburn";
if (s.usable("Shadowblade")) return "Shadowblade";

return s.usable("Auto Attack") ? "Auto Attack" : null;
