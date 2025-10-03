'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ShoppingBag, Store, TrendingUp, Shield, Truck, Heart } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated, isSeller, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">
                E-Commerce Platform
              </h1>
              <p className="text-xl text-gray-600">
                แพลตฟอร์มซื้อขายออนไลน์ที่ครบวงจร
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-lg"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md border-2 border-blue-600 text-lg"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ปลอดภัยและน่าเชื่อถือ</h3>
              <p className="text-gray-600">ระบบรักษาความปลอดภัยระดับสูง</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">จัดส่งรวดเร็ว</h3>
              <p className="text-gray-600">ติดตามสถานะการจัดส่งแบบ real-time</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">เปิดร้านค้าได้ง่าย</h3>
              <p className="text-gray-600">เริ่มขายสินค้าออนไลน์ได้ทันที</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Logged in user home page
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            สวัสดี, {user?.username}! 👋
          </h1>
          <p className="text-blue-100">
            ยินดีต้อนรับสู่แพลตฟอร์ม E-Commerce
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Link
            href="/products"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">ช้อปปิ้ง</h3>
            <p className="text-sm text-gray-600">เลือกซื้อสินค้า</p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">รายการโปรด</h3>
            <p className="text-sm text-gray-600">สินค้าที่ชอบ</p>
          </Link>

          <Link
            href="/orders"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">คำสั่งซื้อ</h3>
            <p className="text-sm text-gray-600">ติดตามพัสดุ</p>
          </Link>

          {isSeller ? (
            <Link
              href="/seller/dashboard"
              className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl shadow-md hover:shadow-lg transition text-white group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">ร้านค้าของฉัน</h3>
              <p className="text-sm text-purple-100">จัดการร้าน</p>
            </Link>
          ) : (
            <Link
              href="/become-seller"
              className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl shadow-md hover:shadow-lg transition text-white group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">เปิดร้านค้า</h3>
              <p className="text-sm text-purple-100">เริ่มขายสินค้า</p>
            </Link>
          )}
        </div>

        {/* Featured Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">สินค้าแนะนำ</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              ดูทั้งหมด
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        {!isSeller && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <Store className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">พร้อมเริ่มต้นธุรกิจออนไลน์?</h2>
            <p className="text-purple-100 mb-6">
              สมัครเป็นผู้ขายและเริ่มต้นสร้างรายได้ออนไลน์ได้ทันที
            </p>
            <Link
              href="/become-seller"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              เริ่มต้นเลย
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
