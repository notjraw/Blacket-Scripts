const GameResourceManager = (() => {
    const CONFIG = {
        delayModifier: 0,
        resourceType: 'blook'
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
    
    let openPack = async (pack) => {
        return new Promise((resolve, reject) => {
            blacket.requests.post("/worker3/open", {
                pack
            }, (data) => {
                if (data.error) reject();
                resolve(data.blook);
            });
        });
    };

    // Added main function to handle opening multiple packs
    const main = async (pack, amount) => {
        try {
            for (let i = 0; i < amount; i++) {
                const blook = await openPack(pack);
                console.log(`Opened pack ${i + 1}/${amount}: Received ${blook}`);
                
                // Optional: Add a delay between pack openings if needed
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log(`Successfully opened ${amount} ${pack} packs`);
        } catch (error) {
            console.error('Error opening packs:', error);
        }
    };

    return {
        openPacks: main
    };
})();

// Pack selection
let packs = Object.keys(blacket.packs);
let pack;
do {
    if (((pack && !packs.includes(pack)) || pack === "")) {
        pack = packs[Math.floor(Math.random() * packs.length)];
    }
    
    pack = window.prompt("What Pack you finna open (or random):", pack || packs[0]);
    if (pack === null) break;
} while(!pack || !packs.includes(pack));

// Amount selection
let amount;
let max_packs = Math.floor(blacket.user.tokens / blacket.packs[pack].price);
do {
    let suggestedAmount = Math.min(5, max_packs);
    amount = parseInt(window.prompt(`How Many Packs you finna open  (Recommended: ${suggestedAmount}, Max: ${max_packs})`));
    
    if (amount === null) break;
    
    if (amount < 1 || amount > max_packs) {
        amount = Math.min(Math.floor(Math.random() * (max_packs + 1)), max_packs);
    }
} while(!amount || amount < 1 || amount > max_packs);

// Open packs if both pack and amount are selected
if (pack && amount) GameResourceManager.openPacks(pack, amount);
// Made by Jraw Dm for help cuh
