'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Filter,
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface OrderItem {
  id: number;
  productName?: string;
  variantOptions?: any;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems?: OrderItem[];
  shippingAddress?: string;
  phoneNumber?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!shopLoading && shop) {
      fetchOrders();
    }
  }, [shop, shopLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          userName: 'สมชาย ใจดี',
          userEmail: 'somchai@example.com',
          totalAmount: 1250,
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00',
          shippingAddress: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          phoneNumber: '081-234-5678',
          orderItems: [
            { id: 1, productName: 'เสื้อยืดสีขาว ไซส์ M', quantity: 2, price: 500 },
            { id: 2, productName: 'กางเกงยีนส์ ขายาว', quantity: 1, price: 750 },
          ],
        },
        {
          id: 2,
          userId: 2,
          userName: 'สมหญิง จันทร์เพ็ญ',
          userEmail: 'somying@example.com',
          totalAmount: 3450,
          status: 'PROCESSING',
          createdAt: '2024-01-14T15:20:00',
          shippingAddress: '456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          phoneNumber: '082-345-6789',
          orderItems: [
            { id: 3, productName: 'รองเท้าผ้าใบ ไซส์ 39', quantity: 1, price: 2200 },
            { id: 4, productName: 'กระเป๋าสะพาย สีน้ำตาล', quantity: 1, price: 1250 },
          ],
        },
        {
          id: 3,
          userId: 3,
          userName: 'วิชัย สมหวัง',
          userEmail: 'wichai@example.com',
          totalAmount: 890,
          status: 'SHIPPED',
          createdAt: '2024-01-13T09:15:00',
          shippingAddress: '789 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10310',
          phoneNumber: '083-456-7890',
          orderItems: [
            { id: 5, productName: 'เสื้อเชิ้ตลายสก็อต ไซส์ L', quantity: 1, price: 890 },
          ],
        },
        {
          id: 4,
          userId: 4,
          userName: 'สุภาพร ศรีสุข',
          userEmail: 'supaporn@example.com',
          totalAmount: 2100,
          status: 'COMPLETED',
          createdAt: '2024-01-12T14:45:00',
          shippingAddress: '321 ถนนงามวงศ์วาน แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10900',
          phoneNumber: '084-567-8901',
          orderItems: [
            { id: 6, productName: 'รองเท้าแตะหนัง ไซส์ 39', quantity: 1, price: 2100 },
          ],
        },
        {
          id: 5,
          userId: 5,
          userName: 'ประยุทธ์ มานะดี',
          userEmail: 'prayut@example.com',
          totalAmount: 450,
          status: 'CANCELLED',
          createdAt: '2024-01-11T11:20:00',
          shippingAddress: '654 ถนนเพชรเกษม แขวงหนองแขม เขตหนองแขม กรุงเทพฯ 10400',
          phoneNumber: '085-678-9012',
          orderItems: [
            { id: 7, productName: 'หมวกแก๊ป สีดำ', quantity: 1, price: 450 },
          ],
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      setSuccess('อัปเดตสถานะสำเร็จ');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'รอดำเนินการ' },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'กำลังเตรียมสินค้า' },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'กำลังจัดส่ง' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'สำเร็จ' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'ยกเลิก' },
    };
    const config = configs[status as keyof typeof configs] || configs.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
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

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">คำสั่งซื้อ</h1>
        <p className="text-white/80 text-sm">จัดการคำสั่งซื้อของร้านค้าของคุณ</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'].map((status) => {
              const count = status === 'ALL' ? orders.length : orders.filter((o) => o.status === status).length;
              const labels = {
                ALL: 'ทั้งหมด',
                PENDING: 'รอดำเนินการ',
                PROCESSING: 'กำลังเตรียม',
                SHIPPED: 'กำลังจัดส่ง',
                COMPLETED: 'สำเร็จ',
              };

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    statusFilter === status
                      ? 'bg-white border-blue-500 shadow-lg'
                      : 'bg-white/80 border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <p className="text-xs text-gray-600 mb-1">{labels[status as keyof typeof labels]}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ค้นหาคำสั่งซื้อด้วยชื่อลูกค้า หรือหมายเลขคำสั่งซื้อ..."
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีคำสั่งซื้อ</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'ALL' ? 'ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข' : 'ยังไม่มีคำสั่งซื้อในร้านค้า'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">คำสั่งซื้อ #{order.id}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{order.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">฿{order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{order.orderItems?.length || 0} รายการ</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">รายการสินค้า</h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {item.productName} x {item.quantity}
                            </span>
                            <span className="font-medium text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        ดูรายละเอียด
                      </button>

                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            ยืนยันคำสั่งซื้อ
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          จัดส่งสินค้า
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">รายละเอียดคำสั่งซื้อ #{selectedOrder.id}</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลลูกค้า</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedOrder.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedOrder.phoneNumber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700">{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">รายการสินค้า</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">จำนวน: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>รวมทั้งหมด</span>
                      <span className="text-blue-600">฿{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
