"use strict";
const form = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#submit-button");
const buttonLabel = document.querySelector("#button-label");
const errorElement = document.querySelector("#login-error");
const togglePassword = document.querySelector("#toggle-password");
function showError(message) {
    if (!errorElement)
        return;
    errorElement.textContent = message;
    errorElement.hidden = false;
}
function clearError() {
    if (!errorElement)
        return;
    errorElement.textContent = "";
    errorElement.hidden = true;
}
function setLoading(loading) {
    if (submitButton)
        submitButton.disabled = loading;
    if (buttonLabel)
        buttonLabel.textContent = loading ? "Memverifikasi akun..." : "Masuk ke Dashboard";
}
function isLoginResponse(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const data = value;
    return (typeof data.id === "number" &&
        typeof data.accessToken === "string" &&
        data.accessToken.length > 0 &&
        typeof data.firstName === "string");
}
function isUserDetail(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const data = value;
    return (data.role === "admin" ||
        data.role === "moderator" ||
        data.role === "user");
}
function destinationForRole(role) {
    return role === "admin" || role === "moderator" ? "index.html" : "ambil-antrian.html";
}
const savedToken = localStorage.getItem("accessToken");
const savedRole = localStorage.getItem("role");
if (savedToken && (savedRole === "admin" || savedRole === "moderator" || savedRole === "user")) {
    window.location.replace(destinationForRole(savedRole));
}
togglePassword?.addEventListener("click", () => {
    if (!passwordInput)
        return;
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.textContent = isHidden ? "Tutup" : "Lihat";
    togglePassword.setAttribute("aria-pressed", String(isHidden));
    togglePassword.setAttribute("aria-label", isHidden ? "Sembunyikan password" : "Tampilkan password");
});
form?.addEventListener("submit", async (event) => {
    event.preventDefault(); // mencegah form refresh halaman
    clearError();
    const username = usernameInput?.value.trim() ?? "";
    const password = passwordInput?.value ?? "";
    if (!username || !password) {
        showError("Username dan password wajib diisi, ya.");
        return;
    }
    setLoading(true);
    try {
        const response = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, expiresInMins: 60 }),
        });
        if (!response.ok) {
            if (response.status === 400 || response.status === 401) {
                throw new Error("Username atau password tidak cocok. Coba periksa lagi, ya.");
            }
            throw new Error(`Server bermasalah (HTTP ${response.status}). Coba lagi nanti.`);
        }
        const raw = await response.json();
        if (!isLoginResponse(raw)) {
            throw new Error("Respons server tidak sesuai format login.");
        }
        // Ambil role berdasarkan ID pengguna dari server
        const userResponse = await fetch(`https://dummyjson.com/users/${raw.id}`);
        if (!userResponse.ok) {
            throw new Error("Gagal mengambil data pengguna.");
        }
        const userData = await userResponse.json();
        if (!isUserDetail(userData)) {
            throw new Error("Role pengguna tidak ditemukan.");
        }
        // Simpan sesi setelah login dan validasi role berhasil
        localStorage.setItem("accessToken", raw.accessToken);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("firstName", raw.firstName);
        // Arahkan pengguna berdasarkan role
        window.location.replace(destinationForRole(userData.role));
    }
    catch (error) {
        if (error instanceof TypeError) {
            showError("Tidak dapat menghubungi server. Periksa internetmu dan coba lagi.");
        }
        else {
            showError(error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.");
        }
    }
    finally {
        setLoading(false);
    }
});
