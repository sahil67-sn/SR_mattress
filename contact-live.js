// Fills the contact form's Product / Size dropdowns from Firestore.
// Anything the admin adds, updates, hides or marks out of stock shows up here automatically.
// If Firebase fails to load, the options written in the page keep working.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const lang = document.documentElement.lang === "hi" ? "hi" : "en";
const T = {
    en: { notSure: "Not sure yet", pickSize: "Select size / pack", any: "Any / not sure", oos: " (Out of Stock)" },
    hi: { notSure: "अभी तय नहीं किया", pickSize: "साइज़ / पैक चुनें", any: "कोई भी / तय नहीं", oos: " (स्टॉक में नहीं)" }
}[lang];

const pick = (p, k) => (lang === "hi" ? (p[k + "Hi"] || p[k]) : p[k]) || "";
const money = n => Number(n).toLocaleString("en-IN");

const prSel = document.getElementById("pr");
const szSel = document.getElementById("sz");
const szWrap = document.getElementById("sz-wrap");

function opt(text, value, extra = {}) {
    const o = document.createElement("option");
    o.textContent = text;
    o.value = value ?? text;
    if (extra.id) o.dataset.id = extra.id;
    if (extra.disabled) o.disabled = true;
    return o;
}

function fillSizes(p) {
    if (!szSel || !szWrap) return;
    szSel.innerHTML = "";
    const sizes = (p?.sizes || []).filter(s => Number(s.price) > 0);
    if (!sizes.length) { szWrap.hidden = true; return; }
    szSel.appendChild(opt(T.any, ""));
    sizes.forEach(s => {
        const label = lang === "hi" ? (s.labelHi || s.label) : s.label;
        szSel.appendChild(opt(`${label} - ₹${money(s.price)}`, label));
    });
    szWrap.hidden = false;
}

(async () => {
    if (!prSel || String(firebaseConfig.apiKey).startsWith("PASTE")) return;
    try {
        const db = getFirestore(initializeApp(firebaseConfig));
        const snap = await getDocs(query(collection(db, "products"), orderBy("order")));
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.visible !== false);
        if (!items.length) return;

        const byId = Object.fromEntries(items.map(p => [p.id, p]));
        prSel.innerHTML = "";
        items.forEach(p => {
            const oos = p.inStock === false;
            prSel.appendChild(opt(pick(p, "name") + (oos ? T.oos : ""), pick(p, "name"), { id: p.id, disabled: oos }));
        });
        prSel.appendChild(opt(T.notSure, T.notSure));

        prSel.addEventListener("change", () => {
            const id = prSel.selectedOptions[0]?.dataset.id;
            fillSizes(byId[id]);
        });

        // If opened with ?product=<id>, that product is pre-selected
        const want = new URLSearchParams(location.search).get("product");
        const first = [...prSel.options].find(o => !o.disabled && (want ? o.dataset.id === want : true)) || [...prSel.options].find(o => !o.disabled);
        if (first) first.selected = true;
        fillSizes(byId[prSel.selectedOptions[0]?.dataset.id]);
    } catch (e) {
        console.warn("Product dropdown failed to load, using the built-in options:", e);
    }
})();
