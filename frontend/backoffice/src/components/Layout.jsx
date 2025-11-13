import Sidebar from "@/components/Sidebar";
import SearchBar from "./SearchBar";

export default function Layout({ children, current, setCurrent }) {
  return (
    <div className="min-h-screen text-gray-900">
      <div className="flex h-screen">
        <Sidebar current={current} setCurrent={setCurrent} />
        <div className="flex-1 overflow-auto relative pt-14 md:ml-64">
          <SearchBar />
          <div className="md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
