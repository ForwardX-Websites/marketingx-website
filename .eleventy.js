module.exports = function (eleventyConfig) {
  // Kopieer static assets naar output
  eleventyConfig.addPassthroughCopy("src/assets");

  // Kopieer _redirects voor Cloudflare Pages
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // Kopieer robots.txt en sitemap als ze bestaan
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Watch targets voor live reload
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // Datum filter (handig voor blog)
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Jaar filter (voor footer copyright)
  eleventyConfig.addFilter("year", function () {
    return new Date().getFullYear();
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
