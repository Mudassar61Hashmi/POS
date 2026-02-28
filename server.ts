import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pos.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    quantity INTEGER,
    category TEXT,
    barcode TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("cashier", "cashier123", "cashier");
  
  const products = [
    ["Apple", 0.5, 100, "Fruit", "1001"],
    ["Milk", 1.2, 50, "Dairy", "1002"],
    ["Bread", 2.0, 30, "Bakery", "1003"],
    ["Eggs", 3.5, 20, "Dairy", "1004"],
    ["Coffee", 5.0, 40, "Beverage", "1005"]
  ];
  const insertProduct = db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)");
  products.forEach(p => insertProduct.run(...p));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Products API
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, price, quantity, category, barcode } = req.body;
    try {
      const result = db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)").run(name, price, quantity, category, barcode);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, price, quantity, category, barcode } = req.body;
    const { id } = req.params;
    try {
      db.prepare("UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, barcode = ? WHERE id = ?").run(name, price, quantity, category, barcode, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    // Check if product was sold
    const sold = db.prepare("SELECT count(*) as count FROM sale_items WHERE product_id = ?").get(id) as { count: number };
    if (sold.count > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete product that has sales history" });
    }
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Sales API
  app.post("/api/checkout", (req, res) => {
    const { userId, items, total } = req.body;
    
    const transaction = db.transaction(() => {
      const saleResult = db.prepare("INSERT INTO sales (user_id, total) VALUES (?, ?)").run(userId, total);
      const saleId = saleResult.lastInsertRowid;

      for (const item of items) {
        // Update inventory
        const product = db.prepare("SELECT quantity FROM products WHERE id = ?").get(item.id) as any;
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
        db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(item.quantity, item.id);
        
        // Record sale item
        db.prepare("INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)").run(saleId, item.id, item.quantity, item.price);
      }
      return saleId;
    });

    try {
      const saleId = transaction();
      res.json({ success: true, saleId });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.get("/api/sales", (req, res) => {
    const sales = db.prepare(`
      SELECT s.*, u.username as cashier 
      FROM sales s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.timestamp DESC
    `).all();
    res.json(sales);
  });

  app.get("/api/sales/:id", (req, res) => {
    const items = db.prepare(`
      SELECT si.*, p.name 
      FROM sale_items si 
      JOIN products p ON si.product_id = p.id 
      WHERE si.sale_id = ?
    `).get(req.params.id);
    res.json(items);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
