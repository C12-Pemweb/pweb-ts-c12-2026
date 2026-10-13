"use strict";
(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    if (!token || !role) {
        window.location.replace("login.html");
        return;
    }
    const JENIS_KEY = "melo:jenis";
    const TIKET_KEY = "melo:tiket";
    const daftarAntrian = document.getElementById("daftar-antrian");
    const userInfo = document.getElementById("user-info");
    const logoutButton = document.getElementById("logout-button");
    const fullscreenButton = document.getElementById("fullscreen-button");
    if (userInfo) {
        const nama = localStorage.getItem("firstName") ?? "Pengguna";
        userInfo.textContent = `${nama} (${role})`;
    }
    logoutButton?.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("firstName");
        window.location.replace("login.html");
    });
    fullscreenButton?.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
        else {
            document.exitFullscreen().catch(() => { });
        }
    });
    document.addEventListener("fullscreenchange", () => {
        if (fullscreenButton) {
            fullscreenButton.textContent = document.fullscreenElement ? "Keluar Layar Penuh" : "Layar Penuh";
        }
    });
    if (!daftarAntrian) {
        return;
    }
    function muatJenis() {
        try {
            const data = JSON.parse(localStorage.getItem(JENIS_KEY) ?? "[]");
            return Array.isArray(data) ? data : [];
        }
        catch {
            return [];
        }
    }
    function muatTiket() {
        try {
            const data = JSON.parse(localStorage.getItem(TIKET_KEY) ?? "[]");
            return Array.isArray(data) ? data : [];
        }
        catch {
            return [];
        }
    }
    function render() {
        const jenisAntrian = muatJenis().filter((jenis) => jenis.aktif);
        const semuaTiket = muatTiket();
        daftarAntrian?.replaceChildren();
        jenisAntrian.forEach((jenis) => {
            const tiketDipanggil = semuaTiket.find((tiket) => tiket.jenisKode === jenis.kode && tiket.status === "dipanggil");
            const jumlahMenunggu = semuaTiket.filter((tiket) => tiket.jenisKode === jenis.kode && tiket.status === "menunggu").length;
            const kartu = document.createElement("div");
            kartu.className = "kartu-antrian";
            const nama = document.createElement("h3");
            nama.textContent = jenis.nama;
            const status = document.createElement("p");
            status.className = tiketDipanggil ? "status dipanggil" : "status";
            status.textContent = tiketDipanggil ? " SEDANG DIPANGGIL " : " BELUM ADA PANGGILAN ";
            const nomor = document.createElement("p");
            nomor.className = "nomor";
            nomor.textContent = tiketDipanggil?.label ?? "-";
            const menunggu = document.createElement("p");
            menunggu.className = "menunggu";
            menunggu.textContent = `${jumlahMenunggu} tiket menunggu`;
            kartu.append(nama, status, nomor, menunggu);
            daftarAntrian?.appendChild(kartu);
        });
    }
    render();
    window.setInterval(render, 3000);
    window.addEventListener("storage", (event) => {
        if (event.key === JENIS_KEY ||
            event.key === TIKET_KEY ||
            event.key === null) {
            render();
        }
    });
})();
