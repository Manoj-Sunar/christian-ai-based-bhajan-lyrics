import Sidebar from "../components/common/Sidebar";
import SidebarWrapper from "../components/common/SidebarWrapper";




export const metadata = {
    title: "WorshipFlow",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (



        <div className="bg-slate-50 text-slate-900 flex ">
            <SidebarWrapper/>
            <main className=" w-full p-6 ">
                {children}
            </main>
        </div>


    );
}