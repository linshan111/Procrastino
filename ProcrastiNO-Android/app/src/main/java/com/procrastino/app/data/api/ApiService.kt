package com.procrastino.app.data.api

import com.procrastino.app.data.api.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // === Auth ===
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("/api/auth/me")
    suspend fun getMe(): Response<MeResponse>

    // === Tasks ===
    @GET("/api/tasks")
    suspend fun getTasks(@Query("status") status: String? = null): Response<TasksResponse>

    @POST("/api/tasks")
    suspend fun createTask(@Body request: CreateTaskRequest): Response<TaskResponse>

    @PATCH("/api/tasks/{id}")
    suspend fun updateTask(@Path("id") id: String, @Body request: UpdateTaskRequest): Response<TaskResponse>

    @DELETE("/api/tasks/{id}")
    suspend fun deleteTask(@Path("id") id: String): Response<Unit>

    // === Focus ===
    @POST("/api/focus")
    suspend fun startFocus(@Body request: FocusStartRequest): Response<FocusResponse>

    @PATCH("/api/focus")
    suspend fun completeFocus(@Body request: FocusCompleteRequest): Response<FocusCompleteResponse>

    // === Leaderboard ===
    @GET("/api/leaderboard")
    suspend fun getLeaderboard(
        @Query("type") type: String = "focus",
        @Query("limit") limit: Int = 20,
        @Query("offset") offset: Int = 0
    ): Response<LeaderboardResponse>

    // === AI Planner ===
    @POST("/api/ai/study-plan")
    suspend fun sendAIMessage(@Body request: AIChatRequest): Response<AIChatResponse>

    @POST("/api/ai/create-plan-tasks")
    suspend fun createPlanTasks(@Body request: CreatePlanTasksRequest): Response<CreatePlanTasksResponse>

    // === Gamification ===
    @GET("/api/gamification")
    suspend fun getGamification(): Response<GamificationResponse>
}
