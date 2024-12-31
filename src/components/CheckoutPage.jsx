import React, { useState } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

    function CheckoutPage() {
      const stripe = useStripe();
      const elements = useElements();
      const location = useLocation();
      const navigate = useNavigate();
      const { product } = location.state || {};
      const [error, setError] = useState('');
      const [shippingAddress, setShippingAddress] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      });

      const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress({ ...shippingAddress, [name]: value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!stripe || !elements) {
          setError('Stripe.js has not loaded yet.');
          return;
        }

        try {
          const cardElement = elements.getElement(CardElement);

          const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
          });

          if (error) {
            setError(error.message);
            return;
          }

          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentMethodId: paymentMethod.id,
              amount: product.price * 100,
              shipping: shippingAddress,
            }),
          });

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Payment failed');
          }

          const { clientSecret } = await response.json();

          const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
            clientSecret,
          );

          if (confirmError) {
            setError(confirmError.message);
            return;
          }

          if (paymentIntent.status === 'succeeded') {
            alert('Payment successful!');
            navigate('/');
          } else {
            setError('Payment failed.');
          }
        } catch (err) {
          setError(err.message);
        }
      };

      if (!product) {
        return <div>No product selected.</div>;
      }

      return (
        <div className="container">
          <h2>Checkout</h2>
          <h3>Product: {product.name}</h3>
          <p>Price: ${product.price}</p>
          <form onSubmit={handleSubmit}>
            <h3>Shipping Address</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={shippingAddress.name}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={shippingAddress.address}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={shippingAddress.city}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={shippingAddress.state}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zip"
                value={shippingAddress.zip}
                onChange={handleShippingChange}
                required
              />
            </div>
            <h3>Payment Details</h3>
            <div className="form-group">
              <CardElement />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn">
              Pay ${product.price}
            </button>
          </form>
        </div>
      );
    }

    export default CheckoutPage;
