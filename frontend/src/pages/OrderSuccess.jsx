import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api from "../api/client.js";
import ReviewPopup from "../components/ReviewPopup.jsx";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("loading");
  const [reviewItems, setReviewItems] = useState(location.state?.orderReviewItems || null);

  const orderLabel = useMemo(() => `Order #${orderId}`, [orderId]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setState("loading");

        const { data } = await api.get(`/orders/${orderId}`);
console.log("Order API response:", data);

        if (!mounted) return;

        setOrder(data.order);
        setState("ready");
      } catch (error) {
        if (!mounted) return;

        setOrder(null);
        setState(error?.response?.status === 404 ? "not_found" : "error");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  function closeReviews() {
    setReviewItems(null);
    if (location.state?.orderReviewItems) {
      window.history.replaceState({}, "", `/order-success/${orderId}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] grid place-items-center px-4 py-10">
        <p className="text-ink/50">Loading your order...</p>
      </div>
    );
  }

  if (state === "not_found") {
    return (
      <div className="min-h-[75vh] grid place-items-center px-4 py-10">
        <div className="w-full max-w-xl text-center">
          <p className="font-display text-3xl sm:text-4xl mb-4">Order not found.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-medium text-cream transition-colors hover:bg-clayDark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-[75vh] grid place-items-center px-4 py-10">
        <div className="w-full max-w-xl text-center">
          <p className="font-display text-3xl sm:text-4xl mb-4">
            Unable to load your order details.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-medium text-cream transition-colors hover:bg-clayDark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const addressLines = [
    order.shipping_name,
    order.shipping_address,
    [
      [order.shipping_city, order.shipping_state].filter(Boolean).join(", "),
      order.shipping_pincode ? `- ${order.shipping_pincode}` : "",
    ]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean);
  const paymentMethod =
    order.payment_method === "cod"
      ? "Cash on Delivery"
      : order.payment_method || "Cash on Delivery";

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-2xl">
        {reviewItems?.length > 0 && (
          <ReviewPopup items={reviewItems} stage={1} onDone={closeReviews} />
        )}
        <div className="rounded-[28px] border border-line bg-white/90 shadow-[0_18px_50px_rgba(43,36,28,0.08)] overflow-hidden">
          <div className="px-6 py-8 sm:px-8 sm:py-10 text-center bg-[linear-gradient(180deg,#fff, #fbf8f1)] border-b border-line">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">
              Your Order Successfully Placed!
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-ink/65 leading-relaxed">
              Thank you for shopping with MevaMahal.
              <br />
              Your order has been received successfully.
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-semibold text-ink">
                {orderLabel}
              </p>
              <p className="mt-1 text-sm text-ink/50">
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="my-7 h-px w-full bg-line" />

            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 text-sm sm:text-[15px]"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{item.product_name}</p>
                    {item.variant_label ? (
                      <p className="mt-1 text-ink/55">Weight: {item.variant_label}</p>
                    ) : null}
                    <p className="mt-1 text-ink/55">Qty: {item.quantity}</p>
                  </div>

                  <p className="shrink-0 font-medium text-ink">
                    {formatCurrency(Number(item.price) * Number(item.quantity))}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-7 h-px w-full bg-line" />

            <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>

            <div className="mt-7 rounded-2xl border border-line bg-cream/45 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-2">
                Delivery Address
              </p>
              <div className="space-y-1 text-sm sm:text-[15px] text-ink/70 leading-relaxed">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 font-medium text-ink transition-colors hover:border-clay hover:text-clay"
              >
                Continue Shopping
              </Link>

              <Link
                to="/account"
                state={{ orderPlaced: order.id }}
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 font-medium text-cream transition-colors hover:bg-clayDark"
              >
                View My Orders
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-ink/40">
              Payment Method: {paymentMethod}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
