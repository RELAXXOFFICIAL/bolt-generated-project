import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';

    function ProductDetails() {
      const { id } = useParams();
      const [product, setProduct] = useState(null);
      const [error, setError] = useState('');
      const navigate = useNavigate();

      useEffect(() => {
        fetchProduct();
      }, [id]);

      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product');
          }
          const data = await response.json();
          setProduct(data);
        } catch (err) {
          setError(err.message);
        }
      };

      const handleCheckout = () => {
        navigate('/checkout', { state: { product } });
      };

      if (!product) {
        return <div>{error || 'Loading...'}</div>;
      }

      return (
        <div className="container">
          <h2>Product Details</h2>
          {error && <div className="error">{error}</div>}
          <div className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button className="btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      );
    }

    export default ProductDetails;
