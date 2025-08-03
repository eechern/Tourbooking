/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51RqFAMLclz1AZ5Lx5lyFFjKmrRw59ZPbt2Sb6R0zqdZcfYBzfj4IzFDzeXjqwHQ4CLlSGnzJ9BPCkVFLg1ti65mF00KpOBlfPb'
    );
    //1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session, stripe);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
