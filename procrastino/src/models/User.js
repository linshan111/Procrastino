import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    xp: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' }, // YYYY-MM-DD UTC
    totalFocusMinutes: { type: Number, default: 0 },
    punishmentPrefs: {
        type: Object,
        default: {
            loseStreak: true,
            deductPoints: true,
            roast: true,
            annoyingEffect: true,
            donationMock: true,
        },
    },
    createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ totalFocusMinutes: -1 });
UserSchema.index({ currentStreak: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
