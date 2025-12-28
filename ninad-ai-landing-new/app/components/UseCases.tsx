const useCases = [
  { name: "Mental and Physical Health" },
  { name: "Education and Ed-Tech" },
  { name: "Edgy and Futuristic" },
  { name: "Metaverse" },
  { name: "Media and Entertainment" },
];

// Arrow icon component
function ArrowIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UseCases() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Background glow effects */}
      <div className="absolute inset-0">
        <div className="absolute w-[1000px] h-[1000px] bg-[#6125d8] rounded-full blur-[300px] opacity-10 -top-[200px] -left-[200px]" />
        <div className="absolute w-[800px] h-[800px] bg-[#00a9ff] rounded-full blur-[250px] opacity-10 top-[300px] right-[-200px]" />
      </div>

      {/* Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="font-inter font-extrabold text-[80px] leading-none tracking-[-2.4px] text-white uppercase mb-12">
          Real-World Use
        </h2>

        {/* Use Cases List */}
        <div className="max-w-[803px]">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card Background */}
              <div className="h-[77px] bg-[#1f1f1f] border border-[#9968fa] rounded-[5px] opacity-50 mb-2 flex items-center justify-between px-6 cursor-pointer hover:opacity-70 transition-opacity">
                {/* Use Case Name */}
                <h3 className="font-inter font-light text-[42px] leading-none tracking-[-1.26px] gradient-text bg-gradient-to-r from-white/80 from-[3%] to-[#6125d8] to-[96%]">
                  {useCase.name}
                </h3>

                {/* Arrow */}
                <div className="text-white/60">
                  <ArrowIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
