import { Link } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { CaretRightIcon } from "@phosphor-icons/react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    isOpen?: boolean
    disabled?: boolean
    items?: {
      title: string
      url: string
      icon?: React.ReactNode
      isActive?: boolean
      disabled?: boolean
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive} disabled={item.disabled}>
                  <Link to={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={`${item.title}-${item.isOpen ? 'open' : 'closed'}`}
              asChild
              defaultOpen={item.isOpen || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} disabled={item.disabled} className={item.disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}>
                    {item.icon}
                    <span>{item.title}</span>
                    <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        {subItem.disabled ? (
                          <SidebarMenuButton
                            disabled
                            className="cursor-not-allowed opacity-50 pointer-events-none"
                          >
                            {subItem.icon}
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton asChild isActive={subItem.isActive}>
                            <Link to={subItem.url}>
                              {subItem.icon}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
