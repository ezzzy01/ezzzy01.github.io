/* Riing Catering, in-browser demo.
   A copy of the PHP/MySQL site's pages and flows, rebuilt in plain JavaScript so it runs on GitHub Pages.
   All data is made up. It lives in memory (and in sessionStorage for this tab only, when allowed). */
(() => {
'use strict';
const KEY = 'riing-demo-v1';

/* ---------- made-up data ---------- */
const TEAM = [
  {me: true, photo: 'img/hakim.webp', name: 'IDHAM HAKIM BIN MOHAMAD NIZAM', roles: ['Food and Beverage Server', 'Cleaner Supervisor']},
  {roles: ['CEO RIING Catering', 'CFO RIING Catering']},
  {roles: ['Catering Manager RIING Catering', 'Supervisor']},
  {roles: ['Event Coordinator', 'Ambassador']}
];

const MENU = {
  'Starters': [['Bruschetta', '5.99', 'bruschetta'], ['Garlic Bread', '3.99', 'garlicbread'], ['Soup of the Day', '4.99', 'soup']],
  'Main Courses': [['Grilled Salmon', '15.99', 'salmon'], ['Chicken Alfredo', '13.99', 'chicken'], ['Vegetable Stir Fry', '12.99', 'vegetable']],
  'Desserts': [['Tiramisu', '6.99', 'tiramisu'], ['Cheesecake', '6.99', 'cheesecake'], ['Chocolate Brownie', '5.99', 'brownie']],
  'Beverages': [['Lemon Tea', '1.99', 'teh'], ['Guava', '1.99', 'sirap'], ['Coffee', '1.99', 'kopi']]
};

const OCCASIONS = ['Birthday Party', 'Anniversary Celebration', 'Wedding Reception', 'Holiday Party', 'Graduation Ceremony', 'Baby Shower', 'Family Reunion'];
const LOCATIONS = ['Kuala Lumpur', 'Selangor'];

// [occasion, date, time, address, location, budget, pax, person, phone, company, email, request, promo, subscribe]
const SEED = [
  ['Wedding Reception', '2026-12-12', '19:30', 'Dewan Seri Melati, Jalan Ampang, 50450 Kuala Lumpur', 'Kuala Lumpur', '45', '300', 'Aisyah Rahman', '012-345 0101', 'Melati Events', 'aisyah.r@example.com', 'Two vegetarian tables, please.', 'WED10', '1'],
  ['Birthday Party', '2026-12-05', '13:00', '12 Jalan SS2/24, 47300 Petaling Jaya', 'Selangor', '25', '40', 'Daniel Lim', '012-345 0102', 'Lim Family', 'daniel.lim@example.com', 'A small cake table near the door.', '', '0'],
  ['Graduation Ceremony', '2026-12-19', '10:00', 'Block C Hall, Jalan Universiti, 43600 Bangi', 'Selangor', '20', '150', 'Priya Nair', '012-345 0103', 'Bangi Student Council', 'priya.n@example.com', '', 'GRAD5', '1'],
  ['Family Reunion', '2027-01-02', '12:30', '8 Lorong Bukit Pantai, 59100 Kuala Lumpur', 'Kuala Lumpur', '30', '60', 'Faiz Kamal', '012-345 0104', 'Kamal Family', 'faiz.kamal@example.com', 'Less spicy food for the elderly guests.', '', '0'],
  ['Anniversary Celebration', '2026-12-27', '20:00', 'Rooftop Terrace, 3 Jalan Sultan Ismail, 50250 Kuala Lumpur', 'Kuala Lumpur', '60', '50', 'Tan Mei Ling', '012-345 0105', 'Northlight Studio', 'meiling.tan@example.com', 'Dessert served after the speeches.', '', '1'],
  ['Holiday Party', '2026-12-23', '18:00', 'Level 9, Menara Contoh, Jalan Tun Razak, 50400 Kuala Lumpur', 'Kuala Lumpur', '35', '120', 'Hafiz Osman', '012-345 0106', 'Brightpath Logistics', 'hafiz.osman@example.com', 'Halal certificate copy for our HR team.', 'XMAS26', '1'],
  ['Baby Shower', '2027-01-09', '11:00', '21 Jalan Kenari 5, 47100 Puchong', 'Selangor', '22', '35', 'Nurul Huda', '012-345 0107', 'Huda Home Bakes', 'nurul.huda@example.com', 'Pastel colours for the dessert table.', '', '0'],
  ['Wedding Reception', '2027-01-16', '12:00', 'Laman Taman, Jalan Kebun, 40460 Shah Alam', 'Selangor', '40', '500', 'Jason Wong', '012-345 0108', 'Wong & Co. Weddings', 'jason.wong@example.com', 'Buffet for 450, VIP table set menu for 50.', '', '1'],
  ['Birthday Party', '2027-01-23', '16:00', '5 Jalan Desa Kiara, 60000 Kuala Lumpur', 'Kuala Lumpur', '28', '25', 'Kavitha Raj', '012-345 0109', 'Raj Household', 'kavitha.raj@example.com', '', 'BDAY', '0'],
  ['Graduation Ceremony', '2027-02-06', '09:30', 'Auditorium B, Persiaran Ilmu, 43000 Kajang', 'Selangor', '18', '200', 'Amirul Zain', '012-345 0110', 'Kajang Tech College', 'amirul.zain@example.com', 'Coffee and tea station all morning.', '', '1']
];
const FIELDS = ['occasion', 'event_date', 'event_time', 'event_address', 'location', 'budget', 'num_pax', 'contact_person', 'contact_no', 'company_name', 'email', 'special_request', 'promo', 'subscribe'];

// The exact messages from order.php, in the same order.
const CHECKS = [
  ['occasion', 'You forgot to enter your Occasion.'],
  ['event_date', 'You forgot to enter your Event Date.'],
  ['event_time', 'You forgot to enter Time of Event.'],
  ['event_address', 'You forgot to enter the Address of the Event.'],
  ['location', 'You forgot to enter your Location.'],
  ['budget', 'You forgot to enter your Budget.'],
  ['num_pax', 'You forgot to enter your PAX.'],
  ['contact_person', 'You forgot to enter your Contact Person.'],
  ['contact_no', 'You forgot to enter your Contact.'],
  ['company_name', 'You forgot to enter Company name.'],
  ['email', 'You forgot to enter your Email Address.']
];

const EXAMPLES = [
  ['Birthday Party', 'Kuala Lumpur', '13:00', '17 Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur', '25', '50', 'Sara Iskandar', '012-345 0199', 'Iskandar Family', 'sara.i@example.com', 'One table of kids\' meals, please.', 'BDAY'],
  ['Wedding Reception', 'Selangor', '19:00', 'Dewan Orkid, Jalan Bunga Raya, 40000 Shah Alam', '42', '250', 'Ravi Kumar', '012-345 0198', 'Orkid Weddings', 'ravi.k@example.com', 'Vegetarian options on every table.', 'WED10'],
  ['Holiday Party', 'Kuala Lumpur', '18:30', 'Level 12, Menara Sample, Jalan Ampang, 50450 Kuala Lumpur', '35', '80', 'Chloe Tan', '012-345 0197', 'Bluefield Design', 'chloe.tan@example.com', 'Drinks served from 6 pm.', '']
];

function seed() {
  return {orders: SEED.map((r, i) => Object.assign({id: i + 1, isNew: false}, Object.fromEntries(FIELDS.map((f, j) => [f, r[j]]))))};
}

let db;
try { db = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
if (!db || !Array.isArray(db.orders)) db = seed();
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage blocked: the demo still works in memory */ } };

/* ---------- helpers ---------- */
const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const app = document.getElementById('app');
const modal = document.getElementById('modal');
// PHP's empty(): '' and '0' count as missing.
const isEmpty = v => v == null || String(v).trim() === '' || String(v).trim() === '0';
const total = (b, p) => { const t = parseFloat(b) * parseInt(p, 10); return isFinite(t) ? t.toFixed(2) : ''; };
const money = v => { const n = parseFloat(v); return isFinite(n) ? 'RM' + n.toFixed(2) : '–'; };

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600);
}

