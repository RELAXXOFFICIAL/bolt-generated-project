import React from 'react';
    import { loadStripe } from '@stripe/stripe-js';
    import { Elements } from '@stripe/react-stripe-js';

    const stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX'); // Replace with your actual Stripe publishable key

    export function StripeProvider({ children }) {
      return (
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      );
    }
