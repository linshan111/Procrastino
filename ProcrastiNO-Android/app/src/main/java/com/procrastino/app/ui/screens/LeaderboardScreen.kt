package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.LeaderboardUser
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LeaderboardScreen() {
    var type by remember { mutableStateOf("focus") }
    var users by remember { mutableStateOf<List<LeaderboardUser>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    fun fetch() {
        loading = true
        scope.launch {
            try {
                val res = RetrofitClient.getApi().getLeaderboard(type = type, limit = 50)
                if (res.isSuccessful) users = res.body()?.users ?: emptyList()
            } catch (_: Exception) {}
            loading = false
        }
    }

    LaunchedEffect(type) { fetch() }

    Column(Modifier.fillMaxSize().background(DarkBg).padding(20.dp)) {
        Text("🏆 Leaderboard", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
        Text("See who's crushing it", color = TextMuted, fontSize = 14.sp)
        Spacer(Modifier.height(16.dp))

        // Tabs
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("focus" to "⏱️ Focus Time", "streak" to "🔥 Streaks").forEach { (key, label) ->
                Button(
                    onClick = { type = key },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (type == key) Purple.copy(alpha = 0.2f) else DarkBgSecondary
                    ),
                    contentPadding = PaddingValues(16.dp, 10.dp)
                ) {
                    Text(label, color = if (type == key) Purple else TextSecondary, fontSize = 14.sp,
                        fontWeight = if (type == key) FontWeight.SemiBold else FontWeight.Normal)
                }
            }
        }
        Spacer(Modifier.height(16.dp))

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Purple)
            }
        } else {
            // Header
            Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
                Text("#", color = TextMuted, fontSize = 12.sp, modifier = Modifier.width(32.dp))
                Text("USER", color = TextMuted, fontSize = 12.sp, modifier = Modifier.weight(1f))
                Text(if (type == "focus") "FOCUS" else "STREAK", color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.width(16.dp))
                Text("XP", color = TextMuted, fontSize = 12.sp)
            }
            HorizontalDivider(color = DarkBorder)

            LazyColumn(contentPadding = PaddingValues(bottom = 80.dp)) {
                itemsIndexed(users) { idx, user ->
                    val bg = if (user.rank <= 3) Purple.copy(alpha = 0.08f - idx * 0.02f) else DarkBg
                    Row(
                        Modifier.fillMaxWidth().background(bg).padding(horizontal = 12.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val rankText = when (user.rank) { 1 -> "🥇"; 2 -> "🥈"; 3 -> "🥉"; else -> "${user.rank}" }
                        Text(rankText, fontSize = 14.sp, modifier = Modifier.width(32.dp))

                        Column(Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(user.avatarLevel?.emoji ?: "🦥", fontSize = 16.sp)
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text(user.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimary)
                                    Text(user.avatarLevel?.name ?: "Lazy", fontSize = 11.sp, color = TextMuted)
                                }
                            }
                        }

                        Text(
                            if (type == "focus") "${user.totalFocusMinutes} min" else "${user.currentStreak} days",
                            fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimary
                        )
                        Spacer(Modifier.width(16.dp))
                        Text("${user.xp}", fontWeight = FontWeight.SemiBold, color = AccentGold, fontSize = 14.sp)
                    }
                    HorizontalDivider(color = DarkBorder.copy(alpha = 0.5f))
                }
            }
        }
    }
}
