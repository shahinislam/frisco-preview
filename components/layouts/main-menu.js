import { useEffect, useState } from "react";
import Submenu from "./sub-menu";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const isExternalLink = (url) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/") || url.startsWith("#")) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host !== "ercare24.com" && !host.endsWith(".ercare24.com");
  } catch {
    return false;
  }
};

export default function MainMenu({ menuItems = [], mainMenuBtn = {} }) {
  // ← Add default values
  const router = useRouter();
  const uri = router.asPath;
  const [openDropdown, setOpenDropdown] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Function to toggle navbar collapse state
  const toggleNavbar = () => {
    setCollapsed(!collapsed);
  };

  // Function to close the navbar
  const closeNavbar = () => {
    setOpenDropdown(null);
    setCollapsed(true);
  };

  useEffect(() => {
    closeNavbar();
  }, [router]);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownToggle = (menuTitle) => {
    setOpenDropdown(openDropdown === menuTitle ? null : menuTitle);
  };

  const activeMenu = (tree) => {
    let result = JSON.stringify(tree).includes(uri + '"');
    return result;
  };

  // Show loading state if data is not ready
  if (!menuItems || menuItems.length === 0) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-0 mb-3">
        <div className="container">
          <Link className="navbar-brand" href="/">
            <Link className="navbar-brand" href="/" prefetch={false}>
              <Image
                src="/assets/SignatureCareER.png?v=2"
                width={240}
                height={45}
                className="d-inline-block align-top"
                alt="SignatureCare"
                priority
              />
            </Link>
          </Link>
          <div className="ms-auto">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-white py-0 mb-3"
        style={{
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <div className="container">
          <Link className="navbar-brand" href="/">
            <Image
              src="/assets/SignatureCareER.webp?v=2"
              width={640}
              height={112}
              className="d-inline-block align-top"
              alt="SignatureCare"
              priority
              quality={75}
              style={{ width: "auto", height: "45px" }}
              sizes="260px"
            />
          </Link>

          <button
            onClick={toggleNavbar}
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded={!collapsed ? "true" : "false"}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse ${collapsed ? "" : "show"}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav navbar-nav-customize ms-auto fw-bold">
              {/* Mobile button */}
              {mainMenuBtn?.url && (
                <li className="nav-item d-flex align-items-center d-lg-none">
                  <Link
                    href={mainMenuBtn.url}
                    target={isExternalLink(mainMenuBtn.url) ? "_blank" : undefined}
                    rel={isExternalLink(mainMenuBtn.url) ? "noopener noreferrer" : undefined}
                    style={{
                      backgroundColor: mainMenuBtn.background || "#0dcaf0",
                      color: mainMenuBtn.color || "#fff",
                    }}
                    className="btn btn-info ms-3 py-2 text-sm fw-bolder text-white"
                  >
                    {mainMenuBtn.title || "Book Now"}
                  </Link>
                </li>
              )}

              {menuItems.map((menu, index) => (
                <li
                  key={index}
                  className={`nav-item nav-item-customize dropdown ${uri !== "/" && activeMenu(menu.submenu || []) ? "active" : ""} ${uri === menu.url ? "active" : ""}`}
                >
                  {/* For Large Screen */}
                  <Link
                    href={menu.url || "#"}
                    target={isExternalLink(menu.url) ? "_blank" : undefined}
                    rel={isExternalLink(menu.url) ? "noopener noreferrer" : undefined}
                    className={`nav-link main-nav-link px-3 d-none d-lg-block d-inline-block ${!menu.url ? "disabled" : ""}`}
                  >
                    {/* {menu.title} {menu.submenu?.length > 0 ? <TiPlus className='ti-plus-desktop' /> : ''} */}
                    {menu.title} {menu.submenu?.length > 0 ? "" : ""}
                  </Link>
                  {/* For Mobile Screen */}
                  <Link
                    href={menu.url || "#"}
                    target={isExternalLink(menu.url) ? "_blank" : undefined}
                    rel={isExternalLink(menu.url) ? "noopener noreferrer" : undefined}
                    className={`nav-link main-nav-link px-3 d-lg-none d-inline-block py-1 w-75 ${!menu.url ? "disabled" : ""}`}
                  >
                    {menu.title}{" "}
                    {menu.submenu?.length > 0 ? (
                      <IoIosArrowDown className="ti-plus-desktop" />
                    ) : (
                      ""
                    )}
                  </Link>
                  {menu.submenu?.length > 0 && (
                    <a
                      className="d-md-none d-inline-block nav-link px-2 me-2 float-end bg-danger"
                      id={menu.title}
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      onClick={() => handleDropdownToggle(menu.title)}
                    >
                      {openDropdown === menu.title ? (
                        <IoIosArrowUp className="ti-minus-mobile float-end fw-bold" />
                      ) : (
                        <IoIosArrowDown className="ti-plus-mobile float-end fw-bold" />
                      )}
                    </a>
                  )}
                  {menu.submenu?.length > 0 && (
                    <Submenu
                      submenus={menu.submenu}
                      id={menu.title}
                      count={0}
                    />
                  )}
                </li>
              ))}

              {/* Desktop button */}
              {mainMenuBtn?.url && (
                <li className="nav-item align-self-center d-none d-lg-block">
                  <Link
                    href={mainMenuBtn.url}
                    target={isExternalLink(mainMenuBtn.url) ? "_blank" : undefined}
                    rel={isExternalLink(mainMenuBtn.url) ? "noopener noreferrer" : undefined}
                    style={{
                      backgroundColor: mainMenuBtn.background || "#0dcaf0",
                      color: mainMenuBtn.color || "#fff",
                    }}
                    className="btn btn-info ms-3 py-3 text-sm fw-bolder"
                  >
                    {mainMenuBtn.title || "Book Now"}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
