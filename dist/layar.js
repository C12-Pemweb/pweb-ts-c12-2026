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
    const userName = document.getElementById("user-name");
    const userRole = document.getElementById("user-role");
    const logoutButton = document.getElementById("logout-button");
    const fullscreenButton = document.getElementById("fullscreen-button");
    const audioButton = document.getElementById("audio-button");
    let suaraAktif = true;
    const idDipanggilSebelumnya = {};
    let inisialisasi = false;
    if (userName) {
        userName.textContent = localStorage.getItem("firstName") ?? "Pengguna";
    }
    if (userRole) {
        userRole.textContent = role;
    }
    if (role === "user") {
        document.querySelectorAll("[data-role='admin']").forEach((el) => {
            el.style.display = "none";
        });
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
    function mainkanChime() {
        return new Promise((resolve) => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) {
                    resolve();
                    return;
                }
                const ctx = new AudioCtx();
                const now = ctx.currentTime;
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = "sine";
                osc1.frequency.setValueAtTime(587.33, now);
                gain1.gain.setValueAtTime(0.25, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.4);
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(880, now + 0.22);
                gain2.gain.setValueAtTime(0.25, now + 0.22);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.22);
                osc2.stop(now + 0.7);
                setTimeout(resolve, 750);
            }
            catch {
                resolve();
            }
        });
    }
    function panggilSuara(label, layanan) {
        mainkanChime().then(() => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                const parts = label.split("-");
                const huruf = parts[0] ?? "";
                const angka = parseInt(parts[1] ?? "0", 10);
                const teks = `Nomor antrian, ${huruf}, ${angka}, menuju ke ${layanan}`;
                const utterance = new SpeechSynthesisUtterance(teks);
                utterance.lang = "id-ID";
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        });
    }
    audioButton?.addEventListener("click", () => {
        suaraAktif = !suaraAktif;
        if (audioButton) {
            audioButton.textContent = suaraAktif ? "🔊 Suara" : "🔇 Bisu";
        }
        if (suaraAktif) {
            mainkanChime();
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
        if (jenisAntrian.length === 0) {
            const kosong = document.createElement("p");
            kosong.textContent = "Belum ada jenis antrian aktif saat ini.";
            daftarAntrian?.appendChild(kosong);
            return;
        }
        jenisAntrian.forEach((jenis) => {
            const tiketDipanggil = semuaTiket.find((tiket) => tiket.jenisKode.toUpperCase() === jenis.kode.toUpperCase() && tiket.status === "dipanggil");
            if (tiketDipanggil) {
                if (inisialisasi && idDipanggilSebelumnya[jenis.kode] !== tiketDipanggil.id) {
                    if (suaraAktif) {
                        panggilSuara(tiketDipanggil.label, jenis.nama);
                    }
                }
                idDipanggilSebelumnya[jenis.kode] = tiketDipanggil.id;
            }
            else {
                delete idDipanggilSebelumnya[jenis.kode];
            }
            const jumlahMenunggu = semuaTiket.filter((tiket) => tiket.jenisKode.toUpperCase() === jenis.kode.toUpperCase() && tiket.status === "menunggu").length;
            const kartu = document.createElement("div");
            kartu.className = "kartu-layar";
            const nama = document.createElement("h3");
            nama.textContent = `${jenis.nama} (${jenis.kode})`;
            const status = document.createElement("p");
            status.className = tiketDipanggil ? "status dipanggil" : "status";
            status.textContent = tiketDipanggil ? "SEDANG DIPANGGIL" : "BELUM ADA PANGGILAN";
            const nomor = document.createElement("p");
            nomor.className = "nomor";
            nomor.textContent = tiketDipanggil?.label ?? "-";
            const menunggu = document.createElement("p");
            menunggu.className = "menunggu";
            menunggu.textContent = `${jumlahMenunggu} tiket menunggu`;
            kartu.append(nama, status, nomor, menunggu);
            daftarAntrian?.appendChild(kartu);
        });
        inisialisasi = true;
    }
    render();
    window.setInterval(render, 3000);
    window.addEventListener("focus", render);
    window.addEventListener("storage", (event) => {
        if (event.key === JENIS_KEY ||
            event.key === TIKET_KEY ||
            event.key === null) {
            render();
        }
    });
})();
