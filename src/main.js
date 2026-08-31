import { cookieDomain } from "./helpers/cookieDomain";
import { makeConfig } from "./salesforce-interactions/config/makeConfig";
import { handleSPAPageChange } from "./helpers/handleSpaPageChange";

console.log("[MCP] =================================");
console.log("[MCP] MAIN.JS CARREGADO");
console.log(
  "[MCP] hostname:",
  window.location.hostname
);
console.log("[MCP] =================================");

const waitForSalesforceInteractions = (
  timeout = 15000
) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const sdk =
        window.SalesforceInteractions;

      if (sdk) {
        console.log(
          "[MCP] SalesforceInteractions encontrado"
        );

        resolve(sdk);
        return;
      }

      if (Date.now() - start >= timeout) {
        reject(
          new Error(
            "SalesforceInteractions não ficou disponível após " +
              timeout +
              "ms"
          )
        );

        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
};

const initializeSDK = async (
  SalesforceInteractions
) => {
  /*
   * Evita que o MCP inicialize o SDK duas vezes.
   */
  if (
    window.__MCP_SALESFORCE_INITIALIZED
  ) {
    console.log(
      "[MCP] SDK já foi inicializado pelo MCP."
    );

    return SalesforceInteractions;
  }

  const domain = cookieDomain();

  console.log(
    "[MCP] cookieDomain:",
    domain
  );

  console.log(
    "[MCP] Consents ANTES do init:",
    SalesforceInteractions.getConsents?.()
  );

  /*
   * Inicialização do Salesforce Personalization.
   */
  await SalesforceInteractions.init({
    cookieDomain: domain,

    consents: [
      {
        purpose:
          SalesforceInteractions
            .mcis
            .ConsentPurpose
            .Personalization,

        provider: "Gentrop",

        status:
          SalesforceInteractions
            .ConsentStatus
            .OptIn
      }
    ]
  });

  window.__MCP_SALESFORCE_INITIALIZED =
    true;

  console.log(
    "[MCP] ================================="
  );

  console.log(
    "[MCP] SDK INICIALIZADO"
  );

  console.log(
    "[MCP] Anonymous ID:",
    SalesforceInteractions.getAnonymousId?.()
  );

  console.log(
    "[MCP] Consents DEPOIS do init:",
    SalesforceInteractions.getConsents?.()
  );

  console.log(
    "[MCP] Cookie Domain:",
    SalesforceInteractions.getCookieDomain?.()
  );

  console.log(
    "[MCP] ================================="
  );

  return SalesforceInteractions;
};

const initializeSitemap = (
  SalesforceInteractions
) => {
  const config = makeConfig();

  console.log(
    "[MCP] CONFIG GERADA:",
    config
  );

  /*
   * Garante que o global existe antes
   * da inicialização do sitemap.
   */
  if (!config || !config.global) {
    console.error(
      "[MCP] ERRO: config.global não existe."
    );

    return;
  }

  console.log(
    "[MCP] Global:",
    config.global
  );

  /*
   * Configura mudanças de rota da VTEX.
   */
  handleSPAPageChange();

  console.log(
    "[MCP] Inicializando Sitemap..."
  );

  SalesforceInteractions.initSitemap(
    config
  );

  console.log(
    "[MCP] Sitemap inicializado."
  );

  console.log(
    "[MCP] Sitemap Config:",
    SalesforceInteractions.getSitemapConfig?.()
  );

  console.log(
    "[MCP] Sitemap Result:",
    SalesforceInteractions.getSitemapResult?.()
  );
};

const start = async () => {
  try {
    const SalesforceInteractions =
      await waitForSalesforceInteractions();

    console.log(
      "[MCP] SDK:",
      SalesforceInteractions
    );

    /*
     * Inicializa o SDK.
     */
    await initializeSDK(
      SalesforceInteractions
    );

    /*
     * Inicializa o sitemap/global.
     */
    initializeSitemap(
      SalesforceInteractions
    );

    console.log(
      "[MCP] ================================="
    );

    console.log(
      "[MCP] MCP INICIALIZAÇÃO FINALIZADA"
    );

    console.log(
      "[MCP] Anonymous ID FINAL:",
      SalesforceInteractions.getAnonymousId?.()
    );

    console.log(
      "[MCP] Consents FINAIS:",
      SalesforceInteractions.getConsents?.()
    );

    console.log(
      "[MCP] ================================="
    );
  } catch (error) {
    console.error(
      "[MCP] ================================="
    );

    console.error(
      "[MCP] ERRO AO INICIALIZAR:",
      error
    );

    console.error(
      "[MCP] ================================="
    );
  }
};

start();