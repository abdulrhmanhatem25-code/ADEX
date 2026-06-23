import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 gap-6">
            {/* Animated 404 Number */}
            <div className="relative">
                <h1 className="text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-bounce">
                        <span className="text-4xl">🔍</span>
                    </div>
                </div>
            </div>

            {/* Text */}
            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {t("notFound.title", "Page Not Found")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {t("notFound.description", "The page you're looking for doesn't exist or has been moved.")}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.97]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("notFound.goBack", "Go Back")}
                </button>
                <button
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.97]"
                >
                    <Home className="w-4 h-4" />
                    {t("notFound.goHome", "Go Home")}
                </button>
            </div>
        </div>
    );
}
