const bs = require("browser-sync");

bs({
    server: "src",
    files: ['src/*.html', 'src/styles/*.css', 'src/scripts/*.js']
})