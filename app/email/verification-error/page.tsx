import { useTranslation } from "@/hooks/useTranslation";

export default function VerificationErrorPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("verification.error.title")}
          </h1>
          <p className="text-gray-600">
            {t("verification.error.subtitle")}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            {t("verification.error.description")}
          </p>
          
          <div className="space-y-3 pt-4">
            <a
              href="/signup"
              className="block w-full bg-[#58cc02] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#4cb302] transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
              aria-label={t("verification.error.try_again")}
            >
              {t("verification.error.try_again")}
            </a>
            
            <a
              href="/"
              className="block w-full border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              aria-label={t("verification.error.homepage")}
            >
              {t("verification.error.homepage")}
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            {t("verification.error.support")}
          </p>
        </div>
      </div>
    </div>
  );
}