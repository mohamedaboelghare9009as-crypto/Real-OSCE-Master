import express from 'express';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Payment } from '../models/Payment';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

// Initialize Stripe (only if key is provided)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Middleware to get user from JWT
const getUserFromToken = async (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId);
        return user;
    } catch {
        return null;
    }
};

// Create payment intent
router.post('/create-intent', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to server/.env' });
    }

    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return res.status(401).json({ error: 'Please log in to make a payment' });
        }

        const { amount = 1999, currency = 'usd' } = req.body;

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user._id.toString(),
                userEmail: user.email
            }
        });

        // Store payment record
        await Payment.create({
            user_id: user._id,
            stripe_payment_intent_id: paymentIntent.id,
            amount,
            currency,
            status: 'pending'
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook to handle payment status updates
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('Stripe webhook secret not configured');
        return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            // Update payment status
            await Payment.findOneAndUpdate(
                { stripe_payment_intent_id: paymentIntent.id },
                { status: 'succeeded', updated_at: new Date() }
            );

            // Upgrade user plan
            const userId = paymentIntent.metadata.userId;
            if (userId) {
                await User.findByIdAndUpdate(userId, { plan: 'Pro' });
            }
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
