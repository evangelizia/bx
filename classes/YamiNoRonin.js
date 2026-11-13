/// name: Yami no Ronin
/// class: Yami no Ronin
/// role: Dodge Melee
/// version: 1.0
/// author: beatrix
/// desc: Builds Flash and Tachi buffs, then times Jigen Kogeki near Yami's expiry to reset Revealed and restore dodge.
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

// Jigen Kogeki (6 s) scales up as Yami's 10 s DoT expires. It consumes Flash,
// Revealed, Ichi, Ni and San, resetting the dodge penalty as it cashes out the
// damage build. Patch notes cap Flash/Revealed at 10 stacks (8% damage, hit and
// crit per Flash stack); five stacks is a mixed DPS/survival trigger rather
// than sitting at the dodge-breaking cap.
if (yami && yami.remainingMs <= 2500 && ichi && ni && san && flashStacks >= 5
    && s.usable("Jigen Kogeki")) {
    return "Jigen Kogeki";
}

// Do not refresh Yami at four seconds: that resets its timer and destroys the
// Jigen damage window. Reapply only when absent or nearly expired.
if ((!yami || yami.remainingMs < 700) && s.usable("Yami no Maku")) {
    return "Yami no Maku";
}

// Tachi's three always-hit strikes grant Ichi (10 s), Ni (8 s), and San (6 s).
// Keep the full setup for Jigen; the aura timers no longer desync as readily
// after the 2026 class balance update.
if ((!ichi || !ni || !san) && s.usable("Tachi")) return "Tachi";

// Kettou (3 s) deals strong damage, heals by damage dealt, and adds Flash plus
// Revealed. Use it for sustain and damage, but avoid unnecessary casts once
// Flash has reached the mixed-playstyle trigger while Jigen is unavailable.
if (me.hpPct < 55 && s.usable("Kettou")) return "Kettou";

// Batto builds Flash/Revealed. Hisome gives +80% Dodge, Gouyuu +35% damage,
// and Sokudo +15% Haste/Crit. Once five Flash stacks are banked, avoid adding
// more while waiting for the Yami/Jigen window so dodge does not keep falling.
if (s.usable("Kettou") && flashStacks < 5) return "Kettou";
if (s.usable("Tachi")) return "Tachi";

if (flashStacks < 5 && s.usable("Auto Attack")) return "Auto Attack";
return null;
