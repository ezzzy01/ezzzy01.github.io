/* Darnoc IT, in-browser demo.
   A copy of the PHP/MySQL store's pages and flows, rebuilt in plain JavaScript so it runs on GitHub Pages.
   All data is made up. It lives in memory (and in sessionStorage for this tab only, when allowed). */
(() => {
'use strict';
const KEY = 'darnoc-demo-v1';
const app = document.getElementById('app');
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago = (days, hr = 11, mi = 0) => { const t = new Date(); t.setDate(t.getDate() - days); t.setHours(hr, mi, 0, 0); return t.toISOString(); };
const nowIso = () => new Date().toISOString();
const RM = (n, dec = 2) => 'RM' + Number(n).toLocaleString('en-MY', {minimumFractionDigits: dec, maximumFractionDigits: dec});
const fd = iso => new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
const fdt = iso => fd(iso) + ' ' + new Date(iso).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
const CATS = {CPU: 'Processor (CPU)', MOTHERBOARD: 'Motherboard', RAM: 'Memory (RAM)', GPU: 'Graphics Card (GPU)', STORAGE: 'Storage', PSU: 'Power Supply', CASE: 'Case'};
const CAT_SHORT = {CPU: 'CPU', MOTHERBOARD: 'Motherboard', RAM: 'RAM', GPU: 'GPU', STORAGE: 'Storage', PSU: 'Power supply', CASE: 'Case'};
const ICON = {CPU: 'fa-microchip', MOTHERBOARD: 'fa-server', RAM: 'fa-memory', GPU: 'fa-desktop', STORAGE: 'fa-hard-drive', PSU: 'fa-plug', CASE: 'fa-box'};
const SLOTS = ['CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE'];
const ORDER_FLOW = ['pending', 'processing', 'shipped', 'delivered'];
const label = s => String(s).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

/* ---------- made-up data ---------- */
function seed() {
  const P = (id, name, cat, brand, price, stock, img, warranty, specs, desc, extra = {}) => ({id, name, cat, brand, price, stock, img, warranty, specs, desc, ...extra});
  const products = [
    P(1, 'i9 14900KS', 'CPU', 'Intel', 2299, 10, 'i9-14900ks', 36, {Cores: '24', Threads: '32', 'Max speed': '6.00 GHz', TDP: '253W', Socket: 'LGA1700'}, "Intel's fastest 14th gen desktop processor, unlocked for overclocking. Built for high-end gaming and heavy creative work.", {socket: 'LGA1700', tdp: 253}),
    P(2, 'i5 12400F', 'CPU', 'Intel', 900, 78, 'i5-12400f', 36, {Cores: '6', Threads: '12', 'Max speed': '4.40 GHz', TDP: '65W', Socket: 'LGA1700'}, 'Six cores with great value for 1080p gaming builds. Needs a graphics card.', {socket: 'LGA1700', tdp: 65}),
    P(3, 'Ryzen 7 7800X3D', 'CPU', 'AMD', 1899, 14, null, 36, {Cores: '8', Threads: '16', 'Max speed': '5.00 GHz', TDP: '120W', Socket: 'AM5'}, 'AMD 3D V-Cache gaming processor for the AM5 platform.', {socket: 'AM5', tdp: 120}),
    P(4, 'ROG Maximus Z790 Formula', 'MOTHERBOARD', 'ASUS', 3299, 4, 'z790-formula', 36, {Socket: 'LGA1700', Chipset: 'Intel Z790', Memory: 'DDR5', 'Form factor': 'ATX'}, 'Flagship Z790 board with Wi-Fi 7, PCIe 5.0 and a hybrid water-cooling block.', {socket: 'LGA1700'}),
    P(5, 'MAG B650 Tomahawk WiFi', 'MOTHERBOARD', 'MSI', 1099, 12, null, 36, {Socket: 'AM5', Chipset: 'AMD B650', Memory: 'DDR5', 'Form factor': 'ATX'}, 'A solid AM5 board for Ryzen 7000 builds with Wi-Fi 6E and 2.5G LAN.', {socket: 'AM5'}),
    P(6, 'Trident Z5 Royal Neo 32GB (2x16GB) DDR5-6000', 'RAM', 'G.Skill', 899, 25, 'trident-z5', 60, {Capacity: '32GB (2x16GB)', Type: 'DDR5', Speed: '6000 MHz', Latency: 'CL30'}, 'Mirror-finish DDR5 kit with crystal RGB light bars, tuned for AMD EXPO and Intel XMP.'),
    P(7, 'RTX 4060 Founders Edition', 'GPU', 'NVIDIA', 1500, 15, 'rtx-4060-fe', 36, {VRAM: '8 GB GDDR6', 'Boost clock': '2460 MHz', Power: '115W', Outputs: '3x DP, 1x HDMI'}, 'Quiet, efficient 1080p card with DLSS 3 and ray tracing.', {power: 115}),
    P(8, 'Dual RTX 4060 OC 8GB', 'GPU', 'ASUS', 1399, 3, 'rtx-4060', 36, {VRAM: '8 GB GDDR6', 'Boost clock': '2535 MHz', Power: '115W', Outputs: '3x DP, 1x HDMI'}, 'Two-fan RTX 4060 with a factory overclock.', {power: 115}),
    P(9, 'RTX 4090 Founders Edition', 'GPU', 'NVIDIA', 8999, 2, 'rtx-4090', 36, {VRAM: '24 GB GDDR6X', 'Boost clock': '2520 MHz', Power: '450W', Outputs: '3x DP, 1x HDMI'}, 'The top of the range for 4K gaming and AI work. Needs a strong power supply.', {power: 450}),
    P(10, 'NITRO+ AMD Radeon™ RX 7900 XTX Vapor-X 24GB', 'GPU', 'Sapphire', 5000, 7, 'rx-7900xtx', 24, {VRAM: '24 GB GDDR6', 'Boost clock': '2680 MHz', Power: '355W', Outputs: '2x DP, 2x HDMI'}, "Sapphire's flagship Radeon card with a vapour-chamber cooler.", {power: 355}),
    P(11, '990 Pro 1TB NVMe SSD', 'STORAGE', 'Samsung', 549, 40, '990-pro', 60, {Capacity: '1 TB', Interface: 'PCIe 4.0 NVMe', Read: '7450 MB/s', Write: '6900 MB/s'}, 'Fast PCIe 4.0 drive for games and the operating system.'),
    P(12, 'NV2 1TB NVMe SSD', 'STORAGE', 'Kingston', 259, 0, 'nv2', 36, {Capacity: '1 TB', Interface: 'PCIe 4.0 NVMe', Read: '3500 MB/s', Write: '2100 MB/s'}, 'Budget NVMe drive for everyday builds.'),
    P(13, 'HX1200 Platinum 1200W', 'PSU', 'Corsair', 1299, 9, 'hx1200', 120, {Wattage: '1200W', Efficiency: '80 PLUS Platinum', Modular: 'Fully modular'}, 'Quiet, fully modular power supply with a 10-year warranty.', {watts: 1200}),
    P(14, 'RM650e 650W', 'PSU', 'Corsair', 389, 20, null, 84, {Wattage: '650W', Efficiency: '80 PLUS Gold', Modular: 'Fully modular'}, 'Compact gold-rated supply for mid-range builds.', {watts: 650}),
    P(15, 'Y60 Mid-Tower Case', 'CASE', 'HYTE', 699, 11, 'hyte-y60', 12, {Type: 'Mid tower', Motherboard: 'ATX, mATX, ITX', Panels: 'Panoramic tempered glass'}, 'Three-piece glass case that shows off the whole build, with a vertical GPU mount.')
  ];
  const users = [
    {id: 1, username: 'admin', role: 'admin', name: 'Store Admin', email: 'admin@darnoc.example', phone: '06-555 0100', created: ago(400)},
    {id: 2, username: 'staff', role: 'staff', name: 'Hana (staff)', email: 'staff@darnoc.example', phone: '06-555 0101', created: ago(300)},
    {id: 3, username: 'aina', role: 'customer', name: 'Aina Rahman', email: 'aina@example.com', phone: '012-345 6789', address: '12, Jalan Contoh 3, Taman Demo', city: 'Alor Gajah', postcode: '78000', state: 'Melaka', created: ago(1400)},
    {id: 4, username: 'farid', role: 'customer', name: 'Farid Hassan', email: 'farid@example.com', phone: '013-222 1111', address: '8, Lorong Sampel 2', city: 'Ayer Keroh', postcode: '75450', state: 'Melaka', created: ago(260)},
    {id: 5, username: 'meiling', role: 'customer', name: 'Tan Mei Ling', email: 'meiling@example.com', phone: '016-777 8888', address: '21, Jalan Ujian 5', city: 'Melaka', postcode: '75200', state: 'Melaka', created: ago(220)}
  ];
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const promos = [
    {id: 1, pid: 2, pct: 50, name: 'i5 12th gen promo', desc: 'Half price while stocks last.', active: true, start: ago(30)},
    {id: 2, pid: 1, pct: 15, name: 'i9 14th gen sale', desc: '', active: true, start: ago(20)},
    {id: 3, pid: 10, pct: 10, name: '7900 XTX promo', desc: 'Year-end deal.', active: true, start: ago(12)}
  ];
  const O = (id, uid, days, items, status, pay) => {
    const u = users.find(x => x.id === uid);
    const lines = items.map(([pid, qty, price]) => ({pid, qty, price: price ?? byId[pid].price, name: byId[pid].name}));
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const ship = sub >= 300 ? 0 : 15;
    const date = ago(days, 10 + (id % 9), (id * 7) % 60);
    const hist = [{status: 'pending', date, by: u.username}];
    const step = ORDER_FLOW.indexOf(status);
    for (let i = 1; i <= step; i++) hist.push({status: ORDER_FLOW[i], date: ago(Math.max(days - i * 2, 0), 15, 0), by: i === 1 ? 'admin' : 'staff'});
    if (status === 'cancelled') hist.push({status: 'cancelled', date: ago(days - 1), by: u.username});
    return {id, uid, date, lines, sub, ship, total: sub + ship, status, pay,
      addr: {name: u.name, phone: u.phone, address: u.address, city: u.city, postcode: u.postcode, state: u.state}, hist};
  };
  const orders = [
    O(1000, 3, 3 * 365 + 190, [[12, 1, 239]], 'delivered', 'Online banking (FPX)'),
    O(1001, 4, 160, [[11, 1]], 'delivered', 'Credit / debit card'),
    O(1002, 5, 148, [[6, 1], [11, 1]], 'delivered', 'Online banking (FPX)'),
    O(1003, 3, 135, [[2, 1, 450]], 'delivered', 'Credit / debit card'),
    O(1004, 4, 120, [[13, 1], [15, 1]], 'delivered', 'Cash on delivery'),
    O(1005, 5, 104, [[7, 1]], 'delivered', 'Credit / debit card'),
    O(1006, 3, 92, [[9, 1]], 'delivered', 'Online banking (FPX)'),
    O(1007, 4, 72, [[10, 1, 4500]], 'delivered', 'Credit / debit card'),
    O(1008, 5, 55, [[4, 1], [6, 2]], 'delivered', 'Credit / debit card'),
    O(1009, 3, 40, [[11, 2]], 'delivered', 'Credit / debit card'),
    O(1010, 4, 28, [[1, 1, 1954.15]], 'shipped', 'Online banking (FPX)'),
    O(1011, 5, 17, [[7, 1], [11, 1]], 'processing', 'Credit / debit card'),
    O(1012, 3, 7, [[6, 1]], 'processing', 'Credit / debit card'),
    O(1013, 4, 4, [[2, 2, 450]], 'pending', 'Cash on delivery'),
    O(1014, 5, 2, [[15, 1]], 'cancelled', 'Online banking (FPX)'),
    O(1015, 3, 1, [[14, 1]], 'pending', 'Credit / debit card')
  ];
  const tradeins = [
    {id: 1, uid: 3, name: 'RTX 3060 Ti', cat: 'GPU', cond: 'Good', months: 24, desc: 'Used for two years, runs cool. Box included.', specs: {Manufacturer: 'NVIDIA', VRAM: '8 GB', 'Clock speed': '1665 MHz'}, img: null, date: ago(44), status: 'accepted', offer: 650, note: 'Tested fine in store. Offer can be used as credit on your next order.', by: 'admin', decided: ago(42)},
    {id: 2, uid: 3, name: 'Core i5-10400F', cat: 'CPU', cond: 'Like new', months: 30, desc: 'Box and stock cooler included.', specs: {Manufacturer: 'Intel', Cores: '6', 'Clock speed': '4.3 GHz'}, img: null, date: ago(3), status: 'pending'},
    {id: 3, uid: 4, name: 'RTX 2070 Super', cat: 'GPU', cond: 'Fair', months: 48, desc: 'One fan is a bit noisy.', specs: {Manufacturer: 'NVIDIA', VRAM: '8 GB', 'Clock speed': '1770 MHz'}, img: null, date: ago(5), status: 'pending'},
    {id: 4, uid: 5, name: '16GB DDR4-3200 kit', cat: 'RAM', cond: 'Good', months: 36, desc: '2x8GB sticks.', specs: {Manufacturer: 'Kingston', Capacity: '16 GB', 'Clock speed': '3200 MHz'}, img: null, date: ago(60), status: 'rejected', note: "We aren't taking DDR4 kits right now.", by: 'staff', decided: ago(58)}
  ];
  const tickets = [
    {id: 1, uid: 3, pid: 9, oid: 1006, subject: 'Issue with graphics card', cat: 'Technical support', pri: 'medium', status: 'waiting_customer', date: ago(14, 0, 4), assigned: 'admin',
      desc: "My monitor doesn't turn on when the new card is plugged in.",
      replies: [{by: 'admin', role: 'admin', date: ago(13, 11, 20), text: 'Thanks Aina. Could you try a different PCIe power cable and tell us which monitor port you are using?'}]},
    {id: 2, uid: 3, pid: 2, oid: 1003, subject: 'Claim warranty', cat: 'Warranty', pri: 'high', status: 'open', date: ago(4, 3, 52), assigned: null,
      desc: "It doesn't boot any more since last week. Fans spin but no display.", replies: []},
    {id: 3, uid: 4, pid: 13, oid: 1004, subject: 'Power supply fan noise', cat: 'Technical support', pri: 'low', status: 'resolved', date: ago(30), assigned: 'staff',
      desc: 'The PSU fan clicks at startup.',
      replies: [{by: 'staff', role: 'staff', date: ago(29), text: 'That click is the fan switching from zero-RPM mode. It is normal for this model.'}, {by: 'farid', role: 'customer', date: ago(28), text: 'Got it, thanks!'}]}
  ];
  const reviews = [
    {pid: 2, uid: 3, rating: 5, text: 'Great value, runs every game I play.', date: ago(120)},
    {pid: 2, uid: 4, rating: 4, text: 'Fast delivery, works well.', date: ago(40)},
    {pid: 9, uid: 3, rating: 5, text: 'A monster card.', date: ago(80)},
    {pid: 11, uid: 4, rating: 5, text: 'Very fast drive.', date: ago(150)},
    {pid: 11, uid: 5, rating: 4, text: 'Good, gets warm without a heatsink.', date: ago(140)},
    {pid: 7, uid: 5, rating: 4, text: 'Quiet and small.', date: ago(95)},
    {pid: 6, uid: 5, rating: 5, text: 'Looks amazing.', date: ago(50)},
    {pid: 10, uid: 4, rating: 5, text: 'Runs cool for a big card.', date: ago(60)}
  ];
  return {products, users, promos, orders, tradeins, tickets, reviews,
    carts: {3: [{pid: 11, qty: 1}]}, build: {}, compare: [7, 10], session: null,
    next: {product: 16, user: 6, promo: 4, order: 1016, ti: 5, ticket: 4}};
}

let db;
try { db = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
if (!db || !db.products) db = seed();
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage blocked: the demo still works in memory */ } };

/* ---------- lookups ---------- */
const me = () => db.users.find(u => u.id === db.session) || null;
const prod = id => db.products.find(p => p.id === +id);
const user = id => db.users.find(u => u.id === +id);
const promoFor = pid => db.promos.find(x => x.pid === pid && x.active);
function price(p) { const pr = promoFor(p.id); const fin = pr ? Math.round(p.price * (100 - pr.pct)) / 100 : p.price; return {orig: p.price, fin, pct: pr ? pr.pct : 0}; }
function rating(pid) { const r = db.reviews.filter(x => x.pid === pid); return {avg: r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : 0, n: r.length}; }
const cart = () => (db.carts[db.session] = db.carts[db.session] || []);
const cartCount = () => cart().reduce((s, l) => s + l.qty, 0);
const homeFor = u => !u ? '#/' : u.role === 'admin' ? '#/admin' : u.role === 'staff' ? '#/staff' : '#/account';
function warranty(order, p) {
  if (!order || !p) return {state: 'none', label: 'No purchase'};
  const exp = new Date(order.date); exp.setMonth(exp.getMonth() + p.warranty);
  const left = Math.ceil((exp - new Date()) / 864e5);
  return {state: left > 0 ? 'valid' : 'expired', exp: exp.toISOString(), left, label: left > 0 ? 'Valid' : 'Expired'};
}
function purchases(uid) {
  const out = [];
  db.orders.filter(o => o.uid === uid && ['delivered', 'shipped'].includes(o.status)).forEach(o => o.lines.forEach(l => { const p = prod(l.pid); if (p) out.push({o, p, w: warranty(o, p)}); }));
  return out.sort((a, b) => b.o.date.localeCompare(a.o.date));
}

/* ---------- small pieces ---------- */
const img = (p, cls = '') => p && p.img ? `<img class="${cls}" src="img/${h(p.img)}.webp" alt="${h(p.name)}" loading="lazy">` : `<div class="noimg ${cls}" aria-hidden="true"><i class="fas ${ICON[p ? p.cat : 'CPU'] || 'fa-box'}"></i></div>`;
function stars(r) { let s = ''; for (let i = 1; i <= 5; i++) s += r >= i ? '<i class="fas fa-star"></i>' : r >= i - .5 ? '<i class="fas fa-star-half-alt"></i>' : '<i class="far fa-star"></i>'; return `<span class="rating-stars" aria-label="${r.toFixed(1)} out of 5">${s}</span>`; }
const badge = (s, txt) => `<span class="status st-${h(s)}">${h(txt || label(s))}</span>`;
const stockTxt = p => p.stock > 10 ? '<span class="stock-in"><i class="fas fa-check-circle"></i> In Stock</span>' : p.stock > 0 ? `<span class="stock-low"><i class="fas fa-exclamation-circle"></i> Low Stock (${p.stock} left)</span>` : '<span class="stock-out"><i class="fas fa-times-circle"></i> Out of Stock</span>';
function priceHtml(p) { const x = price(p); return x.pct ? `<span class="product-original-price">${RM(x.orig)}</span>${RM(x.fin)}` : RM(x.fin); }

function toast(msg, icon = 'fa-check-circle') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="fas ${icon}"></i><span>${h(msg)}</span>`;
  t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2800);
}
const modal = document.getElementById('modal');
function openModal(title, body, foot = '') {
  modal.innerHTML = `<div class="mh"><h3>${title}</h3><button class="x" type="button" data-act="close-modal" aria-label="Close"><i class="fas fa-times"></i></button></div>${body}${foot}`;
  modal.showModal();
  const f = modal.querySelector('input,select,textarea'); if (f) f.focus();
}
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

/* ---------- layout ---------- */
function topBar(mode) {
  const right = mode === 'admin' ? '<span><i class="fas fa-crown"></i> Admin Panel</span><span><i class="fas fa-shield-alt"></i> Full Access</span>'
    : mode === 'staff' ? '<span><i class="fas fa-shield-alt"></i> Staff Panel</span><span><i class="fas fa-users"></i> Customer Service</span>'
    : `<a href="${me() && me().role === 'customer' ? '#/account/orders' : '#/login'}"><i class="fas fa-truck"></i> Track Order</a><span><i class="fas fa-shield-alt"></i> Secure Payment</span>`;
  return `<div class="top-bar"><div class="top-bar-container"><div class="top-bar-left"><span><i class="fas fa-envelope"></i> hello@darnoc.example</span><span><i class="fas fa-phone"></i> 06-555 0100</span></div><div class="top-bar-right">${right}</div></div></div>`;
}
function header(panel) {
  const u = me(); let r = '';
  if (panel) r = `<a href="#/" class="header-button"><i class="fas fa-store"></i> View Store</a><button class="header-button" data-act="logout"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
  else {
    if (u) r += `<a href="${homeFor(u)}" class="header-button"><i class="fas fa-user-circle"></i> Dashboard</a><button class="header-button" data-act="logout"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
    else r += `<a href="#/login" class="header-button"><i class="fas fa-sign-in-alt"></i> Login</a><a href="#/register" class="header-button"><i class="fas fa-user-plus"></i> Register</a>`;
    if (!u || u.role === 'customer') { const n = u ? cartCount() : 0; r += `<a href="#/cart" class="header-button"><i class="fas fa-shopping-cart"></i> Cart${n ? `<span class="cart-count-badge">${n}</span>` : ''}</a>`; }
  }
  return `<header class="site"><div class="header-container"><a href="#/" class="logo-container"><img src="img/logo.png" alt="" width="48" height="48"><span class="logo-text">DARNOC IT</span></a><div class="header-right">${r}</div></div></header>`;
}
function nav(active) {
  const L = [['', 'fa-home', 'Home'], ['promotions', 'fa-tags', 'Promotions'], ['compare', 'fa-balance-scale', 'Compare'], ['build', 'fa-tools', 'PC Builder'], ['support', 'fa-headset', 'Support']];
  return `<nav class="mainnav" aria-label="Store"><div class="nav-container"><div class="main-nav">${L.map(([k, i, t]) => `<a href="#/${k}"${active === k ? ' class="active" aria-current="page"' : ''}><i class="fas ${i}"></i> ${t}</a>`).join('')}</div></div></nav>`;
}
const footer = () => `<footer class="site"><div class="footer-container"><div class="footer-grid">
  <div class="footer-col"><h4>DARNOC IT</h4><p>Computer parts, custom PC builds, trade-ins and after-sales support from a shop in Melaka.</p></div>
  <div class="footer-col"><h4>Shop</h4><ul><li><a href="#/">All products</a></li><li><a href="#/promotions">Promotions</a></li><li><a href="#/build">PC Builder</a></li><li><a href="#/compare">Compare</a></li></ul></div>
  <div class="footer-col"><h4>Account</h4><ul><li><a href="#/account">My dashboard</a></li><li><a href="#/account/orders">Track order</a></li><li><a href="#/account/tradeins">Trade-in</a></li><li><a href="#/support">Support</a></li></ul></div>
  <div class="footer-col"><h4>Contact</h4><ul><li>Alor Gajah, Melaka</li><li>06-555 0100</li><li>hello@darnoc.example</li></ul></div>
  </div><div class="footer-bottom"><span>© Darnoc IT. Portfolio demo with made-up data.</span><span><i class="fab fa-cc-visa"></i> <i class="fab fa-cc-mastercard"></i> <i class="fas fa-university"></i></span></div></div></footer>`;
const store = (active, body) => topBar('store') + header(false) + nav(active) + body + footer();
const panelLayout = (role, body) => `<div class="${role === 'admin' ? 'admin-mode' : ''}">` + topBar(role) + header(true) + body + footer() + '</div>';
const flash = () => { const f = db.flash; db.flash = null; return f ? `<div class="alert alert-${f[0]}"><i class="fas ${f[0] === 'success' ? 'fa-check-circle' : f[0] === 'info' ? 'fa-info-circle' : 'fa-exclamation-triangle'}"></i> ${h(f[1])}</div>` : ''; };

/* ---------- store pages ---------- */
function productCard(p) {
  const x = price(p), r = rating(p.id), u = me(), inCmp = db.compare.includes(p.id);
  let btns;
  if (p.stock <= 0) btns = '<button class="product-btn" disabled><i class="fas fa-times-circle"></i> Out of Stock</button>';
  else if (!u) btns = `<a href="#/login?next=${encodeURIComponent('#/product/' + p.id)}" class="product-btn"><i class="fas fa-sign-in-alt"></i> Login to Buy</a>`;
  else if (u.role !== 'customer') btns = `<a href="#/product/${p.id}" class="product-btn"><i class="fas fa-eye"></i> View Details</a>`;
  else btns = `<button class="product-btn" data-act="add" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button><button class="product-btn" data-act="buy" data-id="${p.id}"><i class="fas fa-bolt"></i> Buy Now</button>`;
  return `<div class="product-card">${x.pct ? `<div class="product-badge">${x.pct}% OFF</div>` : ''}
   <div class="product-image"><a href="#/product/${p.id}" aria-label="${h(p.name)}">${img(p)}</a>
    <div class="product-actions"><button class="product-action-btn" data-act="cmp" data-id="${p.id}" aria-pressed="${inCmp}" title="${inCmp ? 'Remove from compare' : 'Add to Compare'}" aria-label="Add ${h(p.name)} to compare"><i class="fas fa-balance-scale"></i></button><a class="product-action-btn" href="#/product/${p.id}" title="Quick View" aria-label="View ${h(p.name)}"><i class="fas fa-eye"></i></a></div></div>
   <div class="product-info"><div><div class="product-category">${h(CAT_SHORT[p.cat] || p.cat)}</div><a href="#/product/${p.id}" class="product-name">${h(p.name)}</a>
    <div class="product-rating">${stars(r.avg)}<span class="rating-text">${r.n ? `${r.avg.toFixed(1)} (${r.n} review${r.n > 1 ? 's' : ''})` : 'No reviews yet'}</span></div>
    <div class="product-meta"><div class="product-stock">${stockTxt(p)}</div></div></div>
    <div><div class="product-price">${priceHtml(p)}</div><div class="product-buttons">${btns}</div></div></div></div>`;
}

function pageHome(q) {
  const s = q.get('q') || '', c = q.get('cat') || '', so = q.get('sort') || '';
  let list = db.products.filter(p => (!s || (p.name + ' ' + p.desc + ' ' + p.brand).toLowerCase().includes(s.toLowerCase())) && (!c || p.cat === c));
  const by = {name_asc: (a, b) => a.name.localeCompare(b.name), name_desc: (a, b) => b.name.localeCompare(a.name), price_asc: (a, b) => price(a).fin - price(b).fin, price_desc: (a, b) => price(b).fin - price(a).fin,
    rating_desc: (a, b) => rating(b.id).avg - rating(a.id).avg, newest: (a, b) => b.id - a.id, discount: (a, b) => price(b).pct - price(a).pct}[so] || ((a, b) => b.id - a.id);
  list = list.slice().sort(by);
  const opt = (v, t, cur) => `<option value="${v}"${v === cur ? ' selected' : ''}>${t}</option>`;
  const filtered = s || c;
  return store('', `
  <section class="hero"><div class="hero-container"><div class="hero-content"><h1>Darnoc IT</h1><p>Computer parts, custom builds and trade-ins, from a hardware shop in Melaka.</p>
   <div class="hero-buttons"><a href="#/?shop=1" class="btn btn-primary" data-act="to-products">Shop Now</a><a href="#/build" class="btn btn-secondary">Custom Build</a></div></div>
   <div class="hero-image"><img src="https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=700&h=490&q=75" alt="A gaming PC with RGB fans" width="700" height="490" onerror="this.style.visibility='hidden'"></div></div></section>
  <div class="search-container"><form class="search-box" data-form="search" role="search">
   <input type="search" name="q" placeholder="Search for products..." class="search-input" value="${h(s)}" aria-label="Search for products">
   <select name="cat" class="search-select" aria-label="Category">${opt('', 'All Categories', c)}${SLOTS.map(k => opt(k, CAT_SHORT[k], c)).join('')}</select>
   <select name="sort" class="search-select" aria-label="Sort by">${opt('', 'Sort By', so)}${opt('name_asc', 'Name (A-Z)', so)}${opt('name_desc', 'Name (Z-A)', so)}${opt('price_asc', 'Price (Low to High)', so)}${opt('price_desc', 'Price (High to Low)', so)}${opt('rating_desc', 'Highest Rated', so)}${opt('newest', 'Newest First', so)}${opt('discount', 'Highest Discount', so)}</select>
   <button type="submit" class="search-button"><i class="fas fa-search"></i> Search</button></form></div>
  <div class="container">${flash()}
   <section id="products" class="section"><div class="section-header"><h2 class="section-title">${filtered ? 'Search Results' : 'Featured Products'}</h2>${filtered || so ? '<a href="#/" class="section-link">Clear Filters <i class="fas fa-times"></i></a>' : `<a href="#/compare" class="section-link">Compare (${db.compare.length}) <i class="fas fa-arrow-right"></i></a>`}</div>
    ${filtered ? `<div class="search-info">${s ? `Searching for: "<strong>${h(s)}</strong>"` : ''}${c ? `${s ? ' in ' : 'Category: '}<strong>${h(CAT_SHORT[c])}</strong>` : ''} · ${list.length} found</div>` : ''}
    <div class="product-grid">${list.length ? list.map(productCard).join('') : `<div class="empty-state"><i class="fas fa-search"></i><h3>No products found</h3><p>No products match your search. Try other words or browse a category.</p><a href="#/" class="btn btn-blue">Clear Search</a></div>`}</div></section>
   <section class="features">${[['fa-shipping-fast', 'Fast Delivery', 'Free shipping on orders over RM300, delivered safely to your door.'], ['fa-shield-alt', 'Quality Guarantee', 'Every part is tested, and the warranty is tracked from the day you buy.'], ['fa-headset', 'Expert Support', 'Open a ticket for any product you bought and get an answer from our team.'], ['fa-exchange-alt', 'Trade-ins', 'Send in your old parts with photos and specs and get an offer.']].map(([i, t, d]) => `<div class="feature-card"><div class="feature-icon"><i class="fas ${i}"></i></div><h3 class="feature-title">${t}</h3><p class="feature-desc">${d}</p></div>`).join('')}</section>
  </div>`);
}

function pageProduct(id) {
  const p = prod(id); if (!p) return store('', notFound());
  const x = price(p), r = rating(p.id), u = me();
  const revs = db.reviews.filter(v => v.pid === p.id).sort((a, b) => b.date.localeCompare(a.date));
  let buy;
  if (p.stock <= 0) buy = '<button class="btn btn-blue" disabled>Out of Stock</button>';
  else if (!u) buy = `<a class="btn btn-blue" href="#/login?next=${encodeURIComponent('#/product/' + p.id)}"><i class="fas fa-sign-in-alt"></i> Login to Buy</a>`;
  else if (u.role !== 'customer') buy = '<p class="muted">You are signed in as staff. Switch to a customer account to buy.</p>';
  else buy = `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><div class="qty"><button type="button" data-act="pdq" data-d="-1" aria-label="Less">−</button><input id="pdq" type="number" min="1" max="${p.stock}" value="1" aria-label="Quantity"><button type="button" data-act="pdq" data-d="1" aria-label="More">+</button></div>
    <button class="btn btn-blue" data-act="add" data-id="${p.id}" data-qty="#pdq"><i class="fas fa-cart-plus"></i> Add to Cart</button><button class="btn btn-ghost" data-act="buy" data-id="${p.id}" data-qty="#pdq"><i class="fas fa-bolt"></i> Buy Now</button></div>`;
  const canReview = u && u.role === 'customer';
  return store('', `<div class="container">${flash()}<p style="margin-bottom:20px"><a href="#/" class="muted" style="text-decoration:none"><i class="fas fa-arrow-left"></i> Back to products</a></p>
   <div class="pd"><div class="pic">${x.pct ? `<div class="product-badge">${x.pct}% OFF</div>` : ''}${img(p)}</div>
    <div><div class="product-category">${h(CATS[p.cat])} · ${h(p.brand)}</div><h1>${h(p.name)}</h1>
     <div class="product-rating">${stars(r.avg)}<span class="rating-text">${r.n ? `${r.avg.toFixed(1)} from ${r.n} review${r.n > 1 ? 's' : ''}` : 'No reviews yet'}</span></div>
     <div class="product-price" style="font-size:2rem">${priceHtml(p)}</div>${x.pct ? `<p class="save" style="margin-top:-12px">You save ${RM(x.orig - x.fin)}</p>` : ''}
     <div class="product-stock" style="margin-bottom:8px">${stockTxt(p)}</div><p class="desc">${h(p.desc)}</p>${buy}
     <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:18px;font-size:.9rem" class="muted"><span><i class="fas fa-shield-alt"></i> ${p.warranty >= 12 ? p.warranty / 12 + '-year' : p.warranty + '-month'} warranty</span><button class="link-btn" style="color:var(--primary-blue)" data-act="cmp" data-id="${p.id}"><i class="fas fa-balance-scale"></i> ${db.compare.includes(p.id) ? 'In compare list' : 'Add to compare'}</button></div>
    </div></div>
   <div class="grid2" style="margin-top:40px"><div class="panel"><div class="panel-head"><h3>Specifications</h3></div><div class="panel-body"><table class="specs"><tbody>${Object.entries(p.specs).map(([k, v]) => `<tr><td>${h(k)}</td><td>${h(v)}</td></tr>`).join('')}<tr><td>Brand</td><td>${h(p.brand)}</td></tr><tr><td>Warranty</td><td>${p.warranty} months</td></tr></tbody></table></div></div>
    <div class="panel"><div class="panel-head"><h3>Reviews (${revs.length})</h3></div><div class="panel-body">${revs.length ? revs.map(v => `<div class="review"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>${h(user(v.uid) ? user(v.uid).username : 'customer')}</b>${stars(v.rating)}</div><p>${h(v.text)}</p><small class="muted">${fd(v.date)}</small></div>`).join('') : '<p class="muted">No reviews yet.</p>'}
     ${canReview ? `<form data-form="review" data-id="${p.id}" style="margin-top:18px;border-top:1px solid var(--neutral-200);padding-top:18px"><div class="form-group"><label class="form-label" for="rv-r">Your rating</label><select id="rv-r" name="rating" class="form-control">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)} (${n})</option>`).join('')}</select></div><div class="form-group"><label class="form-label" for="rv-t">Your review</label><textarea id="rv-t" name="text" class="form-control" required maxlength="400" placeholder="What did you think?"></textarea></div><button class="btn btn-blue" type="submit">Post Review</button></form>` : ''}</div></div></div></div>`);
}

