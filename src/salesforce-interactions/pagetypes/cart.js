export const pageTypeCart = {
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

      // Impede propagação dupla do evento no DOM
      e.stopPropagation();

      // Identifica a ação de forma exclusiva
      const isIncrease = action === "increment";
      const isDecrease = action === "decrement";
      const isRemove = action === "remove-item";

      if (!isIncrease && !isDecrease && !isRemove) return;

      // Busca o card pai e os atributos de identificação
      const card = button.closest(".fsj-custom-cart-item") || 
                   button.closest("[data-product-id]") || 
                   button.closest("[class*='cart-item']") || 
                   button.parentElement;

      const productId = (card && card.getAttribute("data-product-id")) || 
                        button.getAttribute("data-product-id") || 
                        button.getAttribute("data-item-key");

      const rawPrice = (card && card.getAttribute("data-product-price")) || button.getAttribute("data-product-price") || "0";
      const price = parseFloat(rawPrice);

      if (!productId) {
        console.warn("[Salesforce SDK] Ação detectada (" + action + "), mas o ID do produto não foi localizado.");
        return;
      }

      // 1. INCREMENTAR (+)
      if (isIncrease) {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: SalesforceInteractions.CartInteractionName.AddToCart,
            lineItem: {
              catalogObjectType: "Product",
              catalogObjectId: productId,
              price: price,
              quantity: 1
            }
          }
        });
      } 
      // 2. DECREMENTAR (-)
      else if (isDecrease) {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: SalesforceInteractions.CartInteractionName.RemoveFromCart,
            lineItem: {
              catalogObjectType: "Product",
              catalogObjectId: productId,
              price: price,
              quantity: 1
            }
          }
        });
      } 
      // 3. REMOVER TOTAL (Lixeira) - CORRIGIDO
      else if (isRemove) {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: SalesforceInteractions.CartInteractionName.RemoveFromCart,
            lineItem: {
              catalogObjectType: "Product",
              catalogObjectId: productId,
              price: price,
              quantity: 1 // Adicionado para satisfazer a validação de Schema
            }
          }
        });
      }
    })
  ]
};