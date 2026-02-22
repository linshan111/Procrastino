import mongoose from 'mongoose';

const FocusSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    plannedDuration: { type: Number, required: true }, // minutes
    actualFocusTime: { type: Number, default: 0 }, // seconds
    tabSwitches: { type: Number, default: 0 },
    warnings: [{ type: String }],
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
    },
    xpEarned: { type: Number, default: 0 },
});

FocusSessionSchema.index({ userId: 1, status: 1 });

export default mongoose.models.FocusSession || mongoose.model('FocusSession', FocusSessionSchema);