function pagePromotions() {
  const list = db.promos.filter(x => x.active).map(x => prod(x.pid)).filter(Boolean);
  return store('promotions', `<div class="page-head"><h1>Special Promotions</h1><p>Deals on computer hardware and accessories. Limited-time offers with big savings on parts for your next build.</p></div>
   <div class="container">${flash()}<div class="product-grid">${list.length ? list.map(p => { const x = price(p), u = me(); return `<div class="product-card"><div class="product-badge">${x.pct}% OFF</div><div class="product-image"><a href="#/product/${p.id}" aria-label="${h(p.name)}">${img(p)}</a></div>
    <div class="product-info"><div><div class="product-category">${h(CAT_SHORT[p.cat])}</div><a class="product-name" href="#/product/${p.id}">${h(p.name)}</a><div class="product-original-price" style="font-size:1rem">${RM(x.orig)}</div><div class="product-price" style="font-size:1.9rem;margin:0 0 6px">${RM(x.fin)}</div><p class="save" style="margin:0 0 20px">Save ${RM(x.orig - x.fin)}</p></div>
    <div class="product-buttons"><a class="product-btn" href="#/product/${p.id}"><i class="fas fa-eye"></i> View Details</a>${p.stock <= 0 ? '<button class="product-btn" disabled>Out of Stock</button>' : u && u.role === 'customer' ? `<button class="product-btn solid" data-act="add" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>` : !u ? `<a class="product-btn solid" href="#/login?next=%23%2Fpromotions"><i class="fas fa-sign-in-alt"></i> Login to Buy</a>` : ''}</div></div></div>`; }).join('') : '<div class="empty-state"><i class="fas fa-tags"></i><h3>No promotions right now</h3><p>Check back soon.</p></div>'}</div></div>`);
}

