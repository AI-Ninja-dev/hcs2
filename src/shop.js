const menuToggle = document.getElementById("shop-menu-toggle");
const navLinks = document.getElementById("shop-nav-links");

function closeShopMenu() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
}

menuToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeShopMenu));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) closeShopMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeShopMenu();
});
matchMedia("(min-width:981px)").addEventListener("change", closeShopMenu);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}


const expandedCatalogue = [
  { brand: "Yuwell", model: "Anytime 5 Pro CGM", category: "diabetes", label: "CGM", detail: "Continuous glucose monitoring option for home diabetes management and trend tracking.", image: "images/products/yuwell-anytime-5pro.webp" },
  { brand: "Yuwell", model: "YX301 Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Fingertip SpO₂ and pulse-rate spot checks for everyday home monitoring." },
  { brand: "Yuwell", model: "5L Oxygen Concentrator", category: "home-equipment", label: "Respiratory", detail: "Home oxygen-concentrator range for prescribed oxygen therapy; exact Yuwell model confirmed before order." },
  { brand: "Yuwell", model: "M102 Mesh Nebuliser", category: "home-equipment", label: "Respiratory", detail: "Compact mesh-nebuliser option for prescribed inhalation therapy at home." },
  { brand: "Yuwell", model: "Auto CPAP", category: "home-equipment", label: "Sleep & respiratory", detail: "Yuwell positive-airway-pressure equipment for prescribed home sleep-therapy use." },
  { brand: "Yuwell", model: "BiPAP / Bi-Level PAP", category: "home-equipment", label: "Sleep & respiratory", detail: "Yuwell bi-level positive-airway-pressure range for supported prescribed home-care requirements." },

  { brand: "Rossmax", model: "Z5 PARR BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Automatic upper-arm monitor with PARR arrhythmia screening and Bluetooth connectivity." },
  { brand: "Rossmax", model: "Z1 BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Automatic upper-arm home blood-pressure monitor with USB Type-C power support." },
  { brand: "Rossmax", model: "X5 BT BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Bluetooth-connected upper-arm monitor with PARR arrhythmia screening." },
  { brand: "Rossmax", model: "X3 BT BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Connected upper-arm home blood-pressure monitor compatible with Rossmax Healthstyle workflows." },
  { brand: "Rossmax", model: "X9 BT BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Connected blood-pressure monitoring with expanded arrhythmia detection features." },
  { brand: "Rossmax", model: "SB200 Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Fingertip SpO₂ and pulse monitoring with Rossmax Artery Check Technology." },
  { brand: "Rossmax", model: "SA300 Handheld Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Handheld SpO₂ and pulse monitor with colour display and optional probe support." },
  { brand: "Rossmax", model: "SA310 Handheld Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Handheld pulse-oximetry option with large memory capacity for repeated monitoring." },
  { brand: "Rossmax", model: "SB220 Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Compact fingertip oxygen-saturation and pulse-rate monitoring for home use." },
  { brand: "Rossmax", model: "SD100 Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Simple fingertip SpO₂ and pulse-rate spot-check monitor." },
  { brand: "Rossmax", model: "HC700 BT Thermometer", category: "home-equipment", label: "Temperature", detail: "Bluetooth non-contact telephoto thermometer with one-second measurement.", image: "images/catalog/thermometer-hc700bt.webp" },
  { brand: "Rossmax", model: "RA600 Ear Thermometer", category: "home-equipment", label: "Temperature", detail: "Infrared ear thermometer for quick home temperature measurement." },
  { brand: "Rossmax", model: "HA500 Temple Thermometer", category: "home-equipment", label: "Temperature", detail: "Non-contact temple thermometer with rapid one-second measurement." },
  { brand: "Rossmax", model: "TG380 Flexible Thermometer", category: "home-equipment", label: "Temperature", detail: "Flexible digital thermometer for routine home temperature checks." },
  { brand: "Rossmax", model: "TG100 Digital Thermometer", category: "home-equipment", label: "Temperature", detail: "Standard digital thermometer for home temperature monitoring." },
  { brand: "Rossmax", model: "HS200 BT+USB Glucose Meter", category: "diabetes", label: "Glucose", detail: "Bluetooth and USB blood-glucose monitoring system with fast testing and memory." },
  { brand: "Rossmax", model: "HS200 Glucose Meter", category: "diabetes", label: "Glucose", detail: "Blood-glucose monitoring system for routine home diabetes checks.", image: "images/catalog/glucometer.webp" },
  { brand: "Rossmax", model: "HS200 Test Strips", category: "diabetes", label: "Consumables", detail: "Compatible Rossmax HS200 blood-glucose test strips; meter compatibility confirmed before supply.", image: "images/catalog/glucose-strips.jpg" },
  { brand: "Rossmax", model: "WF262 Body Fat Scale", category: "home-equipment", label: "Weight", detail: "Connected body-weight and body-composition tracking for home wellness monitoring.", image: "images/catalog/scale-wb101.webp" },
  { brand: "Rossmax", model: "NL100 Piston Nebuliser", category: "home-equipment", label: "Respiratory", detail: "Compressor/piston nebuliser for prescribed respiratory therapy at home." },

  { brand: "CONTEC", model: "CONTEC08C-BT BP Monitor", category: "blood-pressure", label: "Blood pressure", detail: "Bluetooth electronic sphygmomanometer for home NIBP measurement with stored-data transfer." },
  { brand: "CONTEC", model: "CMS50D-BT Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Bluetooth fingertip pulse oximeter for SpO₂ and pulse-rate monitoring in the home." },
  { brand: "CONTEC", model: "CMS50D+ Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Portable fingertip pulse oximeter with SpO₂, pulse, waveform and data-storage functions." },
  { brand: "CONTEC", model: "CMS50D Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Compact fingertip SpO₂ and pulse-rate monitor for straightforward home checks." },
  { brand: "CONTEC", model: "CMS50E Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Rechargeable pulse oximeter with data storage and real-time data transmission." },
  { brand: "CONTEC", model: "CMS50EW Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Wireless fingertip pulse oximeter with memory and configurable display." },
  { brand: "CONTEC", model: "CMS50ED Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Rechargeable fingertip SpO₂ and pulse monitor for family and community use." },
  { brand: "CONTEC", model: "CMS50I Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Rechargeable pulse oximeter with perfusion-index display, memory and wired data upload." },
  { brand: "CONTEC", model: "CMS50L Pulse Oximeter", category: "heart", label: "Pulse & oxygen", detail: "Simple home pulse oximeter with SpO₂, pulse rate and audible readout support." },
  { brand: "CONTEC", model: "OC30 Oxygen Concentrator", category: "home-equipment", label: "Respiratory", detail: "Mobile oxygen concentrator designed for family and community oxygen supply, with alarms and nebulisation support." }
];

