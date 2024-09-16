import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51PyygE00jwMy2lh8bGauAqmhLPzvZ4ooe4GgKa9sp9t1srxZBXg3PzNCw1XhziT7wxBSjTAwaPcaZZ1t5n8UIBnp00sviYjs83');

const AboutDonation = () => {
  const [amount, setAmount] = useState(500); // Default to $5.00 in cents
  const [customAmount, setCustomAmount] = useState(''); // Custom amount entered by user

  const handleDonation = async () => {
    const stripe = await stripePromise;

    // If the user entered a custom amount, validate and convert it to cents
    let finalAmount = amount;
    if (customAmount) {
      const customAmountInCents = parseInt(customAmount) * 100;
      if (customAmountInCents >= 100 && Number.isInteger(customAmountInCents)) {
        finalAmount = customAmountInCents;
      } else {
        alert('Please enter a valid whole dollar amount of at least $1.00.');
        return;
      }
    }

    try {
      // Create a checkout session on your backend
      const { data } = await axios.post('http://localhost:3001/api/stripe/create-checkout-session', {
        amount: finalAmount, // Send the selected or custom amount to the server
      });

      // Redirect the user to the Stripe checkout page
      const result = await stripe.redirectToCheckout({
        sessionId: data.id, // ID from the session creation response
      });

      if (result.error) {
        console.error('Error redirecting to Stripe:', result.error.message);
      }
    } catch (error) {
      console.error('Failed to initiate donation:', error);
    }
  };

  return (
    <div>
      <h1>About Us</h1>
      <p>
        Welcome to our League of Legends Tracker! We are passionate about helping players track their game stats, history, and live matches.
        Our mission is to provide a seamless experience to help you improve your skills and stay updated with your favorite players.
      </p>

      <h2>Support Us</h2>
      <p>
        If you appreciate our service, consider making a donation to support future development and features. Every contribution helps us keep the platform running and improve it for all players.
      </p>

      <div>
        <label>Select an amount:</label>
        <div>
          <button onClick={() => { setAmount(500); setCustomAmount(''); }}>$5.00</button>
          <button onClick={() => { setAmount(1000); setCustomAmount(''); }}>$10.00</button>
          <button onClick={() => { setAmount(2000); setCustomAmount(''); }}>$20.00</button>
        </div>
      </div>

      <div>
        <label>Or enter a custom amount:</label>
        <input
          type="text"
          value={customAmount}
          placeholder="Enter amount in whole dollars"
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
            setCustomAmount(value);
          }}
        />
      </div>

      <p>
        You are about to donate: <strong>{customAmount ? `$${customAmount}` : `$${amount / 100}`}</strong>
      </p>

      <button onClick={handleDonation}>
        Donate {customAmount ? `$${customAmount}` : `$${amount / 100}`} To Our Devs!
      </button>
    </div>
  );
};

export default AboutDonation;
