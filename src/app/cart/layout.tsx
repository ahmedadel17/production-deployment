'use client';
import Breadcrumb from "../../components/header/headerBreadcrumb";
import { useTranslations } from "next-intl";
function Layout({children}: {children: React.ReactNode}) {
  const t = useTranslations();
  return (
    <div id="content" className="flex-1 mt-8 mb-8 site-content" role="main">
    <div id="primary" className="container">
        <main id="main" role="main">
            {/* <!-- Breadcrumb --> */}
        <Breadcrumb name={t('Cart')} />                          

{children}










</main>
</div>
</div>

  )
}

export default Layout
