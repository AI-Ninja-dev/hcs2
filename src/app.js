const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
function closeMenu() {
  navLinks.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
}
toggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
navLinks
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("open")) {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) closeMenu();
});
matchMedia("(min-width:981px)").addEventListener("change", closeMenu);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((item) => observer.observe(item));
}
const products = {
  diabetes: {
    name: "Anytime 5 Pro CGM",
    description:
      "Explore continuous glucose monitoring for home use. Ask about the exact sensor model, wear duration, supported phones and any app requirements.",
  },
  "blood-pressure": {
    name: "Smart BP Monitor",
    description:
      "Explore blood-pressure monitoring at home. Ask about the exact model, cuff sizes, connectivity and setup support.",
  },
  heart: {
    name: "ECG Health Watch",
    description:
      "Explore wearable heart-health monitoring. Ask about the exact model, supported features, phone compatibility and intended use.",
  },
};
const search = document.getElementById("product-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let category = "all";
function filterProducts() {
  const query = search.value.toLowerCase().trim();
  let count = 0;
  document.querySelectorAll(".product").forEach((card) => {
    const matches =
      (category === "all" || card.dataset.category === category) &&
      `${card.dataset.search} ${card.querySelector("h3").textContent}`
        .toLowerCase()
        .includes(query);
    card.hidden = !matches;
    if (matches) count++;
  });
  document.getElementById("result-count").textContent =
    `${count} ${count === 1 ? "device" : "devices"}`;
  document.getElementById("empty-products").hidden = count !== 0;
}
search.addEventListener("input", filterProducts);
filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.filter;
    filterButtons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    filterProducts();
  }),
);
const dialog = document.getElementById("product-dialog");
const saveButton = document.getElementById("save-product");
let selectedProduct;
let previousFocus;
let saved = [];
try {
  const stored = JSON.parse(sessionStorage.getItem("hcs-enquiry") || "[]");
  if (Array.isArray(stored))
    saved = [...new Set(stored.filter((key) => Object.hasOwn(products, key)))];
} catch {
  /* The enquiry list remains usable if browser storage is unavailable. */
}
function renderList() {
  const list = document.getElementById("enquiry-list");
  list.replaceChildren();
  if (!saved.length) {
    const p = document.createElement("p");
    p.textContent =
      "Your list is empty. Explore a device to add it, or download a general enquiry.";
    list.append(p);
  }
  saved.forEach((key) => {
    const row = document.createElement("div");
    row.className = "enquiry-item";
    const name = document.createElement("span");
    name.textContent = products[key].name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${products[key].name}`);
    remove.addEventListener("click", () => {
      saved = saved.filter((item) => item !== key);
      persist();
      renderList();
      (
        list.querySelector("button") ||
        document.getElementById("download-enquiry")
      ).focus();
    });
    row.append(name, remove);
    list.append(row);
  });
}
function persist() {
  try {
    sessionStorage.setItem("hcs-enquiry", JSON.stringify(saved));
  } catch {
    /* Session memory is the fallback. */
  }
}
document.querySelectorAll("[data-product]").forEach((button) =>
  button.addEventListener("click", () => {
    selectedProduct = button.dataset.product;
    previousFocus = button;
    document.getElementById("detail-title").textContent =
      products[selectedProduct].name;
    document.getElementById("detail-description").textContent =
      products[selectedProduct].description;
    saveButton.disabled = saved.includes(selectedProduct);
    saveButton.textContent = saved.includes(selectedProduct)
      ? "Added to enquiry list"
      : "Add to enquiry list";
    document.getElementById("save-status").textContent = "";
    dialog.showModal();
  }),
);
document
  .getElementById("close-dialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => previousFocus?.focus());
saveButton.addEventListener("click", () => {
  if (!saved.includes(selectedProduct)) saved.push(selectedProduct);
  persist();
  renderList();
  saveButton.disabled = true;
  saveButton.textContent = "Added to enquiry list";
  document.getElementById("save-status").textContent =
    "Added. Download your enquiry at the bottom of this page.";
});
document.getElementById("download-enquiry").addEventListener("click", () => {
  const content = [
    "HomeClinicStore product enquiry",
    "",
    ...(saved.length
      ? saved.map((key) => `- ${products[key].name}`)
      : ["General device and biomedical support enquiry"]),
    "",
    "Please confirm exact models, specifications, compatibility, prices, stock, delivery, warranty and return terms.",
    "",
    "My name:",
    "My contact details:",
    "Additional questions:",
    "",
    "This is an enquiry draft. No order has been placed or message sent.",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "homeclinicstore-enquiry.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  document.getElementById("download-status").textContent =
    "Enquiry file prepared. Send it through your verified HomeClinicStore contact channel.";
});
renderList();
