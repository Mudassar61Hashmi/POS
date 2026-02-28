import Database from "better-sqlite3";

const db = new Database("inventory.db");

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

// Seed Users
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("cashier", "cashier123", "cashier");
}

// Seed Products
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)")
    .run("Apple", 0.5, 100, "Fruits", "1001");
  db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)")
    .run("Milk", 1.2, 50, "Dairy", "1002");
  db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)")
    .run("Bread", 2.0, 30, "Bakery", "1003");
}

export default db;
