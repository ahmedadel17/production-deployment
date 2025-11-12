import React from 'react'

function HeaderNotification() {
  return (
   <div className="te-navbar-dropdown">
    <a href="dashboard-notification.php" className="header-notification relative flex items-center gap-3 cursor-pointer">
        <div className="cart-icon">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 dark:text-white flex justify-center items-center rounded-full relative">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>

                {/* <!-- Badge --> */}
                <span className="header-notification-item absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    5
                </span>
            </div>
        </div>
    </a>
</div>
  )
}

export default HeaderNotification
