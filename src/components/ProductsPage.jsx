import React, { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom';

    function ProductsPage() {
      const [products, setProducts] = useState([]);
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

      return (
        <div className="container">
          <h2>Products</h2>
          {error && <div className="error">{error}</div>}
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.imageUrl} alt={product.name} />
                <h4>{product.name}</h4>
                <p>Price: ${product.price}</p>
                <Link to={`/products/${product.id}`} className="btn">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      );
    }

    export default ProductsPage;
