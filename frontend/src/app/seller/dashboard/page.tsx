'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  ShoppingBag,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopLoading && shop) {
      fetchDashboardData();
    }
  }, [shop, shopLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsRes = await api.get(`/products?shopId=${shop?.id}`);
      const products = productsRes.data;

      // Fetch orders (mock for now - adjust endpoint as needed)
      // const ordersRes = await api.get(`/seller/orders`);
      // const orders = ordersRes.data;

      // Calculate stats (using mock data for demonstration)
      setStats({
        totalProducts: products.length || 0,
        totalOrders: 42, // Mock data
        totalRevenue: 125430, // Mock data
        averageRating: 4.5, // Mock data
        pendingOrders: 8, // Mock data
        completedOrders: 34, // Mock data
        lowStockProducts: products.filter((p: any) => p.stockQuantity < 10).length,
      });

      // Set recent orders (mock data)
      setRecentOrders([
        { id: 1, customerName: 'สมชาย ใจดี', total: 1250, status: 'PENDING', createdAt: '2024-01-15' },
        { id: 2, customerName: 'สมหญิง จันทร์เพ็ญ', total: 3450, status: 'COMPLETED', createdAt: '2024-01-14' },
        { id: 3, customerName: 'วิชัย สมหวัง', total: 890, status: 'PROCESSING', createdAt: '2024-01-14' },
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (shopLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shop) {
    router.push('/seller/create-shop');
    return null;
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      yellow: 'from-yellow-500 to-yellow-600',
    }[color] || 'from-blue-500 to-blue-600';

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendValue}
            </span>
            <span className="text-gray-500">จากเดือนที่แล้ว</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
          แดชบอร์ด
        </h1>
        <p className="text-white/80 text-sm">
          ภาพรวมข้อมูลร้านค้าของคุณ {shop.name}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="สินค้าทั้งหมด"
              value={stats.totalProducts}
              icon={Package}
              color="blue"
              trend="up"
              trendValue="+12%"
            />
            <StatCard
              title="คำสั่งซื้อ"
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="green"
              trend="up"
              trendValue="+8%"
            />
            <StatCard
              title="รายได้ทั้งหมด"
              value={`฿${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
              trend="up"
              trendValue="+23%"
            />
            <StatCard
              title="คะแนนเฉลี่ย"
              value={stats.averageRating.toFixed(1)}
              icon={Star}
              color="yellow"
            />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">รอดำเนินการ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">สินค้าใกล้หมด</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">คำสั่งซื้อล่าสุด</h2>
                <button
                  onClick={() => router.push('/seller/order')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  ดูทั้งหมด
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">
                        #{order.id} · {new Date(order.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">฿{order.total.toLocaleString()}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status === 'COMPLETED' ? 'เสร็จสิ้น' :
                         order.status === 'PENDING' ? 'รอดำเนินการ' : 'กำลังจัดส่ง'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">รายการด่วน</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/seller/products')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  จัดการสินค้า
                </button>

                <button
                  onClick={() => router.push('/seller/order')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  ดูคำสั่งซื้อ
                </button>

                <button
                  onClick={() => router.push('/seller/reviews')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  รีวิวสินค้า
                </button>

                <button
                  onClick={() => router.push('/seller/shop')}
                  className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  จัดการร้านค้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
