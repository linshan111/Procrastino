import mongoose from 'mongoose';

const MicroTaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
}, { _id: true });

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    microTasks: [MicroTaskSchema],
    focusDuration: { type: Number, required: true }, // minutes
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'abandoned'],
        default: 'pending',
    },
    category: { type: String, default: 'general' },
    xpEarned: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
});

TaskSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
