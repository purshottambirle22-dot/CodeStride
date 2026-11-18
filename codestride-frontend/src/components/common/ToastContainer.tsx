import React from "react";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = {
          success: {
            icon: CheckCircle2,
            border: "border-emerald-500/30",
            bg: "bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100",
            iconColor: "text-emerald-600 dark:text-emerald-400",
          },
          error: {
            icon: AlertCircle,
            border: "border-rose-500/30",
            bg: "bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100",
            iconColor: "text-rose-600 dark:text-rose-400",
          },
          warning: {
            icon: AlertTriangle,
            border: "border-amber-500/30",
            bg: "bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100",
            iconColor: "text-amber-600 dark:text-amber-400",
          },
          info: {
            icon: Info,
            border: "border-indigo-500/30",
            bg: "bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100",
            iconColor: "text-indigo-600 dark:text-indigo-400",
          },
        }[toast.type];

        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${config.border} ${config.bg} shadow-2xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <IconComponent className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className="text-sm font-medium leading-relaxed flex-1">{toast.text}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
