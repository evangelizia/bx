/// name: ArchPaladin
/// class: ArchPaladin
/// role: Support Bruiser
/// version: 1.0
/// author: beatrix
/// desc: Hymn when hurt, Seal into Eden, Commandment to hold the stacks.
/// tags: support, healer, endgame

const me = s.self;
const target = s.target;

// Hymn of Light: 40 mana, 10 s. 380% hybrid heal, +20% END and Defense for 15 s.
if (me.hpPct < 55 && s.usable("Hymn of Light")) return "Hymn of Light";

if (!target) return null;

// Righteous Seal: 20 mana, 25 s. 90% less outgoing damage, and Eden's setup.
if (!target.aura("Righteous Seal") && s.usable("Righteous Seal")) return "Righteous Seal";

// Sacred Magic: Eden: 40 mana, 25 s. 1100% into the seal, 550% otherwise.
if (s.usable("Sacred Magic: Eden")) return "Sacred Magic: Eden";

// Commandment: 10 mana, 5 s. Six stacks of Divine, Commandment and Eminent, 10 s.
const commanded = target.aura("Commandment");
if (s.usable("Commandment")
    && (!commanded || commanded.stacks < 6 || commanded.remainingMs < 4000)) {
    return "Commandment";
}

return s.usable("Auto Attack") ? "Auto Attack" : null;
