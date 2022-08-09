const CleanCSS = require("clean-css");
const metagen = require("eleventy-plugin-metagen");
const respimg = require("eleventy-plugin-sharp-respimg");
const fs = require("fs");

module.exports = (eleventyConfig) => {

    eleventyConfig.addPlugin(metagen);
    eleventyConfig.addPlugin(respimg);

    eleventyConfig.setTemplateFormats([
        "md",
        "njk"
    ]);

    markdownTemplateEngine: "njk";

    // Perform manual passthrough file copy to include directories in the build output _site
    eleventyConfig.addPassthroughCopy("./src/static/img/about");
    eleventyConfig.addPassthroughCopy("./src/static/img/books");
    eleventyConfig.addPassthroughCopy("./src/static/img/work/mapping");
    eleventyConfig.addPassthroughCopy("./src/static/img/work/strands");
    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addPassthroughCopy("./src/js");
    eleventyConfig.addPassthroughCopy("./src/favicon_data");
    eleventyConfig.addPassthroughCopy('./src/admin');

    // Create css-clean CSS Minifier filter
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Configure image in a template paired shortcode
    eleventyConfig.addPairedShortcode("image", (srcSet, src, alt, sizes = "(min-width: 400px) 33.3vw, 100vw") => {
        return `<img srcset="${srcSet}" src="${src}" alt="${alt}" sizes="${sizes}" />`;
    });

    // Configure outgoing Pexels anchor elements in a template paried shortcode
    eleventyConfig.addPairedShortcode("link", (href, cls = "image-link", rel = "noopener", target = "_blank", btnTxt = "Pexels") => {
        return `<a class="${cls}" href="${href}" rel="${rel}" target="${target}">${btnTxt}</a>`;
    });

    // get the current year to be placed in the footer
    eleventyConfig.addShortcode("getYear", function () {
        const year = new Date().getFullYear();
        return `${year}`;
    });

    const filesToRead = [
        "strands",
        "mapping"
    ];

    const mergedImages = [];
    const mergeFile = "works.json";

    filesToRead.forEach((file) => {
        fs.readFile(`${__dirname}/src/_data/${file}.json`, (err, data) => {
            if (err) throw err;

            // merge results into a single list, add a 'group' field
            const imageData = JSON.parse(data.toString()).map((img) => {
                img["group"] = file;
                return img;
            });

            mergedImages.push(...imageData);

            // write the output file containing all the image objects
            fs.writeFile(`${__dirname}/src/_data/${mergeFile}`, JSON.stringify(mergedImages, null, 2), (err) => {
                if (err) throw err;
            });
        });
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            data: "_data",
            layouts: "_includes/layouts",
            includes: "_includes",
        },
        templateFormats: ["md", "liquid", "njk"],
        passthroughFileCopy: true
    }
};