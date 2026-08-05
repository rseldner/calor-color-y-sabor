(function () {
  const grid = document.getElementById("grid");
  const searchInput = document.getElementById("q");
  const filters = document.getElementById("filters");
  const emptyNote = document.getElementById("emptyNote");

  // Only run on the homepage — other pages won't have these elements.
  if (!grid || !searchInput) return;

  const cards = Array.from(grid.querySelectorAll(".card"));
  let activeCat = "all";
  let matchedUrls = null; // null = no search term active, show all (subject to category filter)
  let fuse = null;

  const prefix = window.SITE_PATH_PREFIX || "/";
  fetch(prefix + "search-index.json")
    .then((res) => res.json())
    .then((data) => {
      fuse = new Fuse(data, {
        keys: ["title", "blurb", "tags", "category"],
        threshold: 0.35,
      });
    })
    .catch(() => {
      // If the index fails to load, search falls back to simple substring
      // matching against the DOM below — no hard failure for the user.
    });

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach((card) => {
      const inCategory = activeCat === "all" || card.dataset.cat === activeCat;
      const inSearch = matchedUrls === null || matchedUrls.has(new URL(card.href).pathname);
      const visible = inCategory && inSearch;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    emptyNote.hidden = visibleCount !== 0;
  }

  function runSearch(term) {
    if (!term) {
      matchedUrls = null;
      applyFilters();
      return;
    }

    if (fuse) {
      const results = fuse.search(term).map((r) => r.item.url);
      matchedUrls = new Set(results);
    } else {
      // Fallback: substring match on title/blurb already in the DOM.
      const lower = term.toLowerCase();
      matchedUrls = new Set(
        cards
          .filter((c) =>
            (c.dataset.title + " " + c.dataset.blurb).toLowerCase().includes(lower)
          )
          .map((c) => new URL(c.href).pathname)
      );
    }
    applyFilters();
  }

  searchInput.addEventListener("input", (e) => runSearch(e.target.value.trim()));

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    applyFilters();
  });
})();
