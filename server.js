import express from 'express';
    import sqlite3 from 'sqlite3';
    import { open } from 'sqlite';
    import crypto from 'crypto';
    import Stripe from 'stripe';

    const stripe = new Stripe('sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX'); // Replace with your actual Stripe secret key
    const app = express();
    const port = 3001;

    app.use(express.json());

    let db;

    async function initializeDatabase() {
      db = await open({
        filename: './ecommerce.db',
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          isAdmin INTEGER DEFAULT 0
        );
      `);

      await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          imageUrl TEXT NOT NULL
        );
      `);

      const adminUser = await db.get('SELECT * FROM users WHERE username = ?', 'admin');
      if (!adminUser) {
        const hashedPassword = crypto.createHash('sha256').update('admin').digest('hex');
        await db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', 'admin', hashedPassword, 1);
      }
    }

    initializeDatabase();

    app.post('/api/login', async (req, res) => {
      const { username, password, isAdminLogin } = req.body;

      const user = await db.get('SELECT * FROM users WHERE username = ?', username);

      if (!user) {
        return res.status(401).send('Invalid username or password');
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      if (hashedPassword !== user.password) {
        return res.status(401).send('Invalid username or password');
      }

      if (isAdminLogin && !user.isAdmin) {
        return res.status(403).send('Admin access denied');
      }

      res.json({ isAdmin: user.isAdmin === 1 });
    });

    app.get('/api/products', async (req, res) => {
      const products = await db.all('SELECT * FROM products');
      res.json(products);
    });

    app.get('/api/products/:id', async (req, res) => {
      const { id } = req.params;
      const product = await db.get('SELECT * FROM products WHERE id = ?', id);
      if (!product) {
        return res.status(404).send('Product not found');
      }
      res.json(product);
    });

    app.post('/api/products', async (req, res) => {
      const { name, description, price, imageUrl } = req.body;
      try {
        const result = await db.run(
          'INSERT INTO products (name, description, price, imageUrl) VALUES (?, ?, ?, ?)',
          name,
          description,
          price,
          imageUrl,
        );
        res.status(201).json({ id: result.lastID, name, description, price, imageUrl });
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    app.put('/api/products/:id', async (req, res) => {
      const { id } = req.params;
      const { name, description, price, imageUrl } = req.body;
      try {
        await db.run(
          'UPDATE products SET name = ?, description = ?, price = ?, imageUrl = ? WHERE id = ?',
          name,
          description,
          price,
          imageUrl,
          id,
        );
        res.json({ id, name, description, price, imageUrl });
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    app.delete('/api/products/:id', async (req, res) => {
      const { id } = req.params;
      try {
        await db.run('DELETE FROM products WHERE id = ?', id);
        res.status(204).send();
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    app.post('/api/create-payment-intent', async (req, res) => {
      const { paymentMethodId, amount, shipping } = req.body;

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          shipping: {
            name: shipping.name,
            address: {
              line1: shipping.address,
              city: shipping.city,
              state: shipping.state,
              postal_code: shipping.zip,
            },
          },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
