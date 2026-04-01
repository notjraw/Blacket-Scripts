console.log(`%c
     ██╗██████╗  █████╗ ██╗    ██╗
     ██║██╔══██╗██╔══██╗██║    ██║
     ██║██████╔╝███████║██║ █╗ ██║
██   ██║██╔══██╗██╔══██║██║███╗██║
╚█████╔╝██║  ██║██║  ██║╚███╔███╔╝
 ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝
`, "color:#00cfff;font-family:monospace;font-size:0.85em");

const rarityOrder = Object.entries(blacket.rarities)
  .sort((a, b) => a[1].exp - b[1].exp)
  .map(x => x[0]);

const openPack = pack => new Promise((resolve, reject) => {
  blacket.requests.post("/worker3/open", { pack }, (data, status) => {
    if (status && status !== "success") reject(new Error(status));
    else if (data?.error) reject(new Error(data.error));
    else if (!data?.blook) reject(new Error("No blook in response"));
    else resolve(data.blook);
  });
});

const main = async (pack, amount) => {
  const pulled = {};
  const price = blacket.packs[pack].price;
  const max_delay = Object.values(blacket.rarities).map(r => r.wait).reduce((a, b) => Math.max(a, b));
  let opened = 0, spent = 0, bestRarity = null, retries = 0;
  const MAX_RETRIES = 5;

  console.log(`%cStarting: ${pack} x${amount}`, "color:#00cfff;font-weight:bold;font-family:monospace");

  for (let i = 0; i < amount; i++) {
    try {
      const blook = await openPack(pack);
      const rarity = blacket.blooks[blook].rarity;
      const rData = blacket.rarities[rarity];
      const color = rData.color;

      blacket.user.tokens -= price;
      spent += price;
      opened++;
      retries = 0;

      pulled[blook] = (pulled[blook] || 0) + 1;

      if (!bestRarity || rData.exp > blacket.rarities[bestRarity].exp)
        bestRarity = rarity;

      console.log(
        `%c[${opened}/${amount}] ${blook} (${rarity}) | Spent: ${spent.toLocaleString()} | Left: ${blacket.user.tokens.toLocaleString()}`,
        `color:${color};font-family:monospace;font-size:1.1em`
      );

      await new Promise(r => setTimeout(r, rData.wait));
    } catch (err) {
      retries++;
      if (retries > MAX_RETRIES) {
        console.error(`%cFailed ${MAX_RETRIES} times — aborting.`, "color:red;font-family:monospace");
        break;
      }
      const backoff = max_delay * 2 ** retries;
      console.warn(`%cError (${retries}/${MAX_RETRIES}), backing off ${backoff}ms: ${err.message}`, "color:orange;font-family:monospace");
      await new Promise(r => setTimeout(r, backoff));
      i--;
    }
  }

  console.log("%c\n— OPENING COMPLETE —", "color:#00cfff;font-size:2em;font-weight:bold;font-family:monospace");
  console.log(`%cOpened: ${opened} | Spent: ${spent.toLocaleString()} | Left: ${blacket.user.tokens.toLocaleString()} | Best: ${bestRarity}`, "color:#aaa;font-family:monospace");
  console.log("%c\nPULL SUMMARY", "color:#00cfff;font-weight:bold;font-family:monospace;font-size:1.3em");

  Object.keys(pulled)
    .sort((a, b) => rarityOrder.indexOf(blacket.blooks[a].rarity) - rarityOrder.indexOf(blacket.blooks[b].rarity))
    .forEach(blook => {
      const rarity = blacket.blooks[blook].rarity;
      const color = blacket.rarities[rarity].color;
      console.log(`%c${blook} x${pulled[blook]} [${rarity}]`, `color:${color};font-size:1.4em;font-family:monospace`);
    });

  console.log("%c\n— Made by Jraw —", "color:#00cfff;font-style:italic;font-family:monospace");
};

let packs = Object.keys(blacket.packs);
let pack;
do {
  const input = prompt("What pack you finna open:", packs[0]);
  if (input === null) { console.log("%cCancelled.", "color:red"); throw ""; }
  pack = packs.find(p => p.toLowerCase() === input.toLowerCase());
} while (!pack);

let amount;
const max = Math.floor(blacket.user.tokens / blacket.packs[pack].price);
do {
  const input = prompt(`How many packs you finna open (Max: ${max}):`);
  if (input === null) { console.log("%cCancelled.", "color:red"); throw ""; }
  amount = parseInt(input);
} while (!amount || amount < 1 || amount > max);

main(pack, amount);
// Jraw