function injectExpandedCatalogue() {
  const grid = document.querySelector(".shop-launch-grid");
  const filters = document.querySelector(".shop-launch-filters");
  if (!grid) return;

  const existingNames = new Set(
    [...grid.querySelectorAll("h3")].map((node) => node.textContent.trim().toLowerCase()),
  );

  expandedCatalogue.forEach((product) => {
    if (existingNames.has(product.model.toLowerCase())) return;

    const article = document.createElement("article");
    article.className = "shop-launch-card";
    article.dataset.shopCategory = product.category;
    article.dataset.shopBrand = product.brand.toLowerCase();
    article.dataset.shopSearch = [product.brand, product.model, product.label, product.detail].join(" ").toLowerCase();

    const media = product.image
      ? '<img src="' + product.image + '" alt="' + product.brand + " " + product.model + '" width="640" height="640" loading="lazy" decoding="async" />'
      : '<div class="shop-catalog-placeholder" aria-hidden="true"><b>' + product.brand + '</b><span>' + product.model + "</span></div>";

    article.innerHTML =
      '<div class="shop-launch-media"><span>' + product.label + "</span>" + media + "</div>" +
      '<div class="shop-launch-body"><small>' + product.brand + " · Home medical equipment</small>" +
      "<h3>" + product.model + "</h3><p>" + product.detail + "</p>" +
      '<div class="shop-card-status"><span>Price on request</span><b>Confirm SA availability</b></div>' +
      '<button class="shop-launch-cta request-product" type="button" data-product="' + product.brand + " " + product.model + '">Check price & availability <span>↗</span></button></div>';

    grid.appendChild(article);
  });

  if (filters && !filters.querySelector("[data-brand-filter]")) {
    const brandGroup = document.createElement("div");
    brandGroup.className = "shop-brand-filters";
    brandGroup.setAttribute("aria-label", "Filter by brand");
    brandGroup.innerHTML =
      '<span>Brand:</span>' +
      '<button type="button" data-brand-filter="all" aria-pressed="true">All brands</button>' +
      '<button type="button" data-brand-filter="yuwell" aria-pressed="false">Yuwell</button>' +
      '<button type="button" data-brand-filter="rossmax" aria-pressed="false">Rossmax</button>' +
      '<button type="button" data-brand-filter="contec" aria-pressed="false">CONTEC</button>';
    filters.parentElement?.appendChild(brandGroup);
  }

  if (!document.getElementById("shop-catalog-runtime-styles")) {
    const style = document.createElement("style");
    style.id = "shop-catalog-runtime-styles";
    style.textContent =
      ".shop-catalog-placeholder{width:100%;aspect-ratio:1/1;display:grid;place-content:center;text-align:center;gap:.5rem;padding:1.5rem;border-radius:1.2rem;background:linear-gradient(145deg,#f6f7f5,#e9ece8);color:#121713}.shop-catalog-placeholder b{font-size:1.05rem;letter-spacing:.12em;text-transform:uppercase}.shop-catalog-placeholder span{max-width:18rem;font-size:.92rem;line-height:1.35;color:#526057}.shop-brand-filters{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.8rem}.shop-brand-filters>span{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6a746d}.shop-brand-filters button{border:1px solid rgba(18,23,19,.14);background:#fff;border-radius:999px;padding:.65rem .9rem;cursor:pointer}.shop-brand-filters button[aria-pressed=true]{background:#121713;color:#fff;border-color:#121713}";
    document.head.appendChild(style);
  }
}

