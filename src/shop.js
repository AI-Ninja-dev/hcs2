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

const search = document.getElementById("shop-search");
const cards = [...document.querySelectorAll("[data-shop-category]")];
const filterButtons = [...document.querySelectorAll("[data-shop-filter]")];
const count = document.getElementById("shop-result-count");
const empty = document.getElementById("shop-empty");
const clear = document.getElementById("clear-shop-filter");
let activeCategory = "all";

function renderProducts() {
  const query = (search?.value || "").trim().toLowerCase();
  let visible = 0;

  cards.forEach((card) => {
    const categoryMatches = activeCategory === "all" || card.dataset.shopCategory === activeCategory;
    const queryMatches = !query || (card.dataset.shopSearch || "").toLowerCase().includes(query);
    const show = categoryMatches && queryMatches;
    card.hidden = !show;
    if (show) visible += 1;
  });

  if (count) count.textContent = `${visible} ${visible === 1 ? "product" : "products"}`;
  if (empty) empty.hidden = visible !== 0;
}

search?.addEventListener("input", renderProducts);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.shopFilter;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderProducts();
  });
});

clear?.addEventListener("click", () => {
  activeCategory = "all";
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

document.querySelectorAll(".request-product").forEach((button) => {
  button.addEventListener("click", () => {
    if (requestProduct) requestProduct.value = button.dataset.product || "";
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => requestProduct?.focus(), 450);
  });
});

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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const text = buildRequestText();

  try {
    if (navigator.share) {
      await navigator.share({
        title: "HomeClinicStore product request",
        text,
      });
      if (status) status.textContent = "Request prepared. Choose your preferred contact app to send it.";
      return;
    }

    await navigator.clipboard.writeText(text);
    if (status) status.textContent = "Request copied to your clipboard. Paste it into your preferred contact channel.";
  } catch (error) {
    if (error?.name === "AbortError") {
      if (status) status.textContent = "Request sharing cancelled.";
      return;
    }

    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      if (status) status.textContent = "Request copied to your clipboard. Paste it into your preferred contact channel.";
    } catch {
      if (status) status.textContent = "Your request is ready above. Copy the details into your preferred contact channel.";
    }
  }
});

renderProducts();
