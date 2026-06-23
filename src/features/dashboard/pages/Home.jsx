import { Bolt, ArrowRight, Plus, BookOpen, CalendarDays, DoorOpen } from "lucide-react";
import AdexButton from "@/shared/ui/AdexButton";
import AdexCard from "@/shared/ui/AdexCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { hasPermission, roles = [] } = useAuth();
  const { t } = useTranslation();

  // Helper to check if user has ANY of the specified roles
  const hasRole = (allowedRoles) => allowedRoles.some(r => roles.includes(r));

  return (
    <>
      <div>
        {/* main content */}
        <div className="bg-gradient-to-r from-adex-schedule-card from-3% via-adex-schedule-card1 via-20% to-adex-schedule-card to-99% border-2 border-adex-schedule-border/50 shadow-lg shadow-adex-schedule-card/50 p-5 flex flex-col rounded-xl">

          {/* badge */}
          <div className="flex items-center gap-1 rounded-4xl p-1 w-48 bg-next-gen shadow-xl/30">
            <Bolt className="size-3 text-next-gen-text" />
            <p className="text-xs text-next-gen-text">{t("home.badge")}</p>
          </div>

          {/* hero */}
          <div className="my-5 lg:me-100 flex flex-col">
            <p className="pb-4 text-3xl font-[1000] text-text-2">
              <span className="text-text/55 dark:text-text">{t("home.heroTitlePrefix")}</span> {t("home.heroTitleSuffix")}
            </p>
            <p className="text-(--description-color)">
              {t("home.heroDescription")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(hasPermission("schedule:generate")) && (
              <AdexButton
                to="/schedule-control"
                variant="grey"
                textColor="text-text-3"
                iconRight={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}>
                {t("home.getStarted")}
              </AdexButton>
            )}
            {(hasPermission("dashboard:view")) && (
              <AdexButton
                to="/dashboard"
                variant="base"
                textColor="text-text">
                <span>{t("home.systemOverview")}</span>
              </AdexButton>
            )}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="space-y-3 pt-3">
          <h6>{t("home.quickCommands")}</h6>
          {(hasRole(["SuperAdmin", "Admin"]) && hasPermission("instructors:add") || hasPermission("instructors:read") && hasPermission("courses:add") || hasPermission("courses:read") && hasPermission("rooms:add") || hasPermission("rooms:read") && hasPermission("students:add") || hasPermission("students:read")) && (
            <div className="flex flex-wrap gap-4 w-full">
              <AdexCard.Action
                icon={<Plus className="h-6 w-6" />}
                label={t("home.editInstructor")}
                iconColor="text-icon-1"
                iconBg="bg-icon-1/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/staff"
                className="flex-1 w-full" />

              <AdexCard.Action
                icon={<BookOpen className="h-6 w-6" />}
                label={t("home.editCourse")}
                iconColor="text-icon-2"
                iconBg="bg-icon-2/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/courses"
                className="flex-1 w-full" />

              <AdexCard.Action
                icon={<DoorOpen className="h-6 w-6" />}
                label={t("home.editRoom")}
                iconColor="text-icon-3"
                iconBg="bg-icon-3/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/rooms"
                className="flex-1 w-full" />

              <AdexCard.Action
                icon={<CalendarDays className="h-6 w-6" />}
                label={t("home.editStudent")}
                iconColor="text-icon-4"
                iconBg="bg-icon-4/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/students"
                className="flex-1 w-full" />

            </div>
          )}
          {(hasRole(["Student", "Assistant", "Technical Assistant"])) && (
            <div className="flex flex-wrap gap-4 w-full">
              <AdexCard.Action
                icon={<Plus className="h-6 w-6" />}
                label={t("home.setting")}
                iconColor="text-icon-1"
                iconBg="bg-icon-1/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/settings"
                className="flex-1 w-full" />

              {(hasPermission("enrollments:read") && hasRole(["Technical Assistant"])) && (
                <AdexCard.Action
                  icon={<BookOpen className="h-6 w-6" />}
                  label={t("home.AdvisorStudents")}
                  iconColor="text-icon-2"
                  iconBg="bg-icon-2/20"
                  radius="rounded-3xl"
                  labelColor="text-text"
                  to="/advisor-students"
                  className="flex-1 w-full" />
              )}

              {(hasRole(["Technical Assistant"])) && (
                <AdexCard.Action
                  icon={<DoorOpen className="h-6 w-6" />}
                  label={t("home.studentRegistration")}
                  iconColor="text-icon-3"
                  iconBg="bg-icon-3/20"
                  radius="rounded-3xl"
                  labelColor="text-text"
                  to="/student-registration"
                  className="flex-1 w-full" />
              )}

              {(hasRole(["Student"])) && (
                <AdexCard.Action
                  icon={<CalendarDays className="h-6 w-6" />}
                  label={t("home.academicRegistration")}
                  iconColor="text-icon-4"
                  iconBg="bg-icon-4/20"
                  radius="rounded-3xl"
                  labelColor="text-text"
                  to="/academic-registration"
                  className="flex-1 w-full" />
              )}

              <AdexCard.Action
                icon={<CalendarDays className="h-6 w-6" />}
                label={t("home.mySchedule")}
                iconColor="text-icon-4"
                iconBg="bg-icon-4/20"
                radius="rounded-3xl"
                labelColor="text-text"
                to="/timetable"
                className="flex-1 w-full" />



            </div>
          )}
        </div>

        {/* Features */}
          <div className="space-y-3 pt-3">
            <h6>{t("home.features")}</h6>
            <div className="flex flex-wrap gap-4 w-full">
                <AdexCard.Feature
                  title={t("home.studentManagementTitle")}
                  titleColor="text-text"
                  description={t("home.studentManagementDesc")}
                  descColor="text-(--description-color)"
                  icon={<Plus className="h-6 w-6" />}
                  iconColor="text-icon-1"
                  iconBg="bg-icon-1/20"
                  radius="rounded-3xl"
                  className="flex-1 min-w-50" />

                <AdexCard.Feature
                  title={t("home.timetableAutomationTitle")}
                  titleColor="text-text"
                  description={t("home.timetableAutomationDesc")}
                  descColor="text-(--description-color)"
                  icon={<CalendarDays className="h-6 w-6" />}
                  iconColor="text-icon-5"
                  iconBg="bg-icon-5/20"
                  radius="rounded-3xl"
                  className="flex-1 min-w-50" />
              
                <AdexCard.Feature
                  title={t("home.conflictDetectionTitle")}
                  titleColor="text-text"
                  description={t("home.conflictDetectionDesc")}
                  descColor="text-(--description-color)"
                  icon={<BookOpen className="h-6 w-6" />}
                  iconColor="text-icon-6"
                  iconBg="bg-icon-6/20"
                  radius="rounded-3xl"
                  className="flex-1 min-w-50" />
              
            </div>
          </div>
        

        {/* footer banner */}

        <div className="pt-3 space-y-3">
          <div className="flex justify-between flex-wrap gap-5 items-center p-5 rounded-xl text-white bg-gradient-to-r from-adex-schedule-card from-3% via-adex-schedule-card1 via-20% to-adex-schedule-card to-99%">
            <div>
              <p className="text-text font-bold">{t("home.readyToOptimize")}</p>
              <p className="text-(--description-color)">{t("home.startGenerating")}</p>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-8 text-text">
              <div className="flex flex-col items-center">
                <p className="font-extrabold">{t("home.ai")}</p>
                <p>{t("home.powered")}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-extrabold">{t("home.zero")}</p>
                <p>{t("home.conflicts")}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-extrabold">{t("home.hundredPercent")}</p>
                <p>{t("home.automated")}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
