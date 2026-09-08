const CART_SELECTORS = {
  decrement: ".item-quantity-change-decrement",

  remove: ".item-link-remove, .icon-remove"
};

/**
 * Obtém o SalesforceInteractions disponível no site.
 */
const getSDK = () => {
  const sdk = window.SalesforceInteractions;

  if (!sdk) {
    console.error(
      "[MCP Cart] SalesforceInteractions não está disponível."
    );

    return null;
  }

  return sdk;
};

/**
 * Verifica se existe consentimento de Personalization
 * e se o status atual é OptIn.
 *
 * IMPORTANTE:
 * O MCP NÃO assume OptIn.
 * Ele consulta o estado atual do SDK.
 */
const hasMarketingConsent = () => {
  const SalesforceInteractions = getSDK();

  if (!SalesforceInteractions) {
    return false;
  }

  const consents =
    SalesforceInteractions.getConsents?.() || [];

  console.log(
    "[MCP Consent] Consents atuais:",
    consents
  );

  const personalizationPurpose =
    SalesforceInteractions
      .mcis
      ?.ConsentPurpose
      ?.Personalization;

  const personalizationConsent =
    consents.find(
      (consent) =>
        consent.purpose ===
        personalizationPurpose
    );

  if (!personalizationConsent) {
    console.warn(
      "[MCP Consent] ❌ Sem consentimento de Personalization. Evento bloqueado."
    );

    return false;
  }

  const isOptIn =
    personalizationConsent.status ===
    SalesforceInteractions.ConsentStatus.OptIn;

  console.log(
    "[MCP Consent] Personalization:",
    personalizationConsent.status
  );

  console.log(
    "[MCP Consent] Autorizado:",
    isOptIn
  );

  return isOptIn;
};

/**
 * Procura o container do item do carrinho.
 */
const getCartRow = (element) => {
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

/**
 * Obtém o ID do produto.
 */
const getProductId = (element) => {
  if (!element) {
    return null;
  }

  const cartRow = getCartRow(element);

  const sources = [
    element,
    cartRow
  ].filter(Boolean);

  /**
   * Primeiro procura nos atributos
   * conhecidos pelo site.
   */
  for (const source of sources) {
    const productId =
      source.getAttribute("data-product-id") ||
      source.getAttribute("data-productid") ||
      source.getAttribute("data-pid") ||
      source.getAttribute("data-sku");

    if (productId) {
      return String(productId);
    }
  }

  /**
   * Depois tenta encontrar pelo ID
   * do elemento.
   */
  for (const source of sources) {
    const elementId =
      source.getAttribute("id");

    if (!elementId) {
      continue;
    }

    const parts =
      elementId.split("-");

    const lastPart =
      parts[parts.length - 1];

    if (lastPart) {
      return String(lastPart);
    }
  }

  return null;
};

/**
 * Obtém a quantidade atual do item.
 */
const getCurrentQuantity = (element) => {
  const cartRow =
    getCartRow(element);

  if (!cartRow) {
    console.warn(
      "[MCP Cart] Container do produto não encontrado."
    );

    return null;
  }

  const quantityElement =
    cartRow.querySelector(
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
      "[MCP Cart] Elemento de quantidade não encontrado.",
      cartRow
    );

    return null;
  }

  const rawQuantity =
    quantityElement.getAttribute(
      "data-quantity"
    ) ||
    quantityElement.value ||
    quantityElement.textContent ||
    quantityElement.innerText;

  const quantity =
    parseInt(
      String(rawQuantity).trim(),
      10
    );

  if (Number.isNaN(quantity)) {
    console.warn(
      "[MCP Cart] Quantidade inválida:",
      rawQuantity
    );

    return null;
  }

  return quantity;
};

/**
 * Envia ReplaceCart.
 *
 * Exemplo:
 *
 * 3 -> 2
 * 2 -> 1
 *
 * O evento SOMENTE é enviado
 * se houver OptIn.
 */
const sendReplaceCart = (
  productId,
  quantity
) => {
  const SalesforceInteractions =
    getSDK();

  if (!SalesforceInteractions) {
    return;
  }

  /**
   * BARRA DE CONSENTIMENTO
   */
  if (!hasMarketingConsent()) {
    console.warn(
      "[MCP Cart] 🚫 ReplaceCart BLOQUEADO por falta de consentimento."
    );

    return;
  }

  if (!productId) {
    console.warn(
      "[MCP Cart] ReplaceCart sem Product ID."
    );

    return;
  }

  const newQuantity =
    Number(quantity);

  if (
    !Number.isFinite(newQuantity) ||
    newQuantity <= 0
  ) {
    console.warn(
      "[MCP Cart] Quantidade inválida para ReplaceCart:",
      quantity
    );

    return;
  }

  const interactionName =
    SalesforceInteractions
      .CartInteractionName
      .ReplaceCart;

  const payload = {
    interaction: {
      name: interactionName,

      lineItem: {
        catalogObjectType: "Product",
        catalogObjectId:
          String(productId),
        quantity: newQuantity,
        price: 30.99,
        currency: "BRL"
      }
    }
  };

  console.log(
    "[MCP Cart] ================================="
  );

  console.log(
    "[MCP Cart] ✅ ENVIANDO REPLACE CART"
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
    "[MCP Cart] Nova quantidade:",
    newQuantity
  );

  console.log(
    "[MCP Cart] Payload:",
    payload
  );

  console.log(
    "[MCP Cart] ================================="
  );

  return SalesforceInteractions
    .sendEvent(payload)
    .then((result) => {
      console.log(
        "[MCP Cart] ✅ ReplaceCart enviado.",
        result
      );

      return result;
    })
    .catch((error) => {
      console.error(
        "[MCP Cart] ❌ Erro ao enviar ReplaceCart:",
        error
      );

      throw error;
    });
};

