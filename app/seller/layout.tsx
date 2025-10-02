import { Kanit } from "next/font/google";
import "../globals.css";
import SCTNavbar from "@/components/SCT/SCTNav/SCTNavbar";

const kanit = Kanit({
    subsets: ['latin'],
    weight: ['400', '700'], // เลือกน้ำหนักที่ต้องการ
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            
            <body className={kanit.className}>
                <div className="min-h-screen min-w-screen h-fit w-fit flex bg-[#578FCA]">
                    <SCTNavbar />
                    <div className="flex-1 mx-4 md:ml-0 md:mr-6 my-7">
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}