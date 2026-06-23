import React, { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginApi } from "@/features/auth/services/authApi";
import { Loader2 } from "lucide-react";
import loginLogo from "@/img/loginLogo.png";
import nubImg from "@/img/nub.jpg";

export default function Login() {
    const { initializeSession, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const hasLoggedIn = React.useRef(false);

    // If user is already authenticated (e.g. visited /login manually), redirect to home.
    // Skip this redirect if they *just* logged in via this form.
    React.useEffect(() => {
        if (isAuthenticated && !isAuthLoading && !hasLoggedIn.current) {
            navigate("/home", { replace: true });
        }
    }, [isAuthenticated, isAuthLoading, navigate]);

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!email || !password) {
            setError(t("login.requiredFields"));
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            // POST /api/Auth — backend sets HTTP-Only cookies in the response
            await loginApi(email, password);
            // Hydrate client-side auth state from the session cookie
            await initializeSession();
            
            hasLoggedIn.current = true;
            navigate("/welcome", { replace: true });
        } catch (err) {
            const backendMessage =
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response.data : null) ||
                "Login failed. Please check your credentials.";
            setError(backendMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* ── خلفية الصفحة = صورة الجامعة كاملة ── */
        <div
            className="min-h-screen flex items-center justify-center p-6 relative"
            style={{
                backgroundImage: `url(${nubImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    backgroundColor: "rgba(0,0,0,0.3)",
                }}
            />
            {/* ── الكارت: يسار (opaque) + يمين (شفاف) ── */}
            <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl relative">

                {/* ── الجانب الأيسر: الفورم — خلفية مصمتة ── */}
                <div className="flex-1 flex flex-col px-10 py-10 justify-center min-w-0 bg-[#e8eaed]">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <img
                            src={loginLogo}
                            alt="ADEX Logo"
                            className="h-14 w-auto object-contain"
                        />
                    </div>

                    {/* العنوان */}
                    <div className="mb-6">
                        <h1 className="text-4xl text-center mb-4 font-bold text-slate-800 mb-1">{t("login.welcomeBack")}</h1>
                        <p className="text-sm text-slate-500">{t("login.enterDetails")}</p>
                    </div>

                    {/* رسالة الخطأ */}
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* الفورم */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1">
                            <label htmlFor="login-email" className="text-sm text-slate-700">{t("login.email")}</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder={t("login.emailPlaceholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 px-4 rounded-lg bg-slate-200/80 border border-slate-300/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label htmlFor="login-password" className="text-sm text-slate-700">{t("login.password")}</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={t("login.passwordPlaceholder")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-11 px-4 rounded-lg bg-slate-200/80 border border-slate-300/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                        </div>

                        {/* Sign In */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-base font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("login.signingIn")}
                                </>
                            ) : (
                                t("login.signIn")
                            )}
                        </button>
                    </form>
                </div>

                {/* ── الجانب الأيمن: صورة بحواف دائرية + بلور خفيف ── */}
                <div
                    className="hidden sm:block w-[46%] shrink-0 relative"
                    style={{ padding: "10px", backgroundColor: "#e8eaed" }}
                >
                    {/* الصورة بحواف دائرية من جوا */}
                    <div className="relative w-full h-full overflow-hidden rounded-2xl">
                        <img
                            src={nubImg}
                            alt="NUB University"
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* قطعة بلور — أعلى يمين */}
                        <div className="absolute" style={{
                            top: "20%", right: "21%",
                            width: "15%", height: "12%",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                            backgroundColor: "rgba(255,255,255,0.18)",
                            borderRadius: "2px",
                        }} />

                        {/* قطعة بلور — وسط يمين */}
                        <div className="absolute" style={{
                            top: "32%", right: "6%",
                            width: "15%", height: "12%",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            borderRadius: "2px",
                        }} />

                        {/* قطعة بلور — أسفل يمين (أكبر) */}
                        <div className="absolute" style={{
                            bottom: "0%", right: "0%",
                            width: "20%", height: "15%",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "2px",
                        }} />

                        {/* قطعة بلور — أسفل يسار */}
                        <div className="absolute" style={{
                            bottom: "15%", left: "0%",
                            width: "10%", height: "20%",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                            backgroundColor: "rgba(255,255,255,0.13)",
                            borderRadius: "2px",
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
