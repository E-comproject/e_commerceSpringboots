"use client";
import React, { useState } from "react";
import MenuProductsPage from "@/components/SCT/MenuProductsPage";
import Pagination from "@/components/SCT/Pagination";
import { products as initialProducts, products } from "@/utils/products";
import { FaPlus } from "react-icons/fa6";
import { BsFillPencilFill } from "react-icons/bs";
import { IoEye } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import { Product } from "@/components/SCT/ProductModal/EditPriceModal";

import Image from "next/image";
import ProductModals from "@/components/SCT/ProductModal/ProductModals";

const emptyProduct: Product = {
  id: "",
  name: "",
  price: 0,
  totalsale: 0,
  inStock: 0,
  image: "",
};

function page() {

  const [items] = useState<Product[]>(
    initialProducts.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: Number(p.price ?? 0),
      totalsale: p.totalsale,
      inStock: p.inStock,
    }))
  );

 const modalRef = React.useRef<any>(null);

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-4xl text-white">สินค้าของฉัน</h1>
      <div className="w-full h-full bg-[#ffffff] rounded-3xl mt-4 p-8 flex flex-col  ">
        <MenuProductsPage />
        
          <div className="flex justify-between items-center mb-4">
            <div className="text-4xl">{products.length} สินค้า</div>
            <div className="text-4xl">
              <button className="bg-[#578FCA] p-3 rounded-full" onClick={() => modalRef.current?.openEditProduct(emptyProduct)}>
                <FaPlus className="text-xl text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 border rounded-3xl border-[#578FCA] w-full min-w-[600px] pb-2">
            <table className="w-[95%] mx-auto ">
              <thead className="border-b bg-white">
                <tr>
                  <th className="py-3.5 w-[10%] text-left ">รหัสสินค้า</th>
                  <th className="py-3.5 w-[10%] text-left ">รูปสินค้า</th>
                  <th className="py-3.5 w-[25%] text-left">ชื่อสินค้า</th>
                  <th className="py-3.5 w-[10%] text-right">ยอดขายรวม</th>
                  <th className="py-3.5 w-[10%] text-right">ราคาสินค้า</th>
                  <th className="py-3.5 w-[10%] text-center">คลัง</th>
                  <th className="py-3.5 w-[25%] text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {initialProducts.map((product) => (
                  <tr key={product.id} className=" hover:bg-gray-50">
                    <td className="py-3.5 w-[10%] text-[#578FCA] font-medium">{product.id}</td>
                    <td className=" w-[10%] text-[#578FCA] "><div><Image src={product.image} alt={product.name} width={40} height={40} style={{ minWidth: 40, minHeight: 40 }}/></div></td>
                    <td className="py-3.5 w-[20%] text-left">{product.name}</td>
                    <td className="py-3.5 w-[15%] text-right">฿{product.totalsale ?? 0}</td>

                    <td className="py-3.5 w-[20%] text-right">
                      ฿{product.price}
                      <button
                        className="ml-3"
                        onClick={() => modalRef.current?.openEditPrice(product)}
                        aria-label={`แก้ไขราคา ${product.name}`}
                      >
                        <BsFillPencilFill />
                      </button>
                    </td>

                    <td className="py-3.5 w-[25%] text-center">
                      {product.inStock}
                      <button
                        className="ml-3"
                        onClick={() => modalRef.current?.openEditStock(product)}
                        aria-label={`แก้ไขสต็อก ${product.name}`}
                      >
                        <BsFillPencilFill />
                      </button>
                    </td>

                    <td className="py-3.5 px-6 text-center flex justify-center items-center gap-3">
                      <button><IoEye /></button>
                      <button onClick={() => modalRef.current?.openEditProduct(product)}><BsFillPencilFill /></button>
                      <button><FaTrashAlt /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        <div className=" h-fit mt-6">
          <Pagination />
        </div>
      </div>

      <ProductModals
        ref={modalRef}
        onAddProduct={(p:any) => console.log("เพิ่มสินค้า", p)}
        onUpdateProduct={(p:any) => console.log("แก้ไขสินค้า", p)}
      />

      
    </div>
  );
}

export default page;