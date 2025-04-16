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
  InsertWishlistItem
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItemWithProduct(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  
  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Wishlist
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItemWithProduct(userId: number): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<void>;
  isProductInWishlist(userId: number, productId: number): Promise<boolean>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private categories: Map<number, Category>;
  private users: Map<number, User>;
  private wishlistItems: Map<number, WishlistItem>;
  private productIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private categoryIdCounter: number;
  private userIdCounter: number;
  private wishlistItemIdCounter: number;
  public sessionStore: any;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.categories = new Map();
    this.users = new Map();
    this.wishlistItems = new Map();
    this.productIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.categoryIdCounter = 1;
    this.userIdCounter = 1;
    this.wishlistItemIdCounter = 1;
    
    // Create session store for authentication
    // We'll set this up in the auth.ts file instead
    this.sessionStore = null;

    // Initialize with some categories
    this.initializeCategories();
    // Initialize with some products
    this.initializeProducts();
    // Initialize users (customer and seller)
    this.initializeUsers();
  }
  
  private initializeUsers(): void {
    const users: InsertUser[] = [
      {
        username: "customer",
        password: "customer123", // This will be hashed when actually registering
        email: "customer@example.com",
        fullName: "Demo Customer",
        role: "customer"
      },
      {
        username: "seller",
        password: "seller123", // This will be hashed when actually registering
        email: "seller@example.com",
        fullName: "Demo Seller",
        role: "seller"
      }
    ];
    
    users.forEach(user => {
      this.createUser(user);
    });
  }
  
  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  // Wishlist methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }
  
  async getWishlistItemWithProduct(userId: number): Promise<(WishlistItem & { product: Product })[]> {
    const wishlistItems = await this.getWishlistItems(userId);
    return await Promise.all(
      wishlistItems.map(async (item) => {
        const product = (await this.getProductById(item.productId))!;
        return { ...item, product };
      })
    );
  }
  
  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if the item already exists in the wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      (wishlistItem) => wishlistItem.productId === item.productId && wishlistItem.userId === item.userId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const id = this.wishlistItemIdCounter++;
    const createdAt = new Date();
    const newItem: WishlistItem = { ...item, id, createdAt };
    this.wishlistItems.set(id, newItem);
    return newItem;
  }
  
  async removeFromWishlist(id: number): Promise<void> {
    this.wishlistItems.delete(id);
  }
  
  async isProductInWishlist(userId: number, productId: number): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }

  private initializeCategories(): void {
    const categories: InsertCategory[] = [
      { name: "Electronics", icon: "fas fa-mobile-alt" },
      { name: "Fashion", icon: "fas fa-tshirt" },
      { name: "Home", icon: "fas fa-home" },
      { name: "Kitchen", icon: "fas fa-utensils" },
      { name: "Health", icon: "fas fa-heartbeat" },
      { name: "Toys", icon: "fas fa-gamepad" },
      { name: "Books", icon: "fas fa-book" },
      { name: "Sports", icon: "fas fa-futbol" },
    ];

    categories.forEach(category => {
      this.createCategory(category);
    });
  }

  private initializeProducts(): void {
    const products: InsertProduct[] = [
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 79.99,
        originalPrice: 99.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Audio",
        inStock: true,
        featured: true,
        discount: 20,
      },
      {
        name: "Smart Watch Series 5",
        description: "Advanced smartwatch with health monitoring and notifications",
        price: 199.99,
        originalPrice: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Wearables",
        inStock: true,
        featured: true,
        discount: 0,
      },
      {
        name: "Vintage Polaroid Camera",
        description: "Classic instant camera for capturing memories",
        price: 149.99,
        originalPrice: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Cameras",
        inStock: true,
        featured: true,
        discount: 0,
      },
      {
        name: "Smart Home Speaker",
        description: "Voice-controlled speaker for your smart home",
        price: 89.99,
        originalPrice: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1553545204-4f7d339aa06a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Smart Home",
        inStock: true,
        featured: true,
        discount: 0,
      },
      {
        name: "Wireless Earbuds Pro",
        description: "Premium wireless earbuds with spatial audio",
        price: 129.99,
        originalPrice: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Audio",
        inStock: true,
        featured: true,
        discount: 15,
      },
      {
        name: "43\" Smart TV 4K UHD",
        description: "Ultra HD smart TV with voice control",
        price: 399.99,
        originalPrice: 599.99,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "TVs",
        inStock: true,
        featured: false,
        discount: 33,
      },
      {
        name: "Wireless Vacuum Cleaner",
        description: "Powerful cordless vacuum for easy cleaning",
        price: 149.99,
        originalPrice: 229.99,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Home",
        subcategory: "Appliances",
        inStock: true,
        featured: false,
        discount: 35,
      },
      {
        name: "Ultrabook Pro 14\"",
        description: "Lightweight and powerful laptop for professionals",
        price: 899.99,
        originalPrice: 1199.99,
        imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        category: "Electronics",
        subcategory: "Computers",
        inStock: true,
        featured: false,
        discount: 25,
      },
    ];

    products.forEach(product => {
      this.createProduct(product);
    });
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async getCartItemWithProduct(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const cartItems = await this.getCartItems(sessionId);
    return await Promise.all(
      cartItems.map(async (item) => {
        const product = (await this.getProductById(item.productId))!;
        return { ...item, product };
      })
    );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (cartItem) => cartItem.productId === item.productId && cartItem.sessionId === item.sessionId
    );

    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + (item.quantity || 1)) as Promise<CartItem>;
    }

    const id = this.cartItemIdCounter++;
    const createdAt = new Date();
    const newItem: CartItem = { 
      ...item, 
      id, 
      createdAt,
      quantity: item.quantity || 1 // Ensure quantity has a default value
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    const updatedItem: CartItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId)
      .map(item => item.id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.sessionId === sessionId);
  }

  // Order Item methods
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Categories methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
}

export const storage = new MemStorage();
