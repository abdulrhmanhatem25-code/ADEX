import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "@/features/dashboard/services/dashboardApi";
import { fetchAuditLogsApi } from "@/features/dashboard/services/auditLogsApi";
import { getReportsMetadata, downloadDynamicReport } from "@/features/reports/services/reportsApi";
import {
    GraduationCap,
    BookOpen,
    Users,
    LayoutGrid,
    Loader2,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import AdexCard from "@/shared/ui/AdexCard";
import AdexButton from "@/shared/ui/AdexButton";
import WeeklyActivityChart from "@/features/dashboard/components/WeeklyActivityChart";
import AcademicYearDonut from "@/features/dashboard/components/AcademicYearDonut";
import DashboardActivityItem from "@/features/dashboard/components/DashboardActivityItem";

const DashboardReportCard = ({ report }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [params, setParams] = useState({});

    const handleParamChange = (name, value) => {
        setParams(prev => ({ ...prev, [name]: value }));
    };

    const handleDownload = async () => {
        setDownloading(true);
        setStatus(null);
        try {
            const response = await downloadDynamicReport(report.reportKey, params);
            const contentDisposition = response.headers?.["content-disposition"];
            let downloadName = `${report.reportKey}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=(['"].*?['"]|[^;\n]*)/);
                if (match?.[1]) downloadName = match[1].replace(/['"]/g, "");
            }
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setStatus('success');
        } catch (err) {
            console.error("Report download failed:", err);
            setStatus('error');
        } finally {
            setDownloading(false);
        }
    };

    // Check if required params are missing
    const hasMissingRequired = report.parameters?.some(p => p.isRequired && !params[p.name]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 capitalize">{report.reportKey.replace(/-/g, ' ')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{report.description}</p>
                
                {report.parameters && report.parameters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                        {report.parameters.map((param) => (
                            <div key={param.name} className="flex flex-col gap-1">
                                <label htmlFor={`dash-report-${report.reportKey}-${param.name}`} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {param.name} {param.isRequired && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    id={`dash-report-${report.reportKey}-${param.name}`}
                                    name={param.name}
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    className="h-8 rounded-lg border border-slate-200 px-2 text-xs w-32 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder={param.name}
                                    value={params[param.name] || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                {status && (
                    <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${
                        status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                        {status === 'success' 
                            ? <><CheckCircle2 className="h-3 w-3" />{t("reports.downloadSuccess")}</>
                            : <><AlertCircle className="h-3 w-3" />{t("reports.downloadFailed")}</>
                        }
                    </span>
                )}
                <AdexButton
                    variant="none"
                    type="button"
                    className="rounded-lg h-8 px-4 text-xs font-semibold gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-sm disabled:opacity-50"
                    disabled={downloading || hasMissingRequired}
                    onClick={handleDownload}
                >
                    {downloading ? (
                        <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>{t("reports.downloading")}</span></span>
                    ) : (
                        <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /><span>{t("reports.download")}</span></span>
                    )}
                </AdexButton>
            </div>
        </div>
    );
};
export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const navigate = useNavigate();
    
    const [summary, setSummary] = useState(null);
    const [reportsData, setReportsData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [resSummary, resReports, resLogs] = await Promise.all([
                getDashboardSummary(),
                getReportsMetadata().catch(() => ({ data: [] })),
                fetchAuditLogsApi({ PageNumber: 1, PageSize: 5 }).catch(() => ({ data: [] })),
            ]);
            setSummary(resSummary.data);
            
            // Filter out 'academic-record' and 'academic-status' for the dashboard
            const filteredReports = (resReports.data || []).filter(
                (r) => r.reportKey !== "academic-record" && r.reportKey !== "academic-status"
            );
            setReportsData(filteredReports);
            setAuditLogs(resLogs.data ?? []);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const counters = summary?.counters ?? {};
    
    const levelDistribution = (summary?.levelDistribution ?? []).map((item) => ({
        ...item,
        levelName: isAr && item.levelNameAr ? item.levelNameAr : item.levelName,
    }));
    
    const weeklyActivity = (summary?.weeklyActivity ?? []).map((item) => ({
        ...item,
        day: isAr && item.dayAr ? item.dayAr : item.day,
    }));
    
    // Audit logs come directly from the new /api/AuditLogs endpoint
    // No need for manual localization — the API returns formattedAction & timeAgo

    const statCards = [
        {
            label: t("dashboard.students"),
            value: counters.totalStudents,
            icon: <GraduationCap className="h-5 w-5" />,
            iconColor: "#8b5cf6",
        },
        {
            label: t("dashboard.courses"),
            value: counters.totalCourses,
            icon: <BookOpen className="h-5 w-5" />,
            iconColor: "#14b8a6",
        },
        {
            label: t("dashboard.instructors"),
            value: counters.totalInstructors,
            icon: <Users className="h-5 w-5" />,
            iconColor: "#ec4899",
        },
        {
            label: t("dashboard.programs"),
            value: counters.totalPrograms,
            icon: <LayoutGrid className="h-5 w-5" />,
            iconColor: "#6366f1",
        },
    ];

    return (
        <div className="min-h-0 max-w-full space-y-6">

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                {statCards.map((card) => (
                    <AdexCard.Stat
                        key={card.label}
                        icon={card.icon}
                        value={
                            isLoading || card.value == null ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                            ) : (
                                card.value.toLocaleString()
                            )
                        }
                        label={card.label}
                        iconColor={card.iconColor}
                        iconSize="w-11 h-11"
                        iconRadius="rounded-xl"
                        iconOpacity={0.18}
                        valueSize="text-2xl"
                        valueColor="text-slate-900"
                        labelColor="text-slate-400"
                        padding="px-4 py-4"
                        hover="hover:shadow-md"
                    />
                ))}
            </div>

            {/* Weekly activity + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-stretch">
                <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 lg:h-full">
                    <h2 className="text-base font-bold text-slate-800 shrink-0">
                        {t("dashboard.weeklyActivity")}
                    </h2>
                    <AdexCard.Panel
                        padding="p-0"
                        className="p-4 sm:p-5 flex-1 flex flex-col min-h-[280px] sm:min-h-[300px]"
                    >
                        <WeeklyActivityChart
                            data={isLoading ? [] : weeklyActivity}
                            isLoading={isLoading}
                        />
                    </AdexCard.Panel>
                </div>
                <div className="flex flex-col gap-2 min-h-0 lg:h-full">
                    <h2 className="text-base font-bold text-slate-800 shrink-0">
                        {t("dashboard.studentsByAcademicYear")}
                    </h2>
                    <AdexCard.Panel
                        padding="p-0"
                        className="flex-1 flex flex-col min-h-[280px] sm:min-h-[300px] py-4 px-3 sm:px-5 sm:py-5"
                    >
                        <AcademicYearDonut
                            data={isLoading ? [] : levelDistribution}
                            isLoading={isLoading}
                            className="flex-1 min-h-0"
                        />
                    </AdexCard.Panel>
                </div>
            </div>

            {/* Report + System activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-stretch">
                <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 lg:h-full">
                    <h2 className="text-base font-bold text-slate-800 shrink-0">{t("dashboard.report")}</h2>
                    <AdexCard.Panel
                        padding="p-0"
                        className="flex-1 flex flex-col min-h-[280px] sm:min-h-[300px]"
                    >
                        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                </div>
                            ) : reportsData.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center pt-6">
                                    No reports available.
                                </p>
                            ) : (
                                reportsData.map((report) => (
                                    <DashboardReportCard key={report.reportKey} report={report} />
                                ))
                            )}
                        </div>

                        {/* See All Reports */}
                        <div className="shrink-0 px-4 pb-4 mt-auto">
                            <AdexButton
                                variant="grey"
                                type="button"
                                className="w-full rounded-xl h-9 text-xs font-semibold"
                                onClick={() => navigate("/reports")}
                            >
                                {t("dashboard.seeAllReports")}
                            </AdexButton>
                        </div>
                    </AdexCard.Panel>
                </div>
                <div className="flex flex-col gap-2 min-h-0 lg:h-full">
                    <h2 className="text-base font-bold text-slate-800 shrink-0">
                        {t("dashboard.systemActivity")}
                    </h2>
                    <AdexCard.Panel
                        padding="p-0"
                        className="flex-1 flex flex-col min-h-[280px] sm:min-h-[300px] p-4"
                    >
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center pt-6">
                                        {t("dashboard.noRecentActivity")}
                                    </p>
                                ) : (
                                    auditLogs.map((log) => (
                                        <DashboardActivityItem
                                            key={log.id}
                                            name={log.userName}
                                            action={log.formattedAction}
                                            timeAgo={log.timeAgo}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="shrink-0 pt-3 mt-auto border-t border-slate-100">
                                <AdexButton
                                    variant="grey"
                                    type="button"
                                    className="w-full rounded-xl h-9 text-xs font-semibold"
                                    onClick={() => navigate("/audit-logs")}
                                >
                                    {t("dashboard.seeAllLogs")}
                                </AdexButton>
                            </div>
                        </div>
                    </AdexCard.Panel>
                </div>
            </div>
        </div>
    );
}
