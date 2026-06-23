import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";
import nubImg from "@/img/nub.jpg";

export default function Welcome() {
    const { isLoading } = useAuth();
    const { profileDisplayName } = useProfile();
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger micro-animation after component mount
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        navigate("/");
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900" dir="rtl">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 scale-105"
                style={{
                    backgroundImage: `url(${nubImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(8px)",
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/80 to-slate-900/95" />

            {/* Content Container */}
            <div 
                className={`relative z-10 flex flex-col items-center justify-center text-center p-8 transition-all duration-1000 ease-out transform ${
                    showContent ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
            >
                <div className="mb-6 p-4 rounded-full bg-blue-500/20 backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-blue-400/20">
                    <svg className="w-16 h-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                    <span className="block mb-4 text-blue-300 font-light text-3xl md:text-4xl text-center" dir="rtl">مرحباً بك،</span>
                    <span className="block text-center">{isLoading ? "..." : (profileDisplayName || "بمنصتنا الأكاديمية")}</span>
                </h1>
                
                <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl leading-relaxed opacity-90 text-center">
                    يسعدنا تواجدك معنا. تمت تهيئة بيئة العمل لتوفير أفضل تجربة أكاديمية متكاملة لك.
                </p>
                
                <button 
                    onClick={handleStart}
                    className="group relative px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
                    dir="ltr"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        Get Started
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                    <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
            </div>
            
            {/* Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        </div>
    );
}
