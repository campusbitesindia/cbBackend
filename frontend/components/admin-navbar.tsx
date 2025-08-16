import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-gradient-to-r dark:from-[#0a192f] dark:to-[#1e3a5f] backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-300 ${
      scrolled ? 'py-1' : 'py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Branding */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/admin/dashboard" className="flex items-center group">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  CB
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-red-500 transition-colors duration-300">
                    Campus Bites
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Admin Panel
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1 bg-gray-100/80 dark:bg-gray-900/50 backdrop-blur-lg rounded-full p-1 border border-gray-200/50 dark:border-white/10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center space-x-2 ${
                    pathname.startsWith(item.href)
                      ? "text-white bg-gradient-to-r from-red-500 to-red-500 shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-expanded="false"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logout Button - Desktop */}
          {isAdmin && (
            <div className="hidden md:block">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 transition-all duration-200 shadow-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium ${
                  pathname.startsWith(item.href)
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-white border-l-4 border-red-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">

                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <div className="flex items-center space-x-3">
                  
                  <span>Logout</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}