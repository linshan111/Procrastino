export const AVATAR_LEVELS = [
    { level: 1, name: 'Lazy', minXP: 0, emoji: '🦥' },
    { level: 2, name: 'Focused', minXP: 100, emoji: '🎯' },
    { level: 3, name: 'Disciplined', minXP: 500, emoji: '⚡' },
    { level: 4, name: 'Productivity God', minXP: 1500, emoji: '👑' },
];

export function getAvatarLevel(xp) {
    for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= AVATAR_LEVELS[i].minXP) return AVATAR_LEVELS[i];
    }
    return AVATAR_LEVELS[0];
}

export function getNextLevel(xp) {
    const current = getAvatarLevel(xp);
    const nextIdx = AVATAR_LEVELS.findIndex((l) => l.level === current.level) + 1;
    if (nextIdx >= AVATAR_LEVELS.length) return null;
    return AVATAR_LEVELS[nextIdx];
}

export const XP_RULES = {
    PER_FOCUS_MINUTE: 2,
    COMPLETE_ALL_MICROTASKS: 20,
    COMPLETE_TASK: 10,
    ABANDON_SESSION: -10,
    EXCESSIVE_TAB_SWITCHES: -5,
};

export const TAB_SWITCH_THRESHOLD = 5;

export const SESSION_TIMEOUT_MINUTES = 30;

export const WARNING_MESSAGES = [
    "Running away again? 🏃",
    "Your future self is disappointed. 😤",
    "That's your 3rd escape. Seriously? 💀",
    "Procrastination won't finish this task.",
    "Every second you waste is XP lost.",
    "Get back to work. NOW. 🔥",
    "You were so close. Don't quit.",
    "The leaderboard doesn't care about your excuses.",
];

export const FALLBACK_ROASTS = [
    "Congratulations, you played yourself. Again.",
    "Your procrastination has procrastination.",
    "Even your tasks are tired of waiting for you.",
    "Breaking news: Local person discovers new way to waste time.",
    "Your streak just died. It had so much potential.",
    "The 'later' you keep promising never comes, does it?",
    "If procrastination was a sport, you'd still find a way to put off training.",
    "Your to-do list just filed a missing person report on you.",
    "Plot twist: The deadline was yesterday.",
    "You've mastered the art of doing absolutely nothing productively.",
    "Your future self just sent a disappointed emoji.",
    "Task abandoned? That's on brand for you.",
    "The focus timer was rooting for you. It's crying now.",
    "Achievement unlocked: Professional Time Waster 🏆",
    "Even your avatar is embarrassed right now.",
    "Speed-running failure is still failure.",
    "Your productivity graph looks like a flatline. Fitting.",
    "I'd say 'try harder' but you'd need to try first.",
    "Your excuses have better work ethic than you.",
    "Somewhere, a deadline is laughing at you.",
];
