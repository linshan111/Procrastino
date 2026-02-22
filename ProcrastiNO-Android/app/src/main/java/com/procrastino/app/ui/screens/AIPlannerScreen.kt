package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.*
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

data class ChatMessage(val role: String, val content: String, val isError: Boolean = false)

@Composable
fun AIPlannerScreen() {
    var messages by remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var input by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var creatingTasks by remember { mutableStateOf(false) }
    var successMsg by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = Purple, unfocusedBorderColor = DarkBorder,
        focusedContainerColor = DarkBgInput, unfocusedContainerColor = DarkBgInput,
        focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary,
        focusedLabelColor = Purple, unfocusedLabelColor = TextMuted
    )

    // Parse JSON plan from AI response
    fun parsePlan(content: String): Pair<String, List<PlanTask>?> {
        val regex = Regex("```(?:json)?\\s*(\\{[\\s\\S]*?)(?:```|$)", RegexOption.IGNORE_CASE)
        val match = regex.find(content)
        val jsonStr = match?.groupValues?.get(1)

        if (jsonStr != null) {
            try {
                val gson = com.google.gson.Gson()
                val planMap = gson.fromJson(jsonStr, Map::class.java)
                val tasksList = (planMap["tasks"] as? List<*>)?.mapNotNull { taskObj ->
                    val task = taskObj as? Map<*, *> ?: return@mapNotNull null
                    val micros = (task["microTasks"] as? List<*>)?.mapNotNull { mt ->
                        val m = mt as? Map<*, *> ?: return@mapNotNull null
                        MicroTaskInput(m["text"]?.toString() ?: "")
                    } ?: emptyList()
                    PlanTask(
                        title = task["title"]?.toString() ?: "",
                        description = task["description"]?.toString() ?: "",
                        focusDuration = (task["focusDuration"] as? Double)?.toInt() ?: 25,
                        microTasks = micros
                    )
                }
                val cleanText = content.replace(match.value, "").replace(Regex("```(?:json)?", RegexOption.IGNORE_CASE), "").replace("```", "").trim()
                return cleanText to tasksList
            } catch (_: Exception) {}
        }
        return content.replace(Regex("```(?:json)?", RegexOption.IGNORE_CASE), "").replace("```", "").trim() to null
    }

    Column(Modifier.fillMaxSize().background(DarkBg).padding(20.dp)) {
        Text("🤖 AI Planner", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
        Spacer(Modifier.height(12.dp))

        // Chat messages
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 12.dp)
        ) {
            if (messages.isEmpty()) {
                item {
                    Box(Modifier.fillParentMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("👋 Hello!", fontSize = 20.sp, color = TextMuted)
                            Text("Tell me what goal or exam\nyou want to tackle!", color = TextMuted, fontSize = 14.sp)
                        }
                    }
                }
            }

            items(messages) { msg ->
                val isUser = msg.role == "user"
                val (text, plan) = if (!isUser && !msg.isError) parsePlan(msg.content) else (msg.content to null)

                Column(
                    Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                ) {
                    // Chat bubble
                    if (text.isNotEmpty()) {
                        Card(
                            shape = RoundedCornerShape(16.dp).let {
                                if (isUser) RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp)
                                else RoundedCornerShape(4.dp, 16.dp, 16.dp, 16.dp)
                            },
                            colors = CardDefaults.cardColors(
                                containerColor = if (isUser) Purple
                                else if (msg.isError) DangerRed.copy(alpha = 0.2f)
                                else DarkBgSecondary
                            ),
                            modifier = Modifier.widthIn(max = 300.dp)
                        ) {
                            Text(
                                text, modifier = Modifier.padding(14.dp),
                                color = if (isUser) TextPrimary else if (msg.isError) DangerRed else TextPrimary,
                                fontSize = 14.sp, lineHeight = 20.sp
                            )
                        }
                    }

                    // Plan card
                    if (plan != null && plan.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkBgSecondary),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(Modifier.padding(16.dp)) {
                                Text("📋 Proposed Plan", fontWeight = FontWeight.ExtraBold, color = Purple, fontSize = 18.sp)
                                Spacer(Modifier.height(12.dp))

                                plan.forEachIndexed { idx, task ->
                                    Card(
                                        shape = RoundedCornerShape(10.dp),
                                        colors = CardDefaults.cardColors(containerColor = DarkBg),
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                                    ) {
                                        Column(Modifier.padding(12.dp)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(task.title, fontWeight = FontWeight.SemiBold, color = TextPrimary,
                                                    fontSize = 14.sp, modifier = Modifier.weight(1f))
                                                Text("⏱️ ${task.focusDuration}m", color = Purple, fontSize = 12.sp,
                                                    fontWeight = FontWeight.SemiBold)
                                            }
                                            if (task.description.isNotEmpty()) {
                                                Text(task.description, color = TextSecondary, fontSize = 12.sp, maxLines = 2)
                                            }
                                            task.microTasks.forEach { mt ->
                                                Text("• ${mt.text}", color = TextMuted, fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }

                                Spacer(Modifier.height(8.dp))
                                Button(
                                    onClick = {
                                        creatingTasks = true
                                        scope.launch {
                                            try {
                                                val res = RetrofitClient.getApi().createPlanTasks(CreatePlanTasksRequest(plan))
                                                if (res.isSuccessful) successMsg = "✅ ${res.body()?.created ?: 0} tasks added!"
                                            } catch (_: Exception) { successMsg = "❌ Failed to create tasks" }
                                            creatingTasks = false
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Purple),
                                    enabled = !creatingTasks
                                ) {
                                    Text(
                                        if (creatingTasks) "⏳ Saving..." else "✨ Add to Tasks",
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }

            if (loading) {
                item {
                    Card(
                        shape = RoundedCornerShape(4.dp, 16.dp, 16.dp, 16.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkBgSecondary)
                    ) {
                        Text("🤖 AI is thinking...", Modifier.padding(14.dp), color = TextMuted,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, fontSize = 14.sp)
                    }
                }
            }
        }

        // Scroll to bottom on new messages
        LaunchedEffect(messages.size, loading) {
            if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1 + if (loading) 1 else 0)
        }

        if (successMsg.isNotEmpty()) {
            Text(successMsg, color = if (successMsg.startsWith("✅")) SuccessGreen else DangerRed,
                fontSize = 14.sp, modifier = Modifier.padding(vertical = 4.dp))
        }

        // Input area
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
            OutlinedTextField(
                value = input, onValueChange = { input = it },
                placeholder = { Text("Type your goals here...", color = TextMuted) },
                singleLine = true,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = fieldColors,
                enabled = !loading && !creatingTasks
            )
            Spacer(Modifier.width(8.dp))
            Button(
                onClick = {
                    if (input.isBlank()) return@Button
                    val userMsg = ChatMessage("user", input.trim())
                    messages = messages + userMsg
                    val sendInput = input.trim()
                    input = ""
                    loading = true
                    successMsg = ""
                    scope.launch {
                        try {
                            val apiMessages = messages.map { AIChatMessage(it.role, it.content) }
                            val res = RetrofitClient.getApi().sendAIMessage(AIChatRequest(apiMessages))
                            if (res.isSuccessful && res.body()?.reply != null) {
                                messages = messages + ChatMessage("assistant", res.body()!!.reply!!)
                            } else {
                                messages = messages + ChatMessage("assistant", "❌ ${res.body()?.error ?: "Failed"}", isError = true)
                            }
                        } catch (e: Exception) {
                            messages = messages + ChatMessage("assistant", "❌ Network error", isError = true)
                        }
                        loading = false
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Purple),
                enabled = !loading && input.isNotBlank() && !creatingTasks,
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 14.dp)
            ) { Text("Send", fontWeight = FontWeight.Bold) }
        }
    }
}
