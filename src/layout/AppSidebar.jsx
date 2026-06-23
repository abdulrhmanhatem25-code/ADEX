import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";
import { useTranslation } from "react-i18next";

import Logo from "./logo.png";

import {
  Calendar,
  Bot,
  BarChart3,
  Layers,
  GraduationCap,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  FileUp,
  Home,
  UserCog,
  ClipboardList,
  FileText,
  FileBarChart,
  CalendarDays,
  Star,
  History,
} from "lucide-react";

export default function AppSidebar() {
  const { open, setOpenMobile, isMobile } = useSidebar();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  // logout
  const { user, logout, roles, hasPermission } = useAuth();
  const { userProfile, profileImageUrl, profileDisplayName } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  // end logout

  const isAuthorized = (itemRoles, itemPermissions) => {
    if (!itemRoles && !itemPermissions) return true;
    
    let passedRole = true;
    if (itemRoles && itemRoles.length > 0) {
        passedRole = itemRoles.some((role) => roles.includes(role.trim()));
    }

    let passedPermission = true;
    if (itemPermissions && itemPermissions.length > 0) {
        passedPermission = itemPermissions.some(p => hasPermission(p));
    }

    // Must pass BOTH checks if both are specified (matching ProtectedRoute logic)
    return passedRole && passedPermission;
  };

  // main menu //
  const navItemsMainMenu = [
    { name: t("sidebar.home"), href: "/home", icon: Home, roles: null },
    { name: t("sidebar.timeTable"), href: "/timetable", icon: Calendar, roles: ["Student", "Technical Assistant", "Admin", "Doctor", "Assistant"], permissions: ["enrollments:read"]  },
    {
      name: t("sidebar.aiAgent"),
      href: "#",
      icon: Bot,
      roles: ["SuperAdmin"],
      submenu: [
        { name: t("sidebar.generateSchedule"), href: "/schedule-control", roles: ["SuperAdmin"], permissions: ["schedule:generate"] },
        { name: t("sidebar.editSchedule"), href: "/edit-schedule", roles: ["SuperAdmin"], permissions: ["schedule:manage"] },
        { name: t("sidebar.viewSchedule"), href: "/view-schedule" },
      ],
    },
  ];
  // end main menu //

  // other menu //
  const navItemsOther = [
    { name: t("sidebar.dashboard"), href: "/dashboard", icon: BarChart3, roles: ["SuperAdmin"], permissions: ["dashboard:read"] },
    { name: t("sidebar.reports"), href: "/reports", icon: FileBarChart, roles: ["SuperAdmin"], permissions: null },
    { name: t("sidebar.auditLogs", "Audit Logs"), href: "/audit-logs", icon: History, roles: ["SuperAdmin"], permissions: null },
    { name: t("sidebar.ratings", "Student Ratings"), href: "/ratings", icon: Star, roles: ["SuperAdmin"], permissions: null },
    { name: t("sidebar.viewSchedules"), href: "/view-schedules", icon: CalendarDays, roles: ["SuperAdmin"], permissions: null },
    { name: t("sidebar.advisorStudents"), href: "/advisor-students", icon: Users, roles: ["SuperAdmin", "Technical Assistant"], permissions: null },
    {
      name: t("sidebar.editSection"),
      href: "/edit-section",
      icon: Layers,
      roles: ["SuperAdmin"],
      submenu: [
        { name: t("sidebar.editClassroom"), href: "/rooms", roles: ["SuperAdmin"], permissions: ["rooms:read"] },
        { name: t("sidebar.editCourses"), href: "/courses", roles: ["SuperAdmin"], permissions: ["courses:read"] },
        { name: t("sidebar.editTeacher"), href: "/staff", roles: ["SuperAdmin"], permissions: ["instructors:read"] },
        { name: t("sidebar.editStudent"), href: "/students", roles: ["SuperAdmin"], permissions: ["students:read"] },
      ],
    },
    { name: t("sidebar.studentRegistration"), href: "/student-registration", icon: ClipboardList, roles: ["SuperAdmin", "Technical Assistant"], permissions: ["enrollments:read"] },
    { name: t("sidebar.academicRegistration"), href: "/academic-registration", icon: GraduationCap, roles: ["Student"], permissions: ["academic-records:read"] },
    { name: t("sidebar.rateInstructor", "Rate Instructor"), href: "/rate-instructor", icon: Star, roles: ["Technical Assistant"], permissions: null },
    { name: t("sidebar.myColleagues", "My Colleagues"), href: "/my-colleagues", icon: Users, roles: ["Doctor", "Technical Assistant"], permissions: null },
    { name: t("sidebar.studentInfo", "My Info"), href: "/student-info", icon: FileText, roles: ["Student"], permissions: null },
    // { name: t("sidebar.importRecords"), href: "/import-records", icon: FileUp, roles: null },
    { name: t("sidebar.userManagement"), href: "/user-management", icon: UserCog, roles: ["SuperAdmin"], permissions: ["users:read"] },
    { name: t("sidebar.settings"), href: "/settings", icon: Settings, roles: null },
  ];
  // end other menu //

  const filterItems = (items) => {
    return items
      .filter((item) => isAuthorized(item.roles, item.permissions))
      .map((item) => {
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter((sub) => isAuthorized(sub.roles, sub.permissions));
          if (filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
          return { ...item, submenu: null };
        }
        return item;
      });
  };

  const filteredMainMenu = filterItems(navItemsMainMenu);
  const filteredOther = filterItems(navItemsOther);

  const isActivePath = (path) => {
    if (path === "#" || !path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const isSubmenuActive = (submenu) => {
    if (!submenu) return false;
    return submenu.some((sub) => isActivePath(sub.href));
  };

  // RTL Support
  const isRtl = i18n.language === 'ar';

  const displayName = isRtl 
    ? (userProfile?.fullNameAr || userProfile?.instructor?.titleAr || profileDisplayName)
    : profileDisplayName;

  const initials = displayName?.[0]?.toUpperCase() || "?";

  return (
    <>
      <Sidebar collapsible="icon" side={isRtl ? "right" : "left"}>
        <SidebarHeader>
          <div className="flex justify-end">
            <SidebarTrigger />
          </div>

          {open && (
            <>
              <div className="flex justify-center">
                <img className="w-3/5" src={Logo} alt="Logo" />
              </div>

              <div className="bg-label-sidebar p-3 rounded-md shadow-md flex gap-2">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback className="bg-slate-400 text-text leading-none font-semibold text-lg">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col w-full items-start">
                  <h2 className="text-text text-sm truncate w-32" title={displayName}>
                    {displayName}
                  </h2>
                  <h4 className="text-text text-xs opacity-75 capitalize">
                    {roles?.join(", ") || t("sidebar.guest")}
                  </h4>
                </div>
              </div>
            </>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-gray-400 text-xs px-3 py-2">
              {t("sidebar.mainMenu")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainMenu.map((item) => {
                  const isParentActive = isSubmenuActive(item.submenu);
                  const isSingleActive = !item.submenu && isActivePath(item.href);
                  
                  return item.submenu ? (
                    <Collapsible key={item.name} className="group/collapsible" defaultOpen={isParentActive}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            isActive={isParentActive}
                            className={`text-sidebar-text hover:bg-slate-700 hover:text-white ${isParentActive ? 'bg-slate-700 text-white font-medium' : ''}`}>
                            <item.icon size={18} />
                            <span>{item.name}</span>
                            <ChevronDown
                              className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                              size={16} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenu.map((sub) => {
                              const isSubActive = isActivePath(sub.href);
                              return (
                              <SidebarMenuSubItem key={sub.name}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link
                                    to={sub.href || "#"}
                                    onClick={handleNavClick}
                                    className={`text-sidebar-text hover:text-white ${isSubActive ? 'text-white font-medium' : ''}`}>
                                    {sub.name}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )})}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isSingleActive}
                        className={`text-sidebar-text hover:bg-slate-700 hover:text-white ${isSingleActive ? 'bg-slate-700 text-white font-medium' : ''}`}>
                        <Link to={item.href} onClick={handleNavClick} className="flex items-center gap-2">
                          <item.icon size={18} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>  
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {open && (
            <SidebarGroup className="pt-0">
              <SidebarGroupLabel className="text-gray-400 text-xs px-3 py-2">
                {t("sidebar.others")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredOther.map((item) => {
                    const isParentActive = isSubmenuActive(item.submenu);
                    const isSingleActive = !item.submenu && isActivePath(item.href);

                    return item.submenu ? (
                      <Collapsible key={item.name} className="group/collapsible" defaultOpen={isParentActive}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton 
                              isActive={isParentActive}
                              className={`text-sidebar-text hover:bg-slate-700 hover:text-white ${isParentActive ? 'bg-slate-700 text-white font-medium' : ''}`}>
                              <item.icon size={18} />
                              <span>{item.name}</span>
                              <ChevronDown
                                className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                                size={16}/>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((sub) => {
                                const isSubActive = isActivePath(sub.href);
                                return (
                                <SidebarMenuSubItem key={sub.name}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link
                                      to={sub.href || "#"}
                                      onClick={handleNavClick}
                                      className={`text-gray-400 hover:text-white ${isSubActive ? 'text-white font-medium' : ''}`}>
                                      {sub.name}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )})}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isSingleActive}
                          className={`text-sidebar-text hover:bg-slate-700 hover:text-white ${isSingleActive ? 'bg-slate-700 text-white font-medium' : ''}`}>
                          <Link to={item.href} onClick={handleNavClick} className="flex items-center gap-2">
                            <item.icon size={18} />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* start footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                tooltip={t("sidebar.logout")}>
                <LogOut size={18} />
                <span>{t("sidebar.logout")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        {/* end footer */}
      </Sidebar>
    </>
  );
}
