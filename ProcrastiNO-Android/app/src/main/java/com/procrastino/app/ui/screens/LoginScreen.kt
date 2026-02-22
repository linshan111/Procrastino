package com.procrastino.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.procrastino.app.data.api.RetrofitClient
import com.procrastino.app.data.api.models.LoginRequest
import com.procrastino.app.data.local.TokenManager
import com.procrastino.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    tokenManager: TokenManager,
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier.fillMaxSize().background(DarkBg),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(32.dp).widthIn(max = 400.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("ProcrastiNO", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Purple)
            Spacer(Modifier.height(4.dp))
            Text("You can scroll... after you finish.", color = TextMuted, fontSize = 13.sp)
            Spacer(Modifier.height(40.dp))

            Text("Welcome back", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Purple,
                    unfocusedBorderColor = DarkBorder,
                    focusedContainerColor = DarkBgInput,
                    unfocusedContainerColor = DarkBgInput,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedLabelColor = Purple,
                    unfocusedLabelColor = TextMuted
                )
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Purple,
                    unfocusedBorderColor = DarkBorder,
                    focusedContainerColor = DarkBgInput,
                    unfocusedContainerColor = DarkBgInput,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedLabelColor = Purple,
                    unfocusedLabelColor = TextMuted
                )
            )
            Spacer(Modifier.height(20.dp))

            if (error.isNotEmpty()) {
                Text(error, color = DangerRed, fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
            }

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        error = "Please fill in all fields"
                        return@Button
                    }
                    loading = true
                    error = ""
                    scope.launch {
                        try {
                            val res = RetrofitClient.getApi().login(LoginRequest(email.trim(), password))
                            if (res.isSuccessful && res.body()?.token != null) {
                                tokenManager.saveToken(res.body()!!.token!!)
                                res.body()?.user?.name?.let { tokenManager.saveUserName(it) }
                                onLoginSuccess()
                            } else {
                                error = res.body()?.error ?: "Invalid credentials"
                            }
                        } catch (e: Exception) {
                            error = "Network error. Is the server running?"
                        }
                        loading = false
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Purple),
                enabled = !loading
            ) {
                if (loading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = TextPrimary, strokeWidth = 2.dp)
                else Text("Sign In", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }

            Spacer(Modifier.height(20.dp))

            Row {
                Text("Don't have an account? ", color = TextMuted, fontSize = 14.sp)
                Text(
                    "Sign Up",
                    color = Purple,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    modifier = Modifier.clickable { onNavigateToRegister() }
                )
            }
        }
    }
}
