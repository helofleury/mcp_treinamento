import { DOMAIN } from "../model/domain";

export const cookieDomain = () => {
  const currentDomain = window.location.hostname;

  let currentCookieDomain = currentDomain;

  if (
    currentDomain === "gentrop.com" ||
    currentDomain.endsWith(".gentrop.com")
  ) {
    currentCookieDomain = DOMAIN.gentrop;
  }

  if (
    currentDomain === "www.saojoaofarmacias.com.br" ||
    currentDomain.endsWith(".saojoaofarmacias.com.br")
  ) {
    currentCookieDomain = DOMAIN.saoJoaoFarmacias;
  }

  return currentCookieDomain;
};