type Prioritas = "normal" | "lansia" | "disabilitas" | "vip";
type StatusTiket = "menunggu" | "dipanggil" | "selesai" | "dilewati";
type Role = "admin" | "moderator" | "user";

interface JenisAntrian {
  kode: string;
  nama: string;
  aktif: boolean;
  nomorBerikutnya: number;
}

interface Tiket {
  id: string;
  jenisKode: string;
  nomor: number;
  label: string;
  prioritas: Prioritas;
  status: StatusTiket;
  sumber: "manual" | "mandiri";
  dibuatPada: number;
}

const KEY_JENIS = "melo:jenis";
const KEY_TIKET = "melo:tiket";

function muatJenis(): JenisAntrian[] {
  try {
    const raw = localStorage.getItem(KEY_JENIS);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as JenisAntrian[]) : [];
  } catch {
    return [];
  }
}
function simpanJenis(list: JenisAntrian[]): void {
  localStorage.setItem(KEY_JENIS, JSON.stringify(list));
}

if (muatJenis().length === 0) {
  simpanJenis([
    { kode: "A", nama: "Pendaftaran",  aktif: true, nomorBerikutnya: 0 },
    { kode: "B", nama: "Poli Umum",    aktif: true, nomorBerikutnya: 0 },
    { kode: "C", nama: "Farmasi",      aktif: true, nomorBerikutnya: 0 },
  ]);
}