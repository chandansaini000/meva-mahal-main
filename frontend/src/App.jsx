import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import Checkout from "./pages/Checkout.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import GiftBuilder from "./pages/GiftBuilder.jsx";
import Journal from "./pages/Journal.jsx";
import Contact from "./pages/Contact.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import Returns from "./pages/Returns.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminLogin from "./pages/admin/Login.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/gift-builder" element={<GiftBuilder />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
