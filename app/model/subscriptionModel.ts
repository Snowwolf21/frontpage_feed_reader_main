import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    feedUrl: {
        type: String,
        required: true
    },
    siteUrl: {
        type: String
    },
    description: {
        type: String
    },
    category: {
        type: String,
        default: 'General'
    }
});

// Ensure a user cannot duplicate a subscription to the exact same feed URL
subscriptionSchema.index({ userId: 1, feedUrl: 1 }, { unique: true });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
