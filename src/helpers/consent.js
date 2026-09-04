const CONSENT_GROUP_PREFIX =
    "groupcookieJ9ng";

const getConsentFromPrivacyTools = () => {
    if (
        !window.pToolsCookieManager ||
        !window.pToolsCookieManager.myCache
    ) {
        console.warn(
            "[MCP Consent] pToolsCookieManager ainda não está disponível."
        );

        return null;
    }

    const entry = [
        ...window.pToolsCookieManager.myCache.entries()
    ].find(([key]) =>
        key.startsWith(CONSENT_GROUP_PREFIX)
    );

    if (!entry) {
        console.warn(
            "[MCP Consent] Grupo de Preferências não encontrado."
        );

        return null;
    }

    const [key, value] = entry;

    console.log(
        "[MCP Consent] Chave encontrada:",
        key
    );

    console.log(
        "[MCP Consent] Valor:",
        value
    );

    return value;
};

export const getConsentStatus = (
    SalesforceInteractions
) => {
    const consent =
        getConsentFromPrivacyTools();

    if (consent === "accepted") {
        console.log(
            "[MCP Consent] Preferências ACEITAS → OptIn"
        );

        return SalesforceInteractions
            .ConsentStatus
            .OptIn;
    }

    if (consent === "rejected") {
        console.log(
            "[MCP Consent] Preferências REJEITADAS → OptOut"
        );

        return SalesforceInteractions
            .ConsentStatus
            .OptOut;
    }

    console.warn(
        "[MCP Consent] Consentimento não encontrado."
    );

    return null;
};