/* ---------- pages ---------- */
const silhouette = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#c9c4bb"/><circle cx="100" cy="78" r="38" fill="#8f897e"/><path d="M28 200c4-46 34-72 72-72s68 26 72 72z" fill="#8f897e"/></svg>');

function pageHome() {
  const cards = TEAM.map(m => m.me
    ? `<div class="col-md-6 team-member">
        <img src="${m.photo}" alt="Idham Hakim" class="team-photo img-fluid rounded-circle" width="200" height="200">
        <h4>${h(m.name)}</h4>
        ${m.roles.map(r => `<p>${h(r)}</p>`).join('')}
      </div>`
    : `<div class="col-md-6 team-member ph">
        <img src="${silhouette}" alt="" class="team-photo img-fluid rounded-circle" width="200" height="200">
        <h4>Team member</h4>
        <p class="ph-note">Name and photo kept private</p>
        ${m.roles.map(r => `<p>${h(r)}</p>`).join('')}
      </div>`).join('');
  return `<div class="container mt-5">
    <div class="backhome">
      <h1 class="text-center">About Our Catering Team</h1><br>
      <div class="row">${cards}</div>
      <div class="why-us text-center mt-4">
        <h4>Why Choose RIING Catering?</h4>
        <ul class="list-unstyled">
          <li><strong>Decades of Experience:</strong> With over 10 years in the catering business, we bring unparalleled expertise to your events.</li>
          <li><strong>Premium Quality:</strong> We use only Jakim Certified Ingredients, ensuring high-quality, halal meals for all our clients.</li>
          <li><strong>Expert Culinary Team:</strong> Our local Muslim chefs are culinary masters with a passion for creating memorable dishes.</li>
          <li><strong>Personalized Service:</strong> We pride ourselves on providing customized menus tailored to the unique theme and style of your event.</li>
        </ul>
      </div><br>
    </div><br>
  </div>`;
}

