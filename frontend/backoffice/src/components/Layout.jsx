import Sidebar from "@/components/Sidebar";

export default function Layout({ children, current, setCurrent }) {
  return (
    <div className="min-h-screen text-gray-900">
      <div className="flex h-screen">
        <Sidebar current={current} setCurrent={setCurrent} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
