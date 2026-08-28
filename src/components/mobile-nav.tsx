"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  UserCheck,
  StickyNote,
  MoreHorizontal,
  Target,
  Flame,
  Trash,
  Settings,
  LogOut,
  X
} from "lucide-react"

import { cn } from "@/lib/utils"
import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"

const primaryNav = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Todos", url: "/todos", icon: CheckSquare },
  { title: "Attendance", url: "/attendance", icon: UserCheck },
  { title: "Notes", url: "/notes", icon: StickyNote },
]

const secondaryNav = [
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Streaks", url: "/streaks", icon: Flame },
  { title: "Recycle Bin", url: "/recycle-bin", icon: Trash },
]

export function MobileNav() {
  const pathname = usePathname() || ""
  const [isMoreOpen, setIsMoreOpen] = React.useState(false)
  const [isLoggingOut, startTransition] = React.useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  // Prevent scrolling when sheet is open
  React.useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMoreOpen])

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNav.map((item) => {
            const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
            
            return (
              <Link 
                key={item.title} 
                href={item.url}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 tap-highlight-transparent"
                onClick={() => setIsMoreOpen(false)}
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-colors",
                  isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </Link>
            )
          })}
          
          <button 
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 tap-highlight-transparent"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            <div className={cn(
              "flex items-center justify-center w-12 h-8 rounded-full transition-colors",
              isMoreOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
              <MoreHorizontal className="w-5 h-5" strokeWidth={isMoreOpen ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors",
              isMoreOpen ? "text-foreground" : "text-muted-foreground"
            )}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* Full Screen "More" Menu with Framer Motion */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMoreOpen(false)}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl border-t border-border overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight">More Apps</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMoreOpen(false)} className="rounded-full bg-muted/50">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {secondaryNav.map((item, i) => (
                    <motion.div 
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link 
                        href={item.url}
                        className="flex flex-col items-center gap-2"
                        onClick={() => setIsMoreOpen(false)}
                      >
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground shadow-sm border border-border/50">
                          <item.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-medium text-center text-muted-foreground line-clamp-1">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4">
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground" onClick={() => setIsMoreOpen(false)}>
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className={isLoggingOut ? "animate-pulse w-5 h-5" : "w-5 h-5"} />
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
