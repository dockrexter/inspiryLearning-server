const fs = require("fs");

module.exports.mkdir = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}