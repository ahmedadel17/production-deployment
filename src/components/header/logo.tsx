import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

function Logo() {
  return (
    <div className="te-navbar-brand">
                <Link href="/" className="flex items-center gap-3 no-underline">
                <Image 
                  src="https://ecommerce.demo.asol-tec.com/frontend/assets/svg/cotton-logo.svg" 
                  alt="logo" 
                  width={100} 
                  height={100}
                  style={{ width: 'auto', height: 'auto' }}
                />
                    {/* <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div><span className="text-xl font-bold text-gray-600 dark:text-white">Naseem</span> */}
                </Link>
            </div>
  )
}

export default Logo