function pageMenu() {
  return `<div class="container mt-4">
    <div class="backmenu">
      <h1>Our Menu</h1><br>
      ${Object.entries(MENU).map(([cat, items]) => `<h2>${h(cat)}</h2><br>
        <div class="row">${items.map(([name, price, img]) => `
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <img class="card-img-top" src="img/${img}.webp" alt="${h(name)}" style="height: 200px; object-fit: cover;" loading="lazy">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${h(name)}</h5>
                <p class="card-text mt-auto">Price: RM${price}</p>
              </div>
            </div>
          </div>`).join('')}
        </div>`).join('')}
    </div><br>
  </div>`;
}

// What the order page shows: the empty form, the form with errors (values kept), or the thank-you message.
let orderState = {errors: null, values: {}, thanks: null};

function opt(list, cur) { return ['', ...list].map(v => `<option value="${h(v)}"${v === cur ? ' selected' : ''}>${h(v)}</option>`).join(''); }

function pageOrder() {
  if (orderState.thanks) {
    return `<div class="center-thanks">
      <br><br>
      <h1><b>THANK YOU!</b></h1>
      <p>We are excited about the opportunity to serve you at your upcoming event. Our team will review your request and get in touch with you within 1-3 working days to discuss further details
      and customize our services to perfectly fit your needs. In the meantime, if you have any additional questions or specific preferences, please feel free to reach out to us. We are committed
      to providing exceptional service and ensuring your event is a memorable success. We look forward to creating a wonderful culinary experience for you and your guests!</p>
      <p><br /></p>
      <div class="demo-only"><span class="tag">Demo</span> Your request is order #${orderState.thanks}. <a class="dl" href="#/requests" data-act="see-new">See it in Customer Request</a> <button type="button" data-act="another">Send another</button></div>
      <p><br /></p>
    </div>`;
  }
  const v = orderState.values, val = k => h(v[k] || '');
  const err = orderState.errors ? `<div class="center-error" role="alert">
      <h1><br>Error!</h1>
      <p class="error">The following error(s) occurred:<br />${orderState.errors.map(m => ` - ${h(m)}<br />`).join('\n')}</p><p>Please try again.</p><p><br /></p>
    </div>` : '';
  return `${err}<div class="container mt-4">
    <div class="demo-only mb-2"><span class="tag">Demo only</span> Not on the real site: <button type="button" data-act="example">Fill with example</button> <span>or send it empty first to see the checks.</span></div>
    <form action="#/order" method="post" id="orderForm">
      <h1 class="text-center mb-4">Enquire Now! Request FREE Quote</h1>

      <h3>Event Details</h3><br>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-occasion">Occasion</label>
          <select name="occasion" id="f-occasion" class="form-select">${opt(OCCASIONS, v.occasion)}</select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-location">Location</label>
          <select name="location" id="f-location" class="form-select">${opt(LOCATIONS, v.location)}</select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-date">Event Date</label>
          <input class="form-control" type="date" id="f-date" name="event_date" value="${val('event_date')}">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-time">Event Time</label>
          <input class="form-control" type="time" id="f-time" name="event_time" value="${val('event_time')}">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-address">Event Address</label>
          <textarea class="form-control" id="f-address" name="event_address">${val('event_address')}</textarea>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="budget">Budget/Pax (RM)</label>
          <input class="form-control" type="text" inputmode="decimal" id="budget" name="budget" value="${val('budget')}">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="num_pax">Number of Pax</label>
          <input class="form-control" type="text" inputmode="numeric" id="num_pax" name="num_pax" value="${val('num_pax')}">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="totalBudget">Total Budget (RM)</label>
          <input class="form-control" type="text" id="totalBudget" name="total_budget" value="${h(total(v.budget, v.num_pax))}" readonly>
        </div>
      </div>

      <br><h3>Contact Details</h3><br>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-person">Contact Person</label>
          <input class="form-control" type="text" id="f-person" name="contact_person" value="${val('contact_person')}" autocomplete="off">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-phone">Contact Number</label>
          <input class="form-control" type="text" id="f-phone" name="contact_no" value="${val('contact_no')}" autocomplete="off">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-company">Company Name</label>
          <input class="form-control" type="text" id="f-company" name="company_name" value="${val('company_name')}" autocomplete="off">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-email">Email Address</label>
          <input class="form-control" type="email" id="f-email" name="email" value="${val('email')}" autocomplete="off">
        </div>
      </div>

      <br><h3>Other Details</h3><br>
      <div class="row">
        <div class="col-md-12 mb-3">
          <label class="form-label" for="f-request">Special Request</label>
          <textarea class="form-control" id="f-request" name="special_request">${val('special_request')}</textarea>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-promo">Promo Code</label>
          <input class="form-control" type="text" id="f-promo" name="promo" value="${val('promo')}" autocomplete="off">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="f-sub">Subscribe To Our Newsletter</label><br>
          <input class="form-check-input" type="checkbox" id="f-sub" name="subscribe" value="1"${v.subscribe === '1' ? ' checked' : ''}>
        </div>
      </div>

      <div class="col-md-12">
        <br><input class="backsubmit" type="submit" name="submit" value="Submit for FREE Quote">
      </div>
      <br>
    </form>
    <br>
  </div>`;
}

