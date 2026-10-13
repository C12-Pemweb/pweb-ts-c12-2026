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
    const kontainer = document.getElementById("pilihan-ambil-antrian");
    const notifikasiTiket = document.getElementById("tiket-terbaru");
    const userInfo = document.getElementById("user-info");
    const logoutButton = document.getElementById("logout-button");
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
    function muatJenis() {
        try {
            const data = JSON.parse(localStorage.getItem(JENIS_KEY) ?? "[]");
            return Array.isArray(data) ? data : [];
        }
        catch {
            return [];
        }
    }
    function simpanJenis(data) {
        localStorage.setItem(JENIS_KEY, JSON.stringify(data));
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
    function simpanTiket(data) {
        localStorage.setItem(TIKET_KEY, JSON.stringify(data));
    }
    function buatIdTiket() {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    function ambilTiket(kode, prioritas) {
        const jenisList = muatJenis();
        const jenis = jenisList.find((j) => j.kode === kode && j.aktif);
        if (!jenis)
            return;
        jenis.nomorBerikutnya += 1;
        simpanJenis(jenisList);
        const tiket = {
            id: buatIdTiket(),
            jenisKode: jenis.kode,
            nomor: jenis.nomorBerikutnya,
            label: `${jenis.kode}-${String(jenis.nomorBerikutnya).padStart(3, "0")}`,
            prioritas,
            status: "menunggu",
            sumber: "mandiri",
            dibuatPada: Date.now(),
        };
        const tiketList = muatTiket();
        tiketList.push(tiket);
        simpanTiket(tiketList);
        if (notifikasiTiket) {
            notifikasiTiket.style.display = "block";
            notifikasiTiket.innerHTML = `<strong>Nomor Tiket Anda: ${tiket.label}</strong><br>Layanan: ${jenis.nama} | Prioritas: ${prioritas.toUpperCase()}`;
        }
        render();
    }
    function render() {
        if (!kontainer)
            return;
        const jenisAntrian = muatJenis().filter((jenis) => jenis.aktif);
        kontainer.replaceChildren();
        if (jenisAntrian.length === 0) {
            const info = document.createElement("p");
            info.className = "sub";
            info.textContent = "Belum ada jenis antrian yang aktif.";
            kontainer.append(info);
            return;
        }
        jenisAntrian.forEach((jenis) => {
            const kartu = document.createElement("div");
            kartu.className = "kartu";
            const kartuAtas = document.createElement("div");
            kartuAtas.className = "kartu-atas";
            const nama = document.createElement("h3");
            nama.textContent = jenis.nama;
            const kode = document.createElement("span");
            kode.className = "kode";
            kode.textContent = jenis.kode;
            kartuAtas.append(nama, kode);
            const btnAmbil = document.createElement("button");
            btnAmbil.className = "btn-ambil";
            btnAmbil.type = "button";
            btnAmbil.textContent = "Ambil Nomor";
            btnAmbil.addEventListener("click", () => ambilTiket(jenis.kode, "normal"));
            const labelPrioritas = document.createElement("p");
            labelPrioritas.className = "label-prioritas";
            labelPrioritas.textContent = "Ambil dengan prioritas";
            const prioritasDiv = document.createElement("div");
            prioritasDiv.className = "prioritas";
            const prioritasList = ["lansia", "disabilitas", "vip"];
            prioritasList.forEach((p) => {
                const btn = document.createElement("button");
                btn.className = "btn-priotritas";
                btn.type = "button";
                btn.textContent = p.charAt(0).toUpperCase() + p.slice(1);
                btn.addEventListener("click", () => ambilTiket(jenis.kode, p));
                prioritasDiv.append(btn);
            });
            kartu.append(kartuAtas, btnAmbil, labelPrioritas, prioritasDiv);
            kontainer.append(kartu);
        });
    }
    window.addEventListener("storage", (event) => {
        if (event.key === JENIS_KEY || event.key === null) {
            render();
        }
    });
    window.setInterval(render, 3000);
    render();
})();
