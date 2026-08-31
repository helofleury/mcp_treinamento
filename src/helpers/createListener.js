export const createListener = (eventType, selector, callback) => {
  return SalesforceInteractions.listener( eventType, selector,() => callback())
}