import CategoriesRanking from "@/components/SCT/SCTDashboard/CategoriesRanking"
import Graph from "@/components/SCT/SCTDashboard/Graph"
import ProductsRanking from "@/components/SCT/SCTDashboard/ProductsRanking"
import ValueUpdate from "@/components/SCT/SCTDashboard/ValueUpdate"

function Dashboard() {
  return (
    <div className="flex flex-col h-full">
        <h1 className="text-4xl text-white">แดชบอร์ด</h1>
        <div className="w-full h-full bg-[#F0F0F0] rounded-3xl mt-4 p-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 h-full">
                <div className="grid-cols-1 md:col-span-3 bg-white rounded-3xl min-h-[200px] md:min-h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]"><Graph /></div>
                <div className="grid-cols-1 md:col-span-2 rounded-3xl"><ValueUpdate /></div>
                <div className="grid-cols-1 md:col-span-3 bg-white rounded-3xl min-h-[200px] md:min-h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]"><ProductsRanking /></div>
                <div className="grid-cols-1 md:col-span-2 bg-white rounded-3xl min-h-[200px] md:min-h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]"><CategoriesRanking /></div>
            </div>
        </div>
    </div>
  )
}
export default Dashboard