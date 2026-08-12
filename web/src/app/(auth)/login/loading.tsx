export default function Loading() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Login Form Section */}
      <section className="relative h-full overflow-hidden bg-emerald-900 flex items-center justify-center">
        {/* Decorative SVG Top */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            {/* Login Form Card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
              {/* Header Title */}
              <div className="text-center mb-8">
                <div className="w-32 h-8 bg-gray-200 rounded mx-auto mb-3 animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>

              {/* Loading Form Fields */}
              <div className="space-y-6">
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Loading Spinner */}
              <div className="mt-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
