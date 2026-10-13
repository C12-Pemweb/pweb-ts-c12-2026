const daftarAntrian = document.getElementById("daftar-antrian");

function render(): void{
    if (!daftarAntrian) return;

    const jenisAntrian = muatJenis().filter((jenis) => jenis.aktif);
    const semuaTiket = muatTiket();

    daftarAntrian.replaceChildren();

    jenisAntrian.forEach((jenis) => {
        const tiketDipanggil = semuaTiket.find(
            (tiket) =>
                tiket.jenisKode === jenis.kode && tiket.status === "dipanggil"
        );

        const jumlahMenunggu = semuaTiket.filter(
            (tiket) =>
                tiket.jenisKode === jenis.kode && tiket.status === "menunggu"
        ).length;

        const kartu = document.createElement("div");
        kartu.className = "kartu-layar";

        const nama = document.createElement("h3");
        nama.textContent = `${jenis.nama} (${jenis.kode})`;

        const nomor = document.createElement("p");
        nomor.className = "nomor";
        nomor.textContent = tiketDipanggil?.label ?? "-";

        const menunggu = document.createElement("p");
        menunggu.className = "menunggu";
        menunggu.textContent = `${jumlahMenunggu} menunggu`;

        kartu.append(nama, nomor, menunggu);
        daftarAntrian.append(kartu);        
    });
}

window.addEventListener("storage", () => render());
render();