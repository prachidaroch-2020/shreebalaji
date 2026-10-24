/* Shree Balaji Fruits and Vegetable: order & pickup demo app.
   Plain JavaScript, no build step. All data lives in this browser (localStorage). */
(function(){
'use strict';

const KEY = 'shree-balaji-app-v2';
const USERS = {
  admin: {user:'owner', pass:'Owner@123', label:'Owner', initials:'OW'},
  staff: {user:'staff', pass:'Staff@123', label:'Store staff', initials:'ST'}
};
const STORES = {
  veg:   {name:'Vegetable Store', short:'Vegetables', e:'🥬', t:'t-veg',   verb:'Start weighing', work:'Weighing'},
  fruit: {name:'Fruit Store',     short:'Fruits',     e:'🍎', t:'t-fruit', verb:'Start weighing', work:'Weighing'},
  juice: {name:'Juice Junction',  short:'Juices',     e:'🧃', t:'t-juice', verb:'Start making',   work:'Making'}
};
const ORDER = ['veg','fruit','juice'];
// id, name, store, emoji, unit, price (₹ per unit), kg per unit (0 = sold by piece), popularity weight
const PRODUCTS = [
  ['tom','Tomato','veg','🍅','1 kg',40,1,1.4],['pot','Potato','veg','🥔','1 kg',30,1,1.3],['oni','Onion','veg','🧅','1 kg',45,1,1.5],
  ['car','Carrot','veg','🥕','500 g',30,.5,.6],['cau','Cauliflower','veg','🥦','1 piece',35,0,.5],['cap','Capsicum','veg','🫑','500 g',40,.5,.5],
  ['chi','Green chilli','veg','🌶️','250 g',20,.25,.4],['pal','Palak (spinach)','veg','🥬','1 bunch',25,0,.5],['cuc','Cucumber','veg','🥒','1 kg',40,1,.5],
  ['bri','Brinjal','veg','🍆','1 kg',50,1,.4],
  ['app','Shimla apple','fruit','🍎','1 kg',120,1,1.3],['ban','Banana','fruit','🍌','1 dozen',60,0,1.4],['man','Safeda mango','fruit','🥭','1 kg',90,1,1],
  ['gra','Green grapes','fruit','🍇','500 g',70,.5,.7],['ora','Nagpur orange','fruit','🍊','1 kg',80,1,1],['wat','Watermelon','fruit','🍉','1 piece',60,0,.6],
  ['pin','Pineapple','fruit','🍍','1 piece',70,0,.5],
  ['joj','Orange juice','juice','🍊','250 ml',45,0,1.3],['mos','Mosambi juice','juice','🍋','250 ml',40,0,1.2],['wmj','Watermelon juice','juice','🍉','250 ml',50,0,.8],
  ['pij','Pineapple juice','juice','🍍','250 ml',55,0,.6],['mix','Mixed fruit juice','juice','🥤','300 ml',60,0,1],['coc','Tender coconut','juice','🥥','1 piece',50,0,.9]
].map(([id,name,cat,e,unit,price,kg,w])=>({id,name,cat,e,unit,price,kg,w}));
const NAMES = ['Sunita Verma','Mohd. Irfan','Kavita Joshi','Vikram Singh','Meena Iyer','Arjun Malhotra','Farah Khan','Deepak Yadav','Ritu Bansal',
  'Suresh Patel','Ananya Rao','Harpreet Kaur','Manoj Tiwari','Sneha Kulkarni','Imran Sheikh','Geeta Chauhan','Karan Sethi','Lakshmi Menon',
  'Rohit Saxena','Priya Desai','Alok Mishra','Nisha Arora','Sanjay Bhatt','Fatima Ali'];
const ROUTES = ['home','shop','staff','admin','demo'];
const DAY = 864e5, MIN = 6e4;

let S;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs = n => '₹' + Math.round(n).toLocaleString('en-IN');
const tm = t => new Date(t).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}).toLowerCase();
const ago = t => { const m = Math.max(0, Math.round((Date.now()-t)/MIN)); return m < 1 ? 'just now' : m + ' min ago'; };
const kgTxt = k => (k < 1 ? Math.round(k*1000) + ' g' : (+k.toFixed(2)) + ' kg');
const sod = t => { const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); };
const dShort = t => new Date(t).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const dLong = t => new Date(t).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const prod = id => S.products.find(p => p.id === id);
const find = t => S.orders.find(o => o.token === t);
const first = n => String(n).split(' ')[0];
const pct = (a,b) => b ? Math.round((a-b)/b*100) : 0;

function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function wpick(list, R){ const s = list.reduce((a,p)=>a+p.w,0); let x = R()*s; for(const p of list){ x -= p.w; if(x <= 0) return p; } return list[list.length-1]; }

/* ---------------- Orders ---------------- */
function line(p, qty){
  return {pid:p.id, name:p.name, e:p.e, cat:p.cat, unit:p.unit, qty, price:p.price, kg:p.kg, est:p.price*qty, final:null, scaleKg:null, actualKg:null};
}
function scale(it){ const f = [1,1.04,0.97,1.06,1.02][Math.floor(Math.random()*5)]; return Math.round(it.kg*it.qty*f*100)/100; }
const total = o => o.items.reduce((s,it)=>s+(it.final ?? it.est), 0);
const estTotal = o => o.items.reduce((s,it)=>s+it.est, 0);
const storesOf = o => ORDER.filter(k => o.parts[k]);
const fromTxt = o => { const s = storesOf(o); return s.length === 3 ? 'All 3 stores' : s.map(k=>STORES[k].short).join(' + '); };
const partLabel = (k,st) => ({queued:'Queued', working:STORES[k].work, approval:'Needs approval', packed:k==='juice'?'Ready':'Packed'})[st];
function orderStatus(o){
  if(o.stage === 'collected') return ['collected','Collected'];
  if(o.stage === 'ready') return ['ready','Ready for pickup'];
  const v = Object.values(o.parts);
  if(v.includes('approval')) return ['approval','Awaiting approval'];
  if(v.includes('working') || v.includes('packed')) return ['working','Packing'];
  return ['queued','Queued'];
}
function log(x){ S.log.unshift({t:Date.now(), x}); S.log = S.log.slice(0,60); }

