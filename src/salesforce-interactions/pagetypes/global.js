const CART_SELECTORS = {
  decrement:
    ".item-quantity-change-decrement",

  remove:
    ".item-link-remove, .icon-remove"
};

const getSDK = () => {
  const sdk =
    window.SalesforceInteractions;

  if (!sdk) {
    console.error(
      "[MCP Cart] SalesforceInteractions não está disponível."
    );

    return null;
  }

  return sdk;
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

  const cartRow =
    getCartRow(element);

  const sources = [
    element,
    cartRow
  ].filter(Boolean);

  /*
   * Primeiro tenta atributos conhecidos.
   */
  for (const source of sources) {
    const productId =
      source.getAttribute(
        "data-product-id"
      ) ||
      source.getAttribute(
        "data-productid"
      ) ||
      source.getAttribute(
        "data-pid"
      ) ||
      source.getAttribute(
        "data-sku"
      );

    if (productId) {
      return String(productId);
    }
  }

  /*
   * Depois tenta IDs HTML.
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
const getCurrentQuantity = (
  element
) => {
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
 * Envia Remove From Cart.
 *
 * Decremento:
 *   quantity = 1
 *
 * Lixeira:
 *   quantity = quantidade existente
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
    SalesforceInteractions
      .getAnonymousId?.()
  );

  console.log(
    "[MCP Cart] Consents:",
    SalesforceInteractions
      .getConsents?.()
  );

  console.log(
    "[MCP Cart] ================================="
  );

  const payload = {
    interaction: {
      name: interactionName,

      lineItem: {
        catalogObjectType:
          "Product",

        catalogObjectId:
          String(productId),

        quantity:
          removeQuantity
      }
    }
  };

  console.log(
    "[MCP Cart] Payload:",
    payload
  );

  /*
   * Retornamos a Promise para facilitar
   * diagnóstico de erro.
   */
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
 * Sempre representa a remoção
 * de UMA unidade.
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

  const currentQuantity =
    getCurrentQuantity(button);

  console.log(
    "[MCP Cart] Quantidade antes:",
    currentQuantity
  );

  /*
   * Clique no "-"
   * = remove exatamente 1 unidade.
   */
  sendRemoveFromCart(
    productId,
    1
  );
};

/**
 * Clique na lixeira.
 *
 * Remove a quantidade inteira
 * que existia antes da operação.
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

  /*
   * Se conseguirmos descobrir a quantidade,
   * enviamos ela.
   *
   * Exemplo:
   * 4 -> 0
   * quantity = 4
   */
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
 *
 * Usamos document porque o checkout
 * da VTEX é SPA e recria elementos
 * dinamicamente.
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

/**
 * Global do Sitemap.
 *
 * Não usamos SalesforceInteractions.listener()
 * aqui. O listener nativo acima já captura
 * os eventos diretamente no document.
 */
export const pageTypeGlobal = {
  name: "global",

  listeners: [],

  onActionEvent: (actionEvent) => {
    return actionEvent;
  }
};

/**
 * Instala os listeners assim que este módulo
 * for carregado.
 */
installCartListeners();