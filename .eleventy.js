module.exports = function (eleventyConfig) {
  // Copy static assets to output
  eleventyConfig.addPassthroughCopy("src/assets");

  // Copy _redirects for Cloudflare Pages
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // Copy robots.txt if it exists
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Watch targets for live reload
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // Blog collection — sorted by date descending
  eleventyConfig.addCollection("blog", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("blog")
      .sort((a, b) => b.date - a.date);
  });

  // Date filter (Dutch locale)
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Year filter (for footer copyright)
  eleventyConfig.addFilter("year", function () {
    return new Date().getFullYear();
  });

  // Limit filter (for showing N blog posts on home)
  eleventyConfig.addFilter("limit", function (arr, limit) {
    return arr.slice(0, limit);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
