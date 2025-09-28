import Sidebar from "@/components/Sidebar";
import NavigationStepper from "@/components/NavigationStepper";

export default function Layout({ children, current, setCurrent }) {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex h-screen">
        <Sidebar current={current} setCurrent={setCurrent} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <NavigationStepper />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