function pageCompare() {
  const [a, b] = [prod(db.compare[0]), prod(db.compare[1])];
  const sel = (n, cur) => `<div class="form-group"><label class="form-label" for="cmp${n}">Product ${n + 1}</label><select id="cmp${n}" class="form-control" data-change="cmp" data-n="${n}"><option value="">-- Select a product --</option>${SLOTS.map(k => `<optgroup label="${CAT_SHORT[k]}">${db.products.filter(p => p.cat === k).map(p => `<option value="${p.id}"${cur && cur.id === p.id ? ' selected' : ''}>${h(p.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>`;
  let table = '<div class="empty-state"><i class="fas fa-balance-scale"></i><h3>Pick two products</h3><p>Choose two products above, or use the <i class="fas fa-balance-scale"></i> button on any product card.</p></div>';
  if (a && b) {
    const pa = price(a).fin, pb = price(b).fin, ra = rating(a.id), rb = rating(b.id);
    const keys = [...new Set([...Object.keys(a.specs), ...Object.keys(b.specs)])];
    const row = (k, va, vb, wa = false, wb = false) => `<tr><td>${k}</td><td class="${wa ? 'win' : ''}">${va}</td><td class="${wb ? 'win' : ''}">${vb}</td></tr>`;
    table = `${a.cat !== b.cat ? '<div class="alert alert-info"><i class="fas fa-info-circle"></i> These products are in different categories, so some specs won\'t line up.</div>' : ''}
     <div class="table-wrap"><table class="cmp"><thead><tr><th scope="col">Feature</th><th scope="col">${img(a)}</th><th scope="col">${img(b)}</th></tr></thead><tbody>
     ${row('Name', `<a href="#/product/${a.id}" class="product-name" style="margin:0">${h(a.name)}</a>`, `<a href="#/product/${b.id}" class="product-name" style="margin:0">${h(b.name)}</a>`)}
     ${row('Price', RM(pa), RM(pb), pa < pb, pb < pa)}${row('Category', CAT_SHORT[a.cat], CAT_SHORT[b.cat])}${row('Brand', h(a.brand), h(b.brand))}
     ${row('Rating', ra.n ? ra.avg.toFixed(1) + ' / 5' : '–', rb.n ? rb.avg.toFixed(1) + ' / 5' : '–', ra.avg > rb.avg, rb.avg > ra.avg)}
     ${row('Stock', stockTxt(a), stockTxt(b))}${row('Warranty', a.warranty + ' months', b.warranty + ' months', a.warranty > b.warranty, b.warranty > a.warranty)}
     ${keys.map(k => row(h(k), h(a.specs[k] || '–'), h(b.specs[k] || '–'))).join('')}
     </tbody></table></div><p class="muted" style="margin-top:10px;font-size:.88rem">Green marks the better value for price, rating and warranty.</p>`;
  }
  return store('compare', `<div class="page-head"><h1>Compare Products</h1><p>Put two parts side by side and check price, specs, rating and warranty before you buy.</p></div><div class="container"><div class="cmp-pick">${sel(0, a)}${sel(1, b)}</div>${table}</div>`);
}

function buildState() {
  const b = db.build, pick = k => prod(b[k]);
  const cpu = pick('CPU'), mb = pick('MOTHERBOARD'), gpu = pick('GPU'), psu = pick('PSU');
  const msgs = []; let bad = false;
  if (cpu && mb) { if (cpu.socket !== mb.socket) { bad = true; msgs.push(['bad', `The ${cpu.name} (${cpu.socket}) does not fit the ${mb.name} (${mb.socket}).`]); } else msgs.push(['ok', `CPU and motherboard both use ${cpu.socket}.`]); }
  const need = (cpu ? cpu.tdp : 0) + (gpu ? gpu.power : 0) + 100;
  if (psu && (cpu || gpu)) { if (psu.watts < need * 1.2) { bad = true; msgs.push(['bad', `Estimated draw is about ${need}W. The ${psu.watts}W supply leaves too little headroom; pick ${Math.ceil(need * 1.2 / 50) * 50}W or more.`]); } else msgs.push(['ok', `Power: about ${need}W needed, ${psu.watts}W supply.`]); }
  const parts = SLOTS.map(pick).filter(Boolean);
  const total = parts.reduce((s, p) => s + price(p).fin, 0);
  if (!parts.length) msgs.push(['info', 'Pick parts on the left. The checks run as you go.']);
  return {cpu, mb, parts, total, msgs, bad};
}
function pageBuild() {
  const st = buildState(), u = me();
  const slot = k => {
    const opts = db.products.filter(p => p.cat === k);
    return `<section class="slot" id="slot-${k}"><h2><i class="fas ${ICON[k]}"></i> ${CATS[k]}</h2><div class="opts">${opts.map(p => {
      const on = db.build[k] === p.id, x = price(p);
      const clash = (k === 'MOTHERBOARD' && st.cpu && p.socket !== st.cpu.socket) || (k === 'CPU' && st.mb && p.socket !== st.mb.socket);
      return `<button type="button" class="opt${clash ? ' bad' : ''}" data-act="pick" data-slot="${k}" data-id="${p.id}" aria-pressed="${on}"${p.stock <= 0 ? ' disabled' : ''}><div class="im">${img(p)}</div><b>${h(p.name)}</b>
        <div class="row"><span>Brand:</span><span>${h(p.brand)}</span></div>${Object.entries(p.specs).slice(0, 3).map(([a, v]) => `<div class="row"><span>${h(a)}:</span><span>${h(v)}</span></div>`).join('')}
        <div class="pr">${x.pct ? `<s class="muted" style="font-weight:500;font-size:.85rem">${RM(x.orig)}</s> ` : ''}${RM(x.fin)}</div>
        ${clash ? '<div class="stk no"><i class="fas fa-exclamation-triangle"></i> Socket mismatch</div>' : p.stock > 0 ? `<div class="stk"><i class="fas fa-check-circle"></i> In Stock (${p.stock} available)</div>` : '<div class="stk no">Out of stock</div>'}</button>`;
    }).join('')}</div></section>`;
  };
  return store('build', `<div class="page-head"><h1>Custom PC Builder</h1><p>Design your computer with our PC builder. Pick parts that fit together; the builder checks the CPU socket and the power supply as you go.</p></div>
  <div class="container"><div class="builder"><div>${SLOTS.map(slot).join('')}</div>
   <aside class="summary" aria-label="Build summary"><h2>Build Summary</h2>${SLOTS.map(k => { const p = prod(db.build[k]); return `<div class="sum-row${p ? ' on' : ''}"><span class="ci"><i class="fas ${ICON[k]}"></i></span><div style="min-width:0;flex:1"><div class="t">${p ? h(p.name) : CAT_SHORT[k] + ' Not Selected'}</div><div class="p">${RM(p ? price(p).fin : 0)}</div></div>${p ? `<button class="x" style="width:32px;height:32px" data-act="pick" data-slot="${k}" data-id="${p.id}" aria-label="Remove ${h(p.name)}"><i class="fas fa-times"></i></button>` : ''}</div>`; }).join('')}
    <div class="sum-total"><span>Total</span><span>${RM(st.total)}</span></div>
    ${st.msgs.map(([c, m]) => `<div class="compat ${c}"><i class="fas ${c === 'ok' ? 'fa-check-circle' : c === 'bad' ? 'fa-exclamation-triangle' : 'fa-info-circle'}" style="margin-top:3px"></i><span>${h(m)}</span></div>`).join('')}
    <div style="display:grid;gap:10px;margin-top:20px">${!u ? `<a class="btn btn-blue" href="#/login?next=%23%2Fbuild"><i class="fas fa-sign-in-alt"></i> Login to buy this build</a>` : u.role === 'customer' ? `<button class="btn btn-blue" data-act="build-cart"${!st.parts.length || st.bad ? ' disabled' : ''}><i class="fas fa-cart-plus"></i> Add Build to Cart</button>` : ''}
     <button class="btn btn-ghost" data-act="build-clear"${st.parts.length ? '' : ' disabled'}><i class="fas fa-redo"></i> Clear Build</button></div></aside></div></div>`);
}

function totals(lines) {
  const orig = lines.reduce((s, l) => s + l.p.price * l.qty, 0), sub = lines.reduce((s, l) => s + price(l.p).fin * l.qty, 0);
  const ship = !lines.length || sub >= 300 ? 0 : 15;
  return {orig, sub, save: orig - sub, ship, total: sub + ship};
}
function pageCart() {
  const lines = cart().map(l => ({...l, p: prod(l.pid)})).filter(l => l.p), t = totals(lines);
  return store('', `<div class="container">${flash()}<h1 class="section-title" style="margin-bottom:28px"><i class="fas fa-shopping-cart" style="color:var(--primary-blue)"></i> Shopping Cart</h1>
  ${lines.length ? `<div class="cart"><div class="panel">${lines.map(l => { const x = price(l.p); return `<div class="cart-item"><a class="im" href="#/product/${l.p.id}">${img(l.p)}</a><div><div class="product-category" style="margin:0">${CAT_SHORT[l.p.cat]}</div><a class="product-name" style="margin:2px 0 4px" href="#/product/${l.p.id}">${h(l.p.name)}</a><div class="muted" style="font-size:.9rem">${x.pct ? `<s>${RM(x.orig)}</s> ` : ''}${RM(x.fin)} each${x.pct ? ` · <span style="color:var(--accent-green);font-weight:600">${x.pct}% off</span>` : ''}</div>${l.qty > l.p.stock ? `<div class="err">Only ${l.p.stock} left in stock</div>` : ''}</div>
     <div class="right"><div class="qty"><button data-act="qty" data-id="${l.p.id}" data-d="-1" aria-label="Less">−</button><input value="${l.qty}" readonly aria-label="Quantity"><button data-act="qty" data-id="${l.p.id}" data-d="1" aria-label="More">+</button></div><b style="font-size:1.1rem">${RM(x.fin * l.qty)}</b><button class="link-btn" data-act="rm" data-id="${l.p.id}"><i class="fas fa-trash"></i> Remove</button></div></div>`; }).join('')}</div>
    <aside class="panel"><div class="panel-head"><h3>Order Summary</h3></div><div class="panel-body"><div class="kv"><span>Subtotal (${lines.reduce((s, l) => s + l.qty, 0)} items)</span><b>${RM(t.orig)}</b></div>${t.save ? `<div class="kv"><span>Promotion savings</span><b style="color:var(--accent-green)">−${RM(t.save)}</b></div>` : ''}<div class="kv"><span>Shipping</span><b>${t.ship ? RM(t.ship) : 'FREE'}</b></div><div class="kv" style="font-size:1.2rem"><span style="color:inherit;font-weight:700">Total</span><b style="color:var(--primary-blue)">${RM(t.total)}</b></div>
     ${t.ship ? `<p class="hint">Add ${RM(300 - t.sub)} more for free shipping.</p>` : ''}<div style="display:grid;gap:10px;margin-top:18px"><a class="btn btn-blue" href="#/checkout"><i class="fas fa-lock"></i> Proceed to Checkout</a><a class="btn btn-ghost" href="#/">Continue Shopping</a></div></div></aside></div>`
  : `<div class="panel"><div class="empty-state"><i class="fas fa-shopping-cart"></i><h3>Your cart is empty</h3><p>Browse the store or build a PC to add some parts.</p><a href="#/" class="btn btn-blue">Start Shopping</a></div></div>`}</div>`);
}

function pageCheckout(q) {
  const u = me(), buy = q.get('buy');
  const lines = (buy ? [{pid: +buy, qty: Math.max(1, +q.get('qty') || 1)}] : cart()).map(l => ({...l, p: prod(l.pid)})).filter(l => l.p);
  if (!lines.length) { go('#/cart'); return null; }
  const t = totals(lines), f = (n, l, v, extra = '') => `<div class="form-group"><label class="form-label" for="co-${n}">${l}</label><input id="co-${n}" name="${n}" class="form-control" value="${h(v || '')}" required ${extra}></div>`;
  return store('', `<div class="container"><h1 class="section-title" style="margin-bottom:28px">Checkout</h1>
  <form class="cart" data-form="checkout" data-buy="${buy ? h(buy) : ''}" data-qty="${lines[0].qty}" novalidate><div style="display:grid;gap:24px">
   <div class="panel"><div class="panel-head"><h3><i class="fas fa-truck" style="color:var(--primary-blue)"></i> Shipping Address</h3></div><div class="panel-body"><div class="grid2" style="gap:0 20px">${f('name', 'Full name', u.name)}${f('phone', 'Phone', u.phone, 'inputmode="tel"')}</div>${f('address', 'Address', u.address)}<div class="grid3" style="gap:0 20px">${f('city', 'City', u.city)}${f('postcode', 'Postcode', u.postcode, 'inputmode="numeric" maxlength="5"')}${f('state', 'State', u.state || 'Melaka')}</div></div></div>
   <div class="panel"><div class="panel-head"><h3><i class="fas fa-credit-card" style="color:var(--primary-blue)"></i> Payment Method</h3></div><div class="panel-body"><div class="pay-opts">
    ${[['Credit / debit card', 'fa-credit-card'], ['Online banking (FPX)', 'fa-university'], ['Cash on delivery', 'fa-money-bill-wave']].map(([m, i], k) => `<label class="pay-opt"><input type="radio" name="pay" value="${m}"${k ? '' : ' checked'} data-change="pay"><i class="fas ${i}"></i><span>${m}</span></label>`).join('')}</div>
    <div id="cardBox" style="margin-top:18px"><div class="alert alert-info" style="margin-bottom:16px"><i class="fas fa-info-circle"></i> Demo: the test card below is filled in for you. No payment is taken.</div><div class="grid3" style="gap:0 20px">${f('card', 'Card number', '4242 4242 4242 4242', 'inputmode="numeric"')}${f('exp', 'Expiry (MM/YY)', '12/29')}${f('cvv', 'CVV', '123', 'inputmode="numeric" maxlength="4"')}</div></div>
    <div class="err" id="coErr" role="alert"></div></div></div></div>
   <aside class="panel"><div class="panel-head"><h3>Your Order</h3></div><div class="panel-body">${lines.map(l => `<div class="kv"><span>${h(l.p.name)} × ${l.qty}</span><b>${RM(price(l.p).fin * l.qty)}</b></div>`).join('')}
    ${t.save ? `<div class="kv"><span>Promotion savings</span><b style="color:var(--accent-green)">−${RM(t.save)}</b></div>` : ''}<div class="kv"><span>Shipping</span><b>${t.ship ? RM(t.ship) : 'FREE'}</b></div><div class="kv" style="font-size:1.2rem"><span style="color:inherit;font-weight:700">Total</span><b style="color:var(--primary-blue)">${RM(t.total)}</b></div>
    <button class="btn btn-blue" type="submit" style="width:100%;margin-top:18px"><i class="fas fa-lock"></i> Place Order</button><a href="#/cart" class="btn btn-ghost" style="width:100%;margin-top:10px">Back to Cart</a></div></aside></form></div>`);
}

function orderTimeline(o) {
  if (o.status === 'cancelled') return `<div class="alert alert-danger"><i class="fas fa-times-circle"></i> This order was cancelled.</div>`;
  const at = ORDER_FLOW.indexOf(o.status);
  return `<ol style="list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px">${ORDER_FLOW.map((s, i) => { const hh = o.hist.find(x => x.status === s); return `<li style="text-align:center"><div style="width:40px;height:40px;border-radius:50%;margin:0 auto 6px;display:grid;place-items:center;${i <= at ? 'background:var(--primary-blue);color:#fff' : 'background:var(--neutral-100);color:var(--neutral-400)'}"><i class="fas ${['fa-receipt', 'fa-cog', 'fa-truck', 'fa-check'][i]}"></i></div><b style="font-size:.85rem">${label(s)}</b><div class="muted" style="font-size:.75rem">${hh ? fd(hh.date) : '&nbsp;'}</div></li>`; }).join('')}</ol>`;
}
function pageOrder(id, q) {
  const o = db.orders.find(x => x.id === +id), u = me();
  if (!o || (u.role === 'customer' && o.uid !== u.id)) return store('', notFound());
  const c = user(o.uid), staffView = u.role !== 'customer';
  const body = `<div class="container">${q.get('new') ? `<div class="panel" style="text-align:center;padding:40px 20px;margin-bottom:28px"><div class="feature-icon" style="background:linear-gradient(135deg,#34d399,#10b981)"><i class="fas fa-check"></i></div><h1 class="section-title" style="font-size:2rem">Order Confirmed!</h1><p class="muted" style="margin:8px 0 20px">Thank you, ${h(c.name)}. Order #${o.id} is in. You can follow it from your dashboard.</p>
    <div class="alert alert-info" style="text-align:left;max-width:640px;margin:0 auto"><i class="fas fa-lightbulb"></i><span>Try the other side: <button class="link-btn" style="color:inherit;text-decoration:underline" data-act="role" data-r="admin">sign in as Admin</button> and process this order in <b>Orders</b>.</span></div></div>` : ''}
   ${flash()}<div class="section-header"><h2 class="section-title" style="font-size:1.9rem">Order #${o.id} ${badge(o.status)}</h2><a class="section-link" href="${staffView ? homeFor(u) + '/orders' : '#/account/orders'}"><i class="fas fa-arrow-left"></i> ${staffView ? 'Order Management' : 'My Orders'}</a></div>
   <div class="panel" style="margin-bottom:24px"><div class="panel-body">${orderTimeline(o)}</div></div>
   <div class="grid2"><div class="panel"><div class="panel-head"><h3>Items</h3></div><div class="panel-body">${o.lines.map(l => `<div class="kv"><span>${h(l.name)} × ${l.qty}</span><b>${RM(l.price * l.qty)}</b></div>`).join('')}<div class="kv"><span>Shipping</span><b>${o.ship ? RM(o.ship) : 'FREE'}</b></div><div class="kv" style="font-size:1.15rem"><span style="color:inherit;font-weight:700">Total</span><b style="color:var(--primary-blue)">${RM(o.total)}</b></div></div></div>
    <div class="panel"><div class="panel-head"><h3>Details</h3></div><div class="panel-body"><div class="kv"><span>Placed</span><b>${fdt(o.date)}</b></div>${staffView ? `<div class="kv"><span>Customer</span><b>${h(c.name)} (${h(c.username)})</b></div>` : ''}<div class="kv"><span>Payment</span><b>${h(o.pay)}</b></div><div class="kv"><span>Ship to</span><b>${h(o.addr.name)}<br>${h(o.addr.address)}<br>${h(o.addr.postcode)} ${h(o.addr.city)}, ${h(o.addr.state)}<br>${h(o.addr.phone)}</b></div>
     <h4 style="margin:18px 0 6px">History</h4>${o.hist.map(x => `<div class="kv"><span>${label(x.status)} · by ${h(x.by)}</span><b style="font-weight:500">${fdt(x.date)}</b></div>`).join('')}
     <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">${staffView ? orderActions(o, true) : o.status === 'pending' ? `<button class="btn btn-red btn-sm" data-act="order-status" data-id="${o.id}" data-s="cancelled"><i class="fas fa-times"></i> Cancel Order</button>` : ''}${!staffView && ['delivered', 'shipped'].includes(o.status) ? `<a class="btn btn-ghost btn-sm" href="#/support/new?order=${o.id}"><i class="fas fa-headset"></i> Get help with this order</a>` : ''}</div></div></div></div></div>`;
  return staffView ? panelLayout(u.role, body) : store('', body);
}

function pageLogin(q) {
  const next = q.get('next') || '';
  return topBar('store') + header(false) + `<div class="auth-bg"><div class="auth"><div class="side"><div class="brand"><img src="img/logo.png" alt="">DARNOC IT</div><h2>Welcome Back</h2><p>Sign in to see your dashboard, manage orders and explore computer hardware.</p><a href="#/" class="btn btn-secondary btn-sm" style="padding:8px 16px"><i class="fas fa-arrow-left"></i> Back to Home</a>
   <ul><li><i class="fas fa-check-circle"></i>Access to member promotions</li><li><i class="fas fa-check-circle"></i>Track your orders in real time</li><li><i class="fas fa-check-circle"></i>Trade in your old parts</li><li><i class="fas fa-check-circle"></i>Warranty and support in one place</li></ul></div>
  <div class="main"><h2>Sign In</h2><p class="sub">Enter your details to access your account</p>
   <div class="demo-logins"><p><i class="fas fa-flask"></i> Demo accounts: one click to sign in</p><div class="row"><button type="button" data-act="role" data-r="customer" data-next="${h(next)}">Customer<small>aina</small></button><button type="button" data-act="role" data-r="staff" data-next="${h(next)}">Staff<small>staff</small></button><button type="button" data-act="role" data-r="admin" data-next="${h(next)}">Admin<small>admin</small></button></div></div>
   <form data-form="login" data-next="${h(next)}" novalidate><div class="form-group"><label class="form-label" for="lg-u">Username</label><input id="lg-u" name="u" class="form-control" autocomplete="username" placeholder="Enter your username" required></div>
    <div class="form-group"><label class="form-label" for="lg-p">Password</label><input id="lg-p" name="p" type="password" class="form-control" autocomplete="current-password" placeholder="Enter your password" required><p class="hint">Every demo account uses the password <b>demo</b>.</p></div>
    <div class="err" id="lgErr" role="alert"></div><button class="btn btn-blue" type="submit" style="width:100%"><i class="fas fa-sign-in-alt"></i> Sign In</button></form>
   <div class="links">Don't have an account? <a href="#/register">Create one here</a></div></div></div></div>` + footer();
}
function pageRegister() {
  const f = (n, l, t = 'text', ex = '') => `<div class="form-group"><label class="form-label" for="rg-${n}">${l}</label><input id="rg-${n}" name="${n}" type="${t}" class="form-control" required ${ex}></div>`;
  return topBar('store') + header(false) + `<div class="auth-bg"><div class="auth"><div class="side"><div class="brand"><img src="img/logo.png" alt="">DARNOC IT</div><h2>Join Darnoc IT</h2><p>Create an account to buy parts, build a PC, trade in old hardware and get support.</p><ul><li><i class="fas fa-check-circle"></i>Your orders and trade-ins in one dashboard</li><li><i class="fas fa-check-circle"></i>Warranty tracked for every purchase</li></ul></div>
  <div class="main"><h2>Create Account</h2><p class="sub">It takes a minute. This one only lives in your browser.</p><form data-form="register" novalidate>${f('username', 'Username', 'text', 'autocomplete="username" maxlength="20"')}${f('name', 'Full name', 'text', 'autocomplete="name"')}${f('email', 'Email', 'email', 'autocomplete="email"')}${f('phone', 'Phone', 'tel', 'autocomplete="tel"')}${f('p', 'Password', 'password', 'autocomplete="new-password" minlength="4"')}${f('p2', 'Confirm password', 'password', 'autocomplete="new-password"')}
   <div class="err" id="rgErr" role="alert"></div><button class="btn btn-blue" type="submit" style="width:100%"><i class="fas fa-user-plus"></i> Create Account</button></form><div class="links">Already have an account? <a href="#/login">Sign in</a></div></div></div></div>` + footer();
}

/* ---------- customer dashboard ---------- */
function pageAccount(tab) {
  const u = me(), mine = db.orders.filter(o => o.uid === u.id).sort((a, b) => b.id - a.id), tis = db.tradeins.filter(t => t.uid === u.id).sort((a, b) => b.id - a.id);
  const active = mine.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length, done = mine.filter(o => o.status === 'delivered').length;
  const spent = mine.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const tabs = [['', 'fa-tachometer-alt', 'Dashboard'], ['orders', 'fa-shopping-bag', 'My Orders', active], ['tradeins', 'fa-exchange-alt', 'Trade-ins'], ['settings', 'fa-cog', 'Settings']];
  const ordersTable = list => list.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th class="num">Total</th><th>Status</th><th></th></tr></thead><tbody>${list.map(o => `<tr><td><b>#${o.id}</b></td><td>${fdt(o.date)}</td><td>${o.lines.map(l => h(l.name) + (l.qty > 1 ? ' × ' + l.qty : '')).join('<br>')}</td><td class="num"><b>${RM(o.total)}</b></td><td>${badge(o.status)}</td><td><a class="btn btn-sky btn-sm" href="#/order/${o.id}"><i class="fas fa-eye"></i> View</a></td></tr>`).join('')}</tbody></table></div>` : '<div class="panel"><div class="empty-state"><i class="fas fa-shopping-bag"></i><h3>No orders yet</h3><p>Your orders will show up here.</p><a class="btn btn-blue" href="#/">Start Shopping</a></div></div>';
  let body;
  if (tab === 'orders') body = `<h2 class="dash-title">My Orders</h2><p class="dash-sub">Every order you've placed, with its current status.</p>${ordersTable(mine)}`;
  else if (tab === 'tradeins') body = `<div class="section-header" style="margin-bottom:8px"><div><h2 class="dash-title">My Trade-In Requests</h2><p class="dash-sub" style="margin-bottom:0">Track the parts you've sent in and the shop's offers.</p></div><a class="btn btn-blue" href="#/tradein"><i class="fas fa-plus"></i> Submit New Trade-In</a></div><div style="margin-top:24px">${tradeinCards(tis, false)}</div>`;
  else if (tab === 'settings') {
    const f = (n, l, ex = '') => `<div class="form-group"><label class="form-label" for="st-${n}">${l}</label><input id="st-${n}" name="${n}" class="form-control" value="${h(u[n] || '')}" ${ex}></div>`;
    body = `<h2 class="dash-title">Settings</h2><p class="dash-sub">Your details are used at checkout.</p><form class="panel" data-form="profile" style="max-width:760px"><div class="panel-body"><div class="grid2" style="gap:0 20px">${f('name', 'Full name', 'required')}${f('email', 'Email', 'type="email" required')}${f('phone', 'Phone')}${f('state', 'State')}</div>${f('address', 'Address')}<div class="grid2" style="gap:0 20px">${f('city', 'City')}${f('postcode', 'Postcode', 'inputmode="numeric" maxlength="5"')}</div><button class="btn btn-blue" type="submit"><i class="fas fa-save"></i> Save Changes</button></div></form>`;
  } else {
    const kv = (k, v) => `<div class="kv"><span>${k}:</span><b>${v}</b></div>`;
    body = `<div class="stats">${stat(mine.length, 'Total Orders', 'fa-shopping-cart', 'bg-blue', '', '#/account/orders')}${stat(active, 'Active Orders', 'fa-clock', 'bg-orange', '', '#/account/orders')}${stat(done, 'Completed Orders', 'fa-check-circle', 'bg-green')}${stat(RM(spent, 0), 'Total Spent', 'fa-wallet', 'bg-purple')}${stat(tis.length, 'Trade-in Requests', 'fa-exchange-alt', 'bg-teal', '', '#/account/tradeins')}</div>
     <div class="grid3"><div class="panel"><div class="panel-head"><div><h3>Account Information</h3><small>Your personal account details</small></div></div><div class="panel-body">${kv('Username', h(u.username))}${kv('Name', h(u.name))}${kv('Email', h(u.email))}${kv('Phone', h(u.phone || '–'))}${kv('Member since', fd(u.created))}</div></div>
      <div class="panel"><div class="panel-head"><div><h3>Order Summary</h3><small>Your order statistics</small></div></div><div class="panel-body">${kv('Total Orders', mine.length)}${kv('Active', active)}${kv('Delivered', done)}${kv('Cancelled', mine.filter(o => o.status === 'cancelled').length)}${kv('Items in cart', cartCount())}</div></div>
      <div class="panel"><div class="panel-head"><div><h3>Trade-in Status</h3><small>Your trade-in requests</small></div></div><div class="panel-body">${kv('Total Requests', tis.length)}${kv('Pending Review', tis.filter(t => t.status === 'pending').length)}${kv('Accepted', tis.filter(t => t.status === 'accepted').length)}${kv('Offers received', RM(tis.filter(t => t.status === 'accepted').reduce((s, t) => s + t.offer, 0), 0))}</div></div></div>
     <h3 style="font-size:1.3rem;margin:36px 0 16px">Recent Orders</h3>${ordersTable(mine.slice(0, 4))}`;
  }
  return topBar('store') + header(false) + `<section class="hero cust"><div class="hero-container"><div class="hero-content"><h1>Welcome Back!</h1><p>Hello, ${h(u.name.split(' ')[0])}! Manage your account and orders from your personal dashboard.</p><div class="hero-buttons"><a href="#/" class="btn btn-primary">Continue Shopping</a><a href="#/support" class="btn btn-secondary">Get Support</a></div></div></div></section>
   <nav class="dash-tabs" aria-label="Dashboard"><div class="in">${tabs.map(([k, i, t, n]) => `<a href="#/account${k ? '/' + k : ''}"${(tab || '') === k ? ' class="active" aria-current="page"' : ''}><i class="fas ${i}"></i> ${t}${n ? ` <span class="count">${n}</span>` : ''}</a>`).join('')}</div></nav>
   <div class="container">${flash()}${body}</div>` + footer();
}
function stat(v, l, ic, bg, note = '', href = '') {
  const inner = `<div><div class="v">${v}</div><div class="l">${l}</div>${note}</div><span class="ic ${bg}"><i class="fas ${ic}"></i></span>`;
  return href ? `<a class="stat" href="${href}">${inner}</a>` : `<div class="stat">${inner}</div>`;
}
function tradeinCards(list, staffView) {
  if (!list.length) return `<div class="panel"><div class="empty-state"><i class="fas fa-exchange-alt"></i><h3>No trade-ins ${staffView ? 'here' : 'yet'}</h3><p>${staffView ? 'Nothing matches this filter.' : 'Send in an old part and get an offer.'}</p>${staffView ? '' : '<a class="btn btn-blue" href="#/tradein">Submit a Trade-In</a>'}</div></div>`;
  return `<div class="ti-grid">${list.map(t => { const c = user(t.uid); return `<article class="ti"><div class="h"><b>${h(t.name)}</b>${badge(t.status)}</div><div class="im">${t.img ? `<img src="${h(t.img)}" alt="Photo of ${h(t.name)}">` : `<div class="noimg" aria-hidden="true"><i class="fas ${ICON[t.cat] || 'fa-box'}"></i></div>`}</div>
    <div class="box"><b><i class="fas fa-align-left"></i> Description</b><p class="muted" style="margin-top:4px">${h(t.desc || '–')}</p></div>
    <div>${staffView ? `<div class="kv"><span>Customer:</span><b>${h(c ? c.name : '?')}</b></div>` : ''}<div class="kv"><span>Category:</span><b>${h(CAT_SHORT[t.cat] || t.cat)}</b></div><div class="kv"><span>Condition:</span><b>${h(t.cond)} · ${t.months} months used</b></div><div class="kv"><span>Submitted:</span><b>${fdt(t.date)}</b></div>${Object.entries(t.specs).filter(([, v]) => v).map(([k, v]) => `<div class="kv"><span>${h(k)}:</span><b>${h(v)}</b></div>`).join('')}</div>
    ${t.status === 'accepted' ? `<div class="offer"><b>Offer: ${RM(t.offer)}</b>${t.note ? `<br>${h(t.note)}` : ''}<br><small>Decided by ${h(t.by)} on ${fd(t.decided)}</small></div>` : t.status === 'rejected' ? `<div class="offer no"><b>Declined</b>${t.note ? `<br>${h(t.note)}` : ''}<br><small>By ${h(t.by)} on ${fd(t.decided)}</small></div>` : staffView ? `<div style="display:flex;gap:10px"><button class="btn btn-green btn-sm" style="flex:1" data-act="ti-decide" data-id="${t.id}" data-s="accepted"><i class="fas fa-check"></i> Accept with offer</button><button class="btn btn-red btn-sm" style="flex:1" data-act="ti-decide" data-id="${t.id}" data-s="rejected"><i class="fas fa-times"></i> Decline</button></div>` : '<div class="offer" style="background:#fef3c7;color:#92400e"><i class="fas fa-hourglass-half"></i> Waiting for the shop to review</div>'}</article>`; }).join('')}</div>`;
}
function pageTradeinNew() {
  return topBar('store') + header(false) + `<div class="container" style="max-width:860px"><p style="margin-bottom:16px"><a href="#/account/tradeins" class="muted" style="text-decoration:none"><i class="fas fa-arrow-left"></i> Back to my trade-ins</a></p>
  <div class="page-head" style="padding-top:0"><div class="feature-icon" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)"><i class="fas fa-exchange-alt"></i></div><h1 style="font-size:2.3rem">Submit a Trade-In</h1><p>Tell us about the part. Staff review it and reply with an offer.</p></div>
  <form class="panel" data-form="tradein" novalidate><div class="panel-body"><div class="grid2" style="gap:0 20px">
   <div class="form-group"><label class="form-label" for="ti-n">Item name / model</label><input id="ti-n" name="name" class="form-control" required maxlength="60" placeholder="e.g. RTX 3070"></div>
   <div class="form-group"><label class="form-label" for="ti-c">Category</label><select id="ti-c" name="cat" class="form-control">${SLOTS.map(k => `<option value="${k}"${k === 'GPU' ? ' selected' : ''}>${CAT_SHORT[k]}</option>`).join('')}</select></div>
   <div class="form-group"><label class="form-label" for="ti-m">Manufacturer</label><input id="ti-m" name="man" class="form-control" placeholder="e.g. NVIDIA"></div>
   <div class="form-group"><label class="form-label" for="ti-k">Condition</label><select id="ti-k" name="cond" class="form-control"><option>Like new</option><option selected>Good</option><option>Fair</option><option>Faulty</option></select></div>
   <div class="form-group"><label class="form-label" for="ti-s1">Memory / capacity</label><input id="ti-s1" name="mem" class="form-control" placeholder="e.g. 8 GB"></div>
   <div class="form-group"><label class="form-label" for="ti-s2">Clock speed</label><input id="ti-s2" name="clock" class="form-control" placeholder="e.g. 1725 MHz"></div>
   <div class="form-group"><label class="form-label" for="ti-a">Months used</label><input id="ti-a" name="months" type="number" min="0" max="240" class="form-control" value="12"></div>
   <div class="form-group"><label class="form-label" for="ti-f">Photo (optional)</label><input id="ti-f" type="file" accept="image/*" class="form-control" data-change="ti-photo" style="padding:9px"><p class="hint">Stays in your browser; it is shrunk and never uploaded.</p></div></div>
   <div id="tiPrev"></div>
   <div class="form-group"><label class="form-label" for="ti-d">Description</label><textarea id="ti-d" name="desc" class="form-control" maxlength="400" placeholder="Anything we should know? Box, receipts, faults..."></textarea></div>
   <div class="err" id="tiErr" role="alert"></div><button class="btn btn-blue" type="submit"><i class="fas fa-paper-plane"></i> Submit Trade-In</button></div></form></div>` + footer();
}

/* ---------- support ---------- */
function ticketCard(t, staffView) {
  const p = prod(t.pid), o = db.orders.find(x => x.id === t.oid), w = warranty(o, p), c = user(t.uid);
  const last = t.replies.length ? t.replies[t.replies.length - 1].date : t.date;
  return `<article class="ticket"><div class="th"><div><h4><i class="fas fa-ticket-alt"></i> #${t.id} - ${h(t.subject)}</h4><div class="meta"><span><i class="fas fa-user"></i> ${h(c ? c.username : '?')}</span><span><i class="fas fa-calendar"></i> ${fdt(t.date)}</span>${p ? `<span><i class="fas fa-box"></i> ${h(p.name)}</span>` : ''}</div></div>
   <div class="tags">${badge(t.status)}${badge(t.pri)}${badge(w.state, 'Warranty: ' + w.label)}</div></div>
   <div class="tb"><div><b style="font-size:.9rem">Description:</b><p style="margin:6px 0 0">${h(t.desc)}</p></div><div class="det"><b style="text-transform:uppercase;font-size:.78rem;letter-spacing:.05em;margin-bottom:4px">Details</b><span><b>Category:</b> ${h(t.cat)}</span><span><b>Assigned to:</b> ${h(t.assigned || 'Not yet')}</span>${o ? `<span><b>Order:</b> #${o.id}, ${fd(o.date)}</span>` : ''}${w.exp ? `<span><b>Warranty ${w.state === 'valid' ? 'expires' : 'expired'}:</b> ${fd(w.exp)}</span>` : ''}<span><b>Responses:</b> ${t.replies.length}</span><span><b>Last activity:</b> ${fdt(last)}</span></div></div>
   <div class="tf"><a class="btn btn-sky btn-sm" href="#/support/${t.id}"><i class="fas fa-eye"></i> View Details</a>${t.status !== 'closed' ? `<a class="btn btn-blue btn-sm" href="#/support/${t.id}#reply"><i class="fas fa-reply"></i> ${staffView ? 'Respond' : 'Add Response'}</a>` : ''}</div></article>`;
}
function pageSupport() {
  const u = me();
  if (u.role !== 'customer') { go(homeFor(u) + '/support'); return null; }
  const mine = db.tickets.filter(t => t.uid === u.id).sort((a, b) => b.id - a.id), bought = purchases(u.id);
  return store('support', `<div class="container">${flash()}<div class="panel" style="margin-bottom:24px"><div class="panel-body" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><div style="display:flex;gap:14px;align-items:center"><span class="stat" style="padding:0;border:0"><span class="ic bg-teal" style="width:44px;height:44px"><i class="fas fa-headset"></i></span></span><div><h1 style="font-size:1.6rem;line-height:1.2">Support Center</h1><p class="muted" style="font-size:.9rem">Submit and track your support requests</p></div></div><div style="display:flex;gap:10px"><a class="btn btn-ghost btn-sm" href="#/account"><i class="fas fa-home"></i> Dashboard</a><a class="btn btn-blue btn-sm" href="#/support/new"><i class="fas fa-plus"></i> New Ticket</a></div></div></div>
   <div class="panel" style="margin-bottom:24px"><div class="panel-head"><h3><i class="fas fa-ticket-alt"></i> My Support Tickets</h3></div><div class="panel-body">${mine.length ? mine.map(t => ticketCard(t, false)).join('') : '<div class="empty-state"><i class="fas fa-ticket-alt"></i><h3>No tickets yet</h3><p>Need help with something you bought? Open a ticket.</p></div>'}</div></div>
   <div class="panel"><div class="panel-head"><div><h3><i class="fas fa-shield-alt"></i> Warranty Checker</h3><small>Worked out from the order date and each product's warranty period</small></div></div><div class="panel-body">${bought.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th>Order</th><th>Bought</th><th>Warranty</th><th>Expires</th><th>Status</th></tr></thead><tbody>${bought.map(b => `<tr><td>${h(b.p.name)}</td><td>#${b.o.id}</td><td>${fd(b.o.date)}</td><td>${b.p.warranty} months</td><td>${fd(b.w.exp)}</td><td>${badge(b.w.state, b.w.state === 'valid' ? (b.w.left <= 60 ? `Ends in ${b.w.left} days` : 'Valid') : 'Expired')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nothing bought yet.</p>'}</div></div></div>`);
}
function pageTicketNew(q) {
  const u = me(), bought = purchases(u.id), pre = +q.get('order') || 0;
  if (!bought.length) { db.flash = ['info', 'Support tickets are for products you have bought. Buy something first, or ask an admin to deliver an order.']; go('#/support'); return null; }
  return store('support', `<div class="container" style="max-width:860px"><p style="margin-bottom:16px"><a href="#/support" class="muted" style="text-decoration:none"><i class="fas fa-arrow-left"></i> Back to Support Center</a></p><h1 class="section-title" style="font-size:2rem;margin-bottom:20px">New Support Ticket</h1>
   <form class="panel" data-form="ticket-new" novalidate><div class="panel-body"><div class="form-group"><label class="form-label" for="tk-p">Product</label><select id="tk-p" name="line" class="form-control" data-change="tk-prod">${bought.map((b, i) => `<option value="${b.o.id}:${b.p.id}"${b.o.id === pre && !bought.slice(0, i).some(x => x.o.id === pre) ? ' selected' : ''}>${h(b.p.name)} (order #${b.o.id}, ${fd(b.o.date)})</option>`).join('')}</select><div id="tkW" style="margin-top:8px"></div></div>
    <div class="grid2" style="gap:0 20px"><div class="form-group"><label class="form-label" for="tk-c">Category</label><select id="tk-c" name="cat" class="form-control"><option>Technical support</option><option>Warranty</option><option>Order issue</option><option>Product question</option><option>Other</option></select></div>
    <div class="form-group"><label class="form-label" for="tk-r">Priority</label><select id="tk-r" name="pri" class="form-control"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div>
    <div class="form-group"><label class="form-label" for="tk-s">Subject</label><input id="tk-s" name="subject" class="form-control" required maxlength="80" placeholder="e.g. No display after installing"></div>
    <div class="form-group"><label class="form-label" for="tk-d">Describe the problem</label><textarea id="tk-d" name="desc" class="form-control" required maxlength="800"></textarea></div>
    <div class="err" id="tkErr" role="alert"></div><button class="btn btn-blue" type="submit"><i class="fas fa-paper-plane"></i> Submit Ticket</button></div></form></div>`);
}
function pageTicket(id) {
  const u = me(), t = db.tickets.find(x => x.id === +id);
  if (!t || (u.role === 'customer' && t.uid !== u.id)) return store('support', notFound());
  const staffView = u.role !== 'customer', c = user(t.uid);
  const body = `<div class="container" style="max-width:1000px">${flash()}<p style="margin-bottom:16px"><a href="${staffView ? homeFor(u) + '/support' : '#/support'}" class="muted" style="text-decoration:none"><i class="fas fa-arrow-left"></i> Back to ${staffView ? 'ticket queue' : 'Support Center'}</a></p>${ticketCard(t, staffView).replace(/<div class="tf">[\s\S]*<\/div><\/article>$/, '</article>')}
   <div class="panel"><div class="panel-head"><h3><i class="fas fa-comments"></i> Conversation</h3>${staffView ? `<label style="display:flex;gap:8px;align-items:center;font-weight:600;font-size:.9rem">Status <select class="form-control" style="min-height:38px;padding:6px 10px;width:auto" data-change="tk-status" data-id="${t.id}">${['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map(s => `<option value="${s}"${t.status === s ? ' selected' : ''}>${label(s)}</option>`).join('')}</select></label>` : ''}</div><div class="panel-body">
    <div class="msg"><div class="who"><i class="fas fa-user"></i> ${h(c.username)} <small>${fdt(t.date)} · opened the ticket</small></div><p>${h(t.desc)}</p></div>
    ${t.replies.map(r => `<div class="msg${r.role !== 'customer' ? ' staff' : ''}"><div class="who"><i class="fas ${r.role !== 'customer' ? 'fa-user-shield' : 'fa-user'}"></i> ${h(r.by)} ${r.role !== 'customer' ? `<span class="status st-open">${h(r.role)}</span>` : ''}<small>${fdt(r.date)}</small></div><p>${h(r.text)}</p></div>`).join('')}
    ${t.status === 'closed' ? '<p class="muted"><i class="fas fa-lock"></i> This ticket is closed.</p>' : `<form id="reply" data-form="ticket-reply" data-id="${t.id}" style="margin-top:20px"><div class="form-group"><label class="form-label" for="rp">${staffView ? 'Reply to the customer' : 'Add a response'}</label><textarea id="rp" name="text" class="form-control" required maxlength="800"></textarea>${staffView ? '<p class="hint">Sending a reply sets the status to "Waiting customer" and assigns the ticket to you.</p>' : ''}</div><button class="btn btn-blue" type="submit"><i class="fas fa-reply"></i> Send</button>${!staffView ? ` <button type="button" class="btn btn-ghost" data-act="tk-close" data-id="${t.id}">Mark as resolved</button>` : ''}</form>`}</div></div></div>`;
  return staffView ? panelLayout(u.role, body) : store('support', body);
}

/* ---------- admin / staff panel ---------- */
function orderActions(o, big) {
  const b = (s, cls, ic, t) => `<button class="btn ${cls} btn-sm" data-act="order-status" data-id="${o.id}" data-s="${s}"><i class="fas ${ic}"></i> ${t}</button>`;
  let r = big ? '' : `<a class="btn btn-sky btn-sm" href="#/order/${o.id}"><i class="fas fa-eye"></i> View</a>`;
  if (o.status === 'pending') r += b('processing', 'btn-blue', 'fa-play', 'Process');
  if (o.status === 'processing') r += b('shipped', 'btn-blue', 'fa-truck', 'Ship');
  if (o.status === 'shipped') r += b('delivered', 'btn-green', 'fa-check', 'Delivered');
  if (['pending', 'processing'].includes(o.status)) r += b('cancelled', 'btn-red', 'fa-times', 'Cancel');
  return r;
}
function revenueMonths() {
  const out = [], now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1), y = d.getFullYear(), m = d.getMonth();
    const os = db.orders.filter(o => o.status !== 'cancelled' && new Date(o.date).getFullYear() === y && new Date(o.date).getMonth() === m);
    out.push({label: d.toLocaleDateString('en-US', {month: 'short'}), full: d.toLocaleDateString('en-US', {month: 'long', year: 'numeric'}), v: os.reduce((s, o) => s + o.total, 0), n: os.length});
  }
  return out;
}
function chart(data) {
  const mx = Math.max(...data.map(d => d.v), 1), step = Math.pow(10, Math.floor(Math.log10(mx))), top = Math.ceil(mx / step) * step;
  const k = v => v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'k' : v;
  return `<div class="chart" role="img" aria-label="Revenue per month, last six months">${[0, .5, 1].map(f => `<div class="grid" style="bottom:calc(28px + ${f} * (100% - 28px))"><span>${k(top * f)}</span></div>`).join('')}<div class="base"></div>
   ${data.map(d => `<div class="col" tabindex="0"><span class="tip">${d.full}: ${RM(d.v)} · ${d.n} order${d.n === 1 ? '' : 's'}</span><div class="bar" style="height:${(d.v / top * 100).toFixed(1)}%"></div><span class="lab">${d.label}</span></div>`).join('')}</div>`;
}
function pagePanel(role, tab, q) {
  const u = me(), isAdmin = role === 'admin', base = '#/' + role;
  const pending = db.orders.filter(o => o.status === 'pending').length, low = db.products.filter(p => p.stock <= 5).length;
  const tiPend = db.tradeins.filter(t => t.status === 'pending').length, tkOpen = db.tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
  const revenue = db.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString(), revToday = db.orders.filter(o => o.status !== 'cancelled' && new Date(o.date).toDateString() === today).reduce((s, o) => s + o.total, 0);
  const tabs = [['', 'fa-tachometer-alt', 'Dashboard'], isAdmin && ['stats', 'fa-chart-bar', 'Statistics'], isAdmin && ['users', 'fa-users', 'Users', db.users.length], ['products', 'fa-box', 'Products', low], ['orders', 'fa-shopping-bag', 'Orders', pending], ['tradeins', 'fa-exchange-alt', 'Trade-ins', tiPend], ['support', 'fa-headset', 'Support', tkOpen], ['promotions', 'fa-tags', 'Promotions']].filter(Boolean);
  let body;
  if (tab === 'stats' && isAdmin) {
    const months = revenueMonths(), sold = {};
    db.orders.filter(o => o.status !== 'cancelled').forEach(o => o.lines.forEach(l => { sold[l.pid] = sold[l.pid] || {q: 0, v: 0}; sold[l.pid].q += l.qty; sold[l.pid].v += l.qty * l.price; }));
    const top = Object.entries(sold).map(([pid, s]) => ({p: prod(pid), ...s})).filter(x => x.p).sort((a, b) => b.v - a.v).slice(0, 5), topMax = top.length ? top[0].v : 1;
    const byCat = SLOTS.map(k => ({k, v: Object.entries(sold).filter(([pid]) => prod(pid) && prod(pid).cat === k).reduce((s, [, x]) => s + x.v, 0)})).filter(x => x.v);
    body = `<h2 class="dash-title">Sales Statistics</h2><p class="dash-sub">Revenue from orders that were not cancelled. In the real app these come from MySQL views and Chart.js.</p>
     <div class="grid2"><div class="panel"><div class="panel-head"><div><h3>Revenue per month</h3><small>Last six months · hover a bar for the figure</small></div></div><div class="panel-body">${chart(months)}
      <details style="margin-top:14px"><summary style="cursor:pointer;color:var(--primary-blue);font-weight:600;font-size:.9rem">Show as a table</summary><table class="specs" style="margin-top:8px"><tbody>${months.map(m => `<tr><td>${m.full}</td><td>${RM(m.v)} (${m.n})</td></tr>`).join('')}</tbody></table></details></div></div>
      <div class="panel"><div class="panel-head"><div><h3>Top sellers</h3><small>By revenue</small></div></div><div class="panel-body">${top.map(x => `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:.92rem"><span>${h(x.p.name)}</span><b>${RM(x.v, 0)}</b></div><div class="meter" aria-hidden="true"><i style="width:${(x.v / topMax * 100).toFixed(1)}%"></i></div><small class="muted">${x.q} sold</small></div>`).join('')}</div></div></div>
     <div class="panel" style="margin-top:24px"><div class="panel-head"><h3>Sales by category</h3></div><div class="panel-body"><table class="specs"><tbody>${byCat.sort((a, b) => b.v - a.v).map(x => `<tr><td>${CAT_SHORT[x.k]}</td><td>${RM(x.v)}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (tab === 'users' && isAdmin) {
    body = `<div class="section-header" style="margin-bottom:20px"><div><h2 class="dash-title">Users</h2><p class="dash-sub" style="margin:4px 0 0">Customers register themselves; admins create staff accounts.</p></div><button class="btn btn-red" data-act="staff-new"><i class="fas fa-user-plus"></i> Create Staff</button></div>
     <div class="table-wrap"><table class="t"><thead><tr><th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th class="num">Orders</th><th>Joined</th></tr></thead><tbody>${db.users.map(x => `<tr><td>${x.id}</td><td><b>${h(x.username)}</b></td><td>${h(x.name)}</td><td>${h(x.email)}</td><td>${badge(x.role === 'admin' ? 'cancelled' : x.role === 'staff' ? 'in_progress' : 'delivered', x.role)}</td><td class="num">${db.orders.filter(o => o.uid === x.id).length}</td><td>${fd(x.created)}</td></tr>`).join('')}</tbody></table></div>`;
  } else if (tab === 'products') {
    body = `<div class="section-header" style="margin-bottom:20px"><div><h2 class="dash-title">Products</h2><p class="dash-sub" style="margin:4px 0 0">${db.products.length} products · ${low} at 5 or fewer in stock</p></div><button class="btn btn-blue" data-act="prod-edit" data-id="new"><i class="fas fa-plus"></i> Add Product</button></div>
     <div class="table-wrap"><table class="t"><thead><tr><th></th><th>Product</th><th>Category</th><th class="num">Price</th><th>Promotion</th><th class="num">Stock</th><th>Actions</th></tr></thead><tbody>${db.products.map(p => { const x = price(p); return `<tr><td>${p.img ? `<img class="thumb" src="img/${h(p.img)}.webp" alt="">` : `<span class="thumb" style="display:grid;place-items:center;color:var(--neutral-400)"><i class="fas ${ICON[p.cat]}"></i></span>`}</td><td><a href="#/product/${p.id}" style="font-weight:600;text-decoration:none">${h(p.name)}</a><br><small class="muted">${h(p.brand)} · ${p.warranty}-month warranty</small></td><td>${CAT_SHORT[p.cat]}</td><td class="num">${RM(p.price)}</td><td>${x.pct ? badge('accepted', x.pct + '% off') : '<span class="muted">–</span>'}</td><td class="num">${p.stock <= 5 ? `<b style="color:#dc2626"><i class="fas fa-exclamation-triangle"></i> ${p.stock}</b>` : p.stock}</td><td><div class="acts"><button class="btn btn-sky btn-sm" data-act="prod-edit" data-id="${p.id}"><i class="fas fa-edit"></i> Edit</button>${isAdmin ? `<button class="btn btn-red btn-sm" data-act="prod-del" data-id="${p.id}" aria-label="Delete ${h(p.name)}"><i class="fas fa-trash"></i></button>` : ''}</div></td></tr>`; }).join('')}</tbody></table></div>`;
  } else if (tab === 'orders') {
    const f = q.get('status') || '', list = db.orders.filter(o => !f || o.status === f).sort((a, b) => b.id - a.id);
    body = `<h2 class="dash-title">Order Management</h2><p class="dash-sub">Move each order along: process, ship, then mark it delivered. Delivered orders start the warranty.</p>
     <div class="toolbar"><label for="of"><i class="fas fa-filter"></i> Filter by Status:</label><select id="of" class="form-control" style="width:auto;min-height:40px;padding:6px 12px" data-change="order-filter"><option value="">All Orders (${db.orders.length})</option>${['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}"${f === s ? ' selected' : ''}>${label(s)} (${db.orders.filter(o => o.status === s).length})</option>`).join('')}</select></div>
     <div class="table-wrap"><table class="t"><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th class="num">Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${list.length ? list.map(o => { const c = user(o.uid); return `<tr><td><b>#${o.id}</b></td><td>${h(c ? c.username : '?')}<br><small class="muted">${h(c ? c.email : '')}</small></td><td>${fdt(o.date)}</td><td>${o.lines.reduce((s, l) => s + l.qty, 0)} items</td><td class="num"><b>${RM(o.total)}</b></td><td>${badge(o.status)}</td><td><div class="acts">${orderActions(o)}</div></td></tr>`; }).join('') : '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">No orders with this status.</td></tr>'}</tbody></table></div>`;
  } else if (tab === 'tradeins') {
    const f = q.get('status') || '', list = db.tradeins.filter(t => !f || t.status === f).sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.id - a.id);
    body = `<h2 class="dash-title">Trade-in Management</h2><p class="dash-sub">Review what customers sent in. Accept with an offer or decline with a reason; the customer sees it in their dashboard.</p>
     <div class="toolbar"><label for="tf"><i class="fas fa-filter"></i> Status:</label><select id="tf" class="form-control" style="width:auto;min-height:40px;padding:6px 12px" data-change="ti-filter"><option value="">All (${db.tradeins.length})</option>${['pending', 'accepted', 'rejected'].map(s => `<option value="${s}"${f === s ? ' selected' : ''}>${label(s)} (${db.tradeins.filter(t => t.status === s).length})</option>`).join('')}</select></div>${tradeinCards(list, true)}`;
  } else if (tab === 'support') {
    const list = db.tickets.slice().sort((a, b) => (['resolved', 'closed'].includes(a.status) ? 1 : 0) - (['resolved', 'closed'].includes(b.status) ? 1 : 0) || b.id - a.id);
    body = `<h2 class="dash-title">Support Tickets</h2><p class="dash-sub">Every customer ticket, open ones first. The warranty status is worked out from the order.</p>${list.map(t => ticketCard(t, true)).join('') || '<p class="muted">No tickets.</p>'}`;
  } else if (tab === 'promotions') {
    body = `<h2 class="dash-title">Manage Promotions</h2><p class="dash-sub">A promotion takes a percentage off one product. It shows on the storefront, the promotions page, the cart and the PC builder straight away.</p>
     <div class="grid2" style="align-items:start"><form class="panel" data-form="promo" novalidate><div class="panel-head"><h3><i class="fas fa-plus-circle"></i> Add New Promotion</h3></div><div class="panel-body">
      <div class="form-group"><label class="form-label" for="pm-p">Select Product</label><select id="pm-p" name="pid" class="form-control" required><option value="">-- Select Product --</option>${db.products.filter(p => !promoFor(p.id)).map(p => `<option value="${p.id}">${h(p.name)} (${RM(p.price)})</option>`).join('')}</select></div>
      <div class="grid2" style="gap:0 16px"><div class="form-group"><label class="form-label" for="pm-x">Discount %</label><input id="pm-x" name="pct" type="number" min="1" max="90" class="form-control" placeholder="e.g. 20" required></div><div class="form-group"><label class="form-label" for="pm-n">Promotion name</label><input id="pm-n" name="name" class="form-control" placeholder="e.g. Year-end sale" required maxlength="40"></div></div>
      <div class="form-group"><label class="form-label" for="pm-d">Description (optional)</label><textarea id="pm-d" name="desc" class="form-control" style="min-height:70px" maxlength="200"></textarea></div><div class="err" id="pmErr" role="alert"></div>
      <button class="btn btn-blue" type="submit"><i class="fas fa-plus"></i> Add Promotion</button></div></form>
      <div class="panel"><div class="panel-head"><h3><i class="fas fa-list"></i> Current Promotions</h3></div><div class="panel-body">${db.promos.length ? db.promos.map(x => { const p = prod(x.pid); if (!p) return ''; return `<div class="kv" style="align-items:center"><div><b>${h(x.name)}</b> ${badge(x.active ? 'delivered' : 'closed', x.active ? 'Active' : 'Paused')}<br><small class="muted">${h(p.name)}: ${RM(p.price)} → ${RM(Math.round(p.price * (100 - x.pct)) / 100)}</small></div><div class="acts" style="display:flex;gap:6px;align-items:center"><span class="product-badge" style="position:static">${x.pct}% OFF</span><button class="btn btn-ghost btn-sm" data-act="promo-toggle" data-id="${x.id}">${x.active ? 'Pause' : 'Resume'}</button><button class="btn btn-red btn-sm" data-act="promo-del" data-id="${x.id}" aria-label="Delete ${h(x.name)}"><i class="fas fa-trash"></i></button></div></div>`; }).join('') : '<p class="muted">No promotions.</p>'}</div></div></div>`;
  } else {
    const n = (cls, ic, t) => `<div class="n ${cls}"><i class="fas ${ic}"></i> ${t}</div>`;
    const recent = db.orders.slice().sort((a, b) => b.id - a.id).slice(0, 6), lows = db.products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
    body = `<h2 class="dash-title">${isAdmin ? 'Dashboard Overview' : 'Staff Dashboard Overview'}</h2><p class="dash-sub">${isAdmin ? "Monitor your store's performance and key metrics" : 'Monitor daily operations and help customers'}</p>
     <div class="stats">${isAdmin ? stat(db.users.filter(x => x.role === 'customer').length, 'Customers', 'fa-users', 'bg-blue', n('mute', 'fa-user-friends', db.users.length + ' accounts in total'), base + '/users') : ''}
      ${stat(db.products.length, isAdmin ? 'Products' : 'Total Products', 'fa-box', isAdmin ? 'bg-green' : 'bg-blue', low ? n('warn', 'fa-exclamation-triangle', low + ' Low Stock') : n('ok', 'fa-check-circle', 'Stock OK'), base + '/products')}
      ${stat(db.orders.length, 'Total Orders', 'fa-shopping-bag', isAdmin ? 'bg-purple' : 'bg-green', pending ? n('warn', 'fa-clock', pending + ' Pending') : n('ok', 'fa-check-circle', 'None pending'), base + '/orders' + (pending ? '?status=pending' : ''))}
      ${isAdmin ? stat(RM(revenue, 0), 'Total Revenue', 'fa-chart-line', 'bg-red', n('mute', 'fa-calendar', 'Today: ' + RM(revToday, 0)), base + '/stats') : ''}
      ${stat(db.tradeins.length, 'Trade-in Requests', 'fa-exchange-alt', 'bg-orange', tiPend ? n('warn', 'fa-hourglass-half', tiPend + ' to review') : n('ok', 'fa-check-circle', 'All Reviewed'), base + '/tradeins')}
      ${stat(db.tickets.length, 'Support Tickets', 'fa-headset', isAdmin ? 'bg-orange' : 'bg-purple', tkOpen ? n('warn', 'fa-envelope-open', tkOpen + ' open') : n('ok', 'fa-check-circle', 'Under Control'), base + '/support')}
      ${!isAdmin ? stat(db.promos.filter(x => x.active).length, 'Active Promotions', 'fa-tags', 'bg-teal', n('mute', 'fa-percent', 'Total: ' + db.promos.length), base + '/promotions') : ''}</div>
     <div class="grid2 dash-grid"><div class="panel"><div class="panel-head"><div><h3>Recent Orders</h3><small>Process them from here</small></div><a class="btn btn-ghost btn-sm" href="${base}/orders"><i class="fas fa-list"></i> View All</a></div><div class="table-wrap" style="border:0;border-radius:0 0 12px 12px"><table class="t"><thead><tr><th>Order</th><th>Customer</th><th class="num">Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${recent.map(o => `<tr><td><b>#${o.id}</b><br><small class="muted">${fd(o.date)}</small></td><td>${h(user(o.uid) ? user(o.uid).username : '?')}</td><td class="num">${RM(o.total)}</td><td>${badge(o.status)}</td><td><div class="acts">${orderActions(o)}</div></td></tr>`).join('')}</tbody></table></div></div>
      <div class="panel"><div class="panel-head"><div><h3>Low Stock</h3><small>5 or fewer left</small></div><a class="btn btn-ghost btn-sm" href="${base}/products"><i class="fas fa-cog"></i> Manage</a></div><div class="panel-body">${lows.length ? lows.map(p => `<div class="kv"><span>${h(p.name)}</span><b style="color:${p.stock ? '#ea580c' : '#dc2626'}">${p.stock ? p.stock + ' left' : 'Out'}</b></div>`).join('') : '<p class="muted">All products are well stocked.</p>'}</div></div></div>`;
  }
  const hero = isAdmin ? `<section class="hero admin"><div class="hero-container"><div class="hero-content"><h1>Admin Dashboard</h1><p>Welcome back, ${h(u.username)}! Manage your store with full administrative tools and insights.</p><div class="hero-buttons"><button class="btn btn-primary" style="color:#dc2626" data-act="prod-edit" data-id="new"><i class="fas fa-plus"></i> Add Product</button><button class="btn btn-secondary" data-act="staff-new"><i class="fas fa-user-plus"></i> Create Staff</button></div></div></div></section>`
    : `<section class="hero staff"><div class="hero-container"><div class="hero-content"><h1>Staff Dashboard</h1><p>Welcome back, ${h(u.username)}! Ready to help customers and run today's operations.</p><div class="hero-buttons"><button class="btn btn-primary" data-act="prod-edit" data-id="new"><i class="fas fa-plus"></i> Add Product</button><a class="btn btn-secondary" href="${base}/support"><i class="fas fa-headset"></i> Support Center</a></div></div></div></section>`;
  return panelLayout(role, hero + `<nav class="dash-tabs" aria-label="${isAdmin ? 'Admin' : 'Staff'} sections"><div class="in">${tabs.map(([k, i, t, c]) => `<a href="${base}${k ? '/' + k : ''}"${(tab || '') === k ? ' class="active" aria-current="page"' : ''}><i class="fas ${i}"></i> ${t}${c ? ` <span class="count">${c}</span>` : ''}</a>`).join('')}</div></nav><div class="container">${flash()}${body}</div>`);
}

const notFound = () => `<div class="container"><div class="empty-state"><i class="fas fa-question-circle"></i><h3>Page not found</h3><p>That page doesn't exist in this demo.</p><a href="#/" class="btn btn-blue">Go to the store</a></div></div>`;

/* ---------- router ---------- */
function parse() { const raw = decodeURI(location.hash.slice(1)).split('#')[0] || '/', i = raw.indexOf('?'); const path = i < 0 ? raw : raw.slice(0, i); return {parts: path.split('/').filter(Boolean), q: new URLSearchParams(i < 0 ? '' : raw.slice(i + 1))}; }
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function need(roles) {
  const u = me();
  if (!u) { db.flash = ['info', 'Please sign in first. Use a demo account below.']; go('#/login?next=' + encodeURIComponent(location.hash)); return false; }
  if (roles && !roles.includes(u.role)) { db.flash = ['info', 'That page is for ' + roles.join(' or ') + ' accounts. Use the bar at the top to switch.']; go(homeFor(u)); return false; }
  return true;
}
function route(a, b, c, q) {
  switch (a || '') {
    case '': return pageHome(q);
    case 'product': return pageProduct(b);
    case 'promotions': return pagePromotions();
    case 'compare': return pageCompare();
    case 'build': return pageBuild();
    case 'cart': return need(['customer']) ? pageCart() : null;
    case 'checkout': return need(['customer']) ? pageCheckout(q) : null;
    case 'order': return need() ? pageOrder(b, q) : null;
    case 'login': if (me()) { go(homeFor(me())); return null; } return pageLogin(q);
    case 'register': if (me()) { go(homeFor(me())); return null; } return pageRegister();
    case 'account': return need(['customer']) ? pageAccount(b) : null;
    case 'tradein': return need(['customer']) ? pageTradeinNew() : null;
    case 'support': if (!need()) return null; if (b === 'new') return me().role === 'customer' ? pageTicketNew(q) : (go(homeFor(me()) + '/support'), null); return b ? pageTicket(b) : pageSupport();
    case 'admin': return need(['admin']) ? pagePanel('admin', b, q) : null;
    case 'staff': return need(['staff', 'admin']) ? pagePanel(me().role === 'admin' ? 'staff' : 'staff', b, q) : null;
    default: return store('', notFound());
  }
}
let lastPath = '';
function render() {
  const r = parse(), html = route(r.parts[0], r.parts[1], r.parts[2], r.q);
  if (html == null) return;
  app.innerHTML = html;
  renderRoles();
  const path = r.parts.join('/');
  const titles = {'': 'Store', product: 'Product', promotions: 'Promotions', compare: 'Compare', build: 'PC Builder', cart: 'Cart', checkout: 'Checkout', order: 'Order', login: 'Sign in', register: 'Register', account: 'My dashboard', tradein: 'Trade-in', support: 'Support', admin: 'Admin', staff: 'Staff'};
  document.title = (titles[r.parts[0] || ''] || 'Darnoc IT') + ' · Darnoc IT demo';
  const anchor = location.hash.includes('#reply') ? document.getElementById('reply') : null;
  if (anchor) anchor.scrollIntoView({block: 'center'});
  else if (r.q.get('shop') || (r.parts.length === 0 && (r.q.get('q') !== null || r.q.get('cat') !== null || r.q.get('sort') !== null))) { const el = document.getElementById('products'); if (el) el.scrollIntoView({block: 'start'}); }
  else if (path !== lastPath || r.q.get('new')) scrollTo(0, 0);
  lastPath = path;
  save();
}
function renderRoles() {
  const u = me(), cur = u ? u.role : 'guest';
  document.getElementById('roleSwitch').innerHTML = `<span>View as:</span>${[['guest', 'Guest'], ['customer', 'Customer'], ['staff', 'Staff'], ['admin', 'Admin']].map(([r, t]) => `<button type="button" data-act="role" data-r="${r}" aria-pressed="${cur === r}">${t}</button>`).join('')}<button type="button" data-act="reset" title="Put all the made-up data back"><i class="fas fa-undo"></i> Reset demo</button>`;
}
addEventListener('hashchange', render);

/* ---------- actions ---------- */
function addToCart(pid, qty) {
  const p = prod(pid), c = cart(), line = c.find(l => l.pid === p.id), have = line ? line.qty : 0;
  if (have + qty > p.stock) { toast(`Only ${p.stock} in stock${have ? ` and ${have} already in your cart` : ''}.`, 'fa-exclamation-triangle'); return false; }
  if (line) line.qty += qty; else c.push({pid: p.id, qty});
  return true;
}
function setRole(r, next) {
  const map = {customer: 'aina', staff: 'staff', admin: 'admin'};
  db.session = r === 'guest' ? null : db.users.find(u => u.username === map[r]).id;
  const u = me();
  toast(u ? `Signed in as ${u.username} (${u.role})` : 'Signed out. You are browsing as a guest.', u ? 'fa-user-check' : 'fa-sign-out-alt');
  go(next && u ? next : homeFor(u));
}
const actions = {
  'close-modal': () => modal.close(),
  logout: () => setRole('guest'),
  role: el => { modal.open && modal.close(); setRole(el.dataset.r, el.dataset.next); },
  reset: () => { const s = db.session; db = seed(); db.session = s && db.users.some(u => u.id === s) ? s : null; save(); toast('Demo data reset', 'fa-undo'); go(homeFor(me())); render(); },
  'to-products': (el, e) => { e.preventDefault(); const p = document.getElementById('products'); if (p) p.scrollIntoView({behavior: 'smooth'}); },
  add: el => { const qty = el.dataset.qty ? Math.max(1, +document.querySelector(el.dataset.qty).value || 1) : 1; if (addToCart(+el.dataset.id, qty)) { save(); toast(`${prod(el.dataset.id).name} added to cart`); const y = scrollY; render(); scrollTo(0, y); } },
  buy: el => { const qty = el.dataset.qty ? Math.max(1, +document.querySelector(el.dataset.qty).value || 1) : 1; if (qty > prod(el.dataset.id).stock) return toast('Not enough stock', 'fa-exclamation-triangle'); go(`#/checkout?buy=${el.dataset.id}&qty=${qty}`); },
  cmp: el => { const id = +el.dataset.id, i = db.compare.indexOf(id); if (i >= 0) { db.compare.splice(i, 1); toast('Removed from compare'); } else { db.compare.push(id); if (db.compare.length > 2) db.compare.shift(); toast(db.compare.length === 2 ? 'Ready to compare: open Compare' : 'Added. Pick one more to compare'); } const y = scrollY; render(); scrollTo(0, y); },
  pdq: el => { const i = document.getElementById('pdq'); i.value = Math.min(+i.max, Math.max(1, (+i.value || 1) + +el.dataset.d)); },
  qty: el => { const l = cart().find(x => x.pid === +el.dataset.id), p = prod(l.pid), n = l.qty + +el.dataset.d; if (n > p.stock) return toast(`Only ${p.stock} in stock`, 'fa-exclamation-triangle'); if (n < 1) return; l.qty = n; render(); },
  rm: el => { db.carts[db.session] = cart().filter(x => x.pid !== +el.dataset.id); toast('Removed from cart'); render(); },
  pick: el => { const k = el.dataset.slot, id = +el.dataset.id; db.build[k] = db.build[k] === id ? undefined : id; const y = scrollY; render(); scrollTo(0, y); },
  'build-clear': () => { db.build = {}; render(); },
  'build-cart': () => { const parts = SLOTS.map(k => prod(db.build[k])).filter(Boolean); for (const p of parts) if (!addToCart(p.id, 1)) return; db.build = {}; db.flash = ['success', `Your build (${parts.length} parts) is in the cart.`]; go('#/cart'); },
  'order-status': el => {
    const o = db.orders.find(x => x.id === +el.dataset.id), s = el.dataset.s, u = me();
    if (s === 'cancelled') {
      openModal(`Cancel order #${o.id}?`, `<div class="mb"><p>The ${o.lines.reduce((a, l) => a + l.qty, 0)} item(s) go back into stock. This can't be undone.</p></div>`, `<div class="mf"><button class="btn btn-ghost btn-sm" data-act="close-modal">Keep order</button><button class="btn btn-red btn-sm" data-act="order-cancel-yes" data-id="${o.id}">Cancel order</button></div>`); return;
    }
    o.status = s; o.hist.push({status: s, date: nowIso(), by: u.username});
    toast(`Order #${o.id} is now ${label(s).toLowerCase()}`); render();
  },
  'order-cancel-yes': el => { const o = db.orders.find(x => x.id === +el.dataset.id); o.status = 'cancelled'; o.hist.push({status: 'cancelled', date: nowIso(), by: me().username}); o.lines.forEach(l => { const p = prod(l.pid); if (p) p.stock += l.qty; }); modal.close(); toast(`Order #${o.id} cancelled; stock returned`); render(); },
  'ti-decide': el => {
    const t = db.tradeins.find(x => x.id === +el.dataset.id), acc = el.dataset.s === 'accepted';
    openModal(acc ? `Accept "${h(t.name)}"` : `Decline "${h(t.name)}"`, `<form data-form="ti-decide" data-id="${t.id}" data-s="${el.dataset.s}" novalidate><div class="mb">${acc ? `<div class="form-group"><label class="form-label" for="tio">Offer (RM)</label><input id="tio" name="offer" type="number" min="1" step="1" class="form-control" required placeholder="e.g. 500"></div>` : ''}<div class="form-group"><label class="form-label" for="tin">${acc ? 'Note to the customer (optional)' : 'Reason'}</label><textarea id="tin" name="note" class="form-control" style="min-height:80px" ${acc ? '' : 'required'} maxlength="300"></textarea></div><div class="err" id="tidErr" role="alert"></div></div><div class="mf"><button type="button" class="btn btn-ghost btn-sm" data-act="close-modal">Back</button><button class="btn ${acc ? 'btn-green' : 'btn-red'} btn-sm" type="submit">${acc ? 'Send offer' : 'Decline'}</button></div></form>`);
  },
  'prod-edit': el => {
    const p = el.dataset.id === 'new' ? null : prod(el.dataset.id), v = (k, d = '') => h(p ? p[k] : d);
    const f = (n, l, val, ex = '') => `<div class="form-group"><label class="form-label" for="pf-${n}">${l}</label><input id="pf-${n}" name="${n}" class="form-control" value="${val}" required ${ex}></div>`;
    openModal(p ? 'Edit Product' : 'Add Product', `<form data-form="product" data-id="${p ? p.id : ''}" novalidate><div class="mb">${f('name', 'Product name', v('name'), 'maxlength="80"')}<div class="grid2" style="gap:0 16px"><div class="form-group"><label class="form-label" for="pf-cat">Category</label><select id="pf-cat" name="cat" class="form-control">${SLOTS.map(k => `<option value="${k}"${p && p.cat === k ? ' selected' : ''}>${CAT_SHORT[k]}</option>`).join('')}</select></div>${f('brand', 'Brand', v('brand'), 'maxlength="30"')}${f('price', 'Price (RM)', v('price'), 'type="number" min="1" step="0.01"')}${f('stock', 'Stock', v('stock', '10'), 'type="number" min="0" step="1"')}${f('warranty', 'Warranty (months)', v('warranty', '12'), 'type="number" min="0" step="1"')}</div><div class="form-group"><label class="form-label" for="pf-desc">Description</label><textarea id="pf-desc" name="desc" class="form-control" style="min-height:80px" maxlength="400">${v('desc')}</textarea></div>${p && (p.cat === 'CPU' || p.cat === 'MOTHERBOARD') ? `<p class="hint">Socket: ${h(p.socket)} (used by the PC builder's check)</p>` : ''}<div class="err" id="pfErr" role="alert"></div></div><div class="mf"><button type="button" class="btn btn-ghost btn-sm" data-act="close-modal">Cancel</button><button class="btn btn-blue btn-sm" type="submit"><i class="fas fa-save"></i> ${p ? 'Save Changes' : 'Add Product'}</button></div></form>`);
  },
  'prod-del': el => { const p = prod(el.dataset.id); openModal('Delete product?', `<div class="mb"><p>Remove <b>${h(p.name)}</b> from the store? Past orders keep their copy of the name and price.</p></div>`, `<div class="mf"><button class="btn btn-ghost btn-sm" data-act="close-modal">Cancel</button><button class="btn btn-red btn-sm" data-act="prod-del-yes" data-id="${p.id}">Delete</button></div>`); },
  'prod-del-yes': el => { const id = +el.dataset.id; db.products = db.products.filter(p => p.id !== id); db.promos = db.promos.filter(x => x.pid !== id); Object.values(db.carts).forEach(c => c.splice(0, c.length, ...c.filter(l => l.pid !== id))); Object.keys(db.build).forEach(k => { if (db.build[k] === id) delete db.build[k]; }); db.compare = db.compare.filter(x => x !== id); modal.close(); toast('Product deleted'); render(); },
  'promo-toggle': el => { const x = db.promos.find(p => p.id === +el.dataset.id); x.active = !x.active; toast(x.active ? 'Promotion resumed' : 'Promotion paused'); render(); },
  'promo-del': el => { db.promos = db.promos.filter(p => p.id !== +el.dataset.id); toast('Promotion deleted'); render(); },
  'staff-new': () => openModal('Create Staff Account', `<form data-form="staff" novalidate><div class="mb"><div class="form-group"><label class="form-label" for="sf-u">Username</label><input id="sf-u" name="username" class="form-control" required maxlength="20"></div><div class="form-group"><label class="form-label" for="sf-n">Full name</label><input id="sf-n" name="name" class="form-control" required></div><div class="form-group"><label class="form-label" for="sf-e">Email</label><input id="sf-e" name="email" type="email" class="form-control" required></div><p class="hint">The new account's password is <b>demo</b>.</p><div class="err" id="sfErr" role="alert"></div></div><div class="mf"><button type="button" class="btn btn-ghost btn-sm" data-act="close-modal">Cancel</button><button class="btn btn-red btn-sm" type="submit"><i class="fas fa-user-plus"></i> Create Staff</button></div></form>`),
  'tk-close': el => { const t = db.tickets.find(x => x.id === +el.dataset.id); t.status = 'resolved'; db.flash = ['success', 'Ticket marked as resolved.']; render(); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = actions[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A' && el.dataset.act !== 'to-products') e.preventDefault();
  fn(el, e); save();
});

/* ---------- forms ---------- */
const err = (id, m) => { const x = document.getElementById(id); if (x) x.textContent = m; return false; };
const nameOk = s => /^[a-z0-9_.]{3,20}$/i.test(s);
const forms = {
  search: (f, d) => { const p = new URLSearchParams(); ['q', 'cat', 'sort'].forEach(k => p.set(k, (d.get(k) || '').trim())); go('#/?' + p.toString()); },
  login: (f, d) => {
    const u = db.users.find(x => x.username.toLowerCase() === String(d.get('u')).trim().toLowerCase());
    if (!u || d.get('p') !== (u.pw || 'demo')) return err('lgErr', 'Wrong username or password. Try a demo account above (password: demo).');
    db.session = u.id; toast(`Welcome back, ${u.username}!`, 'fa-user-check'); go(f.dataset.next || homeFor(u));
  },
  register: (f, d) => {
    const g = k => String(d.get(k) || '').trim(), un = g('username');
    if (!nameOk(un)) return err('rgErr', 'Username: 3 to 20 letters, numbers, dots or underscores.');
    if (db.users.some(x => x.username.toLowerCase() === un.toLowerCase())) return err('rgErr', 'That username is taken.');
    if (!g('name') || !/^\S+@\S+\.\S+$/.test(g('email'))) return err('rgErr', 'Please enter your name and a valid email.');
    if (g('p').length < 4) return err('rgErr', 'Password needs at least 4 characters.');
    if (g('p') !== g('p2')) return err('rgErr', "The passwords don't match.");
    const u = {id: db.next.user++, username: un, role: 'customer', name: g('name'), email: g('email'), phone: g('phone'), pw: g('p'), address: '', city: '', postcode: '', state: 'Melaka', created: nowIso()};
    db.users.push(u); db.session = u.id; db.flash = ['success', 'Account created. Welcome to Darnoc IT!']; go('#/account');
  },
  review: (f, d) => { const t = String(d.get('text') || '').trim(); if (!t) return; db.reviews.push({pid: +f.dataset.id, uid: db.session, rating: +d.get('rating'), text: t, date: nowIso()}); db.flash = ['success', 'Thanks! Your review is posted.']; render(); },
  checkout: (f, d) => {
    const g = k => String(d.get(k) || '').trim(), pay = g('pay');
    for (const k of ['name', 'phone', 'address', 'city', 'postcode', 'state']) if (!g(k)) return err('coErr', 'Please fill in every shipping field.');
    if (!/^\d{5}$/.test(g('postcode'))) return err('coErr', 'Postcode should be 5 digits.');
    if (pay === 'Credit / debit card') { if (!/^\d{16}$/.test(g('card').replace(/\s/g, '')) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(g('exp')) || !/^\d{3,4}$/.test(g('cvv'))) return err('coErr', 'Check the card details (16 digits, MM/YY, 3-digit CVV).'); }
    const buy = f.dataset.buy, src = buy ? [{pid: +buy, qty: +f.dataset.qty || 1}] : cart();
    const lines = src.map(l => ({...l, p: prod(l.pid)})).filter(l => l.p);
    for (const l of lines) if (l.qty > l.p.stock) return err('coErr', `Only ${l.p.stock} of ${l.p.name} left. Update your cart.`);
    const t = totals(lines), u = me(), o = {id: db.next.order++, uid: u.id, date: nowIso(), lines: lines.map(l => ({pid: l.p.id, qty: l.qty, price: price(l.p).fin, name: l.p.name})), sub: t.sub, ship: t.ship, total: t.total, status: 'pending', pay,
      addr: {name: g('name'), phone: g('phone'), address: g('address'), city: g('city'), postcode: g('postcode'), state: g('state')}, hist: [{status: 'pending', date: nowIso(), by: u.username}]};
    lines.forEach(l => { l.p.stock -= l.qty; });
    db.orders.push(o); if (!buy) db.carts[u.id] = [];
    go(`#/order/${o.id}?new=1`);
  },
  profile: (f, d) => { const u = me(); ['name', 'email', 'phone', 'state', 'address', 'city', 'postcode'].forEach(k => { u[k] = String(d.get(k) || '').trim(); }); db.flash = ['success', 'Your details are saved.']; render(); },
  tradein: (f, d) => {
    const g = k => String(d.get(k) || '').trim();
    if (!g('name')) return err('tiErr', 'Please enter the item name or model.');
    const specs = {Manufacturer: g('man')}; specs[g('cat') === 'CPU' ? 'Cores' : 'Memory'] = g('mem'); specs['Clock speed'] = g('clock');
    db.tradeins.push({id: db.next.ti++, uid: db.session, name: g('name'), cat: g('cat'), cond: g('cond'), months: Math.max(0, +g('months') || 0), desc: g('desc'), specs, img: forms._photo || null, date: nowIso(), status: 'pending'});
    forms._photo = null; db.flash = ['success', 'Trade-in sent. Staff will review it; switch to Staff or Admin in the top bar to try that side.']; go('#/account/tradeins');
  },
  'ticket-new': (f, d) => {
    const g = k => String(d.get(k) || '').trim(); if (!g('subject') || !g('desc')) return err('tkErr', 'Please add a subject and describe the problem.');
    const [oid, pid] = g('line').split(':').map(Number), t = {id: db.next.ticket++, uid: db.session, pid, oid, subject: g('subject'), cat: g('cat'), pri: g('pri'), status: 'open', date: nowIso(), assigned: null, desc: g('desc'), replies: []};
    db.tickets.push(t); db.flash = ['success', `Ticket #${t.id} opened. Staff can answer it from their dashboard.`]; go('#/support/' + t.id);
  },
  'ticket-reply': (f, d) => {
    const t = db.tickets.find(x => x.id === +f.dataset.id), u = me(), text = String(d.get('text') || '').trim(); if (!text) return;
    t.replies.push({by: u.username, role: u.role, date: nowIso(), text});
    if (u.role === 'customer') { if (['waiting_customer', 'resolved'].includes(t.status)) t.status = 'open'; } else { t.status = 'waiting_customer'; t.assigned = u.username; }
    db.flash = ['success', 'Response sent.']; render();
  },
  'ti-decide': (f, d) => {
    const t = db.tradeins.find(x => x.id === +f.dataset.id), acc = f.dataset.s === 'accepted', offer = +d.get('offer'), note = String(d.get('note') || '').trim();
    if (acc && !(offer > 0)) return err('tidErr', 'Enter an offer in RM.');
    if (!acc && !note) return err('tidErr', 'Tell the customer why.');
    Object.assign(t, {status: f.dataset.s, offer: acc ? offer : undefined, note, by: me().username, decided: nowIso()});
    modal.close(); toast(acc ? `Offer of ${RM(offer)} sent` : 'Trade-in declined'); render();
  },
  product: (f, d) => {
    const g = k => String(d.get(k) || '').trim(), pr = +g('price'), st = +g('stock'), wa = +g('warranty');
    if (!g('name') || !g('brand')) return err('pfErr', 'Name and brand are needed.');
    if (!(pr > 0) || !(st >= 0) || !Number.isInteger(st) || !(wa >= 0)) return err('pfErr', 'Price must be above 0; stock and warranty whole numbers.');
    let p = f.dataset.id ? prod(f.dataset.id) : null;
    if (!p) { p = {id: db.next.product++, img: null, specs: {}, socket: 'LGA1700', tdp: 65, power: 150, watts: 750}; db.products.push(p); }
    Object.assign(p, {name: g('name'), cat: g('cat'), brand: g('brand'), price: Math.round(pr * 100) / 100, stock: st, warranty: wa, desc: g('desc') || 'New product.'});
    modal.close(); toast(f.dataset.id ? 'Product saved' : 'Product added to the store'); render();
  },
  promo: (f, d) => {
    const pid = +d.get('pid'), pct = +d.get('pct'), name = String(d.get('name') || '').trim();
    if (!pid) return err('pmErr', 'Pick a product.'); if (!(pct >= 1 && pct <= 90)) return err('pmErr', 'Discount must be 1 to 90%.'); if (!name) return err('pmErr', 'Give the promotion a name.');
    db.promos.push({id: db.next.promo++, pid, pct, name, desc: String(d.get('desc') || '').trim(), active: true, start: nowIso()});
    db.flash = ['success', `${name} is live: ${pct}% off ${prod(pid).name}.`]; render();
  },
  staff: (f, d) => {
    const g = k => String(d.get(k) || '').trim();
    if (!nameOk(g('username'))) return err('sfErr', 'Username: 3 to 20 letters, numbers, dots or underscores.');
    if (db.users.some(x => x.username.toLowerCase() === g('username').toLowerCase())) return err('sfErr', 'That username is taken.');
    if (!g('name') || !/^\S+@\S+\.\S+$/.test(g('email'))) return err('sfErr', 'Name and a valid email, please.');
    db.users.push({id: db.next.user++, username: g('username'), role: 'staff', name: g('name'), email: g('email'), phone: '', created: nowIso()});
    modal.close(); toast(`Staff account "${g('username')}" created`); go('#/admin/users');
  }
};
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  forms[f.dataset.form](f, new FormData(f)); save();
});
document.addEventListener('change', e => {
  const el = e.target, k = el.dataset.change; if (!k) return;
  if (k === 'cmp') { const v = +el.value; db.compare[+el.dataset.n] = v || undefined; db.compare = db.compare.slice(0, 2); if (!v) db.compare = db.compare.filter(Boolean); render(); }
  else if (k === 'order-filter') go(location.hash.split('?')[0] + (el.value ? '?status=' + el.value : ''));
  else if (k === 'ti-filter') go(location.hash.split('?')[0] + (el.value ? '?status=' + el.value : ''));
  else if (k === 'tk-status') { const t = db.tickets.find(x => x.id === +el.dataset.id); t.status = el.value; if (!t.assigned) t.assigned = me().username; toast('Status: ' + label(el.value)); render(); }
  else if (k === 'pay') { const b = document.getElementById('cardBox'); if (b) b.hidden = el.value !== 'Credit / debit card'; }
  else if (k === 'tk-prod') showWarranty();
  else if (k === 'ti-photo') {
    const file = el.files && el.files[0]; if (!file) return;
    const im = new Image(), url = URL.createObjectURL(file);
    im.onload = () => { const c = document.createElement('canvas'), s = Math.min(1, 360 / Math.max(im.width, im.height)); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); forms._photo = c.toDataURL('image/jpeg', .75); URL.revokeObjectURL(url); document.getElementById('tiPrev').innerHTML = `<img src="${forms._photo}" alt="Your photo" style="max-height:160px;border-radius:10px;margin:-6px 0 18px">`; };
    im.onerror = () => toast("That file couldn't be read as an image", 'fa-exclamation-triangle');
    im.src = url;
  }
  save();
});
function showWarranty() {
  const s = document.getElementById('tk-p'), box = document.getElementById('tkW'); if (!s || !box) return;
  const [oid, pid] = s.value.split(':').map(Number), w = warranty(db.orders.find(o => o.id === oid), prod(pid));
  box.innerHTML = w.state === 'valid' ? `<span class="status st-valid">Warranty valid until ${fd(w.exp)}</span>` : `<span class="status st-expired">Warranty expired on ${fd(w.exp)}</span> <span class="hint">You can still ask for paid repair.</span>`;
}
const obs = new MutationObserver(() => showWarranty()); obs.observe(app, {childList: true});

render();
})();
