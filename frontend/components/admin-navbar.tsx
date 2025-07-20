import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Vendors", href: "/admin/vendors" },
  { name: "Campuses", href: "/admin/campuses" },
  { name: "Payouts", href: "/admin/payouts" }, 
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAdminAuth();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-gradient-to-r dark:from-[#0a192f] dark:to-[#1e3a5f] backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 flex h-20 items-center justify-between">
        {/* Logo and Branding */}
        <Link href="/admin/dashboard" className="flex items-center group">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Campus Bites Logo" width={50} height={50} className="transition-all duration-300 group-hover:brightness-110" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide group-hover:text-red-500 transition-colors duration-300">
                Campus Bites
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wider">
                Fast • Fresh • Delicious
              </span>
            </div>
          </div>
        </Link>
        {/* Centered Navigation Links */}
        <div className="flex-1 flex justify-center">
          <div className="relative flex items-center bg-gray-100/70 dark:bg-gray-900/50 backdrop-blur-lg rounded-full p-1 border border-gray-300/50 dark:border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-6 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
                  pathname.startsWith(item.href)
                    ? "text-white bg-red-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                {pathname.startsWith(item.href) && (
                  <span className="absolute inset-0 z-0 rounded-full bg-red-600" style={{ opacity: 0.8 }} />
                )}
              </Link>
            ))}
          </div>
        </div>
        {/* Logout Button */}
        {isAdmin && (
          <button
            onClick={handleLogout}
            className="ml-6 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
} 