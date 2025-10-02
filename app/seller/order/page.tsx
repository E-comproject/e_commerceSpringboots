import MenuOrderPage from "@/components/SCT/MenuOrderPage";
import Pagination from "@/components/SCT/Pagination";
import { IoClose } from "react-icons/io5";
import { orders } from "@/utils/orders"

function page() {
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case "สำเร็จ": return "text-green-600 bg-green-100";
            case "กำลังจัดส่ง": return "text-[#578FCA] bg-[#d0e7ff]";
            case "รอดำเนินการ": return "text-yellow-600 bg-yellow-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };
    const getNextStatus = (status: string) => {
        switch (status) {
            case "สำเร็จ": return "ดูคำสั่งซื้อ";
            case "กำลังจัดส่ง": return "จัดส่งแล้ว";
            case "รอดำเนินการ": return "กำลังจัดส่ง";
            default: return "text-gray-600 bg-gray-100";
        }
    };
    const getNextStatusColor = (status: string) => {
        switch (status) {
            case "สำเร็จ": return "bg-[#8ED2FF]";
            case "กำลังจัดส่ง": return "bg-[#93ED8B]";
            case "รอดำเนินการ": return "bg-[#FFC107]";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-4xl text-white">คำสั่งซื้อของฉัน</h1>
            <div className="w-full h-full bg-[#ffffff] rounded-3xl mt-4 p-8 flex flex-col  ">
                <MenuOrderPage />
                <div className="flex-1">
                    <div className="text-4xl mb-2">{orders.length} คำสั่งซื้อ</div>
                    <div className="border rounded-3xl border-[#578FCA] w-full h-full">

                        <table className="w-[95%] mx-auto">
                            <thead className="border-b bg-white">
                                <tr>
                                    <th className="py-4 px-6 text-left ">เลขที่คำสั่งซื้อ</th>
                                    <th className="py-4 px-6 text-left">สินค้า</th>
                                    <th className="py-4 px-6 text-right">ยอดรวม</th>
                                    <th className="py-4 px-6 text-center">ช่องทางการจัดส่ง</th>
                                    <th className="py-4 px-6 text-center">สถานะ</th>
                                    <th className="py-4 px-6 text-center">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className=" hover:bg-gray-50">
                                        <td className="py-4 px-6 text-[#578FCA] font-medium">{order.id}</td>
                                        <td className="py-4 px-6">{order.products}</td>
                                        <td className="py-4 px-6 text-right">฿{order.total}</td>
                                        <td className="py-4 px-6 text-center">{order.delivery}</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center flex justify-center items-center gap-3">
                                            <button className={`bg-[#ff6969] px-3 py-1 text-white rounded-lg flex justify-center items-center`}><IoClose className="text-xl mr-1"/>ยกเลิก</button>
                                            <button className={`${getNextStatusColor(order.status)} px-3 py-1 text-white rounded-lg flex justify-center items-center`}>{getNextStatus(order.status)}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                    </div>
                </div>
                <div className="f-full h-fit mt-20">
                    <Pagination />
                </div>
            </div>
        </div>
    )
}
export default page