import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AdexCard from "@/shared/ui/AdexCard";
import AdexButton from "@/shared/ui/AdexButton";
import { getReportsMetadata, downloadDynamicReport } from "@/features/reports/services/reportsApi";

const DynamicReportGridCard = ({ report }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error' }
    const [params, setParams] = useState({});

    const handleParamChange = (name, value) => {
        setParams((prev) => ({ ...prev, [name]: value }));
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
            setStatus({ type: "success" });
        } catch (err) {
            console.error("Report download failed:", err);
            setStatus({ type: "error" });
        } finally {
            setDownloading(false);
        }
    };

    const hasMissingRequired = report.parameters?.some(
        (p) => p.isRequired && !params[p.name]
    );

    return (
        <AdexCard.Panel padding="p-0" className="report-card group relative overflow-hidden flex flex-col h-full">
            {/* Gradient accent bar */}
            <div className="h-1 w-full shrink-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Icon + Title */}
                <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 leading-tight capitalize">
                            {report.reportKey.replace(/-/g, " ")}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {report.description}
                        </p>
                    </div>
                </div>

                {/* Parameters inputs */}
                {report.parameters && report.parameters.length > 0 && (
                    <div className="mt-2 flex flex-col gap-3 flex-1">
                        {report.parameters.map((param) => (
                            <div key={param.name} className="flex flex-col gap-1.5">
                                <label htmlFor={`report-param-${report.reportKey}-${param.name}`} className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                    {param.name} {param.isRequired && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    id={`report-param-${report.reportKey}-${param.name}`}
                                    name={param.name}
                                    type={param.type === "number" ? "number" : "text"}
                                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors w-full"
                                    placeholder={`Enter ${param.name}...`}
                                    value={params[param.name] || ""}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Spacer to push buttons to bottom if parameters take less space */}
                <div className="flex-1" />

                {/* Status feedback */}
                {status && (
                    <div className={`flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 shrink-0 ${status.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {status.type === "success" ? (
                            <><CheckCircle2 className="h-3.5 w-3.5" />{t("reports.downloadSuccess")}</>
                        ) : (
                            <><AlertCircle className="h-3.5 w-3.5" />{t("reports.downloadFailed")}</>
                        )}
                    </div>
                )}

                {/* Download button */}
                <AdexButton
                    type="button"
                    className="w-full rounded-xl h-10 text-xs font-semibold gap-2 report-download-btn shrink-0"
                    onClick={handleDownload}
                    disabled={downloading || hasMissingRequired}
                >
                    {downloading ? (
                        <span className="flex items-center justify-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /><span>{t("reports.downloading")}</span></span>
                    ) : (
                        <span className="flex items-center justify-center gap-1.5"><Download className="h-4 w-4" /><span>{t("reports.download")}</span></span>
                    )}
                </AdexButton>
            </div>
        </AdexCard.Panel>
    );
};

export default function Reports() {
    const { t } = useTranslation();
    const [reportsData, setReportsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            try {
                const res = await getReportsMetadata();
                setReportsData(res.data || []);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="min-h-0 max-w-full space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    {t("reports.title")}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    {t("reports.subtitle")}
                </p>
            </div>

            {/* Reports grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
            ) : reportsData.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    No reports available.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                    {reportsData.map((report) => (
                        <DynamicReportGridCard key={report.reportKey} report={report} />
                    ))}
                </div>
            )}
        </div>
    );
}
