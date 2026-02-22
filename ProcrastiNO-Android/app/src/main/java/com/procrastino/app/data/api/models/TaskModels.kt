package com.procrastino.app.data.api.models

data class TasksResponse(val tasks: List<TaskData> = emptyList())

data class CreateTaskRequest(
    val title: String,
    val description: String = "",
    val focusDuration: Int,
    val microTasks: List<MicroTaskInput> = emptyList(),
    val category: String = "general"
)

data class MicroTaskInput(val text: String)

data class TaskData(
    val _id: String = "",
    val title: String = "",
    val description: String = "",
    val microTasks: List<MicroTaskData> = emptyList(),
    val focusDuration: Int = 25,
    val status: String = "pending",
    val category: String = "general",
    val xpEarned: Int = 0,
    val createdAt: String = ""
)

data class MicroTaskData(
    val _id: String = "",
    val text: String = "",
    val completed: Boolean = false
)

data class TaskResponse(val task: TaskData? = null, val error: String? = null)

data class UpdateTaskRequest(
    val status: String? = null,
    val microTasks: List<MicroTaskData>? = null
)