/* ---------------- Sample data ---------------- */
function seed(){
  const now = Date.now(), d0 = sod(now), R = rng(Math.floor(d0/DAY));
  const products = PRODUCTS.map(p => { const d = [-5,-3,0,0,0,2,5][Math.floor(R()*7)]; return {...p, prev:Math.max(10, p.price + d), avail:true}; });
  const P = id => products.find(p => p.id === id);
  P('gra').avail = false;

  // 60 days of closed days for the reports
  const days = [];
  for(let k = 60; k >= 1; k--){
    const date = d0 - k*DAY, wd = new Date(date).getDay();
    const orders = Math.round(64 + R()*26 + (wd === 0 || wd === 6 ? 16 : 0));
    const rev = Math.round(orders * (238 + R()*52));
    const st = {veg:Math.round(rev*(.35+R()*.07)), juice:Math.round(rev*(.18+R()*.06))}; st.fruit = rev - st.veg - st.juice;
    const upi = Math.round(rev * (.63 + R()*.12));
    const items = {};
    ORDER.forEach(c => { const ps = products.filter(p=>p.cat===c), sw = ps.reduce((s,p)=>s+p.w,0);
      ps.forEach(p => { items[p.id] = Math.round(st[c]*p.w/sw/p.price*(.85+R()*.3)); }); });
    days.push({date, orders, rev, upi, cash:rev-upi, st, items});
  }

  let n = 101;
  const orders = [];
  const mk = (name, createdAt, lines, parts, stage, extra={}) => {
    const o = {token:'A'+(n++), name, phone:'', createdAt, items:lines.map(([id,q])=>line(P(id),q)), parts, stage, approval:{}, mine:false, ...extra};
    o.items.forEach(it => { if(parts[it.cat] === 'packed'){ it.final = it.est; if(it.kg) it.actualKg = it.kg*it.qty; } });
    orders.push(o); return o;
  };

  // Orders already collected earlier today
  const start = Math.max(d0 + 7*60*MIN, now - 10*60*MIN), end = now - 60*MIN;
  const cnt = end > start ? Math.min(46, Math.round((end-start)/(13*MIN))) : 0;
  for(let i = 0; i < cnt; i++){
    const t = start + (i + R()*.8) * (end-start) / cnt;
    const stores = ORDER.filter(() => R() < .55); if(!stores.length) stores.push(ORDER[Math.floor(R()*3)]);
    const lines = [];
    stores.forEach(c => { const ps = products.filter(p=>p.cat===c && p.avail); const k = 1 + Math.floor(R()*3);
      for(let j = 0; j < k; j++){ const p = wpick(ps,R); if(!lines.find(l=>l[0]===p.id)) lines.push([p.id, R() < .3 ? 2 : 1]); } });
    const readyAt = t + (8 + R()*8)*MIN;
    mk(NAMES[Math.floor(R()*NAMES.length)], t, lines, Object.fromEntries(stores.map(c=>[c,'packed'])), 'collected',
       {payment: R() < .7 ? 'UPI' : 'Cash', readyAt, collectedAt: readyAt + (4 + R()*20)*MIN});
  }
  const m = x => now - x*MIN;
  const meena  = mk('Meena Iyer',m(25),[['pot',2],['oni',1],['pal',1]],{veg:'packed'},'ready',{readyAt:m(14)});
  const anil   = mk('Anil Mehta',m(18),[['tom',1],['car',1],['app',1],['man',1],['joj',1]],{veg:'packed',fruit:'packed',juice:'working'},'preparing');
  const rajesh = mk('Rajesh Gupta',m(12),[['oni',2],['cap',1],['chi',1],['ora',1],['pij',1]],{veg:'working',fruit:'packed',juice:'queued'},'preparing');
  const pooja  = mk('Pooja Nair',m(9),[['mix',2]],{juice:'packed'},'ready',{readyAt:m(3)});
  const neha   = mk('Neha Kapoor',m(7),[['tom',1],['cuc',1],['bri',1],['ban',1]],{veg:'approval',fruit:'packed'},'preparing');
  const vikram = mk('Vikram Singh',m(2),[['ban',1],['ora',1],['wmj',2]],{fruit:'queued',juice:'queued'},'preparing');
  rajesh.items.forEach(it => { if(it.cat === 'veg' && it.kg) it.scaleKg = scale(it); });
  neha.items.forEach(it => { if(it.cat !== 'veg') return;
    if(it.pid === 'tom'){ it.actualKg = 1.12; it.final = 45; } else if(it.pid === 'bri'){ it.actualKg = 1.06; it.final = 53; } else { it.actualKg = it.kg*it.qty; it.final = it.est; } });
  neha.approval = {veg:8};

  const ratesAt = Math.min(d0 + (8*60+5)*MIN, now - 45*MIN);
  const lg = [
    {t:m(2), x:`${vikram.token} placed by Vikram Singh · Fruits + Juices · ${rs(estTotal(vikram))}`},
    {t:m(7), x:`${neha.token} Vegetable Store: weights are higher than ordered (+₹8). Waiting for Neha to approve.`},
    {t:m(7), x:`${neha.token} placed by Neha Kapoor · Vegetables + Fruits · ${rs(estTotal(neha))}`},
    {t:m(3), x:`${pooja.token} ready at Main Counter. Pooja notified.`},
    {t:m(9), x:`${pooja.token} placed by Pooja Nair · Juices · ${rs(estTotal(pooja))}`},
    {t:m(12), x:`${rajesh.token} placed by Rajesh Gupta · all 3 stores · ${rs(estTotal(rajesh))}`},
    {t:m(14), x:`${meena.token} ready at Main Counter. Meena notified.`},
    {t:m(18), x:`${anil.token} placed by Anil Mehta · all 3 stores · ${rs(estTotal(anil))}`},
    {t:ratesAt + 3*MIN, x:'Fruit Store marked Green grapes as out of stock'},
    {t:ratesAt, x:"Store staff published today's rates"}
  ];
  orders.filter(o=>o.stage==='collected').slice(-3).forEach(o => lg.push({t:o.collectedAt, x:`${o.token} collected · ${rs(total(o))} paid by ${o.payment}`}));
  lg.sort((a,b)=>b.t-a.t);

  const keep = S ? {session:S.session||{}, route:S.ui && S.ui.route} : {session:{}};
  S = {
    v:2, day:d0, products, days, orders, next:n, log:lg, rates:{at:ratesAt, by:'Store staff'}, draft:{},
    session: keep.session,
    ui:{route: keep.route || 'home', screen:'shop', cat:'all', q:'', cart:{}, mine:null, store:'veg', name:'Ramesh Sharma', phone:'98765 43210',
        notif:null, stf:'orders', adm:'overview', period:'7', payf:'all', ordf:'all', dview:'customer', loginErr:''}
  };
}

function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function load(){
  try{ const r = localStorage.getItem(KEY); if(r){ const x = JSON.parse(r); if(x && x.v === 2){ S = x; return true; } } }catch(e){}
  return false;
}

/* ---------------- Actions ---------------- */
function checkReady(o){
  if(o.stage !== 'preparing') return;
  if(Object.values(o.parts).every(v => v === 'packed')){
    o.stage = 'ready'; o.readyAt = Date.now();
    log(`${o.token} ready at Main Counter. ${first(o.name)} notified.`);
    if(o.mine) S.ui.notif = {at:Date.now(), x:`${o.token} is ready for pickup at Main Counter. Final bill ${rs(total(o))}.`};
  }
}
function setHash(r){ try{ history.replaceState(null, '', '#' + r); }catch(e){} }
const A = {
  nav(r){
    if(r === 'staff' && !S.session.staff) r = 'login-staff';
    if(r === 'admin' && !S.session.admin) r = 'login-admin';
    S.ui.route = r; S.ui.loginErr = '';
    setHash(r.replace('login-',''));
    window.scrollTo(0,0);
  },
  logout(role){ delete S.session[role]; S.ui.route = 'home'; setHash('home'); },
  fill(role){ const u = $('#lu'), p = $('#lp'); if(u && p){ u.value = USERS[role].user; p.value = USERS[role].pass; } return 'norender'; },
  cat(c){ S.ui.cat = c; },
  add(id){ S.ui.cart[id] = (S.ui.cart[id]||0) + 1; },
  sub(id){ const q = (S.ui.cart[id]||0) - 1; if(q <= 0) delete S.ui.cart[id]; else S.ui.cart[id] = q; },
  go(s){ S.ui.screen = s; S.ui.notif = null; if(S.ui.route === 'shop') window.scrollTo(0,0); },
  place(){
    const ids = Object.keys(S.ui.cart).filter(id => prod(id).avail); if(!ids.length) return;
    const name = (S.ui.name||'').trim() || 'Walk-in customer';
    const items = ids.map(id => line(prod(id), S.ui.cart[id]));
    const parts = {}; items.forEach(it => parts[it.cat] = 'queued');
    const o = {token:'A'+(S.next++), name, phone:S.ui.phone, createdAt:Date.now(), items, parts, stage:'preparing', approval:{}, mine:true};
    S.orders.push(o); S.ui.cart = {}; S.ui.mine = o.token; S.ui.screen = 'track';
    log(`${o.token} placed by ${name} · ${fromTxt(o)} · ${rs(estTotal(o))}`);
  },
  start(token,k){
    const o = find(token); o.parts[k] = 'working';
    o.items.forEach(it => { if(it.cat === k && it.kg && it.scaleKg == null) it.scaleKg = scale(it); });
    log(`${o.token} ${STORES[k].name}: ${k === 'juice' ? 'making juice' : 'weighing started'}`);
  },
  pack(token,k){
    const o = find(token); let delta = 0;
    o.items.forEach((it,i) => {
      if(it.cat !== k) return;
      if(it.kg){
        const inp = document.getElementById(`w-${token}-${i}`);
        let v = inp ? parseFloat(inp.value) : NaN;
        if(!(v > 0)) v = it.scaleKg ?? it.kg*it.qty;
        it.actualKg = Math.round(v*100)/100;
        it.final = Math.round(it.price/it.kg*it.actualKg);
      } else it.final = it.est;
      delta += it.final - it.est;
    });
    if(delta > 0){
      o.parts[k] = 'approval'; o.approval[k] = delta;
      log(`${o.token} ${STORES[k].name}: weights are higher than ordered (+${rs(delta)}). Waiting for ${first(o.name)} to approve.`);
      if(o.mine) S.ui.notif = {at:Date.now(), x:`Your ${STORES[k].short.toLowerCase()} weighed a little more (+${rs(delta)}). Tap to approve the new bill.`};
    } else {
      o.parts[k] = 'packed';
      log(`${o.token} ${STORES[k].name}: ${k === 'juice' ? 'juice ready' : 'packed'}${delta < 0 ? ` (bill reduced by ${rs(-delta)})` : ''}`);
      checkReady(o);
    }
  },
  approve(token, by){
    const o = find(token);
    Object.keys(o.approval).forEach(k => { o.parts[k] = 'packed'; });
    const d = Object.values(o.approval).reduce((a,b)=>a+b,0); o.approval = {};
    log(`${o.token} updated bill (+${rs(d)}) approved ${by === 'owner' ? 'by the owner after a phone call' : 'by ' + first(o.name)}`);
    checkReady(o);
  },
  collect(token, method){
    const o = find(token); o.stage = 'collected'; o.payment = method; o.collectedAt = Date.now();
    if(o.mine) S.ui.notif = null;
    log(`${o.token} collected · ${rs(total(o))} paid by ${method}`);
  },
  stock(id){ const p = prod(id); p.avail = !p.avail; log(`${STORES[p.cat].name} marked ${p.name} ${p.avail ? 'back in stock' : 'as out of stock'}`); },
  store(k){ S.ui.store = k; },
  again(){ S.ui.mine = null; S.ui.screen = 'shop'; },
  notif(){ S.ui.screen = 'track'; S.ui.notif = null; },
  stf(x){ S.ui.stf = x; },
  adm(x){ S.ui.adm = x; window.scrollTo(0,0); },
  period(x){ S.ui.period = x; },
  payf(x){ S.ui.payf = x; },
  ordf(x){ S.ui.ordf = x; },
  dview(x){ S.ui.dview = x; },
  ratecopy(){ S.products.forEach(p => { if(p.prev !== p.price) S.draft[p.id] = p.prev; }); },
  rateclear(){ S.draft = {}; },
  ratepub(){
    let c = 0;
    Object.entries(S.draft).forEach(([id,v]) => { const p = prod(id), n = Math.round(+v); if(p && n > 0 && n !== p.price){ p.price = n; c++; } });
    S.draft = {}; S.rates = {at:Date.now(), by:'Store staff'};
    log(`Store staff published today's rates (${c} price${c === 1 ? '' : 's'} changed)`);
  }
};

