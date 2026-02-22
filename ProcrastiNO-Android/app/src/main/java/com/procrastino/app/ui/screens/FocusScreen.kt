package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.FocusCompleteRequest
import com.procrastino.app.data.api.models.FocusStartRequest
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun FocusScreen(taskId: String?, onFinish: () -> Unit) {
    var sessionId by remember { mutableStateOf<String?>(null) }
    var totalSeconds by remember { mutableIntStateOf(25 * 60) }
    var remainingSeconds by remember { mutableIntStateOf(25 * 60) }
    var isRunning by remember { mutableStateOf(false) }
    var isCompleted by remember { mutableStateOf(false) }
    var xpEarned by remember { mutableIntStateOf(0) }
    var roast by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    // Auto-countdown
    LaunchedEffect(isRunning) {
        while (isRunning && remainingSeconds > 0) {
            delay(1000)
            remainingSeconds--
        }
        if (isRunning && remainingSeconds <= 0) {
            isRunning = false
            // Auto-complete
            if (sessionId != null) {
                try {
                    val res = RetrofitClient.getApi().completeFocus(
                        FocusCompleteRequest(sessionId!!, 0, true)
                    )
                    if (res.isSuccessful) {
                        xpEarned = res.body()?.xpEarned ?: 0
                        isCompleted = true
                    }
                } catch (_: Exception) {}
            } else {
                isCompleted = true
            }
        }
    }

    Box(Modifier.fillMaxSize().background(DarkBg), contentAlignment = Alignment.Center) {
        if (isCompleted) {
            // Completion screen
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                Text("🎉", fontSize = 64.sp)
                Spacer(Modifier.height(16.dp))
                Text("Session Complete!", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = SuccessGreen)
                Spacer(Modifier.height(8.dp))
                Text("+$xpEarned XP earned", color = AccentGold, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                if (roast != null) {
                    Spacer(Modifier.height(16.dp))
                    Text(roast!!, color = TextMuted, fontSize = 14.sp)
                }
                Spacer(Modifier.height(32.dp))
                Button(onClick = onFinish, shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Purple)) {
                    Text("Back to Tasks", fontWeight = FontWeight.Bold)
                }
            }
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                Text("⏱️ Focus Mode", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
                Spacer(Modifier.height(40.dp))

                // Timer circle
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = { remainingSeconds.toFloat() / totalSeconds },
                        modifier = Modifier.size(220.dp),
                        color = Purple,
                        trackColor = DarkBgSecondary,
                        strokeWidth = 8.dp
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        val min = remainingSeconds / 60
                        val sec = remainingSeconds % 60
                        Text(
                            String.format("%02d:%02d", min, sec),
                            fontSize = 48.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary
                        )
                        Text(
                            if (isRunning) "Stay focused!" else "Ready?",
                            color = TextMuted, fontSize = 14.sp
                        )
                    }
                }

                Spacer(Modifier.height(40.dp))

                if (!isRunning) {
                    // Duration selector (before start)
                    if (sessionId == null) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            listOf(15, 25, 45, 60).forEach { mins ->
                                val selected = totalSeconds == mins * 60
                                Button(
                                    onClick = { totalSeconds = mins * 60; remainingSeconds = mins * 60 },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (selected) Purple else DarkBgSecondary
                                    ),
                                    contentPadding = PaddingValues(14.dp, 10.dp)
                                ) { Text("${mins}m", fontSize = 14.sp, color = if (selected) TextPrimary else TextMuted) }
                            }
                        }
                        Spacer(Modifier.height(24.dp))
                    }

                    Button(
                        onClick = {
                            isRunning = true
                            if (taskId != null && sessionId == null) {
                                scope.launch {
                                    try {
                                        val res = RetrofitClient.getApi().startFocus(
                                            FocusStartRequest(taskId, totalSeconds / 60)
                                        )
                                        if (res.isSuccessful) sessionId = res.body()?.session?._id
                                    } catch (_: Exception) {}
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Purple)
                    ) { Text("▶ Start Focusing", fontWeight = FontWeight.Bold, fontSize = 18.sp) }
                } else {
                    // Abandon button
                    Button(
                        onClick = {
                            isRunning = false
                            scope.launch {
                                if (sessionId != null) {
                                    try {
                                        val res = RetrofitClient.getApi().completeFocus(
                                            FocusCompleteRequest(sessionId!!, 0, false)
                                        )
                                        roast = res.body()?.roast
                                        xpEarned = res.body()?.xpEarned ?: 0
                                    } catch (_: Exception) {}
                                }
                                isCompleted = true
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
                    ) { Text("✋ Give Up", fontWeight = FontWeight.Bold, fontSize = 18.sp) }
                }

                if (error.isNotEmpty()) {
                    Spacer(Modifier.height(12.dp))
                    Text(error, color = DangerRed, fontSize = 13.sp)
                }
            }
        }
    }
}
