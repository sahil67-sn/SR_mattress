// Fills the products page from Firestore.
// If Firebase is not set up or fails to load, the products written in the page stay visible.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const lang = document.documentElement.lang === "hi" ? "hi" : "en";
const T = {
    en: {
        start: "Starting at", hint: "Hover for prices", price: "Price", ws: "Wholesale:",
        enq: "Enquire on WhatsApp", oos: "Out of Stock",
        wsLine: (p, u, m) => ` from ₹${p} per ${u} · MOQ ${m} pcs`,
        wa: n => `I want to enquire about ${n}`
    },
    hi: {
        start: "शुरुआती दाम", hint: "दाम देखने के लिए माउस ले जाएँ", price: "दाम", ws: "थोक:",
        enq: "WhatsApp पर पूछें", oos: "स्टॉक में नहीं",
        wsLine: (p, u, m) => ` ₹${p} प्रति ${u} से शुरू · न्यूनतम ${m} पीस`,
        wa: n => `मुझे ${n} के बारे में पूछना है`
    }
}[lang];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => Number(n).toLocaleString("en-IN");
const pick = (p, k) => (lang === "hi" ? (p[k + "Hi"] || p[k]) : p[k]) || "";

function card(p) {
    const sizes = (p.sizes || []).filter(s => Number(s.price) > 0);
    const name = pick(p, "name");
    const from = sizes.length ? Math.min(...sizes.map(s => Number(s.price))) : 0;
    const badge = p.inStock === false ? T.oos : pick(p, "badge");
    const rows = sizes.map(s => `<tr><td>${esc(lang === "hi" ? (s.labelHi || s.label) : s.label)}</td><td>₹${money(s.price)}</td></tr>`).join("");
    const ws = Number(p.wholesalePrice) > 0
        ? `<div class="wsale"><b>${T.ws}</b>${esc(T.wsLine(money(p.wholesalePrice), pick(p, "unit"), p.moq || 10))}</div>` : "";
    const wa = "https://wa.me/918852099018?text=" + encodeURIComponent(T.wa(name));
    return `
<article class="pcard reveal${p.inStock === false ? " oos" : ""}" tabindex="0">
  <div class="pimg">
    ${badge ? `<span class="badge">${esc(badge)}</span>` : ""}
    <img alt="${esc(name)}" loading="lazy" src="${esc(p.image)}">
  </div>
  <div class="pbody">
    <h3>${esc(name)}</h3>
    <p class="sub">${esc(pick(p, "sub"))}</p>
    <div class="from"><small>${T.start}</small><b>₹${money(from)}</b><span class="hint">${T.hint}</span></div>
  </div>
  <div class="pdetail">
    <h4>${esc(name)}</h4>
    <div class="spec">${esc(pick(p, "spec"))}</div>
    <table class="ptable">
      <thead><tr><th>${esc(pick(p, "sizeHead") || (lang === "hi" ? "साइज़ (इंच)" : "Size (inches)"))}</th><th>${T.price}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${ws}
    <a class="btn btn-gold" href="${wa}" rel="noopener" target="_blank">${T.enq}</a>
  </div>
</article>`;
}

(async () => {
    const box = document.querySelector(".product-card");
    if (!box || String(firebaseConfig.apiKey).startsWith("PASTE")) return;
    try {
        const db = getFirestore(initializeApp(firebaseConfig));
        const snap = await getDocs(query(collection(db, "products"), orderBy("order")));
        const items = snap.docs.map(d => d.data()).filter(p => p.visible !== false);
        if (items.length) box.innerHTML = items.map(card).join("");
    } catch (e) {
        console.warn("Products failed to load, showing the built-in ones:", e);
    }
})();