/* ---------------- Icons ---------------- */
const svg = {
  bag:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  search:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5D6E66" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  check:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#163F33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="#163F33" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  cash:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#163F33" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  scale:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#163F33" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/></svg>',
  msg:'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 1-2z"/></svg>'
};

/* ---------------- Customer ---------------- */
const cartIds = () => Object.keys(S.ui.cart).filter(id => prod(id));
const cartCount = () => cartIds().reduce((a,id)=>a+S.ui.cart[id],0);
const cartTotal = () => cartIds().reduce((s,id)=>s+(prod(id).avail ? prod(id).price*S.ui.cart[id] : 0),0);

function prodRows(){
  const q = S.ui.q.trim().toLowerCase();
  const list = S.products.filter(p => (S.ui.cat === 'all' || p.cat === S.ui.cat) && (!q || p.name.toLowerCase().includes(q) || STORES[p.cat].short.toLowerCase().includes(q)));
  if(!list.length) return `<div class="empty">Nothing matches “${esc(S.ui.q)}”.</div>`;
  return list.map(p => {
    const q = S.ui.cart[p.id] || 0;
    const ctl = !p.avail ? '<span class="oos">Out of stock</span>'
      : q ? `<div class="step"><button data-a="sub" data-v="${p.id}" aria-label="One less ${esc(p.name)}">−</button><span class="num">${q}</span><button data-a="add" data-v="${p.id}" aria-label="One more ${esc(p.name)}">+</button></div>`
      : `<button class="add" data-a="add" data-v="${p.id}">Add</button>`;
    return `<div class="prod${p.avail ? '' : ' out'}"><div class="thumb ${STORES[p.cat].t}">${p.e}</div>
      <div><div class="nm">${esc(p.name)}</div><div class="un">${p.unit}${p.kg ? ' · weighed at store' : ''}</div>
      <div class="pr num">${rs(p.price)}</div></div>${ctl}</div>`;
  }).join('');
}
function screenShop(framed){
  const mine = S.ui.mine && find(S.ui.mine);
  const cats = [['all','All'],['veg','Vegetables'],['fruit','Fruits'],['juice','Juices']];
  return `<div class="scr">
    ${mine && mine.stage !== 'collected' ? `<button class="mini-track" data-a="go" data-v="track"><span>Your order <b>${mine.token}</b> · ${orderStatus(mine)[1]}</span><span>Track ›</span></button>` : ''}
    <h1>Shop fresh</h1><p class="sub">Order from all three stores in one basket. Collect at Main Counter, pay at pickup.</p>
    <div class="ratesline">● Today’s rates · updated ${tm(S.rates.at)}</div>
    <div class="shopbar"><div class="search">${svg.search}<input id="q" type="search" placeholder="Search tomato, apple, juice…" value="${esc(S.ui.q)}" autocomplete="off" aria-label="Search products"></div>
    <div class="chips">${cats.map(([k,l])=>`<button class="chip" data-a="cat" data-v="${k}" aria-pressed="${S.ui.cat===k}">${l}</button>`).join('')}</div></div>
    <div class="plist" id="plist">${prodRows()}</div>
  </div>
  ${cartCount() ? `<button class="bbar" data-a="go" data-v="basket"><span>${svg.bag} View basket (${cartCount()})</span><span class="num">${rs(cartTotal())} ›</span></button>` : ''}`;
}
function screenBasket(){
  const ids = cartIds();
  if(!ids.length) return `<div class="scr narrow"><button class="back" data-a="go" data-v="shop">‹ Back to shop</button><h1>Your basket</h1><div class="empty">Your basket is empty.<br><br><button class="ghost" data-a="go" data-v="shop">Browse products</button></div></div>`;
  const anyKg = ids.some(id => prod(id).kg);
  const anyOut = ids.some(id => !prod(id).avail);
  return `<div class="scr narrow"><button class="back" data-a="go" data-v="shop">‹ Keep shopping</button><h1>Review order</h1>
    <div class="card" style="padding:4px 12px">${ids.map(id => { const p = prod(id), q = S.ui.cart[id]; return `<div class="bline"><div class="thumb ${STORES[p.cat].t}">${p.e}</div>
      <div><b>${esc(p.name)}</b><div style="font-size:12px;color:var(--muted)">${p.unit} · ${STORES[p.cat].name}</div>
      ${p.avail ? `<div class="step" style="display:inline-flex;margin-top:5px"><button data-a="sub" data-v="${id}" aria-label="One less">−</button><span class="num">${q}</span><button data-a="add" data-v="${id}" aria-label="One more">+</button></div>` : '<span class="oos" style="margin-top:5px">Out of stock · will be removed</span>'}</div>
      <b class="num">${p.avail ? rs(p.price*q) : '—'}</b></div>`; }).join('')}</div>
    <div class="total"><span>Estimated total</span><span class="num">${rs(cartTotal())}</span></div>
    <div class="card" style="padding:2px 12px">
      <div class="info">${svg.pin}<div><b>Pickup: Main Counter</b><small>We’ll message you when every item is packed</small></div></div>
      <div class="info">${svg.cash}<div><b>Pay at pickup</b><small>UPI or cash at the counter</small></div></div>
      ${anyKg ? `<div class="info">${svg.scale}<div><b>Weighed at the store</b><small>If the weight comes out higher, we ask you before the bill changes</small></div></div>` : ''}
    </div>
    <div class="field"><label for="cname">Your name</label><input id="cname" value="${esc(S.ui.name)}" autocomplete="off"></div>
    <div class="field"><label for="cphone">Mobile number</label><input id="cphone" value="${esc(S.ui.phone)}" inputmode="tel" autocomplete="off"></div>
    <button class="primary" data-a="place"${cartTotal() ? '' : ' disabled'}>Place order · ${rs(cartTotal())}</button>
    ${anyOut ? '<p class="sub" style="margin-top:8px">Out-of-stock items are left out of the order.</p>' : ''}
  </div>`;
}
function screenTrack(framed){
  const o = S.ui.mine && find(S.ui.mine);
  if(!o) return screenShop(framed);
  const tok = `<div class="tokbox"><small>Your token number</small><b>${o.token}</b></div>`;
  const billRows = o.items.map(it => {
    const q = it.kg && it.actualKg != null ? kgTxt(it.actualKg) : it.qty + ' × ' + it.unit;
    return `<div class="bill"><span>${it.e} ${esc(it.name)} <span style="color:var(--muted)">· ${q}</span></span><span class="num">${rs(it.final ?? it.est)}</span></div>`;
  }).join('');
  if(o.stage === 'collected') return `<div class="scr narrow center"><div class="okcirc">${svg.check}</div><h1>Thank you, ${esc(first(o.name))}!</h1>
    <p class="sub">Order ${o.token} collected at ${tm(o.collectedAt)} · paid by ${o.payment}</p>
    <div class="card" style="text-align:left">${billRows}<div class="bill t"><span>Paid</span><span class="num">${rs(total(o))}</span></div></div>
    <button class="primary" data-a="again">Start a new order</button></div>`;
  if(o.stage === 'ready') return `<div class="scr narrow center"><div class="rays"><span></span><span></span><span></span></div><h1>Ready for pickup</h1>${tok}
    <p style="display:flex;justify-content:center;gap:6px;align-items:center;font-weight:700;margin:0 0 12px">${svg.pin} Main Counter</p>
    <div class="card" style="text-align:left">${billRows}<div class="bill t"><span>Final bill</span><span class="num">${rs(total(o))}</span></div></div>
    <p class="sub" style="margin-top:12px">Show this token at the counter. Pay by UPI or cash.</p></div>`;
  const pend = Object.keys(o.approval || {});
  const appr = pend.length ? `<div class="approve"><h3>Please approve your updated bill</h3>
     <p style="margin:0 0 6px;font-size:13px;color:var(--muted)">Some items weighed a little more than you ordered.</p>
     ${o.items.filter(it => pend.includes(it.cat) && it.final != null && it.final !== it.est).map(it => `<div class="ln"><span>${it.e} ${esc(it.name)} · ${kgTxt(it.actualKg)}</span><span class="num">${rs(it.est)} → <b>${rs(it.final)}</b></span></div>`).join('')}
     <div class="ln" style="font-weight:800;border-top:1px solid #f1c9a8;margin-top:5px;padding-top:6px"><span>New total</span><span class="num">${rs(total(o))}</span></div>
     <button class="primary orange" data-a="approve" data-v="${o.token}" style="margin-top:10px">Approve ${rs(total(o))}</button></div>` : '';
  return `<div class="scr narrow center"><div class="okcirc">${svg.check}</div><h1>Order confirmed</h1>${tok}
    ${appr}
    <p style="margin:0;font-weight:700">Preparing your order</p><p class="sub">We will message you when it’s ready.</p>
    <div class="card" style="text-align:left;padding:2px 14px">${storesOf(o).map(k => `<div class="srow"><span>${STORES[k].e} ${STORES[k].name}</span><span class="pill s-${o.parts[k]}">${partLabel(k,o.parts[k])}</span></div>`).join('')}</div>
    <div class="total" style="margin-top:12px"><span>Estimated total</span><span class="num">${rs(total(o))}</span></div>
    <button class="ghost" data-a="go" data-v="shop" style="width:100%">Back to shop</button></div>`;
}
function custHTML(framed){
  const n = S.ui.notif && Date.now() - S.ui.notif.at < 9000 ? S.ui.notif : null;
  const banner = n ? `<button class="notif" data-a="notif"><span class="ic">${svg.msg}</span><span><b>Shree Balaji <small>now</small></b><span>${esc(n.x)}</span></span></button>` : '';
  const scr = S.ui.screen === 'basket' ? screenBasket() : S.ui.screen === 'track' ? screenTrack(framed) : screenShop(framed);
  if(!framed) return `<div class="custpage">${banner}${scr}</div>`;
  return `<div class="phone"><div class="sbar"><span>${tm(Date.now()).replace(/\s?[ap]m/,'')}</span><span>●●● 4G</span></div>${banner}
    <div class="phdr"><span></span><img src="assets/logo.png" alt="Shree Balaji"><button class="iconbtn" data-a="go" data-v="basket" aria-label="Basket">${svg.bag}${cartCount() ? `<span class="badge">${cartCount()}</span>` : ''}</button></div>
    ${scr}</div>`;
}

