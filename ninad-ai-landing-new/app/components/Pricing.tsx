// Check icon component
function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 10L9 13L14 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free Trial",
    price: "$0",
    period: "/14 day",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
    ],
  },
  {
    name: "Professional",
    price: "$8",
    period: "/month billed annually",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
      { text: "Unlimited threads & chats" },
    ],
  },
  {
    name: "Organization",
    price: "$14",
    period: "/month billed annually",
    highlighted: true,
    badge: "MOST POPULAR",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
      { text: "Unlimited threads & chats" },
      { text: "Advanced invitation controls" },
      { text: "SCIM & SSO" },
    ],
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={`relative rounded-[26px] p-8 ${
        isHighlighted
          ? "bg-[#6125d8] shadow-[0px_32px_34px_0px_rgba(82,67,194,0.3)] h-[474px] w-[294px]"
          : "h-[420px] w-[232px]"
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-5 right-5 bg-black rounded-[13.5px] px-3 py-1">
          <span className="font-poppins font-extrabold text-[10px] text-white tracking-[0.83px]">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className={`font-poppins font-bold text-[36px] leading-[46px] ${
            isHighlighted ? "text-white" : "text-white"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`font-poppins font-medium text-[14px] ${
            isHighlighted ? "text-white" : "text-white/80"
          }`}
        >
          {plan.period}
        </span>
      </div>

      {/* Plan Name */}
      <h3
        className={`font-poppins font-medium text-[28px] mb-6 ${
          isHighlighted ? "text-white" : "text-[#6125d8]"
        }`}
      >
        {plan.name}
      </h3>

      {/* Features */}
      <div className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={isHighlighted ? "text-white" : "text-[#6125d8]"}>
              <CheckIcon />
            </div>
            <span
              className={`font-poppins font-medium text-[13px] ${
                isHighlighted ? "text-white" : "text-white"
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        className={`absolute bottom-8 left-8 right-8 h-[44px] rounded-[24px] font-poppins font-medium text-[15px] ${
          isHighlighted
            ? "bg-white text-black"
            : "bg-[#6125d8] text-white"
        }`}
      >
        Choose plan
      </button>
    </div>
  );
}

export default function Pricing() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[644px] h-[448px] bg-[#6125d8] rounded-full blur-[200px] opacity-30 top-[200px] left-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Billing Toggle */}
        <div className="flex justify-end mb-8">
          <div className="relative h-[42px] bg-white/50 rounded-[22px] overflow-hidden">
            {/* Active Tab */}
            <div className="absolute left-0 top-0 h-[42px] px-6 py-3 bg-[#6125d8] rounded-[22px] shadow-[4px_0px_3px_0px_rgba(6,3,25,0.23)] flex items-center">
              <span className="font-poppins font-medium text-[12px] text-white tracking-[0.83px]">
                MONTHLY
              </span>
            </div>
            {/* Inactive Tab */}
            <div className="ml-[97px] h-[42px] w-[110px] px-6 py-3 flex items-center justify-center">
              <span className="font-poppins font-medium text-[12px] text-white tracking-[0.83px]">
                YEARLY
              </span>
            </div>
          </div>
        </div>

        {/* Glass Container */}
        <div className="relative rounded-[30px] border-2 border-[#bab7b7] p-6 overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-[30px]" />
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay rounded-[30px]" />

          {/* Pricing Cards */}
          <div className="relative flex items-end justify-center gap-8 py-8">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
