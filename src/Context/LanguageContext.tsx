"use client"
import React, { createContext, useContext, useState, useEffect,ReactNode } from "react";
export  type Lang = "ar" | "en";
interface LanguageContextType {
    Language: Lang;
    setLanguage: (lang: Lang) => void;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang,setlang]=useState<Lang>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("lang") as Lang) || "ar"; 
        }
        return "ar"; // Fallback for server-side rendering not in broswer 
    });
    const setLanguage = (lang: Lang) => {
        setlang(lang);
        if (typeof window !== "undefined") {
                localStorage.setItem("lang", lang);

        }
    };
    return (
        <LanguageContext.Provider value={{ Language: lang, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
  
}
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};