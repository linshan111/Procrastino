package com.procrastino.app

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.local.TokenManager
import com.procrastino.app.ui.navigation.AppNavigation
import com.procrastino.app.ui.navigation.BottomNavBar
import com.procrastino.app.ui.theme.DarkBg
import com.procrastino.app.ui.theme.ProcrastinoTheme
import kotlinx.coroutines.launch

@Composable
fun ProcrastinoApp() {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    var isLoggedIn by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    // Init Retrofit
    LaunchedEffect(Unit) {
        RetrofitClient.init(tokenManager)
        val token = tokenManager.getToken()
        isLoggedIn = token != null
        isLoading = false
    }

    ProcrastinoTheme {
        if (isLoading) return@ProcrastinoTheme

        val navController = rememberNavController()
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route

        val showBottomBar = currentRoute in listOf("dashboard", "tasks", "focus", "leaderboard", "ai-planner", "settings")

        Scaffold(
            containerColor = DarkBg,
            bottomBar = {
                if (showBottomBar) BottomNavBar(navController)
            }
        ) { padding ->
            AppNavigation(
                navController = navController,
                tokenManager = tokenManager,
                isLoggedIn = isLoggedIn,
                onAuthChange = {
                    scope.launch {
                        isLoggedIn = tokenManager.getToken() != null
                    }
                }
            )
        }
    }
}
