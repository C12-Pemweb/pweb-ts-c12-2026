"use strict";
const KEY_JENIS = "melo:jenis";
const KEY_TIKET = "melo:tiket";
const KODE_VALID = /^[A-Z]$/;
const LABEL_PRIORITAS = {
    normal: "Normal",
    lansia: "Lansia",
    disabilitas: "Disabilitas",
    vip: "VIP",
};
function muatJenis() {
    try {
        const raw = localStorage.getItem(KEY_JENIS);
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function simpanJenis(list) {
    localStorage.setItem(KEY_JENIS, JSON.stringify(list));
}
function muatTiket() {
    try {
        const raw = localStorage.getItem(KEY_TIKET);
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function simpanTiket(list) {
    localStorage.setItem(KEY_TIKET, JSON.stringify(list));
}
function buatIdTiket() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const token = localStorage.getItem("accessToken");
const role = localStorage.getItem("role");
if (!token) {
    window.location.replace("login.html");
}
else if (role === "admin" || role === "moderator") {
    jalankanDashboard();
}
else {
    window.location.replace(role === "user" ? "ambil-antrian.html" : "login.html");
}
function jalankanDashboard() {
    const nameEl = document.querySelector("#user-name");
    const roleEl = document.querySelector("#user-role");
    const logoutButton = document.querySelector("#logout-button");
    const resetButton = document.querySelector("#reset-button");
    const formJenis = document.querySelector("#form-jenis");
    const inputKode = document.querySelector("#input-kode");
    const inputNama = document.querySelector("#input-nama");
    const errorJenis = document.querySelector("#error-jenis");
    const bodyJenis = document.querySelector("#tabel-jenis tbody");
    const formTiket = document.querySelector("#form-tiket");
    const selectJenis = document.querySelector("#select-jenis");
    const selectPrioritas = document.querySelector("#select-prioritas");
    const errorTiket = document.querySelector("#error-tiket");
    const kartuTiket = document.querySelector("#kartu-tiket");
    const statJenis = document.querySelector("#stat-jenis");
    const statMenunggu = document.querySelector("#stat-menunggu");
    const statDipanggil = document.querySelector("#stat-dipanggil");
    const statSelesai = document.querySelector("#stat-selesai");
    if (muatJenis().length === 0) {
        simpanJenis([
            { kode: "A", nama: "Pendaftaran", aktif: true, nomorBerikutnya: 0 },
            { kode: "B", nama: "Poli Umum", aktif: true, nomorBerikutnya: 0 },
            { kode: "C", nama: "Farmasi", aktif: true, nomorBerikutnya: 0 },
        ]);
    }
    if (nameEl)
        nameEl.textContent = localStorage.getItem("firstName") ?? "-";
    if (roleEl)
        roleEl.textContent = role ?? "-";
    logoutButton?.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("firstName");
        window.location.replace("login.html");
    });
    function tampilError(el, pesan) {
        if (!el)
            return;
        el.textContent = pesan;
        el.hidden = false;
    }
    function bersihError(el) {
        if (!el)
            return;
        el.textContent = "";
        el.hidden = true;
    }
    function renderTabelJenis() {
        if (!bodyJenis)
            return;
        bodyJenis.textContent = "";
        for (const jenis of muatJenis()) {
            const tr = document.createElement("tr");
            tr.dataset.kode = jenis.kode;
            const tdKode = document.createElement("td");
            tdKode.className = "td-kode";
            tdKode.textContent = jenis.kode;
            const tdNama = document.createElement("td");
            tdNama.textContent = jenis.nama;
            const tdStatus = document.createElement("td");
            const chip = document.createElement("span");
            chip.className = jenis.aktif ? "chip chip-aktif" : "chip chip-nonaktif";
            chip.textContent = jenis.aktif ? "Aktif" : "Nonaktif";
            tdStatus.appendChild(chip);
            const tdBerikutnya = document.createElement("td");
            tdBerikutnya.textContent = `${jenis.kode}-${String(jenis.nomorBerikutnya + 1).padStart(3, "0")}`;
            const tdAksi = document.createElement("td");
            const bungkusAksi = document.createElement("div");
            bungkusAksi.className = "aksi-tombol";
            const tombolToggle = document.createElement("button");
            tombolToggle.type = "button";
            tombolToggle.className = "tombol-baris";
            tombolToggle.dataset.aksi = "toggle";
            tombolToggle.textContent = jenis.aktif ? "Nonaktifkan" : "Aktifkan";
            const tombolHapus = document.createElement("button");
            tombolHapus.type = "button";
            tombolHapus.className = "tombol-baris tombol-hapus";
            tombolHapus.dataset.aksi = "hapus";
            tombolHapus.textContent = "Hapus";
            bungkusAksi.append(tombolToggle, tombolHapus);
            tdAksi.appendChild(bungkusAksi);
            tr.append(tdKode, tdNama, tdStatus, tdBerikutnya, tdAksi);
            bodyJenis.appendChild(tr);
        }
    }
    function renderPilihanJenis() {
        if (!selectJenis)
            return;
        selectJenis.textContent = "";
        const aktif = muatJenis().filter((j) => j.aktif);
        if (aktif.length === 0) {
            const kosong = document.createElement("option");
            kosong.value = "";
            kosong.textContent = "Belum ada jenis antrian aktif";
            selectJenis.appendChild(kosong);
            selectJenis.disabled = true;
            return;
        }
        selectJenis.disabled = false;
        for (const jenis of aktif) {
            const opt = document.createElement("option");
            opt.value = jenis.kode;
            opt.textContent = `${jenis.kode} — ${jenis.nama}`;
            selectJenis.appendChild(opt);
        }
    }
    function renderStatistik() {
        const tiket = muatTiket();
        const jenis = muatJenis();
        if (statJenis)
            statJenis.textContent = String(jenis.filter((j) => j.aktif).length);
        if (statMenunggu)
            statMenunggu.textContent = String(tiket.filter((t) => t.status === "menunggu").length);
        if (statDipanggil)
            statDipanggil.textContent = String(tiket.filter((t) => t.status === "dipanggil").length);
        if (statSelesai)
            statSelesai.textContent = String(tiket.filter((t) => t.status === "selesai" || t.status === "dilewati").length);
    }
    function renderSemua() {
        renderTabelJenis();
        renderPilihanJenis();
        renderStatistik();
    }
    function sudahAda(list, kode, nama) {
        const k = kode.toUpperCase();
        const n = nama.trim().toLowerCase();
        return list.some((j) => j.kode.toUpperCase() === k || j.nama.trim().toLowerCase() === n);
    }
    formJenis?.addEventListener("submit", (event) => {
        event.preventDefault();
        bersihError(errorJenis);
        const kode = (inputKode?.value ?? "").trim().toUpperCase();
        const nama = (inputNama?.value ?? "").trim();
        if (!KODE_VALID.test(kode)) {
            tampilError(errorJenis, "Kode harus tepat satu huruf kapital A-Z.");
            return;
        }
        if (!nama) {
            tampilError(errorJenis, "Nama layanan wajib diisi.");
            return;
        }
        const list = muatJenis();
        if (sudahAda(list, kode, nama)) {
            tampilError(errorJenis, "Kode atau nama layanan sudah digunakan (pemeriksaan mengabaikan besar/kecil huruf).");
            return;
        }
        list.push({ kode, nama, aktif: true, nomorBerikutnya: 0 });
        simpanJenis(list);
        formJenis.reset();
        renderSemua();
    });
    bodyJenis?.addEventListener("click", (event) => {
        const target = event.target;
        const tombol = target.closest("button[data-aksi]");
        if (!tombol)
            return;
        const kode = tombol.closest("tr[data-kode]")?.dataset.kode ?? "";
        const aksi = tombol.dataset.aksi;
        const list = muatJenis();
        const indeks = list.findIndex((j) => j.kode === kode);
        if (indeks === -1)
            return;
        const jenis = list[indeks];
        if (aksi === "toggle") {
            jenis.aktif = !jenis.aktif;
            simpanJenis(list);
            renderSemua();
            return;
        }
        if (aksi === "hapus") {
            const masihAdaTiketAktif = muatTiket().some((t) => t.jenisKode === kode && (t.status === "menunggu" || t.status === "dipanggil"));
            if (masihAdaTiketAktif) {
                tampilError(errorJenis, `Jenis ${kode} masih memiliki tiket aktif. Selesaikan dulu atau reset antrian.`);
                return;
            }
            if (!confirm(`Hapus jenis antrian ${kode} — ${jenis.nama}?`))
                return;
            list.splice(indeks, 1);
            simpanJenis(list);
            bersihError(errorJenis);
            renderSemua();
        }
    });
    resetButton?.addEventListener("click", () => {
        if (!confirm("Reset antrian? Seluruh tiket dihapus dan penomoran kembali ke awal (berikutnya X-001)."))
            return;
        simpanTiket([]);
        const list = muatJenis();
        for (const jenis of list) {
            jenis.nomorBerikutnya = 0;
        }
        simpanJenis(list);
        if (kartuTiket)
            kartuTiket.hidden = true;
        bersihError(errorJenis);
        bersihError(errorTiket);
        renderSemua();
    });
    function kePrioritas(nilai) {
        return nilai in LABEL_PRIORITAS ? nilai : "normal";
    }
    function tampilKartuTiket(tiket, namaLayanan) {
        if (!kartuTiket)
            return;
        kartuTiket.textContent = "";
        kartuTiket.hidden = false;
        const judul = document.createElement("p");
        judul.className = "kartu-judul";
        judul.textContent = "TIKET DITERBITKAN";
        const nomor = document.createElement("div");
        nomor.className = "kartu-nomor";
        nomor.textContent = tiket.label;
        const info = document.createElement("p");
        info.className = "kartu-info";
        info.textContent = `${namaLayanan} • Prioritas ${LABEL_PRIORITAS[tiket.prioritas]} • Menunggu dipanggil`;
        kartuTiket.append(judul, nomor, info);
    }
    formTiket?.addEventListener("submit", (event) => {
        event.preventDefault();
        bersihError(errorTiket);
        const kode = selectJenis?.value ?? "";
        const prioritas = kePrioritas(selectPrioritas?.value ?? "normal");
        const list = muatJenis();
        const jenis = list.find((j) => j.kode === kode && j.aktif);
        if (!jenis) {
            tampilError(errorTiket, "Pilih jenis antrian yang aktif terlebih dahulu.");
            return;
        }
        jenis.nomorBerikutnya += 1;
        simpanJenis(list);
        const tiket = {
            id: buatIdTiket(),
            jenisKode: jenis.kode,
            nomor: jenis.nomorBerikutnya,
            label: `${jenis.kode}-${String(jenis.nomorBerikutnya).padStart(3, "0")}`,
            prioritas,
            status: "menunggu",
            sumber: "manual",
            dibuatPada: Date.now(),
        };
        const semua = muatTiket();
        semua.push(tiket);
        simpanTiket(semua);
        tampilKartuTiket(tiket, jenis.nama);
        renderSemua();
    });
    renderSemua();
}
