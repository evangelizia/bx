/// name: Rogue
/// class: Rogue
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Maintains Footwork and Viper's Kiss, then spends the poison near expiry with Opportunity's Strike.
/// tags: rogue, thief, dodge, melee, solo, base class

const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const footwork = me.aura("Footwork");
if ((!footwork || footwork.remainingMs < 1200) && s.usable("Footwork")) {
    return "Footwork";
}

if (!target) return null;

const poison = target.aura("Viper's Kiss");
const concealed = me.aura("Concealed Blade");

// Opportunity's Strike gains damage as Viper's Kiss approaches expiration.
if (poison && poison.remainingMs < 1600 && s.usable("Opportunity's Strike")) {
    return "Opportunity's Strike";
}

if (!poison && s.usable("Viper's Kiss")) return "Viper's Kiss";

// Stiletto grants Concealed Blade for 12 seconds, increasing damage against
// targets below 40% health. Keep it up when the target is in execute range.
if (target.hpPct < 40 && (!concealed || concealed.remainingMs < 1500)
    && s.usable("Stiletto")) return "Stiletto";

if (s.usable("Viper's Kiss")) return "Viper's Kiss";
if (s.usable("Stiletto")) return "Stiletto";
if (s.usable("Opportunity's Strike")) return "Opportunity's Strike";

return s.usable("Auto Attack") ? "Auto Attack" : null;
