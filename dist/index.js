(() => {
  // src/model/domain.js
  var DOMAIN = {
    gentrop: "gentrop.com",
    saoJoaoFarmacias: "saojoaofarmacias.com.br"
  };

  // src/helpers/cookieDomain.js
  var cookieDomain = () => {
    const currentDomain = window.location.hostname;
    let currentCookieDomain = currentDomain;
    if (currentDomain === "gentrop.com" || currentDomain.endsWith(".gentrop.com")) {
      currentCookieDomain = DOMAIN.gentrop;
    }
    if (currentDomain === "www.saojoaofarmacias.com.br" || currentDomain.endsWith(".saojoaofarmacias.com.br")) {
      currentCookieDomain = DOMAIN.saoJoaoFarmacias;
    }
    return currentCookieDomain;
  };

  // src/salesforce-interactions/pagetypes/default.js
  var pageTypeDefault = {
    name: "default",
    isMatch: () => true,
    interaction: { name: "Acessou p\xE1gina" }
  };

  // src/salesforce-interactions/pagetypes/global.js
  var pageTypeGlobal = {
    isMatch: () => true,
    onActionEvent: (actionEvent) => {
      console.log("Global Action Event: ", actionEvent.interaction.name);
      return actionEvent;
    }
  };

  // src/salesforce-interactions/config/makeConfig.js
  var makeConfig = () => {
    return {
      global: pageTypeGlobal,
      pageTypeDefault,
      pageTypes: []
    };
  };

  // src/helpers/handleSpaPageChange.js
  var handleSPAPageChange = () => {
    let url = window.location.href;
    const urlChangeInterval = setInterval(() => {
      if (url !== window.location.href) {
        url = window.location.href;
        SalesforceInteractions.reinit();
      }
    }, 2e3);
  };

  // src/helpers/consent.js
  var CONSENT_GROUP_PREFIX = "groupcookiej9ng";
  var getConsentFromPrivacyTools = () => {
    const cookieManager = window.pToolsCookieManager;
    if (!cookieManager || !cookieManager.myCache) {
      return null;
    }
    const entry = [...cookieManager.myCache.entries()].find(
      ([key]) => String(key).toLowerCase().startsWith(CONSENT_GROUP_PREFIX.toLowerCase())
    );
    if (!entry) return null;
    const [, value] = entry;
    return value;
  };
  var getConsentStatus = () => {
    const consent = getConsentFromPrivacyTools();
    if (String(consent).toLowerCase() === "accepted") {
      console.log("%c[MCP Consent] Utilizador ACEITOU os cookies -> OptIn (Eventos ATIVOS)", "color: green; font-weight: bold;");
      return window.SalesforceInteractions.ConsentStatus.OptIn;
    }
    if (String(consent).toLowerCase() === "rejected") {
      console.log("%c[MCP Consent] Utilizador REJEITOU os cookies -> OptOut (Eventos BLOQUEADOS)", "color: red; font-weight: bold;");
      return window.SalesforceInteractions.ConsentStatus.OptOut;
    }
    console.warn("%c[MCP Consent] Consentimento pendente -> Definindo OptOut por padr\xE3o", "color: orange; font-weight: bold;");
    return window.SalesforceInteractions.ConsentStatus.OptOut;
  };
  var listenToConsentChanges = () => {
    document.addEventListener("click", (e) => {
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

  // src/salesforce-interactions/pagetypes/cart.js
  var pageTypeCart = {
    name: "cart",
    isMatch: () => window.location.href.indexOf("/cart") !== -1 || window.location.href.indexOf("/checkout") !== -1,
    interaction: {
      name: "View Cart"
    },
    listeners: [
      SalesforceInteractions.listener("click", "body", (e) => {
        const target = e.target;
        if (!target) return;
        const button = target.closest("button");
        if (!button) return;
        const action = button.getAttribute("data-action");
        if (!action) return;
        e.stopPropagation();
        const isIncrease = action === "increment";
        const isDecrease = action === "decrement";
        const isRemove = action === "remove-item";
        if (!isIncrease && !isDecrease && !isRemove) return;
        const card = button.closest(".fsj-custom-cart-item") || button.closest("[data-product-id]") || button.closest("[class*='cart-item']") || button.parentElement;
        const productId = card && card.getAttribute("data-product-id") || button.getAttribute("data-product-id") || button.getAttribute("data-item-key");
        const rawPrice = card && card.getAttribute("data-product-price") || button.getAttribute("data-product-price") || "0";
        const price = parseFloat(rawPrice);
        if (!productId) {
          console.warn("[Salesforce SDK] A\xE7\xE3o detectada (" + action + "), mas o ID do produto n\xE3o foi localizado.");
          return;
        }
        if (isIncrease) {
          SalesforceInteractions.sendEvent({
            interaction: {
              name: SalesforceInteractions.CartInteractionName.AddToCart,
              lineItem: {
                catalogObjectType: "Product",
                catalogObjectId: productId,
                price,
                quantity: 1
              }
            }
          });
        } else if (isDecrease) {
          SalesforceInteractions.sendEvent({
            interaction: {
              name: SalesforceInteractions.CartInteractionName.RemoveFromCart,
              lineItem: {
                catalogObjectType: "Product",
                catalogObjectId: productId,
                price,
                quantity: 1
              }
            }
          });
        } else if (isRemove) {
          SalesforceInteractions.sendEvent({
            interaction: {
              name: SalesforceInteractions.CartInteractionName.RemoveFromCart,
              lineItem: {
                catalogObjectType: "Product",
                catalogObjectId: productId,
                price,
                quantity: 1
                // Adicionado para satisfazer a validação de Schema
              }
            }
          });
        }
      })
    ]
  };

  // src/salesforce-interactions/pagetypes/productDetail.js
  var pageTypeProductDetail = {
    name: "productDetail",
    // Regra para identificar que está na página do produto
    isMatch: () => window.location.pathname.includes("/p/"),
    interaction: {
      name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
      // "View Catalog Object"
      catalogObject: {
        type: "Product",
        id: "12345",
        // Capturar dinamicamente o ID/SKU do produto na tela
        attributes: {
          name: "Dipirona 500mg",
          price: 12.9,
          category: "Medicamentos"
        }
      }
    },
    listeners: [
      // Se o usuário clicar em "Adicionar ao Carrinho" dentro da página do produto:
      SalesforceInteractions.listener("click", ".btn-comprar", () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: SalesforceInteractions.CartInteractionName.AddToCart,
            lineItem: {
              catalogObjectType: "Product",
              catalogObjectId: "12345",
              price: 12.9,
              quantity: 1
            }
          }
        });
      })
    ]
  };

  // src/main.js
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
})();
