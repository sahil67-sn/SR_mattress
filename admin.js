import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---- Purane (abhi website pe likhe) products - "Import" button se database mein jaate hain ---- */
const SEED = [
    {
        id: "royal-navy-pillow-top", order: 1, visible: true, inStock: true,
        name: "Royal Navy Pillow-Top Mattress", nameHi: "रॉयल नेवी पिलो-टॉप गद्दा",
        badge: "Best Seller", badgeHi: "बेस्ट सेलर",
        sub: "Premium floral jacquard fabric · double-layer pillow top", subHi: "प्रीमियम फ्लोरल जैकार्ड कपड़ा · डबल-लेयर पिलो टॉप",
        spec: "8 inch · Strong edge support · Skin friendly", specHi: "8 इंच · मज़बूत किनारा · त्वचा के अनुकूल",
        image: "assets/img/navy-mattress.jpg",
        sizeHead: "Size (inches)", sizeHeadHi: "साइज़ (इंच)",
        sizes: [
            { label: "Single (72x36)", labelHi: "सिंगल (72x36)", price: 5499 },
            { label: "Double (72x48)", labelHi: "डबल (72x48)", price: 7999 },
            { label: "Queen (78x60)", labelHi: "क्वीन (78x60)", price: 9999 },
            { label: "King (78x72)", labelHi: "किंग (78x72)", price: 11999 }
        ],
        wholesalePrice: 4300, moq: 10, unit: "mattress", unitHi: "गद्दा"
    },
    {
        id: "classic-brown-star", order: 2, visible: true, inStock: true,
        name: "Classic Brown Star Mattress", nameHi: "क्लासिक ब्राउन स्टार गद्दा",
        badge: "Classic", badgeHi: "क्लासिक",
        sub: "Diamond quilted fabric · soft touch · breathable", subHi: "डायमंड क्विल्टेड कपड़ा · मुलायम स्पर्श · हवादार",
        spec: "6 inch · Dual piping edge · Breathable", specHi: "6 इंच · डबल पाइपिंग किनारा · हवादार",
        image: "assets/img/brown-mattress.jpg",
        sizeHead: "Size (inches)", sizeHeadHi: "साइज़ (इंच)",
        sizes: [
            { label: "Single (72x36)", labelHi: "सिंगल (72x36)", price: 3999 },
            { label: "Double (72x48)", labelHi: "डबल (72x48)", price: 5799 },
            { label: "Queen (78x60)", labelHi: "क्वीन (78x60)", price: 7299 },
            { label: "King (78x72)", labelHi: "किंग (78x72)", price: 8799 }
        ],
        wholesalePrice: 3100, moq: 10, unit: "mattress", unitHi: "गद्दा"
    },
    {
        id: "silky-comfort-pillows", order: 3, visible: true, inStock: true,
        name: "Silky Comfort Pillows", nameHi: "सिल्की कम्फर्ट तकिए",
        badge: "Daily Comfort", badgeHi: "रोज़ का आराम",
        sub: "Soft polyester fibre fill · paisley print cover", subHi: "मुलायम पॉलिएस्टर फाइबर फिल · पेस्ली प्रिंट कवर",
        spec: "17x27 inch · Lightweight · Easy to carry", specHi: "17x27 इंच · हल्का · आसानी से ले जाने लायक",
        image: "assets/img/pillow.jpg",
        sizeHead: "Pack", sizeHeadHi: "पैक",
        sizes: [
            { label: "1 Pillow", labelHi: "1 तकिया", price: 249 },
            { label: "Pair (2 pcs)", labelHi: "जोड़ी (2 पीस)", price: 449 },
            { label: "Pack of 4", labelHi: "4 का पैक", price: 849 },
            { label: "Pack of 6", labelHi: "6 का पैक", price: 1199 }
        ],
        wholesalePrice: 165, moq: 50, unit: "pillow", unitHi: "तकिया"
    }
];

