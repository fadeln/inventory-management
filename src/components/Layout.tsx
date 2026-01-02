import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Truck,
  PackagePlus,
  PackageMinus,
  FileText,
  ClipboardList,
  ShoppingCart,
  History,
  BarChart3,
  LogOut,
  Menu,
  X,
  Warehouse,
  CheckSquare,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "warehouse_staff", "department_user", "head_of_warehouse"],
  },
  {
    title: "Items",
    href: "/items",
    icon: Package,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Incoming Goods",
    href: "/incoming-goods",
    icon: PackagePlus,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Outgoing Goods",
    href: "/outgoing-goods",
    icon: PackageMinus,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Item Requests",
    href: "/item-requests",
    icon: ClipboardList,
    roles: ["admin", "warehouse_staff", "department_user"],
  },
  {
    title: "Purchase Orders",
    href: "/purchase-orders",
    icon: ShoppingCart,
    roles: ["admin", "warehouse_staff"],
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
    roles: ["head_of_warehouse"],
  },
  {
    title: "Stock Movements",
    href: "/stock-movements",
    icon: History,
    roles: ["admin", "warehouse_staff", "head_of_warehouse"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "warehouse_staff", "head_of_warehouse"],
  },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <Warehouse className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">
            Inventory
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <Warehouse className="h-6 w-6 text-sidebar-primary" />
            <span className="ml-3 font-semibold text-sidebar-foreground">
              Inventory System
            </span>
          </div>

          {/* Navigation */}
         <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">



            <ul className="px-3 space-y-3">
              {/* General */}
              <li className="px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                General
              </li>
              <div className="space-y-1">
                {filteredNavItems
                  .filter((item) => ["/dashboard"].includes(item.href))
                  .map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
              </div>

              {/* Inventory */}
              <li className="px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Inventory
              </li>
              <div className="space-y-1">
                {filteredNavItems
                  .filter((item) =>
                    [
                      "/items",
                      "/categories",
                      "/suppliers",
                      "/incoming-goods",
                      "/outgoing-goods",
                      "/stock-movements",
                    ].includes(item.href)
                  )
                  .map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
              </div>

              {/* Operations */}
              <li className="px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Operations
              </li>
              <div className="space-y-1">
                {filteredNavItems
                  .filter((item) =>
                    [
                      "/item-requests",
                      "/purchase-orders",
                      "/approvals",
                    ].includes(item.href)
                  )
                  .map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
              </div>

              {/* Administration */}
              <li className="px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Administration
              </li>
              <div className="space-y-1">
                {filteredNavItems
                  .filter((item) => ["/users", "/reports"].includes(item.href))
                  .map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
              </div>
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-foreground">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user && ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
