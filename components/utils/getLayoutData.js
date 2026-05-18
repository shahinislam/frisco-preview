import http from "./http";

let cachedLayoutData = null;
let cacheTimestamp = null;
const isDev = process.env.NODE_ENV === "development";
const CACHE_DURATION = isDev ? 0 : 5 * 60 * 1000; // No cache in dev, 5 min in production

export async function getLayoutData(forceRefresh = false) {
  const now = Date.now();

  // Return cached data immediately if available and not expired
  if (
    !forceRefresh &&
    cachedLayoutData &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedLayoutData;
  }

  try {
    const navigation = await http.get("/admin/layouts");
    const layouts = navigation.data;

    const mainMenuObj = layouts.find((layout) => layout.type === "main-menu");
    const mainMenuBtnObj = layouts.find(
      (layout) => layout.type === "main-menu-button",
    );
    const topMenuObj = layouts.find((layout) => layout.type === "top-menu");
    const bottomMenuObj = layouts.find(
      (layout) => layout.type === "bottom-menu",
    );
    const footerObj = layouts.find((layout) => layout.type === "footer");
    const globalTagsObj = layouts.find(
      (layout) => layout.type === "global-tags",
    );
    const mobileLayoutObj = layouts.find(
      (layout) => layout.type === "mobile-layout",
    );

    const mainMenu = JSON.parse(mainMenuObj?.menus || "[]");
    const mainMenuBtn = JSON.parse(mainMenuBtnObj?.menus || "[]");
    const topMenu = JSON.parse(topMenuObj?.menus || "[]");
    const bottomMenu = JSON.parse(bottomMenuObj?.menus || "[]");
    const mobileLayout = JSON.parse(mobileLayoutObj?.menus || "{}");

    const mobileTopMenu = topMenu.filter((menu) =>
      mobileLayout.top?.includes(menu.id),
    );
    const restMobileTopMenu = topMenu.filter(
      (menu) => !mobileLayout.top?.includes(menu.id),
    );
    const mobileMainMenu = [...mainMenu, ...restMobileTopMenu];
    const filteredMobileMainMenu = mobileMainMenu.filter(
      (item) => !item.url?.includes("/emergency-room-appointment"),
    );

    cachedLayoutData = {
      mainMenu,
      mainMenuBtn,
      mobileMainMenu: filteredMobileMainMenu,
      topMenu,
      mobileTopMenu,
      bottomMenu,
      footer: footerObj || {},
      globalTags: globalTagsObj || {},
      mobileLayout,
    };

    cacheTimestamp = now;
    return cachedLayoutData;
  } catch (error) {
    console.error("Error fetching layouts:", error);

    if (cachedLayoutData) {
      return cachedLayoutData;
    }

    return {
      mainMenu: [],
      mainMenuBtn: [],
      mobileMainMenu: [],
      topMenu: [],
      mobileTopMenu: [],
      bottomMenu: [],
      footer: {},
      globalTags: {},
      mobileLayout: {},
    };
  }
}
