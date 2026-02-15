import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stripe_payment_intent_id: { type: String, required: true },
    amount: { type: Number, required: true }, // in cents
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'canceled'], default: 'pending' },
    plan: { type: String, default: 'pro' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const Payment = mongoose.model('Payment', paymentSchema);
