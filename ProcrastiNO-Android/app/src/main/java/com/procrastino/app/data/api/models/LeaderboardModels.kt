package com.procrastino.app.data.api.models

data class LeaderboardResponse(
    val users: List<LeaderboardUser> = emptyList(),
    val total: Int = 0,
    val offset: Int = 0,
    val limit: Int = 20
)

data class LeaderboardUser(
    val rank: Int = 0,
    val name: String = "",
    val xp: Int = 0,
    val currentStreak: Int = 0,
    val totalFocusMinutes: Int = 0,
    val avatarLevel: AvatarLevel? = null
)

data class AvatarLevel(
    val level: Int = 1,
    val name: String = "Lazy",
    val minXP: Int = 0,
    val emoji: String = "🦥"
)
