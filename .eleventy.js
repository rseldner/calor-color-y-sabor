const slugify = require("./utils/slugify.js");

module.exports = function (eleventyConfig) {
  // Static assets (css/js/fonts) copied as-is to the output site
  eleventyConfig.addPassthroughCopy("assets");

  // Used in frontmatter permalinks: "recipes/{{ title | slug }}/"
  eleventyConfig.addFilter("slug", slugify);

  // Returns the distinct set of categories present in a list of recipes,
  // used to build the filter row on the homepage without hardcoding categories.
  eleventyConfig.addFilter("uniqueCategories", function (recipes) {
    return [...new Set(recipes.map((r) => r.data.category))];
  });

  // Zero-pads the "No. 004" style index numbers on recipe cards.
  eleventyConfig.addFilter("padZero", function (num, size = 3) {
    return String(num).padStart(size, "0");
  });

  // Converts markdown-style **bold** to <strong>bold</strong> for strings
  // (like frontmatter ingredient items) that never pass through Eleventy's
  // markdown renderer. Use with `| safe` in templates.
  eleventyConfig.addFilter("md", function (str) {
    if (typeof str !== "string") return str;
    return str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  });

  // Turns the plain multi-line `ingredients: |` block into a list of groups:
  // { header: "Adobo (Marinada):" | null, items: [...] }. A line that is
  // *entirely* **bold** starts a new group and becomes its header; every
  // other line is an ingredient in the current group. Recipes with no bold
  // lines come back as a single group with header: null, so the ingredients
  // render as one flat list — no template branching needed for that case.
  // Also accepts the old dash-based YAML list for backwards compatibility.
  eleventyConfig.addFilter("ingredientGroups", function (raw) {
    let lines;
    if (Array.isArray(raw)) {
      lines = raw;
    } else if (typeof raw === "string") {
      lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
    } else {
      lines = [];
    }

    const headerPattern = /^\*\*(.+)\*\*$/;
    const groups = [];
    let current = { header: null, items: [] };

    lines.forEach((line) => {
      const match = headerPattern.exec(line);
      if (match) {
        if (current.header !== null || current.items.length > 0) {
          groups.push(current);
        }
        current = { header: match[1], items: [] };
      } else {
        current.items.push(line);
      }
    });
    groups.push(current);

    return groups;
  });

  // Every markdown file dropped in /recipes becomes part of this collection,
  // sorted alphabetically by title.
  eleventyConfig.addCollection("recipes", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("recipes/*.md")
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
  });

  // Build-time JSON search index consumed by assets/search.js in the browser.
  // (Generated from _includes/search-index.njk — see that file.)

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
