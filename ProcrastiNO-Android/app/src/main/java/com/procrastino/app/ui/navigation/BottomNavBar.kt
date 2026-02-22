package com.procrastino.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.procrastino.app.ui.theme.Purple
import com.procrastino.app.ui.theme.TextMuted
import com.procrastino.app.ui.theme.DarkBgSecondary

data class BottomNavItem(val route: String, val label: String, val icon: ImageVector)

val bottomNavItems = listOf(
    BottomNavItem("dashboard", "Home", Icons.Default.Home),
    BottomNavItem("tasks", "Tasks", Icons.Default.Checklist),
    BottomNavItem("focus", "Focus", Icons.Default.Timer),
    BottomNavItem("leaderboard", "Rank", Icons.Default.EmojiEvents),
    BottomNavItem("ai-planner", "AI", Icons.Default.SmartToy),
)

@Composable
fun BottomNavBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(containerColor = DarkBgSecondary) {
        bottomNavItems.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                selected = currentRoute == item.route,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            popUpTo("dashboard") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Purple,
                    selectedTextColor = Purple,
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted,
                    indicatorColor = Purple.copy(alpha = 0.15f)
                )
            )
        }
    }
}