/**
 * Envia RemoveFromCart.
 *
 * O evento SOMENTE é enviado
 * se houver OptIn.
 */
const sendRemoveFromCart = (
  productId,
  quantity = 1
) => {
  const SalesforceInteractions =
    getSDK();

  if (!SalesforceInteractions) {
    return;
  }

  /**
   * BARRA DE CONSENTIMENTO
   */
  if (!hasMarketingConsent()) {
    console.warn(
      "[MCP Cart] 🚫 RemoveFromCart BLOQUEADO por falta de consentimento."
    );

    return;
  }

  if (!productId) {
    console.warn(
      "[MCP Cart] RemoveFromCart sem Product ID."
    );

    return;
  }

  const removeQuantity =
    Number(quantity);

  if (
    !Number.isFinite(removeQuantity) ||
    removeQuantity <= 0
  ) {
    console.warn(
      "[MCP Cart] Quantidade inválida:",
      quantity
    );

    return;
  }

  const interactionName =
    SalesforceInteractions
      .CartInteractionName
      .RemoveFromCart;

  const payload = {
    interaction: {
      name: interactionName,

      lineItem: {
        catalogObjectType: "Product",

        catalogObjectId:
          String(productId),

        quantity:
          removeQuantity
      }
    }
  };

  console.log(
    "[MCP Cart] ================================="
  );

  console.log(
    "[MCP Cart] 🗑️ ENVIANDO REMOVE FROM CART"
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
    "[MCP Cart] Quantity removida:",
    removeQuantity
  );

  console.log(
    "[MCP Cart] Payload:",
    payload
  );

  console.log(
    "[MCP Cart] ================================="
  );

  return SalesforceInteractions
    .sendEvent(payload)
    .then((result) => {
      console.log(
        "[MCP Cart] ✅ RemoveFromCart enviado.",
        result
      );

      return result;
    })
    .catch((error) => {
      console.error(
        "[MCP Cart] ❌ Erro ao enviar RemoveFromCart:",
        error
      );

      throw error;
    });
};

/**
 * Clique no decremento.
 *
 * Exemplo:
 *
 * quantidade antes = 3
 * clique no "-"
 * quantidade depois = 2
 *
 * Envia ReplaceCart quantity = 2.
 */
const handleDecrementClick = (
  event
) => {
  const button =
    event.target.closest(
      CART_SELECTORS.decrement
    );

  if (!button) {
    return;
  }

  console.log(
    "[MCP Cart] 🔥 DECREMENTO CAPTURADO"
  );

  const productId =
    getProductId(button);

  console.log(
    "[MCP Cart] Product ID:",
    productId
  );

  if (!productId) {
    console.warn(
      "[MCP Cart] Não consegui encontrar Product ID.",
      button
    );

    return;
  }

  const quantityBefore =
    getCurrentQuantity(button);

  console.log(
    "[MCP Cart] Quantidade antes:",
    quantityBefore
  );

  if (
    !quantityBefore ||
    quantityBefore <= 1
  ) {
    console.log(
      "[MCP Cart] Quantidade já está em 1. Não enviando ReplaceCart."
    );

    return;
  }

  const quantityAfter =
    quantityBefore - 1;

  console.log(
    "[MCP Cart] Quantidade depois:",
    quantityAfter
  );

  sendReplaceCart(
    productId,
    quantityAfter
  );
};

/**
 * Clique na lixeira.
 *
 * Exemplo:
 *
 * quantidade = 3
 * clique na lixeira
 * RemoveFromCart quantity = 3.
 */
const handleRemoveClick = (
  event
) => {
  const button =
    event.target.closest(
      CART_SELECTORS.remove
    );

  if (!button) {
    return;
  }

  console.log(
    "[MCP Cart] 🗑️ LIXEIRA CAPTURADA"
  );

  const productId =
    getProductId(button);

  console.log(
    "[MCP Cart] Product ID:",
    productId
  );

  if (!productId) {
    console.warn(
      "[MCP Cart] Não consegui encontrar Product ID.",
      button
    );

    return;
  }

  const currentQuantity =
    getCurrentQuantity(button);

  console.log(
    "[MCP Cart] Quantidade antes da remoção:",
    currentQuantity
  );

  const quantityToRemove =
    currentQuantity &&
    currentQuantity > 0
      ? currentQuantity
      : 1;

  sendRemoveFromCart(
    productId,
    quantityToRemove
  );
};

/**
 * Instala os listeners nativos.
 */
const installCartListeners = () => {
  if (
    window.__MCP_CART_LISTENERS_INSTALLED
  ) {
    console.log(
      "[MCP Cart] Listeners já instalados."
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

  window.__MCP_CART_LISTENERS_INSTALLED =
    true;

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

export const pageTypeGlobal = {
  name: "global",

  listeners: [],

  onActionEvent: (
    actionEvent
  ) => {
    return actionEvent;
  }
};

installCartListeners();