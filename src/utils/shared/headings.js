/** @param {string} text */
const headingId = (text) =>
  text
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
module.exports = { headingId };
