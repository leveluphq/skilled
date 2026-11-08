/**
 * A full page load of another URL. It's a module of its own so tests can mock
 * it: jsdom can't navigate, and Jest 30's jsdom doesn't let a test replace
 * window.location.
 */
const navigateTo = (url: string) => {
  window.location.href = url;
};

export default navigateTo;
