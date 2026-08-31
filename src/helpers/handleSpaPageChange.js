/*
  Check for URL change every 2 seconds. If URL has changed, reinitialize beacon and sitemap.
*/
export const handleSPAPageChange = () => {
  let url = window.location.href;
  const urlChangeInterval = setInterval(() => {
    if (url !== window.location.href) {
      url = window.location.href;
      SalesforceInteractions.reinit();
    }
  }, 2000);
}