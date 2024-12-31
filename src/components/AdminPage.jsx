import React, { useState, useEffect } from 'react';

    function AdminPage() {
      const [products, setProducts] = useState([]);
      const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
      });
      const [editProduct, setEditProduct] = useState(null);
      const [error, setError] = useState('');

      useEffect(() => {
        fetchProducts();
      }, []);

      const fetchProducts = async () => {
        try {
          const response = await fetch('/api/products');
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          const data = await response.json();
          setProducts(data);
        } catch (err) {
          setError(err.message);
        }
      };

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
      };

      const handleAddProduct = async (e) => {
        e.preventDefault();
        setError('');

        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
          });

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Failed to add product');
          }

          fetchProducts();
          setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
        } catch (err) {
          setError(err.message);
        }
      };

      const handleEditProduct = (product) => {
        setEditProduct(product);
        setNewProduct({ ...product });
      };

      const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setError('');

        try {
          const response = await fetch(`/api/products/${editProduct.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
          });

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Failed to update product');
          }

          fetchProducts();
          setEditProduct(null);
          setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
        } catch (err) {
          setError(err.message);
        }
      };

      const handleDeleteProduct = async (id) => {
        setError('');
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Failed to delete product');
          }

          fetchProducts();
        } catch (err) {
          setError(err.message);
        }
      };

      return (
        <div className="container">
          <h2>Admin Panel</h2>
          <h3>Add/Edit Product</h3>
          <form onSubmit={editProduct ? handleUpdateProduct : handleAddProduct}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={newProduct.imageUrl}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn">
              {editProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editProduct && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEditProduct(null);
                  setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    imageUrl: '',
                  });
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
          <h3>Product List</h3>
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.imageUrl} alt={product.name} />
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <button className="btn" onClick={() => handleEditProduct(product)}>
                  Edit
                </button>
                <button className="btn" onClick={() => handleDeleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    export default AdminPage;
