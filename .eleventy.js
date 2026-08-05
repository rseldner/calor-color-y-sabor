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
