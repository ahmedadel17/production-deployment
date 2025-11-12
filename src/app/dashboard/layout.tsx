'use client';
import React from 'react'
import DashboardSidebar from '../../components/dashboard/dashboardSidebar'
import Breadcrumb from '../../components/header/headerBreadcrumb'
import { useTranslations } from "next-intl";
function Layout({children}: {children: React.ReactNode}) {
  const t = useTranslations();
  return (
      <div id="content" className="flex-1 mt-8 mb-8 site-content">

    <div className="container">

    <main id="main" role="main">
                    <Breadcrumb name={t('Dashboard')}/>                         
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

    
    <DashboardSidebar />
    {children}
   
</div>

</main>
</div>
</div>


  )
}

export default Layout
