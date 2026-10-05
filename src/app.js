const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function closeMenu() {
  if (!toggle || !navLinks) return;
  navLinks.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
}

toggle?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(Boolean(open)));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) closeMenu();
});
matchMedia("(min-width:981px)").addEventListener("change", closeMenu);

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

const products = {
  diabetes: {
    name: "Yuwell Anytime 5Pro CGM",
    description: "Continuous glucose monitoring for everyday diabetes management. Current sensor availability, supported phones and setup requirements are confirmed before order.",
    image: "images/products/yuwell-anytime-5pro.webp",
    alt: "Yuwell Anytime 5Pro CGM applicator",
  },
  "blood-pressure": {
    name: "Yuwell YE660E BP Monitor",
    description: "Upper-arm blood-pressure monitoring for home routines. Confirm the supplied cuff size, accessories and current availability before order.",
    image: "images/products/yuwell-ye660e.webp",
    alt: "Yuwell YE660E upper-arm blood-pressure monitor",
  },
  heart: {
    name: "Yuwell Pulse Oximeter",
    description: "Fingertip spot checks of oxygen saturation and pulse rate for home monitoring. Confirm the exact supplied model and intended use.",
    image: "images/products/yuwell-pulse-oximeter.webp",
    alt: "Yuwell fingertip pulse oximeter",
  },
  oxygen: {
    name: "Yuwell 10L Oxygen Concentrator",
    description: "Home oxygen equipment for use within an appropriate prescribed care plan. Confirm the exact model, required flow and setup requirements before order.",
    image: "images/products/yuwell-10l-oxygen.webp",
    alt: "Yuwell 10 litre oxygen concentrator",
  },
  nebuliser: {
    name: "Yuwell 403T Nebuliser",
    description: "Compressor nebuliser equipment for prescribed inhalation therapy. Confirm accessories, availability and suitability before order.",
    image: "images/products/yuwell-403t.webp",
    alt: "Yuwell 403T compressor nebuliser",
  },
  thermometer: {
    name: "Yuwell YT-1 Thermometer",
    description: "Infrared temperature monitoring for practical home-care checks. Confirm the exact supplied model and current availability before order.",
    image: "images/products/yuwell-yt1.webp",
    alt: "Yuwell YT-1 infrared thermometer",
  },
};

const search = document.getElementById("product-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let category = "all";

function filterProducts() {
  if (!search) return;
  const query = search.value.toLowerCase().trim();
  let count = 0;

  document.querySelectorAll(".product").forEach((card) => {
    const matches =
      (category === "all" || card.dataset.category === category) &&
      `${card.dataset.search || ""} ${card.querySelector("h3")?.textContent || ""}`
        .toLowerCase()
        .includes(query);
    card.hidden = !matches;
    if (matches) count += 1;
  });

  const resultCount = document.getElementById("result-count");
  const emptyProducts = document.getElementById("empty-products");
  if (resultCount) resultCount.textContent = `${count} ${count === 1 ? "device" : "devices"}`;
  if (emptyProducts) emptyProducts.hidden = count !== 0;
}

search?.addEventListener("input", filterProducts);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    category = button.dataset.filter;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    filterProducts();
  });
});

const dialog = document.getElementById("product-dialog");
let previousFocus;

document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = products[button.dataset.product];
    if (!dialog || !selected) return;

    previousFocus = button;
    const title = document.getElementById("detail-title");
    const description = document.getElementById("detail-description");
    const image = document.getElementById("detail-image");

    if (title) title.textContent = selected.name;
    if (description) description.textContent = selected.description;
    if (image) {
      image.src = selected.image;
      image.alt = selected.alt;
    }

    dialog.showModal();
  });
});

document.getElementById("close-dialog")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("close", () => previousFocus?.focus());

filterProducts();
