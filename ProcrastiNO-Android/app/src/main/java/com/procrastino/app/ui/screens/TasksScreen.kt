package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.*
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun TasksScreen(onStartFocus: (String) -> Unit) {
    var tasks by remember { mutableStateOf<List<TaskData>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var showDialog by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun refreshTasks() {
        scope.launch {
            try {
                val res = RetrofitClient.getApi().getTasks()
                if (res.isSuccessful) tasks = res.body()?.tasks ?: emptyList()
            } catch (_: Exception) {}
            loading = false
        }
    }

    LaunchedEffect(Unit) { refreshTasks() }

    Box(Modifier.fillMaxSize().background(DarkBg)) {
        Column(Modifier.fillMaxSize().padding(20.dp)) {
            Text("📋 Tasks", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary)
            Spacer(Modifier.height(16.dp))

            if (loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Purple)
                }
            } else if (tasks.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No tasks yet. Tap + to create one!", color = TextMuted)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), contentPadding = PaddingValues(bottom = 100.dp)) {
                    items(tasks, key = { it._id }) { task ->
                        TaskCard(task, onDelete = {
                            scope.launch {
                                try { RetrofitClient.getApi().deleteTask(task._id); refreshTasks() } catch (_: Exception) {}
                            }
                        }, onStartFocus = { onStartFocus(task._id) })
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = { showDialog = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp, 90.dp),
            containerColor = Purple,
            contentColor = TextPrimary
        ) {
            Icon(Icons.Default.Add, "Add Task")
        }
    }

    if (showDialog) {
        CreateTaskDialog(onDismiss = { showDialog = false }, onCreate = { showDialog = false; refreshTasks() })
    }
}

@Composable
fun TaskCard(task: TaskData, onDelete: () -> Unit, onStartFocus: () -> Unit) {
    val isCompleted = task.status == "completed"
    Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = DarkBgSecondary)) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                val icon = when (task.status) { "completed" -> "✅"; "abandoned" -> "❌"; "active" -> "⏱️"; else -> "📌" }
                Text(icon, fontSize = 18.sp)
                Spacer(Modifier.width(10.dp))
                Text(
                    task.title, fontWeight = FontWeight.SemiBold, color = if (isCompleted) SuccessGreen else TextPrimary,
                    textDecoration = if (isCompleted) TextDecoration.LineThrough else null,
                    modifier = Modifier.weight(1f)
                )
                Text("${task.focusDuration}m", color = TextMuted, fontSize = 12.sp)
            }
            if (task.description.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Text(task.description, color = TextSecondary, fontSize = 13.sp, maxLines = 2)
            }
            if (task.microTasks.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                task.microTasks.forEach { mt ->
                    Text(
                        "• ${mt.text}",
                        color = if (mt.completed) SuccessGreen else TextMuted,
                        fontSize = 12.sp,
                        textDecoration = if (mt.completed) TextDecoration.LineThrough else null
                    )
                }
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (task.status == "pending") {
                    Button(onClick = onStartFocus, shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Purple), contentPadding = PaddingValues(12.dp, 8.dp)) {
                        Text("▶ Focus", fontSize = 13.sp)
                    }
                }
                IconButton(onClick = onDelete) { Icon(Icons.Default.Delete, "Delete", tint = DangerRed) }
            }
        }
    }
}

@Composable
fun CreateTaskDialog(onDismiss: () -> Unit, onCreate: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("25") }
    var microTaskText by remember { mutableStateOf("") }
    var microTasks by remember { mutableStateOf<List<String>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = Purple, unfocusedBorderColor = DarkBorder,
        focusedContainerColor = DarkBgInput, unfocusedContainerColor = DarkBgInput,
        focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary,
        focusedLabelColor = Purple, unfocusedLabelColor = TextMuted
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkBgSecondary,
        title = { Text("Create Task", color = TextPrimary, fontWeight = FontWeight.Bold) },
        text = {
            Column {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") },
                    singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp), colors = fieldColors)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp), colors = fieldColors)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = duration, onValueChange = { duration = it.filter { c -> c.isDigit() } },
                    label = { Text("Duration (min)") }, singleLine = true, modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp), colors = fieldColors)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(value = microTaskText, onValueChange = { microTaskText = it },
                        label = { Text("Add micro-task") }, singleLine = true, modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp), colors = fieldColors)
                    Spacer(Modifier.width(8.dp))
                    Button(onClick = { if (microTaskText.isNotBlank()) { microTasks = microTasks + microTaskText; microTaskText = "" } },
                        shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = Purple),
                        contentPadding = PaddingValues(12.dp, 8.dp)) { Text("+") }
                }
                microTasks.forEach { Text("• $it", color = TextMuted, fontSize = 12.sp) }
            }
        },
        confirmButton = {
            Button(onClick = {
                if (title.isBlank()) return@Button
                loading = true
                scope.launch {
                    try {
                        RetrofitClient.getApi().createTask(CreateTaskRequest(
                            title = title.trim(), description = description.trim(),
                            focusDuration = duration.toIntOrNull() ?: 25,
                            microTasks = microTasks.map { MicroTaskInput(it) }
                        ))
                        onCreate()
                    } catch (_: Exception) {}
                    loading = false
                }
            }, colors = ButtonDefaults.buttonColors(containerColor = Purple), enabled = !loading) {
                Text(if (loading) "Creating..." else "Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextMuted) }
        }
    )
}
