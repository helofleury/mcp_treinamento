import { pageTypeDefault } from "../pagetypes/default";
import { pageTypeGlobal } from "../pagetypes/global";

export const makeConfig = () => {
  return {
    global: pageTypeGlobal,
    pageTypeDefault: pageTypeDefault,
    pageTypes: []
  };
};