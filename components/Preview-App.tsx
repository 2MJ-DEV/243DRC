import Preview from "./ui/Preview"

const PreviewApp = () => {
  return (
    <>
    <section className="mb-10 sm:mb-20 px-4 sm:px-6">
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Fenêtre macOS */}
          <div className="rounded-lg sm:rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-[#f5f5f7] dark:bg-[#1a1a1c] shadow-sm sm:shadow-md">
            {/* Barre du haut (style macOS) */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#e8e8ed] dark:bg-[#2a2a2c] border-b border-black/10 dark:border-white/10">
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#007FFF]"></span>
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#EFDA5B]"></span>
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#CA3E4B]"></span>
            </div>
            <Preview />
          </div>
        </div>
      </section>
      </>
  )
}

export default PreviewApp