import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { insertOrderSchema, insertCartItemSchema, insertWishlistItemSchema, insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create session ID if not exists for non-authenticated sessions
  app.use((req, res, next) => {
    if (!req.isAuthenticated() && (!req.headers.cookie || !req.headers.cookie.includes('sessionId='))) {
      const sessionId = randomUUID();
      res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly`);
    }
    next();
  });

  // Helper function to get sessionId from cookie
  const getSessionId = (req: Request): string => {
    const cookies = req.headers.cookie?.split(';') || [];
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionId='));
    return sessionCookie ? sessionCookie.trim().split('=')[1] : '';
  };

  // Products routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (_req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID not found" });
      }

      const cartItems = await storage.getCartItemWithProduct(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID not found" });
      }

      const cartItemData = { ...req.body, sessionId };
      const validatedData = insertCartItemSchema.parse(cartItemData);
      const cartItem = await storage.addToCart(validatedData);
      
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }

      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }

      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID not found" });
      }

      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID not found" });
      }

      // Validate order data
      const orderData = { ...req.body, sessionId };
      const validatedOrder = insertOrderSchema.parse(orderData);
      
      // Get cart items to create order items
      const cartItems = await storage.getCartItemWithProduct(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Create the order
      const order = await storage.createOrder(validatedOrder);

      // Create order items from cart items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        });
      }

      // Clear the cart
      await storage.clearCart(sessionId);

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID not found" });
      }

      const orders = await storage.getOrdersBySessionId(sessionId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const items = await storage.getOrderItemsByOrderId(id);
      
      res.json({ order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Wishlist routes (requires authentication)
  app.get("/api/wishlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = (req.user as Express.User).id;
      const wishlistItems = await storage.getWishlistItemWithProduct(userId);
      res.json(wishlistItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = (req.user as Express.User).id;
      const wishlistItemData = { ...req.body, userId };
      const validatedData = insertWishlistItemSchema.parse(wishlistItemData);
      const wishlistItem = await storage.addToWishlist(validatedData);
      
      res.status(201).json(wishlistItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      res.status(500).json({ error: "Failed to add item to wishlist" });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid wishlist item ID" });
      }

      await storage.removeFromWishlist(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated", inWishlist: false });
      }
      
      const userId = (req.user as Express.User).id;
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const inWishlist = await storage.isProductInWishlist(userId, productId);
      res.json({ inWishlist });
    } catch (error) {
      res.status(500).json({ error: "Failed to check wishlist status" });
    }
  });

  // Order tracking endpoint
  app.get("/api/orders/:id/track", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // In a real implementation, this would connect to a tracking service
      // For now, we'll generate fake tracking data
      const trackingInfo = {
        orderId: order.id,
        status: "in_transit", // "processing", "in_transit", "out_for_delivery", "delivered"
        estimatedDelivery: order.deliveryDate,
        currentLocation: "Tashkent Distribution Center",
        lastUpdated: new Date().toISOString(),
        history: [
          { 
            status: "order_placed", 
            location: "Online", 
            timestamp: new Date(order.createdAt).toISOString(),
            description: "Order placed successfully"
          },
          { 
            status: "processing", 
            location: "Warehouse", 
            timestamp: new Date(new Date(order.createdAt).getTime() + 1000*60*60).toISOString(),
            description: "Order picked and packed" 
          },
          { 
            status: "in_transit", 
            location: "Tashkent Distribution Center", 
            timestamp: new Date(new Date(order.createdAt).getTime() + 1000*60*60*3).toISOString(),
            description: "Order shipped" 
          }
        ]
      };
      
      res.json(trackingInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tracking information" });
    }
  });

  // Purchase history endpoint (requires authentication)
  app.get("/api/purchase-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // In a real app, we would filter orders by user ID
      // For now, we'll just return all orders since we don't have that relationship
      const orders = await storage.getOrdersBySessionId(getSessionId(req));
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          return { order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase history" });
    }
  });

  // Reviews routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const reviews = await storage.getReviewWithUserDetails(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = (req.user as Express.User).id;
      const reviewData = { ...req.body, userId };
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid review ID" });
      }

      const reviewData = req.body;
      const updatedReview = await storage.updateReview(id, reviewData);
      
      if (!updatedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid review ID" });
      }

      await storage.deleteReview(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/products/:productId/rating", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const averageRating = await storage.getAverageRatingByProductId(productId);
      res.json({ productId, averageRating });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product rating" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
