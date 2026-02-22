package com.procrastino.app.data.api.models

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)

data class AuthResponse(
    val token: String? = null,
    val user: UserData? = null,
    val error: String? = null
)

data class MeResponse(
    val user: UserData? = null,
    val error: String? = null
)

data class UserData(
    val _id: String = "",
    val name: String = "",
    val email: String = "",
    val xp: Int = 0,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val totalFocusMinutes: Int = 0,
    val punishmentPrefs: PunishmentPrefs? = null
)

data class PunishmentPrefs(
    val loseStreak: Boolean = true,
    val deductPoints: Boolean = true,
    val roast: Boolean = true,
    val annoyingEffect: Boolean = true,
    val donationMock: Boolean = true
)