function pageRequests() {
  const rows = db.orders.map(o => `<tr tabindex="0" data-id="${o.id}" aria-label="Order ${o.id}, ${h(o.contact_person)}: show details">
      <td>${o.id}${o.isNew ? '<span class="new-tag">New</span>' : ''}</td><td>${h(o.contact_person)}</td><td>${h(o.contact_no)}</td><td>${h(o.num_pax)}</td><td>${h(o.event_date)}</td><td>${h(o.location)}</td></tr>`).join('');
  return `<div class="container mt-4">
    <div class="backcust">
      <h1>Customer Orders</h1>
      <div class="demo-only mt-2"><span class="tag">Demo</span> Click a row to see every detail of the request (not on the real site).</div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Order ID</th><th>Contact Person</th><th>Contact Number</th><th>Number of Pax</th><th>Event Date</th><th>Location</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <br>
  </div>`;
}

function showOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  const t = total(o.budget, o.num_pax);
  const rows = [
    ['Occasion', o.occasion], ['Event date', o.event_date], ['Event time', o.event_time], ['Address', o.event_address], ['Location', o.location],
    ['Budget per pax', money(o.budget)], ['Number of pax', o.num_pax], ['Total budget', t ? 'RM' + t : '–'],
    ['Contact person', o.contact_person], ['Contact number', o.contact_no], ['Company', o.company_name], ['Email', o.email],
    ['Special request', o.special_request || '–'], ['Promo code', o.promo || '–'], ['Newsletter', o.subscribe === '1' ? 'Yes' : 'No']
  ];
  modal.innerHTML = `<div class="mh"><p class="t" id="mTitle">Order ${o.id}</p><button type="button" class="x" data-act="close" aria-label="Close">&times;</button></div>
    <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${h(v)}</dd>`).join('')}</dl>`;
  if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
  modal.querySelector('.x').focus();
}

/* ---------- router ---------- */
const PAGES = {
  '': ['home', 'Home - RIING CATERING', pageHome],
  'menu': ['menu', 'Menu - RIING CATERING', pageMenu],
  'order': ['order', 'Catering Order -  RIING CATERING', pageOrder],
  'requests': ['requests', 'Customer Requests - RIING CATERING', pageRequests]
};
const route = () => decodeURI(location.hash.slice(1)).split('#')[0].split('?')[0].split('/').filter(Boolean)[0] || '';

function render(keepScroll) {
  const p = PAGES[route()] || PAGES[''];
  document.title = p[1];
  app.innerHTML = p[2]();
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === p[0]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  closeNav();
  if (!keepScroll) window.scrollTo(0, 0);
}

let lastRoute = route();
addEventListener('hashchange', () => {
  const r = route();
  // Opening the order page from the menu gives a fresh form, like loading order.php again.
  if (r === 'order' && lastRoute !== 'order') orderState = {errors: null, values: {}, thanks: null};
  lastRoute = r;
  render();
});

/* ---------- phone menu ---------- */
const navToggle = document.getElementById('navToggle'), navBox = document.getElementById('navbarNav');
function closeNav() { navBox.classList.remove('show'); navToggle.setAttribute('aria-expanded', 'false'); }
navToggle.addEventListener('click', () => {
  const open = !navBox.classList.contains('show');
  navBox.classList.toggle('show', open); navToggle.setAttribute('aria-expanded', String(open));
});

/* ---------- actions ---------- */
function readForm(f) {
  const v = {};
  FIELDS.forEach(k => { const el = f.elements[k]; if (el) v[k] = el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value; });
  return v;
}

function isoIn(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id !== 'orderForm') return;
  e.preventDefault();
  const v = readForm(f);
  const errors = CHECKS.filter(([k]) => isEmpty(v[k])).map(([, m]) => m);
  if (errors.length) {
    orderState = {errors, values: v, thanks: null};
    render();
    return;
  }
  const id = db.orders.reduce((m, o) => Math.max(m, o.id), 0) + 1;
  const o = {id, isNew: true};
  FIELDS.forEach(k => { o[k] = String(v[k] || '').trim(); });
  db.orders.push(o); save();
  orderState = {errors: null, values: {}, thanks: id};
  render();
});

document.addEventListener('input', e => {
  if (e.target.id === 'budget' || e.target.id === 'num_pax') {
    const f = e.target.form;
    f.elements.total_budget.value = total(f.elements.budget.value, f.elements.num_pax.value);
  }
});

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  const row = e.target.closest('tr[data-id]');
  if (row && !a) { showOrder(+row.dataset.id); return; }
  if (!a) {
    if (e.target === modal) modal.close();
    return;
  }
  const act = a.dataset.act;
  if (act === 'reset') {
    db = seed(); save(); orderState = {errors: null, values: {}, thanks: null};
    if (modal.open) modal.close();
    render(true); toast('Demo reset: the made-up data is back.');
  } else if (act === 'example') {
    const f = document.getElementById('orderForm'), x = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    const vals = {occasion: x[0], location: x[1], event_date: isoIn(30 + Math.floor(Math.random() * 60)), event_time: x[2], event_address: x[3], budget: x[4], num_pax: x[5], contact_person: x[6], contact_no: x[7], company_name: x[8], email: x[9], special_request: x[10], promo: x[11]};
    Object.entries(vals).forEach(([k, v]) => { f.elements[k].value = v; });
    f.elements.subscribe.checked = true;
    f.elements.total_budget.value = total(vals.budget, vals.num_pax);
    toast('Filled with made-up details. Press Submit for FREE Quote.');
  } else if (act === 'another') {
    orderState = {errors: null, values: {}, thanks: null}; render();
  } else if (act === 'close') {
    modal.close();
  }
});

document.addEventListener('keydown', e => {
  const row = e.target.closest && e.target.closest('tr[data-id]');
  if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showOrder(+row.dataset.id); }
  if (e.key === 'Escape') closeNav();
});

document.getElementById('yr').textContent = new Date().getFullYear();
render();
})();
