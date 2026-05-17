import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { SignOutIcon } from "@phosphor-icons/react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center w-full gap-2 p-2 rounded-none">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 bg-red-50/50 hover:bg-red-100 hover:!text-red-600 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:!text-red-400 transition-colors shrink-0"
            onClick={handleLogout}
          >
            <SignOutIcon size={18} weight="bold" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

