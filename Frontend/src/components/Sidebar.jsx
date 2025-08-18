"use client"

import { useState, useEffect } from "react"
import { Home, Settings, User, Menu, X, BarChartIcon as ChartNetwork } from "lucide-react"
import { motion } from "framer-motion"

export default function SideNavbar() {
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeMenu, setActiveMenu] = useState("Work Progress") // added active state tracking

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setOpen(false)
      } else {
        setOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menus = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
    { name: "Work Progress", icon: ChartNetwork, href: "/work-progress" },
  ]

  return (
    <div>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-blue-500/20"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        animate={{
          width: open ? (isMobile ? 280 : 260) : isMobile ? 0 : 80,
        }}
        initial={{ width: isMobile ? 0 : 260 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-700/50
          ${isMobile ? "fixed top-0 left-0 z-40" : "relative"}
        `}
      >
        <div className={`p-6 border-b border-slate-700/50 ${isMobile ? "pt-20" : ""}`}>
          <motion.div
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <ChartNetwork size={20} className="text-white" />
            </div>
            {open && (
              <div>
                <h2 className="text-lg font-bold text-white">WorkFlow</h2>
                <p className="text-xs text-slate-400">Progress Tracker</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          <nav className="flex flex-col gap-2 mt-4">
            {menus.map((menu, i) => {
              const isActive = activeMenu === menu.name
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => {
                      setActiveMenu(menu.name)
                      if (isMobile) setOpen(false)
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-300 shadow-lg border border-blue-500/20"
                          : "hover:bg-slate-700/50 text-slate-300 hover:text-white"
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    )}

                    <div
                      className={`flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"} transition-colors duration-200`}
                    >
                      <menu.icon size={20} />
                    </div>

                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className={`text-sm font-medium ${isActive ? "text-blue-200" : "text-slate-300 group-hover:text-white"} transition-colors duration-200`}
                      >
                        {menu.name}
                      </motion.span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </button>
                </motion.div>
              )
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-700/50">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium shadow-lg">
                U
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">User Account</p>
                  <p className="text-xs text-slate-400 truncate">user@example.com</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
