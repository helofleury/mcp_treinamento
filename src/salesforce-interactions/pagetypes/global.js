export const pageTypeGlobal = {
  isMatch: () => true,
  onActionEvent: (actionEvent) => {
    console.log("Global Action Event: ", actionEvent.interaction.name);
    return actionEvent;
  },
}