import { cookieDomain } from "./helpers/cookieDomain";
import { makeConfig } from "./salesforce-interactions/config/makeConfig";
import { handleSPAPageChange } from "./helpers/handleSpaPageChange";
import { getConsentStatus, listenToConsentChanges } from "./helpers/consent";

import { pageTypeGlobal } from "./salesforce-interactions/pagetypes/global";
import { pageTypeDefault } from "./salesforce-interactions/pagetypes/default";
import { pageTypeCart } from "./salesforce-interactions/pagetypes/cart";
import { pageTypeProductDetail } from "./salesforce-interactions/pagetypes/productDetail";

SalesforceInteractions.init({
  cookieDomain: cookieDomain(),
  consents: [
    {
      purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
      provider: "Gentrop",
      status: getConsentStatus()
    }
  ]
}).then(() => {
  const baseConfig = makeConfig();

  handleSPAPageChange();
  
  // Ativa a escuta dinâmica de alterações no banner de cookies
  listenToConsentChanges();

  SalesforceInteractions.initSitemap({
    ...baseConfig,
    global: pageTypeGlobal,
    pageTypes: [
      pageTypeProductDetail,
      pageTypeCart,
      pageTypeDefault
    ]
  });
});