'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaMenu from './Megamenu';

function HeaderDesktopMenu({ menuData }: { menuData: any }) {
    const pathname = usePathname();
//   console.log('mega menu data ✅✅',menuData);

  return (
    <div className="te-navbar-nav te-navbar-nav-desktop border-t border-gray-100 dark:border-gray-700 justify-center hidden lg:flex">

    {/* <Link href="/" className={`te-navbar-link ${pathname === '/' ? 'te-navbar-link-active' : ''}`}>{t("Home")}</Link> */}
    {/* <div className="te-navbar-mega-dropdown"><a href="#" className="te-navbar-link te-navbar-link-has-mega-menu">{t("Men")}</a>
        <div className="te-navbar-mega-menu te-navbar-mega-menu-2-col">
            <div className="te-navbar-mega-menu-grid">
                <div className="te-navbar-mega-menu-column">
                    <h6 className="te-navbar-mega-menu-title">{t("Men Mega Menu Title")}</h6>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 1")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 2")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 3")}</a>
                </div>
                <div className="te-navbar-mega-menu-column">
                    <h6 className="te-navbar-mega-menu-title">{t("Men Mega Menu Title")}</h6>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 1")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 2")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 3")}</a>
                </div>
            </div>
        </div>
    </div> */}
    {/* <!-- .te-navbar-mega-dropdown --> */}

    {/* <div className="te-navbar-mega-dropdown">
        <a href="#" className="te-navbar-link te-navbar-link-has-mega-menu">{t("Women")}</a>
        <div className="te-navbar-mega-menu te-navbar-mega-menu-2-col">
            <div className="te-navbar-mega-menu-grid">
                <div className="te-navbar-mega-menu-column">
                    <h6 className="te-navbar-mega-menu-title">{t("Women Mega Menu Title")}</h6>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 1")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 2")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 3")}</a>
                </div>
                <div className="te-navbar-mega-menu-column">
                    <h6 className="te-navbar-mega-menu-title">{t("Women Mega Menu Title")}</h6>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 1")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 2")}</a>
                    <a href="#" className="te-navbar-mega-menu-link">{t("Menu Link 3")}</a>
                </div>
            </div>
        </div>
    </div> */}
    {/* <!-- .te-navbar-mega-dropdown --> */}


  
    {/* <!-- .te-navbar-mega-dropdown --> */}

    {/* <div className="te-navbar-dropdown">
        <a href="#" className="te-navbar-link te-navbar-link-has-submenu">{t("Accessories")}</a>
        <div className="te-navbar-submenu-content">
            <a href="#" className="te-navbar-submenu-link">{t("Menu Link 1")}</a>
            <a href="#" className="te-navbar-submenu-link">{t("Menu Link 2")}</a>
            <a href="#" className="te-navbar-submenu-link">{t("Menu Link 3")}</a>
            <a href="#" className="te-navbar-submenu-link">{t("Menu Link 4")}</a>
        </div>
    </div> */}
    {/* <!-- .te-navbar-dropdown --> */}

    {/* <div className="te-navbar-dropdown">
        <a href="#" className="te-navbar-link te-navbar-link-has-submenu">{t("Single")}</a>
        <div className="te-navbar-submenu-content">
            <a href="single.php" className="te-navbar-submenu-link">{t("Single")}</a>
            <a href="single-3d.php" className="te-navbar-submenu-link">{t("Single Gallery 3D")}</a>
            <a href="single-full.php" className="te-navbar-submenu-link">{t("Single Full")}</a>
        </div>
    </div> */}
    {/* <!-- .te-navbar-dropdown --> */}
    {menuData.items.map((item: any) => (
        item?.is_mega_menu ? <MegaMenu key={item.id} data={item} /> : 
        <Link key={item.id} href={item.url} prefetch={false} className={`te-navbar-link ${pathname.startsWith(item.url) ? 'te-navbar-link-active' : ''}`}>{item.label}</Link>
    ))}
    {/* <Link href="/products" className={`te-navbar-link ${pathname.startsWith('/products') ? 'te-navbar-link-active' : ''}`}>{t("Products")}</Link>
    <a href="cotton.php" className={`te-navbar-link ${pathname === '/cotton.php' ? 'te-navbar-link-active' : ''}`}>{t("Cotton")}</a>
    <a href="blog.php" className={`te-navbar-link ${pathname === '/blog.php' ? 'te-navbar-link-active' : ''}`}>{t("Blog")}</a>
    <a href="contact.php" className={`te-navbar-link ${pathname === '/contact.php' ? 'te-navbar-link-active' : ''}`}>{t("Contact Us")}</a> */}

</div>
  )
}

export default HeaderDesktopMenu
