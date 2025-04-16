import { 
  Product, 
  CartItem, 
  InsertCartItem, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  OrderItem, 
  InsertOrderItem,
  Category,
  InsertCategory,
  User,
  InsertUser,
  WishlistItem,
  InsertWishlistItem,
  products,
  cartItems,
  orders,
  orderItems,
  categories,
  users,
  wishlistItems
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  // Wishlist methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }
  
  async getWishlistItemWithProduct(userId: number): Promise<(WishlistItem & { product: Product })[]> {
    const items = await this.getWishlistItems(userId);
    return await Promise.all(
      items.map(async (item) => {
        const product = (await this.getProductById(item.productId))!;
        return { ...item, product };
      })
    );
  }
  
  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if the item already exists in the wishlist
    const [existingItem] = await db.select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, item.userId),
          eq(wishlistItems.productId, item.productId)
        )
      );
    
    if (existingItem) {
      return existingItem;
    }
    
    const [newItem] = await db.insert(wishlistItems).values(item).returning();
    return newItem;
  }
  
  async removeFromWishlist(id: number): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }
  
  async isProductInWishlist(userId: number, productId: number): Promise<boolean> {
    const [item] = await db.select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
    return !!item;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async getCartItemWithProduct(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await this.getCartItems(sessionId);
    return await Promise.all(
      items.map(async (item) => {
        const product = (await this.getProductById(item.productId))!;
        return { ...item, product };
      })
    );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const [existingItem] = await db.select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.productId, item.productId),
          eq(cartItems.sessionId, item.sessionId)
        )
      );

    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + (item.quantity || 1)) as Promise<CartItem>;
    }

    const [newItem] = await db.insert(cartItems).values({
      ...item,
      quantity: item.quantity || 1 // Ensure quantity has a default value
    }).returning();
    
    return newItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }

  // Order Item methods
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Categories methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
}