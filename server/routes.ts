import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { insertOrderSchema, insertCartItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create session ID if not exists
  app.use((req, res, next) => {
    if (!req.headers.cookie || !req.headers.cookie.includes('sessionId=')) {
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

  const httpServer = createServer(app);

  return httpServer;
}
