/// name: Yami no Ronin
/// class: Yami no Ronin
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Builds Flash, keeps Yami active, and uses Jigen Kogeki near expiry for damage while resetting Revealed and restoring dodge.
/// tags: dps, dodge, melee, solo, endgame
const me = s.self;
const target = s.target;

if (!me || !me.alive) return null;

const flash = me.aura("Flash");
const ichi = me.aura("Ichi");
const ni = me.aura("Ni");
const san = me.aura("San");

if (!target) return null;

const yami = target.aura("Yami") || target.aura("Yami no Maku");

const flashStacks = flash ? flash.stacks : 0;

// Jigen scales up as Yami's DoT expires and consumes the accumulated class
// buffs. Don't require all three short-lived Tachi effects: that can make the
// policy miss the Yami window. Three Flash stacks give a useful damage boost
// without letting Revealed's dodge penalty grow unchecked.
if (yami && yami.remainingMs <= 2000 && flashStacks >= 3
    && s.usable("Jigen Kogeki")) {
    return "Jigen Kogeki";
}

// Refresh Yami only after its damage window has been used or has expired.
if ((!yami || yami.remainingMs < 700) && s.usable("Yami no Maku")) {
    return "Yami no Maku";
}

// Tachi's three strikes grant the short-lived Ichi, Ni, and San damage buffs.
// Use it to set up Jigen, but don't make those auras a hard requirement.
if ((!ichi || !ni || !san) && s.usable("Tachi")) return "Tachi";

// Kettou deals strong damage, heals, and builds Flash/Revealed. Spend it when
// sustain is needed; otherwise cap the dodge-costly Flash buildup at five.
if (me.hpPct < 55 && s.usable("Kettou")) return "Kettou";

// Batto builds Flash/Revealed. Hisome gives +80% Dodge, Gouyuu +35% damage,
// and Sokudo +15% Haste/Crit. Once five Flash stacks are banked, avoid adding
// more while waiting for the Yami/Jigen window so dodge does not keep falling.
if (s.usable("Kettou") && flashStacks < 5) return "Kettou";
if (s.usable("Tachi")) return "Tachi";

if (flashStacks < 5 && s.usable("Auto Attack")) return "Auto Attack";
return null;
