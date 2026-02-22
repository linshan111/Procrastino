package com.procrastino.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.procrastino.app.data.local.TokenManager
import com.procrastino.app.ui.screens.*

@Composable
fun AppNavigation(
    navController: NavHostController,
    tokenManager: TokenManager,
    isLoggedIn: Boolean,
    onAuthChange: () -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = if (isLoggedIn) "dashboard" else "login"
    ) {
        composable("login") {
            LoginScreen(
                tokenManager = tokenManager,
                onLoginSuccess = {
                    onAuthChange()
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate("register")
                }
            )
        }
        composable("register") {
            RegisterScreen(
                tokenManager = tokenManager,
                onRegisterSuccess = {
                    onAuthChange()
                    navController.navigate("dashboard") {
                        popUpTo("register") { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }
        composable("dashboard") {
            DashboardScreen()
        }
        composable("tasks") {
            TasksScreen(onStartFocus = { taskId ->
                navController.navigate("focus/$taskId")
            })
        }
        composable("focus/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId")
            FocusScreen(taskId = taskId, onFinish = {
                navController.popBackStack()
            })
        }
        composable("focus") {
            FocusScreen(taskId = null, onFinish = {
                navController.navigate("tasks") {
                    popUpTo("focus") { inclusive = true }
                }
            })
        }
        composable("leaderboard") {
            LeaderboardScreen()
        }
        composable("ai-planner") {
            AIPlannerScreen()
        }
        composable("settings") {
            SettingsScreen(tokenManager = tokenManager, onLogout = {
                onAuthChange()
                navController.navigate("login") {
                    popUpTo(0) { inclusive = true }
                }
            })
        }
    }
}
