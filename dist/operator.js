"use strict";
// Halaman Operator MeloCare. Data tiket mengikuti kontrak Dashboard Admin.
// Dibungkus dalam IIFE agar nama tipe/variabel tidak bentrok dengan file TS lain.
(() => {
    const TIKET_KEY = "melo:tiket";
    const JENIS_KEY = "melo:jenis";
    const PRIORITY_RANK = {
        vip: 0,
        disabilitas: 1,
        lansia: 2,
        normal: 3,
    };
    const PRIORITY_LABEL = {
        vip: "VIP",
        disabilitas: "Disabilitas",
        lansia: "Lansia",
        normal: "Normal",
    };
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    if (!token) {
        window.location.replace("login.html");
        return;
    }
    if (role !== "admin" && role !== "moderator") {
        window.location.replace(role === "user" ? "ambil-antrian.html" : "login.html");
        return;
    }
    const get = (id) => document.getElementById(id);
    const currentNumber = get("operator-current-number");
    const currentService = get("operator-current-service");
    const currentPriority = get("operator-current-priority");
    const currentBadge = get("operator-current-badge");
    const nextPreview = get("operator-next-preview");
    const waitingList = get("operator-waiting-list");
    const nextButton = get("operator-next");
    const skipButton = get("operator-skip");
    const finishButton = get("operator-finish");
    const messageEl = get("operator-message");
    const username = get("operator-user");
    if (username)
        username.textContent = `${localStorage.getItem("firstName") ?? "Petugas"} · ${role}`;
    get("operator-logout")?.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("firstName");
        window.location.replace("login.html");
    });
    function muatTiket() {
        try {
            const value = JSON.parse(localStorage.getItem(TIKET_KEY) ?? "[]");
            return Array.isArray(value) ? value : [];
        }
        catch {
            return [];
        }
    }
    function muatJenis() {
        try {
            const value = JSON.parse(localStorage.getItem(JENIS_KEY) ?? "[]");
            return Array.isArray(value) ? value : [];
        }
        catch {
            return [];
        }
    }
    function simpanTiket(data) {
        localStorage.setItem(TIKET_KEY, JSON.stringify(data));
    }
    function namaLayanan(kode) {
        return muatJenis().find((jenis) => jenis.kode === kode)?.nama ?? `Layanan ${kode}`;
    }
    function urutMenunggu(list) {
        return list.filter((ticket) => ticket.status === "menunggu")
            .sort((a, b) => PRIORITY_RANK[a.prioritas] - PRIORITY_RANK[b.prioritas]
            || a.dibuatPada - b.dibuatPada
            || a.nomor - b.nomor);
    }
    function tiketAktif(list) {
        return list.find((ticket) => ticket.status === "dipanggil");
    }
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
    function setMessage(message) {
        if (messageEl)
            messageEl.textContent = message;
    }
    function render() {
        const semua = muatTiket();
        const aktif = tiketAktif(semua);
        const menunggu = urutMenunggu(semua);
        const berikutnya = menunggu[0];
        const statWaiting = get("operator-stat-waiting");
        const statActive = get("operator-stat-active");
        const statDone = get("operator-stat-done");
        if (statWaiting)
            statWaiting.textContent = String(menunggu.length);
        if (statActive)
            statActive.textContent = String(semua.filter(t => t.status === "dipanggil").length);
        if (statDone)
            statDone.textContent = String(semua.filter(t => t.status === "selesai").length);
        if (currentNumber)
            currentNumber.textContent = aktif?.label ?? "—";
        if (currentService)
            currentService.textContent = aktif ? namaLayanan(aktif.jenisKode) : "Belum ada antrian yang dipanggil";
        if (currentPriority)
            currentPriority.textContent = aktif ? `Prioritas ${PRIORITY_LABEL[aktif.prioritas]}` : "—";
        if (currentBadge)
            currentBadge.textContent = aktif ? "● Sedang dipanggil" : "Menunggu panggilan";
        if (skipButton)
            skipButton.disabled = !aktif;
        if (finishButton)
            finishButton.disabled = !aktif;
        if (nextButton)
            nextButton.disabled = !berikutnya;
        if (nextPreview) {
            nextPreview.textContent = berikutnya ? `${berikutnya.label} · ${namaLayanan(berikutnya.jenisKode)} · ${PRIORITY_LABEL[berikutnya.prioritas]}` : "Belum ada pasien menunggu.";
        }
        if (!waitingList)
            return;
        waitingList.replaceChildren();
        if (menunggu.length === 0) {
            const empty = document.createElement("li");
            empty.className = "operator-empty";
            empty.textContent = "Belum ada antrian.";
            waitingList.append(empty);
            return;
        }
        for (const ticket of menunggu) {
            const li = document.createElement("li");
            const label = document.createElement("strong");
            const detail = document.createElement("span");
            const badge = document.createElement("small");
            label.textContent = ticket.label;
            detail.textContent = namaLayanan(ticket.jenisKode);
            badge.textContent = PRIORITY_LABEL[ticket.prioritas];
            li.append(label, detail, badge);
            waitingList.append(li);
        }
    }
    nextButton?.addEventListener("click", () => {
        const semua = muatTiket();
        const target = urutMenunggu(semua)[0];
        if (!target) {
            setMessage("Belum ada antrian yang menunggu.");
            render();
            return;
        }
        for (const ticket of semua) {
            if (ticket.status === "dipanggil")
                ticket.status = "selesai";
        }
        const dipanggil = semua.find(ticket => ticket.id === target.id);
        if (!dipanggil)
            return;
        dipanggil.status = "dipanggil";
        simpanTiket(semua);
        panggilSuara(dipanggil.label, namaLayanan(dipanggil.jenisKode));
        setMessage(`Memanggil ${dipanggil.label} — ${namaLayanan(dipanggil.jenisKode)}.`);
        render();
    });
    skipButton?.addEventListener("click", () => {
        const semua = muatTiket();
        const aktif = tiketAktif(semua);
        if (!aktif)
            return;
        // Pilihan yang diizinkan soal: menandai status tiket sebagai dilewati.
        aktif.status = "dilewati";
        simpanTiket(semua);
        setMessage(`Tiket ${aktif.label} dilewati. Klik Panggil Berikutnya untuk lanjut.`);
        render();
    });
    finishButton?.addEventListener("click", () => {
        const semua = muatTiket();
        const aktif = tiketAktif(semua);
        if (!aktif)
            return;
        aktif.status = "selesai";
        simpanTiket(semua);
        setMessage(`Tiket ${aktif.label} selesai. Belum memanggil tiket berikutnya.`);
        render();
    });
    window.addEventListener("storage", (event) => {
        if (event.key === TIKET_KEY || event.key === JENIS_KEY || event.key === null)
            render();
    });
    window.addEventListener("focus", render);
    window.setInterval(render, 2500);
    render();
})();
