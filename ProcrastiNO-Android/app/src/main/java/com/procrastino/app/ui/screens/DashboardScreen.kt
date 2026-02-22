package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.UserData
import com.procrastino.app.data.api.models.TaskData
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen() {
    var user by remember { mutableStateOf<UserData?>(null) }
    var recentTasks by remember { mutableStateOf<List<TaskData>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val meRes = RetrofitClient.getApi().getMe()
                if (meRes.isSuccessful) user = meRes.body()?.user
                val tasksRes = RetrofitClient.getApi().getTasks()
                if (tasksRes.isSuccessful) recentTasks = tasksRes.body()?.tasks?.take(5) ?: emptyList()
            } catch (_: Exception) {}
            loading = false
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().background(DarkBg).verticalScroll(rememberScrollState()).padding(20.dp)
    ) {
        // Header
        Text("Welcome back, ${user?.name ?: "..."} 👋", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
        Text("Ready to crush some tasks today?", color = TextMuted, fontSize = 14.sp)
        Spacer(Modifier.height(24.dp))

        // Stats Cards
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("⭐ XP", "${user?.xp ?: 0}", Modifier.weight(1f))
            StatCard("🔥 Streak", "${user?.currentStreak ?: 0} days", Modifier.weight(1f))
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("⏱️ Focus", "${user?.totalFocusMinutes ?: 0} min", Modifier.weight(1f))
            StatCard("🏆 Best", "${user?.longestStreak ?: 0} days", Modifier.weight(1f))
        }
        Spacer(Modifier.height(24.dp))

        // Avatar Section
        val avatarEmoji = getAvatarEmoji(user?.xp ?: 0)
        val avatarName = getAvatarName(user?.xp ?: 0)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkBgSecondary)
        ) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🎮 Your Avatar", fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(Modifier.height(12.dp))
                Text(avatarEmoji, fontSize = 48.sp)
                Text(avatarName, color = Purple, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
        Spacer(Modifier.height(24.dp))

        // Recent Tasks
        Text("📋 Recent Tasks", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 16.sp)
        Spacer(Modifier.height(12.dp))
        if (recentTasks.isEmpty()) {
            Text("No tasks yet. Create one to get started!", color = TextMuted, fontSize = 14.sp)
        } else {
            recentTasks.forEach { task ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkBgSecondary)
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        val icon = when (task.status) {
                            "completed" -> "✅"; "abandoned" -> "❌"; else -> "📌"
                        }
                        Text(icon, fontSize = 16.sp)
                        Spacer(Modifier.width(10.dp))
                        Text(task.title, color = TextPrimary, fontSize = 14.sp, modifier = Modifier.weight(1f))
                        Text("${task.focusDuration}m", color = TextMuted, fontSize = 12.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(80.dp)) // bottom nav padding
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = DarkBgSecondary)) {
        Column(Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, color = TextMuted)
            Spacer(Modifier.height(6.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
        }
    }
}

fun getAvatarEmoji(xp: Int): String = when {
    xp >= 1500 -> "👑"; xp >= 500 -> "⚡"; xp >= 100 -> "🎯"; else -> "🦥"
}

fun getAvatarName(xp: Int): String = when {
    xp >= 1500 -> "Productivity God"; xp >= 500 -> "Disciplined"; xp >= 100 -> "Focused"; else -> "Lazy"
}
