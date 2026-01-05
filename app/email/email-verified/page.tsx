import { useTranslation } from "@/hooks/useTranslation";

export default function EmailVerifiedPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("verification.success.title")}
          </h1>
          <p className="text-gray-600">
            {t("verification.success.subtitle")}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            {t("verification.success.description")}
          </p>
          
          <div className="pt-4">
            <a
              href="/login"
              className="inline-block w-full bg-[#58cc02] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#4cb302] transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
              aria-label={t("verification.success.login_button")}
            >
              {t("verification.success.login_button")}
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            {t("verification.success.redirect")}
          </p>
        </div>
      </div>
    </div>
  );
}