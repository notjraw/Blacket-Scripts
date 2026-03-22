const GameResourceManager = (() => {
    const CONFIG = {
        delayModifier: 0,
        resourceType: 'blook'
    };

    // Pull log storage
    const pullLog = {
        session: [],
        summary: {}
    };

    const colorShift = (p, c0, c1, l) => {
        let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
        if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
        if (!this.colorShiftHelper) this.colorShiftHelper = (d) => {
            let n = d.length, x = {};
            if (n > 9) {
                [r, g, b, a] = d = d.split(","), n = d.length;
                if (n < 3 || n > 4) return null;
                x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
            } else {
                if (n == 8 || n == 6 || n < 4) return null;
                if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
                d = i(d.slice(1), 16);
                if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
                else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
            } return x
        };
        h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.colorShiftHelper(c0), P = p < 0, t = c1 && c1 != "c" ? this.colorShiftHelper(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
        if (!f || !t) return null;
        if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
        else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
        a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
        if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
        else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
    };

    let extra_delay = CONFIG.delayModifier;
    let max_delay = Object.values(blacket.rarities).map(x => x.wait).reduce((curr, prev) => curr > prev ? curr : prev) + extra_delay;
    const rarityOrder = Object.entries(blacket.rarities).sort((a, b) => a[1].exp - b[1].exp).map(x => x[0]);

    // Helper: get rarity of a blook
    const getBlookRarity = (blookName) => {
        for (const [rarity, data] of Object.entries(blacket.rarities)) {
            if (data.blooks && data.blooks.includes(blookName)) return rarity;
        }
        return 'Unknown';
    };

    // Logger: styled console output
    const logPull = (packName, blookName, pullNum, total) => {
        const rarity = getBlookRarity(blookName);
        const rarityColor = blacket.rarities[rarity]?.color || '#ffffff';

        // Track in summary
        pullLog.session.push({ pack: packName, blook: blookName, rarity, time: new Date().toLocaleTimeString() });
        pullLog.summary[blookName] = (pullLog.summary[blookName] || 0) + 1;

        console.log(
            `%c[Jraw's Pack Opener]%c Pack ${pullNum}/${total} | %c${blookName}%c [${rarity}]`,
            'color: #ff6b6b; font-weight: bold;',
            'color: #aaaaaa;',
            `color: ${rarityColor}; font-weight: bold;`,
            'color: #aaaaaa;'
        );
    };

    // Logger: print full session summary
    const logSummary = (packName, amount) => {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');
        console.log(`%c[Jraw's Pack Opener] Session Summary — ${amount}x ${packName}`, 'color: #ff6b6b; font-weight: bold; font-size: 13px;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');

        // Sort by count descending
        const sorted = Object.entries(pullLog.summary).sort((a, b) => b[1] - a[1]);
        for (const [blook, count] of sorted) {
            const rarity = getBlookRarity(blook);
            const rarityColor = blacket.rarities[rarity]?.color || '#ffffff';
            console.log(
                `%c  ${blook}%c x${count} [${rarity}]`,
                `color: ${rarityColor}; font-weight: bold;`,
                'color: #cccccc;'
            );
        }

        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');
        console.log('%cScript by Jraw — DM for help cuh 🔥', 'color: #ff6b6b; font-style: italic;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');

        // Also expose the full log on window for easy copy-paste
        window._jrawPullLog = pullLog;
        console.log('%c[Jraw] Full pull log saved to window._jrawPullLog', 'color: #888888; font-style: italic;');
    };

    let openPack = async (pack) => {
        return new Promise((resolve, reject) => {
            blacket.requests.post("/worker3/open", { pack }, (data) => {
                if (data.error) reject(data.error);
                resolve(data.blook);
            });
        });
    };

    const main = async (pack, amount) => {
        // Reset log for new session
        pullLog.session = [];
        pullLog.summary = {};

        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');
        console.log(`%c[Jraw's Pack Opener] Opening ${amount}x ${pack} packs... 🎴`, 'color: #ff6b6b; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━
