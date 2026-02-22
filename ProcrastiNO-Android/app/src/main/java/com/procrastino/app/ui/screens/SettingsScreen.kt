package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.UserData
import com.procrastino.app.data.local.TokenManager
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(tokenManager: TokenManager, onLogout: () -> Unit) {
    var user by remember { mutableStateOf<UserData?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        try {
            val res = RetrofitClient.getApi().getMe()
            if (res.isSuccessful) user = res.body()?.user
        } catch (_: Exception) {}
    }

    Column(
        Modifier.fillMaxSize().background(DarkBg).padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("⚙️ Settings", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
        Spacer(Modifier.height(32.dp))

        // Profile card
        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = DarkBgSecondary),
            modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(getAvatarEmoji(user?.xp ?: 0), fontSize = 48.sp)
                Spacer(Modifier.height(8.dp))
                Text(user?.name ?: "...", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
                Text(user?.email ?: "", color = TextMuted, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Text("${user?.xp ?: 0} XP • ${getAvatarName(user?.xp ?: 0)}", color = Purple, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(Modifier.height(24.dp))

        // Stats
        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = DarkBgSecondary),
            modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(20.dp)) {
                Text("📊 Your Stats", fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(Modifier.height(12.dp))
                SettingsRow("Total Focus", "${user?.totalFocusMinutes ?: 0} minutes")
                SettingsRow("Current Streak", "${user?.currentStreak ?: 0} days")
                SettingsRow("Longest Streak", "${user?.longestStreak ?: 0} days")
            }
        }

        Spacer(Modifier.weight(1f))

        // Logout
        Button(
            onClick = {
                scope.launch {
                    tokenManager.clear()
                    onLogout()
                }
            },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
        ) {
            Text("🚪 Log Out", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
        Spacer(Modifier.height(80.dp))
    }
}

@Composable
fun SettingsRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = TextSecondary, fontSize = 14.sp)
        Text(value, color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
    }
}
