import { useState } from "react"
import { FiMenu, FiHome, FiUsers, FiLogOut, FiChevronLeft } from "react-icons/fi"

interface object_sss {
    usr?: string
    acs?: string
}

interface DashboardLayoutProps {
    sss?: object_sss | null
    now?: string
    children: React.ReactNode
    onClick?: () => void 
}

export interface MenuItemConfig {
    label: string
    icon: React.ReactNode
    href?: string
    roles?: string[]
    action?: () => void
}

export const dashboardMenu: MenuItemConfig[] = [
    {
        label: "Dashboard",
        icon: <FiHome />,
        href: "/dashboard",
        roles: ["admin", "kepala", "pegawai"]
    },
    {
        label: "Pegawai",
        icon: <FiUsers />,
        href: "/pegawai",
        roles: ["admin"]
    },
    {
        label: "Logout",
        icon: <FiLogOut />,
        action: () => {
            window.location.href = "/logout"
        }
    }
]

const DashboardLayout = ({ sss, now, children, onClick }: DashboardLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapse, setSidebarCollapse] = useState(false)

    const role = sss?.acs
    const menus = dashboardMenu.filter(menu => {
    if (!menu.roles) return true
    if (!role) return false
    return menu.roles.includes(role)
    })

    return (
        <div className="min-h-screen bg-gray-100 flex" onClick={onClick}>
            {sidebarOpen && (
                <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                fixed inset-y-0 left-0 z-40
                bg-green-900 text-white
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
                ${sidebarCollapse ? "lg:w-20" : "lg:w-64"}
                w-64
                `}
            >
                <div className={`h-16 flex items-center justify-between px-4 border-b border-white/10 
                ${sidebarCollapse && 'lg:flex lg:justify-center'}`}>
                {!sidebarCollapse && (
                    <span className="font-extrabold text-lg tracking-wide">
                    SIKAP
                    </span>
                )}

                <button
                    onClick={() => setSidebarCollapse(!sidebarCollapse)}
                    className="hidden lg:flex p-1 rounded hover:bg-white/10 cursor-pointer"
                >
                    <FiChevronLeft
                    className={`transition-transform ${
                        sidebarCollapse ? "rotate-180" : ""
                    }`}
                    />
                </button>
                </div>
                <nav
                className={`
                    px-3 py-4 space-y-2
                    ${sidebarCollapse ? "lg:flex lg:flex-col lg:items-center" : ""}
                `}
                >
                {menus.map((menu, index) => (
                    <MenuItem
                    key={index}
                    icon={menu.icon}
                    label={menu.label}
                    collapsed={sidebarCollapse}
                    onClick={menu.action}
                    href={menu.href}
                    active={menu.label === now}
                    />
                ))}
                </nav>
            </aside>

                <div
                className={`
                    flex-1 flex flex-col
                    transition-all duration-300
                    ml-0
                    ${sidebarCollapse ? "lg:ml-20" : "lg:ml-64"}
                `}
                >
                <header className={`
                    fixed top-0 right-0
                    h-16 bg-white shadow-sm
                    flex items-center px-4 gap-3
                    z-40
                    transition-all duration-300
                    ${sidebarCollapse ? "lg:left-20" : "lg:left-64"}
                    left-0
                `}>

                    <button
                        className="lg:hidden text-gray-700"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <FiMenu size={22} />
                    </button>

                    <h1 className="text-lg font-semibold text-gray-800">
                        Dashboard
                    </h1>
                </header>

                <main className="flex-1 pt-[70px] p-4">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout

const MenuItem = ({
  icon,
  label,
  collapsed,
  href,
  onClick,
  active
}: {
  icon: React.ReactNode
  label: string
  collapsed?: boolean
  href?: string
  onClick?: () => void
  active?: boolean
}) => {
  const Component = href ? "a" : "div"

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3
        px-3 py-2 rounded-md
        cursor-pointer
        transition
        ${active ? "bg-white/20 hover:bg-white/10 font-semibold" : "hover:bg-white/10"}
      `}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && (
        <span className="text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      )}
    </Component>
  )
}
