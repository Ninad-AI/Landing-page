// export default function Waitlist() {
//   return (
//     <section
//       id="waitlist"
//       className="relative w-full py-14 md:py-16 overflow-hidden bg-[#f5f5f5] flex items-center justify-center"
//     >
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0))] pointer-events-none" />
//       <div className="relative container mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">

//         <div className="md:w-1/2 text-left">
//           <h2 className="font-sans font-extrabold text-[52px] md:text-[66px] leading-[1.0] text-[#2a105d] tracking-tight">
//             JOIN THE<br />
//             WAITLIST NOW
//           </h2>
//         </div>

//         <div className="md:w-1/2 flex justify-end">
//           <div className="w-full max-w-[560px]">
//             <form className="group flex items-center h-[52px] rounded-full border border-[#6125d8]/70 bg-white shadow-[0_10px_24px_rgba(97,37,216,0.14)] overflow-hidden transition-shadow duration-200 focus-within:shadow-[0_14px_34px_rgba(97,37,216,0.18)]">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="flex-1 h-full px-7 text-[16px] font-light font-ibm text-[#2a2a2a] placeholder:text-[#6b6b6b] bg-transparent outline-none focus-visible:ring-0"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="h-full px-9 bg-[#6125d8] text-white font-inter font-medium text-[16px] hover:bg-[#5012b8] transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#6125d8]"
//               >
//                 Join Waitlist
//               </button>
//             </form>
//             <p className="mt-3 text-[14px] font-inter text-[#6125d8] opacity-80 leading-relaxed">
//               We'll email you as soon as the waitlist opens. Automated messaging service coming soon.
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

export default function Waitlist() {
  return (
    <section
      id="waitlist"
      className="relative w-full py-8 md:py-10 overflow-hidden bg-[#f5f5f5] flex items-center justify-center"
    >
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative container mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">

        <div className="md:w-1/2 text-left">
          <h2 className="font-sans font-extrabold text-[52px] md:text-[66px] leading-[1.0] text-[#2a105d] tracking-tight">
            JOIN THE<br />
            WAITLIST NOW
          </h2>
        </div>

        <div className="md:w-1/2 flex justify-end">
          <div className="w-full max-w-[560px]">
            <form className="group flex items-center h-[46px] rounded-full border border-[#6125d8]/50 bg-white shadow-[0_6px_16px_rgba(97,37,216,0.12)] overflow-hidden transition-all duration-200 focus-within:shadow-[0_10px_26px_rgba(97,37,216,0.18)]">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-full px-6 text-[15px] font-light font-ibm text-[#2a2a2a] placeholder:text-[#6b6b6b] bg-transparent outline-none"
                required
              />
              <button
                type="submit"
                className="h-full px-8 bg-[#6125d8] text-white font-inter font-medium text-[15px] hover:bg-[#5012b8] transition-colors duration-200 whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </form>

            <p className="mt-3 text-[14px] font-inter text-[#6125d8] opacity-80 leading-relaxed">
              We'll email you as soon as the waitlist opens. Automated messaging service coming soon.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