injectExpandedCatalogue();

const search = document.getElementById("shop-search");
const cards = [...document.querySelectorAll("[data-shop-category]")];
const filterButtons = [...document.querySelectorAll("[data-shop-filter]")];
const count = document.getElementById("shop-result-count");
const empty = document.getElementById("shop-empty");
const clear = document.getElementById("clear-shop-filter");
let activeCategory = "all";

const brandButtons = [...document.querySelectorAll("[data-brand-filter]")];
let activeBrand = "all";


function renderProducts() {
  const query = (search?.value || "").trim().toLowerCase();
  let visible = 0;

  cards.forEach((card) => {
    const categoryMatches = activeCategory === "all" || card.dataset.shopCategory === activeCategory;
    const queryMatches = !query || (card.dataset.shopSearch || "").toLowerCase().includes(query);
    const brandMatches = activeBrand === "all" || (card.dataset.shopBrand || "").toLowerCase() === activeBrand;
    const show = categoryMatches && brandMatches && queryMatches;
    card.hidden = !show;
    if (show) visible += 1;
  });

  if (count) count.textContent = `${visible} ${visible === 1 ? "product" : "products"}`;
  if (empty) empty.hidden = visible !== 0;
}

search?.addEventListener("input", renderProducts);


brandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeBrand = button.dataset.brandFilter;
    brandButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderProducts();
  });
});


filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.shopFilter;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderProducts();
  });
});

clear?.addEventListener("click", () => {
  activeCategory = "all";
  activeBrand = "all";
  brandButtons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.brandFilter === "all")));
  if (search) search.value = "";
  filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.shopFilter === "all")));
  renderProducts();
});

document.querySelectorAll("[data-category-link]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.categoryLink;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.shopFilter === activeCategory)));
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    renderProducts();
  });
});

const requestProduct = document.getElementById("request-product");


function bindRequestButtons() {
  document.querySelectorAll(".request-product").forEach((button) => {
    if (button.dataset.requestBound === "true") return;
    button.dataset.requestBound = "true";
    button.addEventListener("click", () => {
      if (requestProduct) requestProduct.value = button.dataset.product || "";
      document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => requestProduct?.focus(), 450);
    });
  });
}

bindRequestButtons();


const form = document.getElementById("shop-request-form");
const status = document.getElementById("request-status");

function buildRequestText() {
  const product = document.getElementById("request-product")?.value.trim();
  const name = document.getElementById("request-name")?.value.trim();
  const contact = document.getElementById("request-contact")?.value.trim();
  const type = document.getElementById("request-type")?.value;
  const notes = document.getElementById("request-notes")?.value.trim();

  return [
    "HomeClinicStore product request",
    "",
    `Product: ${product}`,
    `Request: ${type}`,
    `Name: ${name}`,
    `Contact: ${contact}`,
    notes ? `Notes: ${notes}` : "",
    "",
    "Please confirm the exact model, current price, stock, warranty, delivery terms and any compatibility requirements before order.",
  ].filter(Boolean).join("\n");
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const text = buildRequestText();
  const whatsappUrl = `https://wa.me/27678042273?text=${encodeURIComponent(text)}`;
  const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  if (status) {
    status.textContent = opened
      ? "WhatsApp opened with your product enquiry ready to send."
      : "Allow pop-ups to open WhatsApp, or use the green WhatsApp button on this page.";
  }
});

renderProducts();