/* ---------------- Staff ---------------- */
const openTasks = k => S.orders.filter(o => o.stage === 'preparing' && o.parts[k] && o.parts[k] !== 'packed');
function renderTask(o,k){
  const st = o.parts[k];
  const items = o.items.map((it,i)=>[it,i]).filter(([it]) => it.cat === k);
  const rows = items.map(([it,i]) => {
    let right;
    if(st === 'working' && it.kg) right = `<div class="wt"><input id="w-${o.token}-${i}" type="number" step="0.01" min="0" inputmode="decimal" value="${it.scaleKg ?? it.kg*it.qty}" aria-label="Weighed kg for ${esc(it.name)}"><span>kg</span></div>`;
    else if(it.final != null && it.final !== it.est) right = `<span class="num"><s style="color:var(--muted)">${rs(it.est)}</s> <b>${rs(it.final)}</b></span>`;
    else right = `<span class="num">${rs(it.est)}</span>`;
    const sub = it.kg ? 'Ordered ' + kgTxt(it.kg*it.qty) + (it.actualKg != null ? ' · weighed ' + kgTxt(it.actualKg) : '') : it.qty + ' × ' + it.unit;
    return `<div class="titem"><span class="e">${it.e}</span><div><b>${esc(it.name)}</b><small>${sub}</small></div>${right}</div>`;
  }).join('');
  const others = storesOf(o).filter(x => x !== k);
  const hasKg = items.some(([it]) => it.kg);
  let act;
  if(st === 'queued') act = `<span class="note">${others.length ? 'Also in this order: ' + others.map(x=>STORES[x].short).join(', ') : 'Only your store'}</span><button class="act o" data-a="start" data-v="${o.token}" data-k="${k}">${hasKg ? STORES[k].verb : k === 'juice' ? 'Start making' : 'Start packing'}</button>`;
  else if(st === 'working') act = `<span class="note">${hasKg ? 'Enter the scale reading, then pack.' : 'Prepare fresh, then hand over.'}</span><button class="act" data-a="pack" data-v="${o.token}" data-k="${k}">${k === 'juice' ? 'Mark juice ready' : 'Packed · save weights'}</button>`;
  else act = `<span class="note">Customer asked to approve +${rs(o.approval[k]||0)}. The owner can also approve after a call.</span>`;
  return `<div class="task st-${st}"><div class="th"><span class="tk">${o.token}</span><div><div class="who2">${esc(o.name)}</div><div class="when">${tm(o.createdAt)} · ${ago(o.createdAt)}</div></div><span class="pill s-${st}">${partLabel(k,st)}</span></div>
    <div class="ti">${rows}</div><div class="ta">${act}</div></div>`;
}
function ordersBoardHTML(){
  const k = S.ui.store;
  const ready = S.orders.filter(o => o.stage === 'ready');
  const tabs = ORDER.map(x => `<button class="stab" role="tab" data-a="store" data-v="${x}" aria-selected="${k===x}"><span class="e">${STORES[x].e}</span>${STORES[x].name}${openTasks(x).length ? `<span class="badge">${openTasks(x).length}</span>` : ''}</button>`).join('')
    + `<button class="stab" role="tab" data-a="store" data-v="counter" aria-selected="${k==='counter'}"><span class="e">🧾</span>Pickup counter${ready.length ? `<span class="badge">${ready.length}</span>` : ''}</button>`;
  let body;
  if(k === 'counter'){
    const prep = S.orders.filter(o => o.stage === 'preparing');
    const done = S.orders.filter(o => o.stage === 'collected').sort((a,b)=>b.collectedAt-a.collectedAt);
    body = `<div class="shead"><h2>Main Counter</h2><span>Hand over and take payment</span></div>
      <div class="tasks">${ready.length ? ready.map(o => `<div class="task rtask"><div class="th"><span class="tk">${o.token}</span><div><div class="who2">${esc(o.name)}</div><div class="when">Ready since ${tm(o.readyAt)} · ${fromTxt(o)}</div></div><span class="pill s-ready">Ready · notified</span></div>
        <div class="ti" style="padding:8px 14px">${o.items.map(it => `<div class="bill"><span>${it.e} ${esc(it.name)} <span style="color:var(--muted)">· ${it.kg && it.actualKg != null ? kgTxt(it.actualKg) : it.qty + ' × ' + it.unit}</span></span><span class="num">${rs(it.final ?? it.est)}</span></div>`).join('')}
        <div class="bill t"><span>Collect</span><span class="num">${rs(total(o))}</span></div></div>
        <div class="ta"><span class="note">Check the token on the customer’s phone</span><span style="display:flex;gap:8px"><button class="act" data-a="collect" data-v="${o.token}" data-k="UPI">Paid by UPI</button><button class="act line" data-a="collect" data-v="${o.token}" data-k="Cash">Paid by cash</button></span></div></div>`).join('')
        : '<div class="card empty">No orders waiting at the counter.</div>'}</div>
      <div class="sect">Still being packed</div>
      <div class="card" style="padding:2px 14px">${prep.length ? prep.map(o => `<div class="srow" style="flex-wrap:wrap"><span><span class="serif" style="font-size:17px;color:var(--green)">${o.token}</span> ${esc(o.name)}</span><span class="parts">${storesOf(o).map(x => `<span class="pill s-${o.parts[x]}">${STORES[x].short}</span>`).join('')}</span></div>`).join('') : '<div class="empty">Nothing in progress.</div>'}</div>
      <div class="sect">Collected today · ${done.length}</div>
      <div class="donel">${done.slice(0,12).map(o => `<span>${o.token} · ${rs(total(o))} · ${o.payment}</span>`).join('') || '<span>None yet</span>'}</div>`;
  } else {
    const open = openTasks(k).sort((a,b)=>a.createdAt-b.createdAt);
    const packed = S.orders.filter(o => o.parts[k] === 'packed').sort((a,b)=>b.createdAt-a.createdAt);
    body = `<div class="shead"><h2>${STORES[k].name}</h2><span>${open.length} open · oldest first</span></div>
      <div class="tasks">${open.length ? open.map(o => renderTask(o,k)).join('') : '<div class="card empty">All caught up. New orders appear here instantly.</div>'}</div>
      <div class="sect">Packed today · ${packed.length}</div>
      <div class="donel">${packed.slice(0,16).map(o => `<span>${o.token}</span>`).join('') || '<span>None yet</span>'}</div>`;
  }
  return `<div class="stabs" role="tablist">${tabs}</div>${body}`;
}
function dirtyCount(){ return Object.entries(S.draft).filter(([id,v]) => prod(id) && Math.round(+v) > 0 && Math.round(+v) !== prod(id).price).length; }
function dirtyText(){ const c = dirtyCount(); return c ? `${c} rate${c === 1 ? '' : 's'} changed · not published yet` : 'No unpublished changes'; }
function ratesHTML(){
  const out = S.products.filter(p => !p.avail).length;
  return `<div class="shead"><h2>Today’s rates &amp; stock</h2><span>Last published ${tm(S.rates.at)} by ${S.rates.by} · ${out} item${out === 1 ? '' : 's'} out of stock</span></div>
    <p class="hint">Update the rate for each item every morning, then tap <b>Publish rates</b>. Customers see new rates straight away. Items marked <b>Out of stock</b> stay visible to customers as out of stock and can’t be ordered.</p>
    <div class="ratebar"><span class="dirty${dirtyCount() ? ' on' : ''}" id="dirty">${dirtyText()}</span>
      <button class="btn-s" data-a="ratecopy">Copy yesterday’s rates</button>
      <button class="btn-s" data-a="rateclear">Discard changes</button>
      <button class="act" data-a="ratepub">Publish rates</button></div>
    <div class="rgrid">${ORDER.map(k => `<div class="rcard"><h3><span>${STORES[k].e}</span>${STORES[k].name}</h3>
      ${S.products.filter(p => p.cat === k).map(p => { const v = S.draft[p.id] ?? p.price; const ch = Math.round(+v) !== p.price;
        return `<div class="rrow${ch ? ' chg' : ''}" id="rr-${p.id}"><span class="e">${p.e}</span><div><b>${esc(p.name)}</b><small>${p.unit} · yesterday ${rs(p.prev)}</small></div>
        <label class="price">₹<input id="rate-${p.id}" type="number" min="1" inputmode="numeric" value="${esc(v)}" data-rate="${p.id}" aria-label="Today's rate for ${esc(p.name)}"></label>
        <button class="tog${p.avail ? '' : ' off'}" data-a="stock" data-v="${p.id}" aria-label="${esc(p.name)}: ${p.avail ? 'in stock, tap to mark out of stock' : 'out of stock, tap to mark in stock'}">${p.avail ? 'In stock' : 'Out of stock'}</button></div>`; }).join('')}
    </div>`).join('')}</div>`;
}
function staffHTML(){
  const open = ORDER.reduce((s,k)=>s+openTasks(k).length,0) + S.orders.filter(o=>o.stage==='ready').length;
  return `<div class="wrap staffpage"><div class="subnav" role="tablist">
      <button role="tab" data-a="stf" data-v="orders" aria-selected="${S.ui.stf==='orders'}">Orders${open ? `<span class="badge">${open}</span>` : ''}</button>
      <button role="tab" data-a="stf" data-v="rates" aria-selected="${S.ui.stf==='rates'}">Today’s rates &amp; stock</button></div>
    ${S.ui.stf === 'rates' ? ratesHTML() : ordersBoardHTML()}</div>`;
}

