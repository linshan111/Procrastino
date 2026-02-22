package com.procrastino.app.data.api.models

data class AIChatRequest(val messages: List<AIChatMessage>)
data class AIChatMessage(val role: String, val content: String)
data class AIChatResponse(val reply: String? = null, val error: String? = null)

data class CreatePlanTasksRequest(val tasks: List<PlanTask>)
data class PlanTask(
    val title: String,
    val description: String = "",
    val focusDuration: Int = 25,
    val microTasks: List<MicroTaskInput> = emptyList()
)

data class CreatePlanTasksResponse(val created: Int = 0, val error: String? = null)

data class FocusStartRequest(val taskId: String, val duration: Int)
data class FocusCompleteRequest(val sessionId: String, val tabSwitches: Int = 0, val completed: Boolean = true)
data class FocusResponse(val session: FocusSessionData? = null, val error: String? = null)
data class FocusCompleteResponse(
    val xpEarned: Int = 0,
    val roast: String? = null,
    val error: String? = null
)

data class FocusSessionData(
    val _id: String = "",
    val taskId: String = "",
    val duration: Int = 0,
    val startedAt: String = ""
)

data class GamificationResponse(val user: UserData? = null, val error: String? = null)
