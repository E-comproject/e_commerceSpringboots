import Pagination from "@/components/SCT/Pagination"
import ChartResponse from "@/components/SCT/SCTReview/ChartResponse"
import ChartScore from "@/components/SCT/SCTReview/ChartScore"
import ReviewContent from "@/components/SCT/SCTReview/ReviewContent"

function page() {
    return (
        <div className="flex flex-col h-full">
            <h1 className="text-4xl text-white">การรีวิว</h1>
            <div className="w-full h-full bg-[#F0F0F0] rounded-3xl mt-4 p-8 flex flex-col  ">

                <div className="grid grid-cols-5 grid-rows-2 w-full h-full gap-8">
                    <div className="rounded-2xl bg-white col-span-2"><ChartScore /></div>
                    <div className="rounded-2xl bg-white col-span-3 row-span-2"><ReviewContent /></div>
                    <div className="rounded-2xl bg-white col-span-2"><ChartResponse /></div>
                </div>

            </div>

        </div>
    )
}
export default page