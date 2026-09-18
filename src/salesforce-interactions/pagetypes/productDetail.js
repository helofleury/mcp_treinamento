export const pageTypeProductDetail = {
  name: "productDetail",
  // Regra para identificar que está na página do produto
  isMatch: () => window.location.pathname.includes("/p/"),

  interaction: {
    name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject, // "View Catalog Object"
    catalogObject: {
      type: "Product",
      id: "12345", // Capturar dinamicamente o ID/SKU do produto na tela
      attributes: {
        name: "Dipirona 500mg",
        price: 12.90,
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
            price: 12.90,
            quantity: 1
          }
        }
      });
    })
  ]
};