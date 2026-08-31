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
    interaction: { name: "Acessou p\xE1gina" }
  };

  // src/salesforce-interactions/pagetypes/global.js
  var CART_SELECTORS = {
    decrement: ".item-quantity-change-decrement",
    remove: ".item-link-remove, .icon-remove"
  };
  var getSDK = () => {
    const sdk = window.SalesforceInteractions;
    if (!sdk) {
      console.error(
        "[MCP Cart] SalesforceInteractions n\xE3o est\xE1 dispon\xEDvel."
      );
      return null;
    }
    return sdk;
  };
  var getCartRow = (element) => {
    if (!element) {
      return null;
    }
    return element.closest(
      [
        ".product-item",
        ".cart-item",
        ".item-cart",
        ".cart-product",
        "[data-product-id]",
        "[data-productid]",
        "[data-pid]",
        "[data-sku]",
        "tr"
      ].join(", ")
    );
  };
  var getProductId = (element) => {
    if (!element) {
      return null;
    }
    const cartRow = getCartRow(element);
    const sources = [
      element,
      cartRow
    ].filter(Boolean);
    for (const source of sources) {
      const productId = source.getAttribute(
        "data-product-id"
      ) || source.getAttribute(
        "data-productid"
      ) || source.getAttribute(
        "data-pid"
      ) || source.getAttribute(
        "data-sku"
      );
      if (productId) {
        return String(productId);
      }
    }
    for (const source of sources) {
      const elementId = source.getAttribute("id");
      if (!elementId) {
        continue;
      }
      const parts = elementId.split("-");
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        return String(lastPart);
      }
    }
    return null;
  };
  var getCurrentQuantity = (element) => {
    const cartRow = getCartRow(element);
    if (!cartRow) {
      console.warn(
        "[MCP Cart] Container do produto n\xE3o encontrado."
      );
      return null;
    }
    const quantityElement = cartRow.querySelector(
      [
        ".item-quantity-change-value",
        ".quantity",
        "[data-quantity]",
        "input[type='number']",
        "input"
      ].join(", ")
    );
    if (!quantityElement) {
      console.warn(
        "[MCP Cart] Elemento de quantidade n\xE3o encontrado.",
        cartRow
      );
      return null;
    }
    const rawQuantity = quantityElement.getAttribute(
      "data-quantity"
    ) || quantityElement.value || quantityElement.textContent || quantityElement.innerText;
    const quantity = parseInt(
      String(rawQuantity).trim(),
      10
    );
    if (Number.isNaN(quantity)) {
      console.warn(
        "[MCP Cart] Quantidade inv\xE1lida:",
        rawQuantity
      );
      return null;
    }
    return quantity;
  };
  var sendRemoveFromCart = (productId, quantity = 1) => {
    const SalesforceInteractions2 = getSDK();
    if (!SalesforceInteractions2) {
      return;
    }
    if (!productId) {
      console.warn(
        "[MCP Cart] RemoveFromCart sem Product ID."
      );
      return;
    }
    const removeQuantity = Number(quantity);
    if (!Number.isFinite(removeQuantity) || removeQuantity <= 0) {
      console.warn(
        "[MCP Cart] Quantidade inv\xE1lida:",
        quantity
      );
      return;
    }
    const interactionName = SalesforceInteractions2.CartInteractionName.RemoveFromCart;
    console.log(
      "[MCP Cart] ================================="
    );
    console.log(
      "[MCP Cart] ENVIANDO REMOVE FROM CART"
    );
    console.log(
      "[MCP Cart] Interaction:",
      interactionName
    );
    console.log(
      "[MCP Cart] Product ID:",
      productId
    );
    console.log(
      "[MCP Cart] Quantity:",
      removeQuantity
    );
    console.log(
      "[MCP Cart] Anonymous ID:",
      SalesforceInteractions2.getAnonymousId?.()
    );
    console.log(
      "[MCP Cart] Consents:",
      SalesforceInteractions2.getConsents?.()
    );
    console.log(
      "[MCP Cart] ================================="
    );
    const payload = {
      interaction: {
        name: interactionName,
        lineItem: {
          catalogObjectType: "Product",
          catalogObjectId: String(productId),
          quantity: removeQuantity
        }
      }
    };
    console.log(
      "[MCP Cart] Payload:",
      payload
    );
    return SalesforceInteractions2.sendEvent(payload).then((result) => {
      console.log(
        "[MCP Cart] \u2705 RemoveFromCart enviado.",
        result
      );
      return result;
    }).catch((error) => {
      console.error(
        "[MCP Cart] \u274C Erro ao enviar RemoveFromCart:",
        error
      );
      throw error;
    });
  };
  var handleDecrementClick = (event) => {
    const button = event.target.closest(
      CART_SELECTORS.decrement
    );
    if (!button) {
      return;
    }
    console.log(
      "[MCP Cart] \u{1F525} DECREMENTO CAPTURADO"
    );
    const productId = getProductId(button);
    console.log(
      "[MCP Cart] Product ID:",
      productId
    );
    if (!productId) {
      console.warn(
        "[MCP Cart] N\xE3o consegui encontrar Product ID.",
        button
      );
      return;
    }
    const currentQuantity = getCurrentQuantity(button);
    console.log(
      "[MCP Cart] Quantidade antes:",
      currentQuantity
    );
    sendRemoveFromCart(
      productId,
      1
    );
  };
  var handleRemoveClick = (event) => {
    const button = event.target.closest(
      CART_SELECTORS.remove
    );
    if (!button) {
      return;
    }
    console.log(
      "[MCP Cart] \u{1F5D1}\uFE0F LIXEIRA CAPTURADA"
    );
    const productId = getProductId(button);
    console.log(
      "[MCP Cart] Product ID:",
      productId
    );
    if (!productId) {
      console.warn(
        "[MCP Cart] N\xE3o consegui encontrar Product ID.",
        button
      );
      return;
    }
    const currentQuantity = getCurrentQuantity(button);
    console.log(
      "[MCP Cart] Quantidade antes da remo\xE7\xE3o:",
      currentQuantity
    );
    const quantityToRemove = currentQuantity && currentQuantity > 0 ? currentQuantity : 1;
    sendRemoveFromCart(
      productId,
      quantityToRemove
    );
  };
  var installCartListeners = () => {
    if (window.__MCP_CART_LISTENERS_INSTALLED) {
      console.log(
        "[MCP Cart] Listeners j\xE1 instalados."
      );
      return;
    }
    document.addEventListener(
      "click",
      handleDecrementClick,
      true
    );
    document.addEventListener(
      "click",
      handleRemoveClick,
      true
    );
    window.__MCP_CART_LISTENERS_INSTALLED = true;
    console.log(
      "[MCP Cart] ================================="
    );
    console.log(
      "[MCP Cart] LISTENERS INSTALADOS"
    );
    console.log(
      "[MCP Cart] Decrement:",
      CART_SELECTORS.decrement
    );
    console.log(
      "[MCP Cart] Remove:",
      CART_SELECTORS.remove
    );
    console.log(
      "[MCP Cart] ================================="
    );
  };
  var pageTypeGlobal = {
    name: "global",
    listeners: [],
    onActionEvent: (actionEvent) => {
      return actionEvent;
    }
  };
  installCartListeners();

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

  // src/main.js
  console.log("[MCP] =================================");
  console.log("[MCP] MAIN.JS CARREGADO");
  console.log(
    "[MCP] hostname:",
    window.location.hostname
  );
  console.log("[MCP] =================================");
  var waitForSalesforceInteractions = (timeout = 15e3) => {
    return new Promise((resolve, reject) => {
      const start2 = Date.now();
      const check = () => {
        const sdk = window.SalesforceInteractions;
        if (sdk) {
          console.log(
            "[MCP] SalesforceInteractions encontrado"
          );
          resolve(sdk);
          return;
        }
        if (Date.now() - start2 >= timeout) {
          reject(
            new Error(
              "SalesforceInteractions n\xE3o ficou dispon\xEDvel ap\xF3s " + timeout + "ms"
            )
          );
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  };
  var initializeSDK = async (SalesforceInteractions2) => {
    if (window.__MCP_SALESFORCE_INITIALIZED) {
      console.log(
        "[MCP] SDK j\xE1 foi inicializado pelo MCP."
      );
      return SalesforceInteractions2;
    }
    const domain = cookieDomain();
    console.log(
      "[MCP] cookieDomain:",
      domain
    );
    console.log(
      "[MCP] Consents ANTES do init:",
      SalesforceInteractions2.getConsents?.()
    );
    await SalesforceInteractions2.init({
      cookieDomain: domain,
      consents: [
        {
          purpose: SalesforceInteractions2.mcis.ConsentPurpose.Personalization,
          provider: "Gentrop",
          status: SalesforceInteractions2.ConsentStatus.OptIn
        }
      ]
    });
    window.__MCP_SALESFORCE_INITIALIZED = true;
    console.log(
      "[MCP] ================================="
    );
    console.log(
      "[MCP] SDK INICIALIZADO"
    );
    console.log(
      "[MCP] Anonymous ID:",
      SalesforceInteractions2.getAnonymousId?.()
    );
    console.log(
      "[MCP] Consents DEPOIS do init:",
      SalesforceInteractions2.getConsents?.()
    );
    console.log(
      "[MCP] Cookie Domain:",
      SalesforceInteractions2.getCookieDomain?.()
    );
    console.log(
      "[MCP] ================================="
    );
    return SalesforceInteractions2;
  };
  var initializeSitemap = (SalesforceInteractions2) => {
    const config = makeConfig();
    console.log(
      "[MCP] CONFIG GERADA:",
      config
    );
    if (!config || !config.global) {
      console.error(
        "[MCP] ERRO: config.global n\xE3o existe."
      );
      return;
    }
    console.log(
      "[MCP] Global:",
      config.global
    );
    handleSPAPageChange();
    console.log(
      "[MCP] Inicializando Sitemap..."
    );
    SalesforceInteractions2.initSitemap(
      config
    );
    console.log(
      "[MCP] Sitemap inicializado."
    );
    console.log(
      "[MCP] Sitemap Config:",
      SalesforceInteractions2.getSitemapConfig?.()
    );
    console.log(
      "[MCP] Sitemap Result:",
      SalesforceInteractions2.getSitemapResult?.()
    );
  };
  var start = async () => {
    try {
      const SalesforceInteractions2 = await waitForSalesforceInteractions();
      console.log(
        "[MCP] SDK:",
        SalesforceInteractions2
      );
      await initializeSDK(
        SalesforceInteractions2
      );
      initializeSitemap(
        SalesforceInteractions2
      );
      console.log(
        "[MCP] ================================="
      );
      console.log(
        "[MCP] MCP INICIALIZA\xC7\xC3O FINALIZADA"
      );
      console.log(
        "[MCP] Anonymous ID FINAL:",
        SalesforceInteractions2.getAnonymousId?.()
      );
      console.log(
        "[MCP] Consents FINAIS:",
        SalesforceInteractions2.getConsents?.()
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
})();