/* ---------------- Owner ---------------- */
function todayRec(){
  const rec = {date:S.day, orders:S.orders.length, rev:0, upi:0, cash:0, st:{veg:0,fruit:0,juice:0}, items:{}, itemRev:{}};
  S.orders.forEach(o => {
    const t = total(o); rec.rev += t;
    if(o.stage === 'collected'){ if(o.payment === 'UPI') rec.upi += t; else rec.cash += t; }
    o.items.forEach(it => { const v = it.final ?? it.est; rec.st[it.cat] += v; rec.items[it.pid] = (rec.items[it.pid]||0) + it.qty; rec.itemRev[it.pid] = (rec.itemRev[it.pid]||0) + v; });
  });
  return rec;
}
function sumDays(ds){
  const a = {orders:0, rev:0, upi:0, cash:0, st:{veg:0,fruit:0,juice:0}, items:{}, itemRev:{}};
  ds.forEach(d => { a.orders += d.orders; a.rev += d.rev; a.upi += d.upi; a.cash += d.cash; ORDER.forEach(k => a.st[k] += d.st[k]);
    Object.entries(d.items).forEach(([id,q]) => { a.items[id] = (a.items[id]||0) + q; a.itemRev[id] = (a.itemRev[id]||0) + (d.itemRev ? d.itemRev[id] : q*prod(id).price); }); });
  return a;
}
function niceMax(v){ const p = Math.pow(10, Math.floor(Math.log10(v))); for(const m of [1,2,4,5,8,10]) if(m*p >= v) return m*p; return 10*p; }
const short = v => v >= 100000 ? '₹' + (v/100000).toFixed(v % 100000 ? 1 : 0) + 'L' : v >= 1000 ? '₹' + (+(v/1000).toFixed(1)) + 'k' : '₹' + Math.round(v);
function chart(vals, labels, every, aria){
  const W = 640, H = 230, l = 50, b = 26, t = 12, r = 6;
  const max = niceMax(Math.max(1, ...vals)), n = vals.length, bw = (W-l-r)/n, ih = H-b-t;
  let g = '';
  for(let i = 0; i <= 4; i++){ const y = H-b-ih*i/4; g += `<line class="gl" x1="${l}" x2="${W-r}" y1="${y}" y2="${y}"/><text class="al" x="${l-7}" y="${y+4}" text-anchor="end">${short(max*i/4)}</text>`; }
  vals.forEach((v,i) => {
    const h = ih*v/max, x = l + i*bw + bw*.17, w = bw*.66, y = H-b-h;
    g += `<rect class="bx${i === n-1 ? ' hi' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" rx="${Math.min(4,w/2).toFixed(1)}"><title>${labels[i]}: ${rs(v)}</title></rect>`;
    if(i % every === 0 || i === n-1) g += `<text class="al" x="${(l + i*bw + bw/2).toFixed(1)}" y="${H-8}" text-anchor="middle">${labels[i]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${g}</svg>`;
}
const kpi = (bg, ic, l, v, d) => `<div class="kpi"><span class="ic" style="background:${bg}">${ic}</span><div><small>${l}</small><b class="num">${v}</b>${d != null ? `<em class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}% vs previous</em>` : ''}</div></div>`;

function attentionHTML(){
  const att = [];
  S.orders.filter(o => Object.keys(o.approval||{}).length).forEach(o => att.push(`<div class="att red"><span class="e">⚖️</span><div><b>${o.token} needs weight approval</b><small>${esc(o.name)} · +${rs(Object.values(o.approval).reduce((a,b)=>a+b,0))} on ${Object.keys(o.approval).map(k=>STORES[k].short.toLowerCase()).join(', ')}</small></div><button data-a="approve" data-v="${o.token}" data-k="owner">Approved on call</button></div>`));
  S.orders.filter(o => o.stage === 'preparing' && Date.now()-o.createdAt > 15*MIN).forEach(o => att.push(`<div class="att"><span class="e">⏱️</span><div><b>${o.token} is taking long</b><small>${ago(o.createdAt).replace(' ago','')} · waiting on ${storesOf(o).filter(k=>o.parts[k]!=='packed').map(k=>STORES[k].name).join(', ')}</small></div><span></span></div>`));
  S.orders.filter(o => o.stage === 'ready' && Date.now()-o.readyAt > 10*MIN).forEach(o => att.push(`<div class="att"><span class="e">🧾</span><div><b>${o.token} not collected yet</b><small>${esc(o.name)} · ready since ${tm(o.readyAt)} · ${rs(total(o))} to collect</small></div><span></span></div>`));
  S.products.filter(p => !p.avail).forEach(p => att.push(`<div class="att red"><span class="e">${p.e}</span><div><b>${STORES[p.cat].name}: ${esc(p.name)} out of stock</b><small>Shown to customers as out of stock</small></div><button data-a="stock" data-v="${p.id}">Back in stock</button></div>`));
  if(!att.length) att.push(`<div class="att green"><span class="e">✓</span><div><b>Nothing needs you right now</b><small>All stores are on track</small></div><span></span></div>`);
  return att.join('');
}
function ordersTable(list, cols){
  return `<div class="tbl"><table><thead><tr><th>Token</th>${cols.time ? '<th>Time</th>' : ''}<th>Customer</th><th>Items from</th><th>Status</th>${cols.pay ? '<th>Payment</th>' : ''}<th class="r">Bill</th></tr></thead><tbody>
    ${list.map(o => { const [c,l] = orderStatus(o); return `<tr><td class="tk">${o.token}</td>${cols.time ? `<td class="num">${tm(o.createdAt)}</td>` : ''}<td>${esc(o.name)}</td><td>${fromTxt(o)}</td><td><span class="pill s-${c}">${l}</span></td>${cols.pay ? `<td>${o.payment || '—'}</td>` : ''}<td class="r num">${rs(total(o))}</td></tr>`; }).join('')}
  </tbody></table></div>`;
}
function overviewHTML(compact){
  const os = S.orders, T = todayRec();
  const prep = os.filter(o=>o.stage==='preparing'), ready = os.filter(o=>o.stage==='ready');
  const got = T.upi + T.cash, due = T.rev - got;
  const last7 = S.days.slice(-6).map(d=>d.rev).concat(T.rev), lab7 = S.days.slice(-6).map(d=>new Date(d.date).toLocaleDateString('en-IN',{weekday:'short'})).concat('Today');
  const maxS = Math.max(1, ...ORDER.map(k=>T.st[k]));
  return `<div class="ocq"><div class="ohead"><h2>All stores. One clear view.</h2><span class="datepill">Today · ${dLong(Date.now())}</span></div>
    <div class="kpis">
      ${kpi('var(--orange-soft)','🛒','Orders today',T.orders)}
      ${kpi('var(--green-soft)','💰','Sales today',rs(T.rev))}
      ${kpi('var(--orange-soft)','📦','In preparation',prep.length)}
      ${kpi('var(--green-soft)','🛍️','Ready for pickup',ready.length)}
    </div>
    <div class="coll"><div><small>Collected today</small><b class="num">${rs(got)}</b><em>UPI ${rs(T.upi)} · Cash ${rs(T.cash)}</em></div>
      <div><small>Awaiting payment</small><b class="num">${rs(due)}</b><em>${prep.length + ready.length} open orders</em></div>
      <div><small>Average basket</small><b class="num">${rs(T.orders ? T.rev/T.orders : 0)}</b><em>per order today</em></div></div>
    <div class="ogrid">
      <div class="box"><h3>Live orders <span class="r">latest 8</span></h3>${ordersTable([...os].sort((a,b)=>b.createdAt-a.createdAt).slice(0,8),{})}</div>
      <div class="box"><h3><span style="color:var(--orange)">▲</span> Needs attention</h3><div class="attn">${attentionHTML()}</div></div>
      ${compact ? '' : `<div class="box"><h3>Sales, last 7 days <span class="r">today so far in orange</span></h3>${chart(last7, lab7, 1, 'Sales for the last 7 days')}</div>`}
      <div class="box"><h3>Stores today</h3><div class="stores">${ORDER.map(k => `<div class="store"><span class="e ${STORES[k].t}">${STORES[k].e}</span><div><b>${STORES[k].name}</b><small>${openTasks(k).length} open tasks · ${rs(T.st[k])} sales</small><div class="bar"><i style="width:${Math.round(T.st[k]/maxS*100)}%"></i></div></div><span class="online">Online</span></div>`).join('')}</div></div>
      <div class="box${compact ? '' : ' wide'}"><h3>Activity</h3><div class="log">${S.log.slice(0, compact ? 8 : 12).map(l => `<div><time>${tm(l.t)}</time><span>${esc(l.x)}</span></div>`).join('')}</div></div>
    </div></div>`;
}
function salesHTML(){
  const per = S.ui.period;
  let cur, prev, vals, labels, every, title;
  if(per === 'today'){
    const T = todayRec(); cur = T; prev = null;
    const h0 = 7, h1 = Math.max(h0+1, new Date().getHours());
    vals = []; labels = [];
    for(let h = h0; h <= h1; h++){ vals.push(S.orders.filter(o => new Date(o.createdAt).getHours() === h).reduce((s,o)=>s+total(o),0)); labels.push((h % 12 || 12) + (h < 12 ? 'a' : 'p')); }
    every = vals.length > 10 ? 2 : 1; title = 'Sales by hour, today';
  } else {
    const n = +per, ds = S.days.slice(-n);
    cur = sumDays(ds); prev = sumDays(S.days.slice(-2*n, -n));
    vals = ds.map(d=>d.rev); labels = ds.map(d => n === 7 ? new Date(d.date).toLocaleDateString('en-IN',{weekday:'short'}) : String(new Date(d.date).getDate()));
    every = n === 7 ? 1 : 5; title = `Sales by day, ${dShort(ds[0].date)} – ${dShort(ds[ds.length-1].date)}`;
  }
  const avg = cur.orders ? cur.rev/cur.orders : 0, pavg = prev && prev.orders ? prev.rev/prev.orders : 0;
  const upiShare = (cur.upi+cur.cash) ? Math.round(cur.upi/(cur.upi+cur.cash)*100) : 0;
  const stTot = ORDER.reduce((s,k)=>s+cur.st[k],0) || 1, maxS = Math.max(1, ...ORDER.map(k=>cur.st[k]));
  const top = Object.entries(cur.itemRev).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return `<div class="ocq"><div class="ohead"><h2>Sales &amp; revenue</h2>
      <div class="filters" style="margin:0">${[['today','Today'],['7','Last 7 days'],['30','Last 30 days']].map(([k,l])=>`<button class="chip" data-a="period" data-v="${k}" aria-pressed="${per===k}">${l}</button>`).join('')}</div></div>
    <div class="kpis">
      ${kpi('var(--green-soft)','💰','Revenue',rs(cur.rev), prev ? pct(cur.rev,prev.rev) : null)}
      ${kpi('var(--orange-soft)','🛒','Orders',cur.orders.toLocaleString('en-IN'), prev ? pct(cur.orders,prev.orders) : null)}
      ${kpi('var(--green-soft)','🧺','Average basket',rs(avg), prev ? pct(avg,pavg) : null)}
      ${kpi('var(--orange-soft)','📱','Paid by UPI',upiShare + '%')}
    </div>
    <div class="ogrid">
      <div class="box wide"><h3>${title}</h3>${chart(vals, labels, every, title)}</div>
      <div class="box"><h3>Top products <span class="r">by revenue</span></h3><div class="tbl"><table><thead><tr><th>Item</th><th>Store</th><th class="r">Units</th><th class="r">Revenue</th></tr></thead><tbody>
        ${top.map(([id,v]) => { const p = prod(id); return `<tr><td>${p.e} ${esc(p.name)}</td><td>${STORES[p.cat].short}</td><td class="r num">${(cur.items[id]||0).toLocaleString('en-IN')}</td><td class="r num">${rs(v)}</td></tr>`; }).join('')}
      </tbody></table></div></div>
      <div class="box"><h3>Revenue by store</h3><div class="stores">${ORDER.map(k => `<div class="store"><span class="e ${STORES[k].t}">${STORES[k].e}</span><div><b>${STORES[k].name}</b><small>${rs(cur.st[k])} · ${Math.round(cur.st[k]/stTot*100)}% of revenue</small><div class="bar"><i style="width:${Math.round(cur.st[k]/maxS*100)}%"></i></div></div><span></span></div>`).join('')}</div>
        <p class="note-s">Revenue is the value of orders billed. Profit needs purchase cost, wastage and expenses, which come in the next phase.</p></div>
    </div>
    <p class="note-s">${per === 'today' ? 'Today updates live as orders are placed.' : 'Closed days only. Today is in the Today view.'} Sample data for the demo.</p></div>`;
}
function paymentsHTML(){
  const T = todayRec();
  const coll = S.orders.filter(o => o.stage === 'collected').sort((a,b)=>b.collectedAt-a.collectedAt);
  const list = S.ui.payf === 'all' ? coll : coll.filter(o => o.payment === S.ui.payf);
  const pending = S.orders.filter(o => o.stage !== 'collected').sort((a,b)=>a.createdAt-b.createdAt);
  const due = pending.reduce((s,o)=>s+total(o),0);
  const last = S.days.slice(-7).reverse();
  const listSum = list.reduce((s,o)=>s+total(o),0);
  return `<div class="ocq"><div class="ohead"><h2>Payments</h2><span class="datepill">Today · ${dLong(Date.now())}</span></div>
    <div class="kpis">
      ${kpi('var(--green-soft)','✅','Collected today',rs(T.upi+T.cash))}
      ${kpi('var(--green-soft)','📱','UPI',rs(T.upi))}
      ${kpi('var(--orange-soft)','💵','Cash',rs(T.cash))}
      ${kpi('var(--red-soft)','⏳','Awaiting payment',rs(due))}
    </div>
    <div class="ogrid">
      <div class="box"><h3>Today’s payments <span class="r">${list.length} payments · ${rs(listSum)}</span></h3>
        <div class="filters">${[['all','All'],['UPI','UPI'],['Cash','Cash']].map(([k,l])=>`<button class="chip" data-a="payf" data-v="${k}" aria-pressed="${S.ui.payf===k}">${l}</button>`).join('')}</div>
        <div class="tbl" style="max-height:420px;overflow-y:auto"><table><thead><tr><th>Time</th><th>Token</th><th>Customer</th><th>Method</th><th class="r">Amount</th></tr></thead><tbody>
        ${list.map(o => `<tr><td class="num">${tm(o.collectedAt)}</td><td class="tk">${o.token}</td><td>${esc(o.name)}</td><td><span class="pill ${o.payment === 'UPI' ? 's-ready' : 's-working'}">${o.payment}</span></td><td class="r num">${rs(total(o))}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">No payments yet</td></tr>'}
        </tbody></table></div></div>
      <div class="box"><h3>Awaiting payment <span class="r">${pending.length} orders</span></h3>
        <div class="tbl"><table><thead><tr><th>Token</th><th>Customer</th><th>Status</th><th class="r">Bill</th></tr></thead><tbody>
        ${pending.map(o => { const [c,l] = orderStatus(o); return `<tr><td class="tk">${o.token}</td><td>${esc(o.name)}</td><td><span class="pill s-${c}">${l}</span></td><td class="r num">${rs(total(o))}</td></tr>`; }).join('') || '<tr><td colspan="4" class="empty">Nothing pending</td></tr>'}
        </tbody></table></div></div>
      <div class="box wide"><h3>Daily settlement <span class="r">last 7 days</span></h3>
        <div class="tbl"><table><thead><tr><th>Date</th><th class="r">Orders</th><th class="r">UPI</th><th class="r">Cash</th><th class="r">Total collected</th></tr></thead><tbody>
        <tr><td><b>Today</b> (so far)</td><td class="r num">${coll.length}</td><td class="r num">${rs(T.upi)}</td><td class="r num">${rs(T.cash)}</td><td class="r num"><b>${rs(T.upi+T.cash)}</b></td></tr>
        ${last.map(d => `<tr><td>${dLong(d.date)}</td><td class="r num">${d.orders}</td><td class="r num">${rs(d.upi)}</td><td class="r num">${rs(d.cash)}</td><td class="r num"><b>${rs(d.rev)}</b></td></tr>`).join('')}
        </tbody><tfoot><tr><td>7-day total</td><td class="r num">${last.reduce((s,d)=>s+d.orders,0)}</td><td class="r num">${rs(last.reduce((s,d)=>s+d.upi,0))}</td><td class="r num">${rs(last.reduce((s,d)=>s+d.cash,0))}</td><td class="r num">${rs(last.reduce((s,d)=>s+d.rev,0))}</td></tr></tfoot></table></div></div>
    </div></div>`;
}
function adminOrdersHTML(){
  const f = S.ui.ordf;
  const list = [...S.orders].filter(o => f === 'all' || (f === 'open' ? o.stage === 'preparing' : o.stage === f)).sort((a,b)=>b.createdAt-a.createdAt);
  const c = x => S.orders.filter(o => x === 'all' || (x === 'open' ? o.stage === 'preparing' : o.stage === x)).length;
  return `<div class="ocq"><div class="ohead"><h2>Orders</h2><span class="datepill">Today · ${S.orders.length} orders</span></div>
    <div class="filters">${[['all','All'],['open','Being packed'],['ready','Ready'],['collected','Collected']].map(([k,l])=>`<button class="chip" data-a="ordf" data-v="${k}" aria-pressed="${f===k}">${l} · ${c(k)}</button>`).join('')}</div>
    <div class="box">${ordersTable(list,{time:true,pay:true})}</div></div>`;
}
function adminRatesHTML(){
  return `<div class="ocq"><div class="ohead"><h2>Rates &amp; stock</h2><span class="datepill">Published ${tm(S.rates.at)} by ${S.rates.by}</span></div>
    <p class="hint">Store staff publish rates and stock each morning from their login. This view is read-only for the owner.</p>
    <div class="box"><div class="tbl"><table><thead><tr><th>Item</th><th>Store</th><th>Unit</th><th class="r">Yesterday</th><th class="r">Today</th><th class="r">Change</th><th>Stock</th></tr></thead><tbody>
    ${S.products.map(p => { const d = p.price - p.prev; return `<tr><td>${p.e} ${esc(p.name)}</td><td>${STORES[p.cat].short}</td><td>${p.unit}</td><td class="r num">${rs(p.prev)}</td><td class="r num"><b>${rs(p.price)}</b></td><td class="r num ${d > 0 ? 'chg-up' : d < 0 ? 'chg-dn' : ''}">${d > 0 ? '▲ ' + rs(d) : d < 0 ? '▼ ' + rs(-d) : '—'}</td><td><span class="pill ${p.avail ? 's-in' : 's-out'}">${p.avail ? 'In stock' : 'Out of stock'}</span></td></tr>`; }).join('')}
    </tbody></table></div></div></div>`;
}
function adminHTML(){
  const secs = [['overview','🏠','Overview'],['orders','🧾','Orders'],['sales','📈','Sales & revenue'],['payments','💳','Payments'],['rates','🏷️','Rates & stock']];
  const s = S.ui.adm;
  const body = s === 'orders' ? adminOrdersHTML() : s === 'sales' ? salesHTML() : s === 'payments' ? paymentsHTML() : s === 'rates' ? adminRatesHTML() : overviewHTML(false);
  return `<div class="adm"><nav class="side" role="tablist" aria-label="Owner sections"><div class="lbl">Owner</div>
    ${secs.map(([k,e,l]) => `<button role="tab" data-a="adm" data-v="${k}" aria-selected="${s===k}"><span aria-hidden="true">${e}</span>${l}</button>`).join('')}</nav>
    <section class="admmain">${body}</section></div>`;
}

/* ---------------- Home, login, presentation ---------------- */
function homeHTML(){
  return `<div class="wrap">
    <section class="hero"><div><h1>One order. Three stores. <em>One token.</em></h1>
      <p>Customers order vegetables, fruits and fresh juice in one basket. Each store packs its part, the customer gets a ready message, then pays and collects at the counter.</p></div>
      <div class="logo-plate"><img src="assets/logo.png" alt="Shree Balaji Fruits and Vegetable"></div></section>
    <p class="sect-t">Open the app as</p>
    <section class="roles">
      <div class="role"><span class="ic t-veg">🛒</span><h2>Customer</h2><p>See today’s rates, build one basket across all three stores and get a pickup token.</p><button data-a="nav" data-v="shop">Start shopping</button></div>
      <div class="role"><span class="ic t-fruit">🧑‍🌾</span><h2>Store staff</h2><p>Publish daily rates, mark items out of stock, weigh and pack orders, hand over at the counter.</p>
        <div class="cred">Demo login: <code>staff</code> / <code>Staff@123</code></div><button data-a="nav" data-v="staff">Staff login</button></div>
      <div class="role"><span class="ic t-juice">📊</span><h2>Owner</h2><p>Live dashboard, sales and revenue report, payment details (UPI and cash) for all stores.</p>
        <div class="cred">Demo login: <code>owner</code> / <code>Owner@123</code></div><button data-a="nav" data-v="admin">Owner login</button></div>
      <div class="role alt"><span class="ic" style="background:var(--green-soft)">🖥️</span><h2>Presentation mode</h2><p>Customer phone, store screens and owner dashboard side by side. Best on a laptop or tablet.</p><button data-a="nav" data-v="demo">Open presentation</button></div>
    </section>
    <p class="sect-t">How it works</p>
    <section class="steps">
      <div class="stepc"><b>Step 1</b><h3>Order</h3><p>Customer picks items from all three stores and places one order.</p></div>
      <div class="stepc"><b>Step 2</b><h3>Pack</h3><p>Each store weighs and packs its own items. Higher weights need the customer’s OK.</p></div>
      <div class="stepc"><b>Step 3</b><h3>Ready message</h3><p>When every part is packed, the customer is told the order is ready.</p></div>
      <div class="stepc"><b>Step 4</b><h3>Pay &amp; collect</h3><p>Customer shows the token at Main Counter and pays by UPI or cash.</p></div>
    </section>
    <p class="foot">Demo with sample products, prices and orders. Data is saved only in this browser. <button class="btn-s" data-a="reset" id="resetBtn">Reset demo data</button></p>
  </div>`;
}
function loginHTML(role){
  const u = USERS[role];
  return `<div class="wrap login"><form class="lcard" id="login" data-role="${role}" autocomplete="off" novalidate>
    <img src="assets/logo.png" alt="Shree Balaji">
    <h1>${role === 'admin' ? 'Owner login' : 'Staff login'}</h1>
    <p class="sub">${role === 'admin' ? 'Dashboard, sales report and payments' : 'Daily rates, stock and orders'}</p>
    <div class="field"><label for="lu">Username</label><input id="lu" autocapitalize="none" spellcheck="false"></div>
    <div class="field"><label for="lp">Password</label><input id="lp" type="password"></div>
    ${S.ui.loginErr ? `<div class="err" role="alert">${esc(S.ui.loginErr)}</div>` : ''}
    <button class="primary" type="submit">Log in</button>
    <div class="demo-cred"><span>Demo login: <code>${u.user}</code> / <code>${u.pass}</code></span><button type="button" class="btn-s" data-a="fill" data-v="${role}">Fill demo login</button></div>
  </form></div>`;
}
function demoHTML(){
  const open = ORDER.reduce((s,k)=>s+openTasks(k).length,0) + S.orders.filter(o=>o.stage==='ready').length;
  const v = S.ui.dview;
  return `<nav class="dtabs" role="tablist">${[['customer','Customer app',cartCount()],['stores','Store staff',open],['owner','Owner',0]].map(([k,l,n]) => `<button role="tab" data-a="dview" data-v="${k}" aria-selected="${v===k}">${l}${n ? `<span class="badge">${n}</span>` : ''}</button>`).join('')}</nav>
    <main class="stage">
      <section class="panel p-cust${v==='customer' ? ' on' : ''}"><div class="phead"><b>Customer app</b><span>What shoppers see on their phone</span></div><div class="pbody">${custHTML(true)}</div></section>
      <section class="panel p-stores${v==='stores' ? ' on' : ''}"><div class="phead"><b>Store staff</b><span>Each counter sees only its own items</span></div><div class="pbody">${ordersBoardHTML()}</div></section>
      <section class="panel p-owner${v==='owner' ? ' on' : ''}"><div class="phead"><b>Owner dashboard</b><span>All three stores, live</span></div><div class="pbody">${overviewHTML(true)}</div></section>
    </main>`;
}
function topbar(){
  const r = S.ui.route;
  const sub = {home:'Order & pickup app', shop:'Customer app', staff:'Staff', admin:'Owner', demo:'Presentation mode', 'login-staff':'Staff login', 'login-admin':'Owner login'}[r];
  let right = '';
  if(r === 'shop') right = `<button class="iconbtn" data-a="go" data-v="basket" aria-label="Basket">${svg.bag}${cartCount() ? `<span class="badge">${cartCount()}</span>` : ''}</button>`;
  if(r === 'staff' || r === 'admin'){ const role = r; right = `<span class="who"><span class="av">${USERS[role].initials}</span><span class="nm">${USERS[role].label}</span></span><button class="btn-s" data-a="logout" data-v="${role}">Log out</button>`; }
  if(r !== 'home') right = `<button class="btn-s" data-a="nav" data-v="home">Home</button>` + right;
  return `<header class="top"><div class="in"><button class="brand" data-a="nav" data-v="home" aria-label="Home"><img src="assets/logo.png" alt="Shree Balaji"><span><b>Shree Balaji</b><small>${sub}</small></span></button><span class="sp"></span>${right}</div></header>`;
}

function render(){
  const r = S.ui.route;
  let main;
  if(r === 'shop') main = custHTML(false);
  else if(r === 'staff') main = S.session.staff ? staffHTML() : loginHTML('staff');
  else if(r === 'admin') main = S.session.admin ? adminHTML() : loginHTML('admin');
  else if(r === 'login-staff') main = loginHTML('staff');
  else if(r === 'login-admin') main = loginHTML('admin');
  else if(r === 'demo') main = demoHTML();
  else main = homeHTML();
  document.getElementById('app').innerHTML = topbar() + main;
}

/* ---------------- Events ---------------- */
let armT;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if(!b) return;
  const a = b.dataset.a, v = b.dataset.v, k = b.dataset.k;
  if(a === 'reset'){
    if(!b.classList.contains('arm')){ b.classList.add('arm'); b.textContent = 'Tap again to reset'; clearTimeout(armT); armT = setTimeout(() => { b.classList.remove('arm'); b.textContent = 'Reset demo data'; }, 3000); return; }
    seed(); save(); render(); return;
  }
  if(!A[a]) return;
  const res = (a === 'pack' || a === 'start' || a === 'approve' || a === 'collect') ? A[a](v,k) : A[a](v);
  if(res === 'norender') return;
  save(); render();
});
document.addEventListener('submit', e => {
  if(e.target.id !== 'login') return;
  e.preventDefault();
  const role = e.target.dataset.role, u = $('#lu').value.trim().toLowerCase(), p = $('#lp').value;
  if(u === USERS[role].user && p === USERS[role].pass){ S.session[role] = true; S.ui.loginErr = ''; S.ui.route = role; setHash(role); }
  else S.ui.loginErr = 'That username or password is not right. Use the demo login shown below.';
  save(); render();
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.id === 'q'){ S.ui.q = t.value; const pl = $('#plist'); if(pl) pl.innerHTML = prodRows(); save(); }
  else if(t.id === 'cname'){ S.ui.name = t.value; save(); }
  else if(t.id === 'cphone'){ S.ui.phone = t.value; save(); }
  else if(t.dataset && t.dataset.rate){
    const id = t.dataset.rate; S.draft[id] = t.value;
    const row = document.getElementById('rr-' + id); if(row) row.classList.toggle('chg', Math.round(+t.value) !== prod(id).price);
    const d = $('#dirty'); if(d){ d.textContent = dirtyText(); d.classList.toggle('on', dirtyCount() > 0); }
    save();
  }
});
window.addEventListener('storage', e => { if(e.key === KEY && load()) render(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if(ROUTES.includes(h) && !S.ui.route.endsWith(h)){ A.nav(h); save(); render(); } });
setInterval(() => {
  const ae = document.activeElement;
  if(ae && (ae.tagName === 'INPUT')) return;
  if(S.ui.notif && Date.now() - S.ui.notif.at >= 9000) S.ui.notif = null;
  if(sod(Date.now()) !== S.day){ seed(); save(); }
  render();
}, 10000);

if(!load() || S.day !== sod(Date.now())) { const old = S; seed(); if(old && old.session) S.session = old.session; save(); }
const h = location.hash.slice(1);
if(ROUTES.includes(h)) A.nav(h);
render();
})();
