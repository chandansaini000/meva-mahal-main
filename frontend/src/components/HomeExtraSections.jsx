import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import {
  FaAward,
  FaGift,
  FaBoxOpen,
  FaTruck,
  FaStar,
} from "react-icons/fa";

const testimonials = [
  {
    name: "AARAV S.",
    role: "VERIFIED BUYER",
    text: "The Mamra almonds are on another level. You can taste the care in every kernel.",
  },
  {
    name: "ISABELLA R.",
    role: "CHEF",
    text: "I run a small patisserie and switched all my nuts to Mevamahal. Consistency is unmatched.",
  },
  {
    name: "DAVID L.",
    role: "FITNESS COACH",
    text: "I keep the mixed jar on my desk. Perfect fuel and it looks beautiful too.",
  },
];

const faqs = [
  "How fresh are your dry fruits?",
  "Are they 100% natural?",
  "Do you ship internationally?",
  "How should I store them?",
];

export default function HomeExtraSections() {
  const [openFaq, setOpenFaq] = useState(null);

  const answers = [
    "Our dry fruits are packed fresh to preserve their natural taste, crunch, and quality. We carefully seal every order to maintain freshness from our kitchen to your doorstep.",
    "Yes. We carefully select premium-quality dry fruits and keep them as natural as possible, without unnecessary additives or artificial ingredients.",
    "Yes, we offer shipping to selected international destinations. Shipping availability and delivery times may vary depending on your location.",
    "Store dry fruits in an airtight container in a cool, dry place away from direct sunlight. For longer freshness, refrigeration is recommended.",
  ];

  const whyChooseUs = [
    {
      icon: <FaAward />,
      title: (
        <>
          Premium
          <br />
          Quality
        </>
      ),
      description:
        "Only the finest nuts, ensuring top-notch taste and freshness.",
      bg: "bg-amber-100",
    },
    {
      icon: <FaGift />,
      title: "Customization",
      description:
        "Tailored hampers and packs to match your needs perfectly.",
      bg: "bg-pink-100",
    },
    {
      icon: <FaBoxOpen />,
      title: (
        <>
          Elegant
          <br />
          Packaging
        </>
      ),
      description:
        "Luxurious designs that make every gift unforgettable.",
      bg: "bg-blue-100",
    },
    {
      icon: <FaTruck />,
      title: (
        <>
          On-Time
          <br />
          Delivery
        </>
      ),
      description: "We value your time and deliver promptly.",
      bg: "bg-emerald-100",
    },
    {
      icon: <FaStar />,
      title: (
        <>
          4.7+ Google
          <br />
          Ratings
        </>
      ),
      description: "Trusted by thousands of happy customers.",
      bg: "bg-violet-100",
    },
  ];

  return (
    <section className="bg-cream text-ink">

      {/* =========================
          CUSTOMER REVIEWS
      ========================== */}
     <section className="relative py-16 sm:py-20 bg-[#f7f7f7] overflow-hidden">

  {/* Decorative hanging elements */}
  <div className="absolute top-0 left-[11%] hidden md:block">
    <div className="flex gap-2">
      <span className="w-px h-28 bg-black/20" />
      <span className="w-px h-32 bg-black/20" />
      <span className="w-px h-36 bg-black/20" />
    </div>

    <div className="absolute top-[100px] left-[28px] w-10 h-10 rounded-full bg-[#ddd] shadow-sm" />
  </div>

  <div className="absolute top-0 right-[11%] hidden md:block">
    <div className="flex gap-2">
      <span className="w-px h-36 bg-black/20" />
      <span className="w-px h-32 bg-black/20" />
      <span className="w-px h-28 bg-black/20" />
    </div>

    <div className="absolute top-[100px] right-[28px] w-10 h-10 rounded-full bg-[#ddd] shadow-sm" />
  </div>

  {/* Section content */}
  <div className="relative max-w-6xl mx-auto px-5 sm:px-6">

    {/* Heading */}
    <div className="text-center mb-10 sm:mb-12">
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink">
        Words From Our Delighted Customers
      </h2>
    </div>

    {/* Testimonials */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {testimonials.map((review) => (
        <div
          key={review.name}
          className="
            relative
            bg-white
            rounded-md
            px-5 sm:px-6
            py-6
            shadow-[0_8px_20px_rgba(0,0,0,0.08)]
            min-h-[205px]
            overflow-hidden
          "
        >

          {/* Large quotation mark */}
          <span
            className="
              absolute
              top-1
              left-4
              text-[58px]
              leading-none
              font-serif
              font-bold
              text-black/[0.06]
              pointer-events-none
            "
          >
            “
          </span>

          <div className="relative z-10">

            {/* Customer name */}
            <h3 className="text-center font-medium text-base sm:text-lg text-ink mb-5">
              {review.name}
            </h3>

            {/* Review content */}
            <div className="flex gap-5">

              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-14 h-14 bg-[#cfcfcf] flex items-center justify-center overflow-hidden">
                  {review.image ? (
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 64 64"
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                    >
                      <circle cx="32" cy="21" r="13" />
                      <path d="M8 58c2-13 11-20 24-20s22 7 24 20H8z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">

                <p className="text-sm sm:text-[15px] leading-6 text-ink/60">
                  <span className="font-bold text-ink/60 mr-1">
                    “
                  </span>

                  {review.text}

                  <span className="font-bold text-ink/60 ml-1">
                    ”
                  </span>
                </p>

                {/* Stars */}
                <div className="flex gap-0.5 mt-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="w-4 h-4 text-[#ffb400] fill-[#ffb400]"
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      ))}

    </div>
  </div>
</section>

      {/* =========================
          LIVE BETTER
      ========================== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div>
            <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs text-gold font-medium mb-3">
              Live Better
            </p>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-5">
              A handful, every day.
            </h2>

            <p className="text-white/60 leading-relaxed max-w-xl mb-7">
              Dry fruits deliver a slow, sustained release of energy—perfect
              between meals, before workouts, or as a mid-afternoon reset.
              Here's how to make them a ritual.
            </p>

            <ul className="space-y-4 text-sm sm:text-base text-ink/70">
              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  Soak 6 almonds overnight, peel and eat first thing in the
                  morning.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  Blend Medjool dates into smoothies as a natural sweetener.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  Top yogurt with pistachios and golden sultanas for a
                  Mediterranean touch.
                </span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <img
              src="/assets/dry-fruit-kitchen.jpg"
              alt="Mevamahal dry fruits"
              className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>
      </section>

      {/* =========================
          WHY CHOOSE US
      ========================== */}
      <section className="py-16 sm:py-20 bg-white">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

          {/* Heading */}
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs text-gold font-medium mb-3">
              Why Mevamahal
            </p>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink">
              Why Choose Us
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-7">

            {whyChooseUs.map((item, index) => (
              <div
                key={index}
               className="
  group
  bg-white
  rounded-2xl
  px-6
  py-8
  text-center
  shadow-sm
  hover:shadow-xl
  border
  border-transparent
  transition-all
  duration-300
  hover:-translate-y-1
"
              >

                {/* Icon */}
                <div
                  className={`
                    ${item.bg}
                    w-20
                    h-20
                    mx-auto
                    mb-6
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  `}
                >
                  <div className="text-3xl text-amber-500">
                    {item.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-ink mb-3 leading-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-ink/60 leading-relaxed">
                  {item.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================
          FAQ
      ========================== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-12">

        <div className="mb-10 text-center">
          <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs text-gold font-medium mb-3">
            Good To Know
          </p>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
            Frequently asked
          </h2>
        </div>

        <div className="max-w-4xl mx-auto bg-white/80 border border-line rounded-2xl overflow-hidden shadow-sm">

          {faqs.map((question, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={question}
                className={`
                  border-b
                  border-line
                  last:border-b-0
                  transition-colors
                  duration-300
                  ${isOpen ? "bg-[#FDFBF6]" : "bg-transparent"}
                `}
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(isOpen ? null : index)
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-6
                    px-5
                    sm:px-7
                    py-5
                    sm:py-6
                    text-left
                    group
                  "
                  aria-expanded={isOpen}
                >

                  <div className="flex items-center gap-4">

                    <span
                      className={`
                        text-xs
                        font-medium
                        transition-colors
                        duration-300
                        ${isOpen ? "text-gold" : "text-ink/30"}
                      `}
                    >
                      0{index + 1}
                    </span>

                    <span
                      className={`
                        font-display
                        text-base
                        sm:text-lg
                        transition-colors
                        duration-300
                        ${isOpen ? "text-clayDark" : "text-ink/80"}
                      `}
                    >
                      {question}
                    </span>

                  </div>

                  <span
                    className={`
                      w-8
                      h-8
                      rounded-full
                      border
                      flex
                      items-center
                      justify-center
                      shrink-0
                      transition-all
                      duration-300
                      ${
                        isOpen
                          ? "border-gold bg-gold text-white"
                          : "border-line text-ink/50 group-hover:border-gold group-hover:text-gold"
                      }
                    `}
                  >
                    <ChevronDown
                      className={`
                        w-4
                        h-4
                        transition-transform
                        duration-300
                        ${isOpen ? "rotate-180" : ""}
                      `}
                    />
                  </span>

                </button>

                {/* Answer */}
                <div
                  className={`
                    grid
                    transition-all
                    duration-300
                    ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">

                    <div className="px-5 sm:px-7 pb-6 pl-[3.75rem] sm:pl-[4.5rem] pr-14">
                      <p className="text-sm sm:text-[15px] text-ink/60 leading-7">
                        {answers[index]}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </section>

    </section>
  );
}