const CONSENT_GROUP_PREFIX = "groupcookiej9ng";

const getConsentFromPrivacyTools = () => {
  const cookieManager = window.pToolsCookieManager;

  if (!cookieManager || !cookieManager.myCache) {
    console.warn(
      "[MCP Consent] pToolsCookieManager ainda não está disponível."
    );
    return null;
  }

  const entry = [...cookieManager.myCache.entries()].find(
    ([key]) =>
      String(key)
        .toLowerCase()
        .startsWith(CONSENT_GROUP_PREFIX.toLowerCase())
  );

  if (!entry) {
    console.warn(
      "[MCP Consent] Grupo de Preferências não encontrado."
    );
    return null;
  }

  const [key, value] = entry;

  console.log("[MCP Consent] Chave encontrada:", key);
  console.log("[MCP Consent] Valor encontrado:", value);

  return value;
};

export const getConsentStatus = (SalesforceInteractions) => {
  const consent = getConsentFromPrivacyTools();

  console.log("[MCP Consent] Valor bruto:", consent);

  if (String(consent).toLowerCase() === "accepted") {
    console.log(
      "[MCP Consent] Preferências ACEITAS → OptIn"
    );

    return SalesforceInteractions.ConsentStatus.OptIn;
  }

  if (String(consent).toLowerCase() === "rejected") {
    console.log(
      "[MCP Consent] Preferências REJEITADAS → OptOut"
    );

    return SalesforceInteractions.ConsentStatus.OptOut;
  }

  console.warn(
    "[MCP Consent] Consentimento não reconhecido:",
    consent
  );

  return null;
};