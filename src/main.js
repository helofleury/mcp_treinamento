import { cookieDomain } from "./helpers/cookieDomain";
import { makeConfig } from "./salesforce-interactions/config/makeConfig";
import { handleSPAPageChange } from "./helpers/handleSpaPageChange";
import { getConsentStatus } from "./helpers/consent";

const waitForSalesforceInteractions = (timeout = 15000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const sdk = window.SalesforceInteractions;

      if (sdk) {
        resolve(sdk);
        return;
      }

      if (Date.now() - start >= timeout) {
        reject(
          new Error(
            `SalesforceInteractions não ficou disponível após ${timeout}ms`
          )
        );
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
};

const syncConsent = (SalesforceInteractions) => {
  const consentStatus = getConsentStatus(SalesforceInteractions);

  if (!consentStatus) {
    console.warn("[MCP Consent] Nenhum consentimento identificado.");
    return null;
  }

  const consent = {
    purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
    provider: "Gentrop",
    status: consentStatus,
  };

  SalesforceInteractions.updateConsents?.([consent]);
  return consentStatus;
};

const initializeSDK = async (SalesforceInteractions) => {
  if (window.__MCP_SALESFORCE_INITIALIZED) {
    syncConsent(SalesforceInteractions);
    return SalesforceInteractions;
  }

  const domain = cookieDomain();
  const consentStatus = getConsentStatus(SalesforceInteractions);

  const initConfig = {
    cookieDomain: domain,
  };

  if (consentStatus) {
    initConfig.consents = [
      {
        purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
        provider: "Gentrop",
        status: consentStatus,
      },
    ];
  } else {
    console.warn("[MCP] Nenhum consentimento identificado no init.");
  }

  await SalesforceInteractions.init(initConfig);
  window.__MCP_SALESFORCE_INITIALIZED = true;

  syncConsent(SalesforceInteractions);
  return SalesforceInteractions;
};

const initializeSitemap = (SalesforceInteractions) => {
  const config = makeConfig();

  if (!config?.global) {
    console.error("[MCP] ERRO: config.global não existe.");
    return;
  }

  handleSPAPageChange();
  SalesforceInteractions.initSitemap(config);
};

const start = async () => {
  try {
    const SalesforceInteractions = await waitForSalesforceInteractions();
    await initializeSDK(SalesforceInteractions);
    initializeSitemap(SalesforceInteractions);
  } catch (error) {
    console.error("[MCP] ERRO AO INICIALIZAR:", error);
  }
};

start();