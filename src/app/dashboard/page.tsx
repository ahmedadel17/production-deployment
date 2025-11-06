"use client";
import React, { useEffect, useState, useCallback } from "react";
import getRequest from "../../../helpers/get";
import { useAuth } from "../hooks/useAuth";
import { useLocale, useTranslations } from "next-intl";
import Breadcrumb from "../../components/header/headerBreadcrumb";

interface Order {
  id: string;
  date: string;
  status: {
    text: string;
    color: string;
  };
  total: string;
}

interface WishlistItem {
  title: string;
  image: string;
  price: string;
}

export default function Dashboard() {
  const orders: Order[] = [
    { id: "ORD-2024-001234", date: "September 1, 2025", status: { text: "Delivered", color: "green" }, total: "65.00" },
    { id: "ORD-2024-001233", date: "August 28, 2025", status: { text: "Shipped", color: "blue" }, total: "85.00" },
    { id: "ORD-2024-001232", date: "August 20, 2025", status: { text: "Processing", color: "yellow" }, total: "45.00" },
  ];

  const wishlistItems: WishlistItem[] = [
    { title: "Straight-leg jeans", image: "/assets/images/product-1.jpg", price: "65.00" },
    { title: "Cotton T-shirt", image: "/assets/images/product-2.jpg", price: "65.00" },
    { title: "Straight-leg jeans", image: "/assets/images/product-3.jpg", price: "65.00" },
    { title: "Striped T-shirt", image: "/assets/images/product-4.jpg", price: "65.00" },
  ];
  const { token,user } = useAuth();
  const locale = useLocale();
  const t = useTranslations();
  // Consolidated state for better performance and organization
  const [state, setState] = useState({
    wallet: null as {balance:number} | null,
    points: null as {points:number, current_points_int: number} | null,
    profile: null as {name:string} | null,
    isLoading: {
      wallet: false,
      points: false,
      profile: false
    }
  });
  const getWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, wallet: true } }));
    try {
      const response = await getRequest('/customer/wallet', {'Content-Type': 'application/json'}, token, locale);
      // console.log('wallet', response);
      setState(prev => ({ 
        ...prev, 
        wallet: response.data,
        isLoading: { ...prev.isLoading, wallet: false }
      }));
      if (response.status) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, wallet: false } }));
    }
  }, [token, locale]);

  const getPoints = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, points: true } }));
    try {
      const response = await getRequest('/customer/points-history', {'Content-Type': 'application/json'}, token, locale);
      // console.log('points', response);
      setState(prev => ({ 
        ...prev, 
        points: response.data,
        isLoading: { ...prev.isLoading, points: false }
      }));
    } catch (error) {
      console.error('Error fetching points:', error);
      setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, points: false } }));
    }
  }, [token, locale]);

  const getProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, profile: true } }));
    try {
      const response = await getRequest('/customer/get-profile', {'Content-Type': 'application/json'}, token, locale);
      // console.log('profile', response);
      setState(prev => ({ 
        ...prev, 
        profile: response.data,
        isLoading: { ...prev.isLoading, profile: false }
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, profile: false } }));
    }
  }, [token, locale]);
 useEffect(()=>{
  getWallet();
  getPoints();
  getProfile();
 },[getWallet, getPoints, getProfile]);

  return (
  <>
   {/* Main Content */}
   <div className="lg:col-span-3 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Welcome back')}, {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('Heres whats happening with your account')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <StatCard
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            }
            value={state.isLoading.wallet ? "Loading" : `$ ${state.wallet?.balance || '0'}`}
            label={t('Wallet Balance')}
            isLoading={state.isLoading.wallet}
          />

          {/* Points Card */}
          <StatCard
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
              </svg>
            }
            value={state.isLoading.points ? t("Loading") : `${state.points?.current_points_int || '0'}`}
            label={t('Reward Points')}
            isLoading={state.isLoading.points}
          />

          {/* Total Spent */}
          <StatCard color="purple" icon={<span className="text-lg">﷼</span>} value="65.00" label={t('Total Spent')} />

          {/* Wishlist */}
          <StatCard color="red" icon={<HeartIcon />} value="12" label={t('Wishlist Items')} />

          {/* Total Orders */}
          <StatCard color="blue" icon={<BagIcon />} value="12" label={t('Total Orders')} />
        </div>

        {/* Loyalty Level Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('Loyalty Status')} </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('You are currently a')} <span className="font-bold text-primary-600">Silver</span> {t('member')}. {t('You are only')} {" "}
                <span className="font-bold">{750} {t('points')} </span> {t('away from reaching')} {" "}
                <span className="font-bold text-yellow-500">{t('Gold')}</span>!
              </p>
            </div>
            <a href="/dashboard-points" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t('See Benefits')}
            </a>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: "50%" }}></div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('Recent Orders')}</h2>
            <a href="/dashboard-orders" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View All
            </a>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">{t('Order ID')}</th>
                  <th className="px-6 py-3">{t('Date')}</th>
                  <th className="px-6 py-3">{t('Status')}</th>
                  <th className="px-6 py-3">{t('Total')}</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 bg-${order.status.color}-100 dark:bg-${order.status.color}-900 text-${order.status.color}-800 dark:text-${order.status.color}-200 text-xs font-medium rounded-full`}
                      >
                        {order.status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">﷼ {order.total}</td>
                    <td className="px-6 py-4">
                      <a href="#" className="font-medium text-primary-600 hover:underline">
                        {t('View')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      
      </div>
  </>

     
  );
}

/* ========== Reusable Components ========== */

interface StatCardProps {
  color: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  isLoading?: boolean;
}

function StatCard({ color, icon, value, label, isLoading = false }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900 rounded-full text-${color}-600 dark:text-${color}-400`}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent"></div>
          ) : (
            icon
          )}
        </div>
        <div className="ms-4">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      ></path>
    </svg>
  );
}

function BagIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
    </svg>
  );
}
