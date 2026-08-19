import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import HomeExtraSections from "../components/HomeExtraSections.jsx";
import {
  getCachedProducts,
  setCachedProducts,
} from "../utils/productCache.js";
import {
  getCachedCategories,
  setCachedCategories,
} from "../utils/categoryCache.js";
const collections = [
  { name: "Almonds", slug: "almonds", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Almonds.jpg?width=500" },
  { name: "Pistachios", slug: "pistachios", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pistachio_Nuts_(Unsplash).jpg?width=500" },
  { name: "Dates", slug: "dates", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Medjool-Date.jpg?width=500" },
  { name: "Cashews", slug: "cashews", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cashew_nuts.JPG?width=500" },
  { name: "Gift boxes", slug: "gift-boxes", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Gift_box.jpg?width=500" },
];

function ProductShelf({ eyebrow, title, products }) {
  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24">
      <div className="flex items-end justify-between mb-8" data-aos="fade-up">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-clay font-medium mb-2">{eyebrow}</p>
          <h2 className="font-display text-3xl">{title}</h2>
        </div>
        <Link to="/shop" className="text-sm font-medium hover:text-clay">View all →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-5">
        {products.slice(0, 8).map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
const [reviewsError, setReviewsError] = useState("");
 useEffect(() => {
  const loadProducts = async () => {
    try {
      // First check browser cache
      const cachedProducts = getCachedProducts();

      if (cachedProducts) {
        console.log("Products loaded from browser cache");
        setProducts(cachedProducts);
        return;
      }

      // Cache not available/expired → API request
      console.log("Products loaded from API");

      const { data } = await api.get("/products?limit=100");

      const productsData = Array.isArray(data?.products)
        ? data.products
        : [];

      setProducts(productsData);

      // Save latest products in browser cache
      setCachedProducts(productsData);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    }
  };

  loadProducts();

  // Keep existing settings request
  api
    .get("/site/settings")
    .then(({ data }) => setSettings(data.settings))
    .catch(() => setSettings(null));

  // Keep existing categories request
 const loadCategories = async () => {
  try {
    const cachedCategories = getCachedCategories();

    if (cachedCategories) {
      console.log("Categories loaded from browser cache");
      setCategories(cachedCategories);
      return;
    }

    console.log("Categories loaded from API");

    const { data } = await api.get("/products/categories");

    const categoriesData = Array.isArray(data?.categories)
      ? data.categories
      : [];

    setCategories(categoriesData);

    setCachedCategories(categoriesData);
  } catch (error) {
    console.error("Failed to load categories:", error);
    setCategories([]);
  }
};

loadCategories();
}, []);

  const newArrivals = useMemo(() => products.filter((product) => product.is_new_arrival), [products]);
  const featured = useMemo(() => products.filter((product) => product.is_featured), [products]);
  const bestSellers = useMemo(() => products.filter((product) => product.is_best_seller), [products]);

useEffect(() => {
  let mounted = true;

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const { data } = await api.get("/products/reviews");

      if (!mounted) return;

      const incomingReviews = Array.isArray(data?.reviews)
        ? data.reviews
        : [];

      // Remove duplicate reviews by ID
      const uniqueReviews = Array.from(
        new Map(
          incomingReviews
            .filter((review) => review?.id != null)
            .map((review) => [review.id, review])
        ).values()
      );

      setReviews(uniqueReviews);
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error?.response?.data || error
      );

      if (mounted) {
        setReviews([]);
        setReviewsError("Unable to load customer reviews.");
      }
    } finally {
      if (mounted) {
        setReviewsLoading(false);
      }
    }
  };

  loadReviews();

  return () => {
    mounted = false;
  };
}, []);
  const sliderImages = useMemo(() => {
    const images = Array.isArray(settings?.slider_images) ? settings.slider_images : [];
    const fallback = settings?.hero_image ? [settings.hero_image] : [];
    return images.length ? images : fallback;
  }, [settings]);

  useEffect(() => {
    if (sliderImages.length <= 1) return undefined;
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [sliderImages]);

  const heroTitle = settings?.hero_title || "The finer half of nature's harvest.";
  const heroEyebrow = settings?.hero_eyebrow || "Small-batch since 1998";
  const heroSubtitle = settings?.hero_subtitle || "Hand-picked almonds, pistachios, walnuts, and dates from single-origin orchards, delivered in beautiful, resealable packaging.";
  const heroPrimaryLabel = settings?.hero_primary_cta || "Shop the harvest";
  const heroSecondaryLabel = settings?.hero_secondary_cta || "Our story";
  const heroPrimaryLink = settings?.hero_primary_link || "/shop";
  const heroSecondaryLink = settings?.hero_secondary_link || "/about";
  const heroImage = settings?.hero_image || sliderImages[0] || "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=900&q=80";
  const heroBadge = settings?.hero_badge || "Loved by 12,000+ households";

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div data-aos="fade-up">
          <p className="uppercase tracking-[0.25em] text-xs text-clay font-medium mb-6">{heroEyebrow}</p>
          <h1 className="font-display text-6xl leading-[1.05] mb-6">
            {heroTitle.split("nature's").length === 2 ? (
              <>
                {heroTitle.split("nature's")[0]}
                <span className="text-clay italic">nature's</span>
                {heroTitle.split("nature's")[1]}
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className="text-ink/60 text-lg mb-8 max-w-md">{heroSubtitle}</p>
          <div className="flex items-center gap-4">
            <Link to={heroPrimaryLink} className="px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors focus-ring">
              {heroPrimaryLabel}
            </Link>
            <Link to={heroSecondaryLink} className="px-6 py-3 rounded-full border border-line font-medium hover:border-clay transition-colors focus-ring">
              {heroSecondaryLabel}
            </Link>
          </div>
        </div>
        <div className="relative rounded-xl2 overflow-hidden aspect-[5/4] max-h-[540px]" data-aos="zoom-in">
          <img
            src={sliderImages[slideIndex] || heroImage}
            alt="Product showcase"
            className="w-full h-full object-cover"
          />
          {sliderImages.length > 1 && (
            <div className="absolute inset-x-4 top-4 flex items-center justify-between">
              <button type="button" onClick={() => setSlideIndex((slideIndex - 1 + sliderImages.length) % sliderImages.length)} className="rounded-full bg-white/90 p-2 shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => setSlideIndex((slideIndex + 1) % sliderImages.length)} className="rounded-full bg-white/90 p-2 shadow-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-xl p-4 flex items-center gap-3">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-gold" />)}
            </div>
            <p className="text-sm text-ink/70">{heroBadge}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-xl2 bg-ink text-cream p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center overflow-hidden relative" data-aos="fade-up">
          <div className="relative z-10"><p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-3">Made for meaningful moments</p><h2 className="font-display text-3xl md:text-4xl">Gift better, without the guesswork.</h2><p className="mt-4 text-cream/70 max-w-xl">From one thoughtful box to hundreds of beautifully branded gifts, we curate, pack and deliver every detail.</p></div>
          <Link to="/services" className="relative z-10 px-6 py-3 rounded-full bg-cream text-ink font-medium hover:bg-white transition-colors">Explore gifting services</Link>
          <div className="absolute -right-10 -bottom-24 w-72 h-72 rounded-full bg-clay/30 blur-2xl" />
        </div>
      </section>
      
      <section className="max-w-7xl mx-auto px-6 pb-24 overflow-hidden">
  <div className="text-center mb-9" data-aos="fade-up">
    <p className="uppercase tracking-[0.2em] text-xs text-clay font-medium mb-2">
      Shop by collection
    </p>

    <h2 className="font-display text-3xl">
      A little something for every ritual.
    </h2>
  </div>

  <div className="overflow-hidden">
    <div className="category-scroll flex gap-8 w-max">
      {[...(categories.length ? categories : collections), ...(categories.length ? categories : collections)].map(
        (collection, index) => (
          <Link
            key={`${collection.slug}-${index}`}
            to={`/shop?category=${collection.slug}`}
            className="group shrink-0 text-center"
            data-aos="zoom-in"
            data-aos-delay={(index % 4) * 100}
          >
            <img
              src={
                collection.image_url ||
                collection.image ||
                "https://placehold.co/500x500/F7F3EA/2B241C?text=Cat"
              }
              alt={collection.name}
              className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-white shadow-sm group-hover:scale-105 transition-transform"
            />

            <p className="mt-3 font-medium text-sm">
              {collection.name}
            </p>
          </Link>
        )
      )}
    </div>
  </div>
</section>
       <section className="max-w-7xl mx-auto px-6 pb-24" >
        <div className="flex items-end justify-between mb-8" data-aos="fade-up">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-clay font-medium mb-2">This week's picks</p>
            <h2 className="font-display text-3xl">Featured harvest</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium hover:text-clay">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-5">
          {featured.map((p, index) => (
            <ProductCard key={p.id} product={p} index={index} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="text-ink/40 text-sm">No featured products yet — add some from the admin dashboard.</p>
        )}
      </section>
<ProductShelf eyebrow="Fresh from the harvest" title="New arrivals" products={newArrivals} />
      <ProductShelf eyebrow="Curated favourites" title="Best sellers" products={bestSellers} />

     
      <section className="relative py-16 sm:py-10 overflow-hidden" style={{
    background:
      "linear-gradient(110deg, #f7ecdc 0%, #f5f0e6 55%, #e8f0e2 100%)",
  }}>

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

        {/* Content */}
        
        <section
  className="py-20 sm:py-12"
  style={{
    background:
      "linear-gradient(110deg, #f7ecdc 0%, #f5f0e6 55%, #e8f0e2 100%)",
  }}
>
  <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
          {/* Heading */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink">
              Words From Our Delighted Customers
            </h2>
          </div>
          {/* Reviews */}
         {reviewsLoading ? (

<p className="text-center text-ink/50"> Loading customer reviews… </p> ) : reviewsError ? ( <p className="text-center text-ink/50"> {reviewsError} </p> ) : reviews.length > 0 ? ( <div className="relative overflow-hidden"> <div className="flex w-max gap-6 animate-review-slide"> {reviews.map((review) => ( <article key={review.id} className=" relative bg-white rounded-md px-5 sm:px-6 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.08)] min-h-[205px] w-[320px] sm:w-[360px] shrink-0 overflow-hidden " > {/* Large quote */} <span className=" absolute top-1 left-4 text-[58px] leading-none font-serif font-bold text-black/[0.06] pointer-events-none " > “ </span>

      <div className="relative z-10">

        {/* Customer name */}
        <h3 className="text-center font-medium text-base sm:text-lg text-ink mb-5">
          {review.user_name || "Customer"}
        </h3>

        <div className="flex gap-5">

          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-14 h-14 bg-[#cfcfcf] flex items-center justify-center overflow-hidden">
              {review.avatar_url ? (
                <img
                  src={review.avatar_url}
                  alt={review.user_name || "Customer"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 64 64"
                  className="w-12 h-12 text-white"
                  fill="currentColor"
                >
                  <circle
                    cx="32"
                    cy="21"
                    r="13"
                  />

                  <path d="M8 58c2-13 11-20 24-20s22 7 24 20H8z" />
                </svg>
              )}
            </div>
          </div>

          {/* Review */}
          <div className="flex-1 min-w-0">

            <p className="text-sm sm:text-[15px] leading-6 text-ink/60">
              <span className="font-bold text-ink/60 mr-1">
                “
              </span>

              {review.comment}

              <span className="font-bold text-ink/60 ml-1">
                ”
              </span>
            </p>

            {/* Stars */}
            <div className="flex gap-0.5 mt-4">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-4 h-4 ${
                    starIndex < Number(review.rating)
                      ? "text-[#ffb400] fill-[#ffb400]"
                      : "text-black/10"
                  }`}
                />
              ))}
            </div>

            {/* Verified + Date */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-ink/40">

              {review.verified_purchase && (
                <span>
                  Verified Purchase
                </span>
              )}

              {review.created_at && (
                <time dateTime={review.created_at}>
                  {new Date(
                    review.created_at
                  ).toLocaleDateString()}
                </time>
              )}

            </div>

          </div>
        </div>
      </div>
    </article>
  ))}
</div>
            </div>
          ) : (
            <p className="text-center text-ink/50">
              No reviews yet. Be the first to share your experience.
            </p>
          )}

        </div>
      </section>
      </section>
      <HomeExtraSections />
    </div>
  );
}
