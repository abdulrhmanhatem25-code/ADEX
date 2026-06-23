import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sun, Moon, Bell, Languages } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useTranslation } from "react-i18next";

const PAGE_TITLES = {
    "/home": "Home",
    "/dashboard": "Dashboard",
    "/staff": "Staff",
    "/students": "Students",
    "/courses": "Courses",
    "/rooms": "Rooms & Labs",
    "/schedule-control": "Generate Schedule",
    "/edit-schedule": "Edit Schedule",
    "/timetable": "Time Table",
    "/academic-registration": "Academic Registration",
    "/student-registration": "Student Registration",
    "/user-management": "User Management",
    "/settings": "Settings",
};

function getPageTitle(pathname) {
    if (pathname.startsWith("/students/")) return "Student Profile";
    return PAGE_TITLES[pathname] ?? "ADEX";
}

export default function Header() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const pageTitle = getPageTitle(location.pathname);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="h-full min-h-0 bg-page-shell flex items-center px-4 md:px-5 gap-3 w-full border-b border-border/60 dark:border-sidebar-border">

            {/* Sidebar Trigger (Mobile Only) */}
            <div className="md:hidden">
                <SidebarTrigger aria-label="Toggle sidebar" />
            </div>

            {/* Dynamic Page Title */}
            <h2 className="flex-1 font-medium text-base truncate">{pageTitle}</h2>

            {/* Search - Hidden on Mobile */}
            <div className="hidden md:block w-64 lg:w-72 max-w-[40vw]">
                <input
                    id="header-search"
                    name="headerSearch"
                    placeholder={t("header.search")}
                    aria-label="Search"
                    className="w-full border rounded-full px-3 py-1.5 text-sm bg-muted focus:outline-none"
                />
            </div>

            {/* Notification */}
            <button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                aria-label="Notifications"
            >
                <Bell size={16} />
            </button>

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 text-xs font-semibold"
                aria-label={i18n.language === "ar" ? t("header.switchEnglish") : t("header.switchArabic")}
                title={i18n.language === "ar" ? t("header.switchEnglish") : t("header.switchArabic")}
            >
                {/* <Languages size={18} className="mr-1" /> */}
                <span>{i18n.language === "ar" ? "EN" : "AR"}</span>
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                aria-label={theme === "light" ? t("header.switchDark") : t("header.switchLight")}
            >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
        </header>
    );
}
