'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellerApplications: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  topShops: Array<{
    shopId: number;
    shopName: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  revenueByDate: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading:  } = useAuth(); const authLoading = false;
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get<DashboardStats>('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="ผู้ใช้ทั้งหมด"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={Store}
            label="ร้านค้า"
            value={stats?.totalSellers || 0}
            color="green"
            badge={stats?.pendingSellerApplications}
            badgeLabel="รออนุมัติ"
          />
          <StatCard
            icon={Package}
            label="สินค้าทั้งหมด"
            value={stats?.totalProducts || 0}
            color="purple"
          />
          <StatCard
            icon={ShoppingCart}
            label="คำสั่งซื้อ"
            value={stats?.totalOrders || 0}
            color="orange"
          />
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">ยอดขายรวม</p>
              <p className="text-4xl font-bold">
                ฿{stats?.totalRevenue.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <DollarSign className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Top Products & Shops */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">สินค้าขายดี</h2>
            </div>
            <div className="space-y-4">
              {stats?.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-500">ขายแล้ว {product.totalSold} ชิ้น</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ฿{product.totalRevenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Shops */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Store className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">ร้านค้ายอดนิยม</h2>
            </div>
            <div className="space-y-4">
              {stats?.topShops.slice(0, 5).map((shop, index) => (
                <div key={shop.shopId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{shop.shopName}</p>
                      <p className="text-sm text-gray-500">{shop.totalOrders} คำสั่งซื้อ</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ฿{shop.totalRevenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">ยอดขาย 30 วันล่าสุด</h2>
          </div>
          <div className="space-y-2">
            {stats?.revenueByDate.slice(-7).reverse().map((data) => (
              <div key={data.date} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{data.date}</p>
                    <p className="text-sm text-gray-500">{data.orderCount} คำสั่งซื้อ</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  ฿{data.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  badge,
  badgeLabel,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  badge?: number;
  badgeLabel?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge} {badgeLabel}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
