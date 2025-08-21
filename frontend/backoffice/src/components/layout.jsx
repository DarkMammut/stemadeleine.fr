import Sidebar from "@/components/Sidebar";

export default function Layout({ children, current, setCurrent }) {
  return (
    <div className="bg-gray-100">
      <header>Hello</header>
      <main>
        <div className="flex h-screen">
          <Sidebar current={current} setCurrent={setCurrent} />
          {children}
        </div>
      </main>
      <footer>Bye</footer>
    </div>
  );
}
