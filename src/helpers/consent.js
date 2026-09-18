const CONSENT_GROUP_PREFIX = "groupcookiej9ng";

const getConsentFromPrivacyTools = () => {
  const cookieManager = window.pToolsCookieManager;

  if (!cookieManager || !cookieManager.myCache) {
    return null;
  }

  const entry = [...cookieManager.myCache.entries()].find(([key]) =>
    String(key).toLowerCase().startsWith(CONSENT_GROUP_PREFIX.toLowerCase())
  );

  if (!entry) return null;

  const [, value] = entry;
  return value;
};

export const getConsentStatus = () => {
  const consent = getConsentFromPrivacyTools();

  if (String(consent).toLowerCase() === "accepted") {
    console.log("%c[MCP Consent] Utilizador ACEITOU os cookies -> OptIn (Eventos ATIVOS)", "color: green; font-weight: bold;");
    return window.SalesforceInteractions.ConsentStatus.OptIn;
  }

  if (String(consent).toLowerCase() === "rejected") {
    console.log("%c[MCP Consent] Utilizador REJEITOU os cookies -> OptOut (Eventos BLOQUEADOS)", "color: red; font-weight: bold;");
    return window.SalesforceInteractions.ConsentStatus.OptOut;
  }

  console.warn("%c[MCP Consent] Consentimento pendente -> Definindo OptOut por padrão", "color: orange; font-weight: bold;");
  return window.SalesforceInteractions.ConsentStatus.OptOut;
};

// Escuta a interação dinâmica no banner de cookies em tempo real
export const listenToConsentChanges = () => {
  document.addEventListener("click", (e) => {
    // Aguarda a atualização do cookieManager após o clique no banner
    setTimeout(() => {
      const currentStatus = getConsentStatus();
      
      if (window.SalesforceInteractions && typeof window.SalesforceInteractions.updateConsents === "function") {
        window.SalesforceInteractions.updateConsents([
          {
            purpose: window.SalesforceInteractions.mcis.ConsentPurpose.Personalization,
            provider: "Gentrop",
            status: currentStatus
          }
        ]);
        console.log("[MCP Consent] Consentimento atualizado dinamicamente via updateConsents().");
      }
    }, 500);
  });
};