/* ---- Setup check ---- */
const notice = $("#notice");
function say(msg, err = false) {
    notice.textContent = msg;
    notice.className = "notice" + (err ? " err" : "");
    notice.hidden = false;
    if (!err) setTimeout(() => { notice.hidden = true; }, 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

if (String(firebaseConfig.apiKey).startsWith("PASTE")) {
    say("Firebase abhi set nahi hai. firebase-config.js mein apni keys paste karein (SETUP-GUIDE.md dekhein).", true);
    throw new Error("Firebase config missing");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBox = $("#login-box"), dash = $("#dash"), who = $("#who"), list = $("#list");

/* ---- Login / logout ---- */
$("#login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = e.submitter; btn.disabled = true;
    try {
        await signInWithEmailAndPassword(auth, $("#email").value.trim(), $("#password").value);
        $("#password").value = "";
    } catch (err) {
        const bad = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"];
        say(bad.includes(err.code) ? "Email ya password galat hai." :
            err.code === "auth/too-many-requests" ? "Bahut baar galat try kiya, thodi der baad dobara koshish karein." :
            "Login nahi hua: " + err.code, true);
    }
    btn.disabled = false;
});
$("#logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
    loginBox.hidden = !!user;
    dash.hidden = !user;
    who.hidden = !user;
    if (user) { $("#who-email").textContent = user.email; load(); }
    else list.innerHTML = "";
});

/* ---- Load & render ---- */
let items = [];
async function load() {
    try {
        const snap = await getDocs(query(collection(db, "products"), orderBy("order")));
        items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        say("Products load nahi hue: " + err.code, true);
        return;
    }
    $("#seed").hidden = items.length > 0;
    list.innerHTML = items.length ? "" : '<p class="muted">Abhi koi product nahi hai. "Purane Products Import Karein" dabayein ya naya product jodein.</p>';
    items.forEach(p => list.appendChild(formEl(p.id, p, false)));
}

function sizeRow(s = {}) {
    const d = document.createElement("div");
    d.className = "grid3 srow";
    d.innerHTML = `
        <div class="field"><label>Size / Pack (English)</label><input data-s="label" value="${esc(s.label)}" placeholder="Single (72x36)"></div>
        <div class="field"><label>Size / Pack (Hindi)</label><input data-s="labelHi" value="${esc(s.labelHi)}" placeholder="सिंगल (72x36)"></div>
        <div class="field"><label>Daam (₹)</label><input data-s="price" type="number" min="0" step="1" value="${esc(s.price)}"></div>
        <div class="rmwrap"><button type="button" class="rm">Hatayein</button></div>`;
    d.querySelector(".rm").addEventListener("click", () => d.remove());
    return d;
}

function f(label, name, val, opts = {}) {
    return `<div class="field"><label>${label}</label>
        <input data-f="${name}" value="${esc(val)}" ${opts.list ? `list="${opts.list}"` : ""} ${opts.type ? `type="${opts.type}"` : ""} ${opts.min != null ? `min="${opts.min}"` : ""} ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""}></div>`;
}

function formEl(id, p, isNew) {
    const d = document.createElement("details");
    d.className = "prod";
    if (isNew) d.open = true;
    const inStock = p.inStock !== false, visible = p.visible !== false;
    d.innerHTML = `
        <summary>
            <img src="${esc(p.image || "")}" alt="">
            <span class="t">${esc(p.name || "Naya Product")}<small>${esc(p.nameHi || "")}</small></span>
            <span class="pill ${inStock ? "" : "off"}">${inStock ? "In Stock" : "Out of Stock"}</span>
        </summary>
        <div class="pform">
            <div class="checks2">
                <label><input type="checkbox" data-f="inStock" ${inStock ? "checked" : ""}> Stock mein hai</label>
                <label><input type="checkbox" data-f="visible" ${visible ? "checked" : ""}> Website pe dikhayein</label>
            </div>
            <div class="grid2">
                ${f("Naam (English)", "name", p.name)}
                ${f("Naam (Hindi)", "nameHi", p.nameHi)}
                ${f("Badge (English)", "badge", p.badge, { ph: "Best Seller" })}
                ${f("Badge (Hindi)", "badgeHi", p.badgeHi, { ph: "बेस्ट सेलर" })}
                ${f("Choti line (English)", "sub", p.sub)}
                ${f("Choti line (Hindi)", "subHi", p.subHi)}
                ${f("Specs (English)", "spec", p.spec, { ph: "8 inch · Strong edge" })}
                ${f("Specs (Hindi)", "specHi", p.specHi)}
                ${f("Photo (assets/img/...)", "image", p.image, { list: "images" })}
                ${f("Number (order mein kaunsa)", "order", p.order ?? items.length + 1, { type: "number", min: 1 })}
                ${f("Table header (English)", "sizeHead", p.sizeHead ?? "Size (inches)")}
                ${f("Table header (Hindi)", "sizeHeadHi", p.sizeHeadHi ?? "साइज़ (इंच)")}
            </div>

            <h3>Sizes aur Daam</h3>
            <div class="sizes"></div>
            <button type="button" class="btn btn-navy sm add-size">+ Size jodein</button>

            <h3>Wholesale</h3>
            <div class="grid2">
                ${f("Wholesale daam (₹, 0 = na dikhayein)", "wholesalePrice", p.wholesalePrice ?? 0, { type: "number", min: 0 })}
                ${f("Minimum quantity (pcs)", "moq", p.moq ?? 10, { type: "number", min: 1 })}
                ${f("Unit (English)", "unit", p.unit ?? "mattress", { ph: "mattress" })}
                ${f("Unit (Hindi)", "unitHi", p.unitHi ?? "गद्दा", { ph: "गद्दा" })}
            </div>

            <div class="pactions">
                <button type="button" class="btn btn-gold save">Save</button>
                ${isNew ? "" : '<button type="button" class="btn btn-red del">Product Hatayein</button>'}
            </div>
        </div>`;

    const box = d.querySelector(".sizes");
    (p.sizes?.length ? p.sizes : [{}]).forEach(s => box.appendChild(sizeRow(s)));
    d.querySelector(".add-size").addEventListener("click", () => box.appendChild(sizeRow()));

    d.querySelector(".save").addEventListener("click", async e => {
        const data = collect(d);
        if (!data.name) return say("Naam (English) zaroori hai.", true);
        if (!data.sizes.length) return say("Kam se kam ek size aur daam daalein.", true);
        e.target.disabled = true;
        try {
            const docId = isNew ? slug(data.name) : id;
            await setDoc(doc(db, "products", docId), data);
            say("Save ho gaya. Website pe dikhne lagega.");
            await load();
        } catch (err) {
            say("Save nahi hua: " + err.code + " (kya aap sahi admin email se login hain?)", true);
            e.target.disabled = false;
        }
    });

    const del = d.querySelector(".del");
    if (del) del.addEventListener("click", async () => {
        if (!confirm(`"${p.name}" hamesha ke liye hata dein?`)) return;
        try { await deleteDoc(doc(db, "products", id)); say("Product hata diya."); await load(); }
        catch (err) { say("Hata nahi paaya: " + err.code, true); }
    });
    return d;
}

function collect(d) {
    const v = n => d.querySelector(`[data-f="${n}"]`);
    const txt = n => v(n).value.trim();
    const num = n => Number(v(n).value) || 0;
    const sizes = [...d.querySelectorAll(".srow")].map(r => {
        const g = k => r.querySelector(`[data-s="${k}"]`).value.trim();
        return { label: g("label"), labelHi: g("labelHi") || g("label"), price: Number(g("price")) || 0 };
    }).filter(s => s.label && s.price > 0);
    return {
        name: txt("name"), nameHi: txt("nameHi") || txt("name"),
        badge: txt("badge"), badgeHi: txt("badgeHi") || txt("badge"),
        sub: txt("sub"), subHi: txt("subHi") || txt("sub"),
        spec: txt("spec"), specHi: txt("specHi") || txt("spec"),
        image: txt("image"),
        sizeHead: txt("sizeHead"), sizeHeadHi: txt("sizeHeadHi"),
        order: num("order") || 99,
        inStock: v("inStock").checked, visible: v("visible").checked,
        wholesalePrice: num("wholesalePrice"), moq: num("moq") || 10,
        unit: txt("unit") || "piece", unitHi: txt("unitHi") || txt("unit") || "पीस",
        sizes
    };
}

const slug = s => (s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product") + "-" + Date.now().toString(36);

/* ---- Naya product / Import ---- */
$("#add").addEventListener("click", () => {
    const el = formEl(null, {}, true);
    list.prepend(el);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#seed").addEventListener("click", async e => {
    if (!confirm("Website ke purane 3 products database mein daal dein?")) return;
    e.target.disabled = true;
    try {
        for (const { id, ...data } of SEED) await setDoc(doc(db, "products", id), data);
        say("Import ho gaya. Ab aap inhe edit kar sakte hain.");
        await load();
    } catch (err) {
        say("Import nahi hua: " + err.code, true);
        e.target.disabled = false;
    }
});
