# GEMASTIK XIX / 2026
## KOMPETISI VIII — PENGEMBANGAN PERANGKAT LUNAK
### PROPOSAL PENGEMBANGAN PERANGKAT LUNAK

**HepaTwin: Digital Twin Hati Berbasis Kecerdasan Buatan untuk Simulasi Visual 3D Hepatotoksisitas Obat dan Triase Praklinis In-Silico Berbiaya Rendah**

**DIUSULKAN OLEH:**
* [Nama Lengkap Ketua Tim]; [NIM Ketua] — Teknologi Informasi
* [Nama Lengkap Anggota 1]; [NIM] — Teknologi Informasi
* [Nama Lengkap Anggota 2]; [NIM] — Farmasi

**DIBIMBING OLEH:**
* [Nama Lengkap Dosen Pembimbing, Gelar]; [NIDN]

**UNIVERSITAS PENDIDIKAN NASIONAL** **DENPASAR** **2026**

---

> **[CATATAN TIM]** Seluruh teks dalam kurung siku `[ ]` adalah *placeholder* yang wajib diisi tim setelah data resmi tersedia (nama anggota, NIM, nama perguruan tinggi, nama dosen pembimbing, NIDN, kota, dan tanggal).  
> **[CATATAN TIM]** Ini adalah isi dari **REVISI KEDUA (Rev 2)** dari draft PPL sebelumnya yang telah diselaraskan dengan hasil sosialisasi resmi GEMASTIK XIX/2026 pada 20 Juli 2026.  
> **Perubahan utama dibanding Rev 1 & pasca-sosialisasi:** > 1. *Scope* diperluas dari murni "media pembelajaran" menjadi *dual-purpose* yang tetap media pembelajaran farmakologi (dua senyawa *flagship*, Mode Edukasi Mendalam) SEKALIGUS alat bantu triase praklinis *in-silico* berbiaya rendah untuk senyawa apa pun melalui input SMILES bebas (Mode Triase Umum);
> 2. Arsitektur AI ditingkatkan menjadi model *hybrid* (fitur substruktur RDKit + *Graph Neural Network* sederhana), mengikuti pendekatan riset 2023–2024 (GeoDILI, Wang et al. 2024, InterDILI), bukan lagi Random Forest/DNN polos;
> 3. Strategi validasi eksternal ditambahkan menggunakan dataset independen Xu et al. (2015) di luar DILIrank, dengan deduplikasi SMILES eksplisit mengikuti praktik metodologis InterDILI (Lee & Yoo, 2024), demi menghindari klaim akurasi yang tidak dapat dipertanggungjawabkan;
> 4. Performa model WAJIB dilaporkan apa adanya ke juri (target realistis AUC 0,75–0,85, bukan klaim mendekati sempurna), dengan rentang performa lapangan yang sebenarnya (Mostafa, Howle, & Chen, 2024) dicantumkan sebagai pembanding jujur;
> 5. Klaim manfaat sosial "mengurangi beban pengujian obat" DIPERSEMPIT secara sengaja menjadi klaim dua lapis — klaim kuat (biaya lisensi software PK/PD komersial yang mahal) dan klaim proksi yang dilabeli eksplisit sebagai indikator tidak langsung (disparitas infrastruktur riset Jawa vs luar Jawa berdasar data BPS/PDDikti nasional, BUKAN data spesifik lab toksikologi Indonesia karena tim tidak menemukan data granular tersebut setelah penelusuran);
> 6. HepaTwin ditegaskan berulang kali di seluruh dokumen sebagai alat BANTU TRIASE/PRIORITISASI AWAL, bukan pengganti uji toksisitas/klinis, mengacu eksplisit pada tinjauan Madden, Enoch, Paini, & Cronin (2020) yang menyatakan tidak ada satu pun metode *in-silico* yang dapat menjadi pengganti utuh pengujian pada *endpoint* toksikologi kompleks;
> 7. **[PENYESUAIAN SOSIALISASI 20 JULI 2026]** Penomoran pagelaran diperbarui resmi menjadi **GEMASTIK XIX / 2026**; narasi tema diikat kuat dengan tema resmi *"Berdampak, Inklusif, dan Berkelanjutan menuju Masyarakat Cerdas"*; lini masa *sprint* dikalibrasi terhadap tenggat penyisihan **14 Agustus 2026** (target progres minimal 50%); serta integrasi agenda wajib finalis yaitu **Pendaftaran Hak Cipta (HKI DJKI Kemkum RI)** dan **Makalah IEEE (similaritas Turnitin <25%)**.

---

## SURAT PERNYATAAN KEASLIAN KARYA

Yang bertanda tangan di bawah ini:

* **Nama Ketua Tim** : [Nama Lengkap Ketua Tim]
* **NIM** : [NIM]
* **Perguruan Tinggi** : Universitas Pendidikan Nasional
* **Nama Tim** : [Nama Tim]
* **Judul Karya** : HepaTwin: Digital Twin Hati Berbasis Kecerdasan Buatan untuk Simulasi Visual 3D Hepatotoksisitas Obat dan Triase Praklinis In-Silico Berbiaya Rendah

Dengan ini menyatakan bahwa karya yang kami ajukan dalam **Kompetisi VIII Pengembangan Perangkat Lunak GEMASTIK XIX/2026** adalah:
1. Karya orisinal dan merupakan hasil pengembangan tim kami sendiri;
2. Tidak menjiplak atau mengadaptasi karya orang lain;
3. Tidak melanggar hak cipta pihak manapun;
4. Belum pernah dilombakan pada kompetisi tingkat nasional manapun;
5. Belum pernah dipublikasikan secara komersial maupun nonkomersial kepada khalayak umum;
6. Tidak mengandung unsur SARA (Suku, Agama, Ras, dan Antar Golongan).

Apabila di kemudian hari terbukti terdapat pelanggaran terhadap pernyataan di atas, kami bersedia menerima sanksi sesuai ketentuan yang berlaku.

[Kota], [Tanggal] [Bulan] 2026  
Ketua Tim,

*(Materai Rp10.000)*

**([Nama Lengkap Ketua Tim])** NIM. [NIM Ketua]

> **[CATATAN TIM]** Surat pernyataan ini wajib dicetak, ditandatangani di atas materai Rp10.000 oleh Ketua Tim, lalu di-*scan* dan dilampirkan sebagai berkas terpisah dalam format PDF.  
> **[KONFIRMASI SOSIALISASI 20 JULI 2026]** *Deployment* demo publik (Vercel/Railway dengan URL yang dapat diakses juri/khalayak) selama masa pengembangan **TIDAK** melanggar klausul "belum pernah dipublikasikan kepada khalayak umum", karena hal tersebut merupakan standar kebutuhan pembuktian fungsionalitas prototipe pada kompetisi Pengembangan Perangkat Lunak (PPL).

---

## A. JUDUL / NAMA PERANGKAT LUNAK

**HepaTwin** *(Hepatic Digital Twin — Simulasi Visual 3D Hepatotoksisitas Obat Berbasis Kecerdasan Buatan, sebagai Media Pembelajaran Farmakologi Interaktif dan Alat Bantu Triase Praklinis In-Silico Berbiaya Rendah)*

---

## B. LATAR BELAKANG IDE PERANGKAT LUNAK

### B.1. Konteks Permasalahan: DILI dan Krisis Metode Pembelajaran Farmakologi
Pembelajaran farmakologi dan toksikologi di perguruan tinggi, khususnya pada mata kuliah Toksikologi Klinik, Farmakokinetika, dan Farmakologi Sistem Organ, menghadapi tantangan fundamental yang belum terpecahkan hingga saat ini: mekanisme kerusakan organ akibat obat (*Drug-Induced Organ Injury*) merupakan fenomena yang berlangsung secara dinamis, spasial, dan temporal di tingkat seluler, namun seluruh materi ajarnya hanya tersedia dalam representasi statis berupa diagram dua dimensi, gambar histopatologi di buku teks, atau tabel angka farmakokinetika yang abstrak bagi mahasiswa.

Salah satu fenomena toksikologi yang paling krusial sekaligus paling sering diajarkan adalah *Drug-Induced Liver Injury* (DILI), atau kerusakan hati akibat induksi obat. DILI merupakan penyebab utama kegagalan kandidat obat dalam uji klinis dan penyebab signifikan penarikan obat dari pasaran sejak dekade 1960-an (Hosack, Damry, & Biswas, 2023). Data epidemiologis menunjukkan DILI menyebabkan gagal hati akut dengan tingkat kefatalan berkisar 10 hingga 50% pada kasus berat, sementara studi populasi di Amerika Serikat melaporkan insiden DILI idiosinkrasi sekitar 20 kasus baru per 100.000 orang per tahun dan kontribusi sekitar 11% terhadap kasus gagal hati akut (Leise, Poterucha, & Talwalkar, 2014). Tinjauan yang lebih baru melaporkan kisaran insiden yang konsisten secara ordo besaran (14–19 kasus per 100.000 populasi, kontribusi kurang dari 1% dari seluruh kasus gangguan hati akut/ALI, meski DILI tetap menjadi penyebab gagal hati akut/ALF tersering di negara Barat), perbedaan angka persisnya mencerminkan perbedaan definisi denominator (ALI vs ALF) dan populasi studi antar penelitian, bukan inkonsistensi data (Allison, Guraka, Shawa, Tripathi, Moritz, & Kermanizadeh, 2023).

Studi kasus yang paling terdokumentasi dan menjadi materi ajar wajib di hampir seluruh program studi farmasi dan kedokteran dunia adalah hepatotoksisitas parasetamol (asetaminofen), bentuk DILI intrinsik yang bersifat *dose-dependent* dan dapat diprediksi. Pada dosis berlebih, metabolit reaktifnya bernama *N-Acetyl-p-Benzoquinone Imine* (NAPQI) yang terbentuk melalui enzim CYP2E1 dan CYP3A4 akan menguras cadangan glutation (GSH) di hepatosit, membentuk aduk protein mitokondria, dan memicu kematian sel hepatosit melalui stres oksidatif dan transisi permeabilitas membran mitokondria, dengan kerusakan yang secara histologis terkonsentrasi pada zona sentrilobuler (zona 3) hati (Chiew et al., 2023; Du et al., 2024).

Di sisi lain, terdapat kategori DILI yang secara mekanistik sangat berbeda: DILI idiosinkratik sebagai bentuk kerusakan hati yang tidak bergantung dosis, sulit diprediksi, dan melibatkan faktor kerentanan individual (diduga terkait varian genetik/HLA tertentu) alih-alih jalur toksisitas langsung seperti pada parasetamol (Allison et al., 2023). *Amoxicillin-clavulanate* adalah kombinasi antibiotik golongan penisilin yang sangat luas digunakan dan secara konsisten dilaporkan sebagai penyebab DILI idiosinkratik tersering di dunia dalam berbagai seri kasus besar di Amerika, Eropa, dan kawasan lain, dengan pola kerusakan yang predominan kolestatik (menyerang saluran empedu) dan berbeda secara histologis dari pola hepatoselular murni pada parasetamol (LiverTox — NIDDK, NCBI Bookshelf; Lucena et al., 2006, dalam kajian LiverTox tersebut).

Pemanfaatan kecerdasan buatan untuk memprediksi risiko DILI dari struktur kimia senyawa telah berkembang pesat, didukung dataset publik berskala besar seperti DILIrank yang mengklasifikasikan 1.036 obat berdasarkan tingkat risiko DILI (Chen et al., 2016). Perkembangan terbaru bidang ini (2023–2025) bergerak menuju arsitektur *hybrid* yang menggabungkan fitur struktural klasik dengan *Graph Neural Network* (GNN), misalnya GeoDILI yang memakai representasi geometris graf molekul (Wu et al., 2023), model *graph-attention* yang menggabungkan mekanisme atensi dengan *fingerprint* molekuler (Wang et al., 2024), dan InterDILI yang menekankan interpretabilitas melalui *feature importance* (Lee & Yoo, 2024). Namun demikian, luaran model-model ini pada umumnya berhenti pada representasi numerik atau klasifikasi biner, tanpa jembatan yang menghubungkannya dengan pemahaman visual-spasial yang dibutuhkan dalam konteks pembelajaran maupun triase cepat oleh peneliti.

### B.2. Kesenjangan Teknologi yang Ada

| Pendekatan Saat Ini | Keterbatasan Utama |
| :--- | :--- |
| **Diagram & slide statis (buku teks)** | Tidak menggambarkan dinamika temporal dan spasial kerusakan; mahasiswa sulit membangun pemahaman visual-mekanis yang mendalam. |
| **Software pemodelan PK/PD (DILIsym, NONMEM, Simcyp)** | Output berupa kurva numerik dan grafik dua dimensi; antarmuka sangat teknis; memerlukan lisensi berbayar mahal (mencapai puluhan-ratusan juta rupiah per tahun) dan keahlian biostatistika khusus, tidak terjangkau bagi banyak laboratorium riset/pengajaran kampus. |
| **Platform anatomi 3D (BioDigital Human, VOKA)** | Kondisi organ bersifat *pre-set* statis; tidak digerakkan oleh komputasi dinamis dari input pengguna seperti dosis dan senyawa obat tertentu. |
| **Model AI prediktif DILI berbasis struktur (Hong et al., 2017; Niu et al., 2025; Wu et al., 2023; Lee & Yoo, 2024)** | Luaran berhenti pada skor numerik/klasifikasi biner, tanpa representasi visual-spasial progresi kerusakan organ; performa model umumnya moderat (AUC 0,7–0,9 tergantung arsitektur dan validasi), bukan alat definitif; untuk senyawa bermekanisme jelas (mis. parasetamol), skor AI tidak menambah informasi baru terhadap apa yang sudah diketahui secara mekanistik. |
| **Uji *in vitro* (*organ-on-a-chip*) dan uji hewan** | Biaya sangat tinggi; memerlukan fasilitas laboratorium basah; waktu uji berminggu-minggu; tidak dapat diakses untuk keperluan pembelajaran massal maupun triase cepat senyawa kandidat awal. |

Di sinilah HepaTwin hadir mengisi kesenjangan yang belum terisi oleh satu pun solusi di atas: sebuah aplikasi web interaktif yang menggabungkan model prediktif kecerdasan buatan dengan rendering 3D organ hati berbasis web dengan pembagian peran yang jelas antara dua lapisan komputasi: persamaan diferensial farmakokinetika-farmakodinamika (PK/PD) untuk senyawa bermekanisme diketahui (parasetamol), dan skor klasifikasi AI sebagai penggerak visual utama untuk senyawa bermekanisme belum diketahui, baik untuk dua senyawa *flagship* (*amoxicillin-clavulanate*) maupun untuk senyawa sembarang yang dimasukkan pengguna melalui notasi SMILES. Pembagian ini memastikan bahwa peran AI dalam HepaTwin bukan sekadar pelengkap kosmetik dari model matematis yang sudah lengkap, melainkan komponen yang *genuinely* dibutuhkan pada kasus di mana model mekanistik memang tidak tersedia.

### B.3. Relevansi dengan Tema GEMASTIK XIX/2026
HepaTwin selaras secara fundamental dengan tema resmi GEMASTIK XIX/2026, yaitu **"Gemastik 2026: Berdampak, Inklusif, dan Berkelanjutan menuju Masyarakat Cerdas"**. Keterkaitan inovasi HepaTwin dengan ketiga pilar utama tema tersebut diwujudkan melalui:
* **Berdampak (*Impactful*):** Dibuktikan secara empiris melalui rancangan evaluasi *pre-test* dan *post-test* terhadap peningkatan pemahaman konsep farmakologi dan toksikologi mahasiswa (Bagian F.3). Dalam konteks pendidikan tinggi (SDG 4: *Quality Education*), HepaTwin hadir sebagai solusi teknologi pembelajaran interaktif yang meningkatkan kualitas dan efektivitas pendidikan farmasi di Indonesia.
* **Inklusif (*Inclusive*):** Melalui *Mode Triase Umum* berbiaya rendah (input SMILES bebas), HepaTwin memberikan akses teknologi *in-silico* kepada laboratorium riset dan pengajaran di kampus-kampus daerah (khususnya di luar Jawa) yang tidak memiliki anggaran untuk membayar lisensi *software* komersial mahal (seperti DILIsym atau Simcyp). Hal ini mendemokratisasi akses terhadap perangkat analisis farmasi lanjutan, membantu mengatasi kesenjangan infrastruktur riset nasional, dan secara tidak langsung berkontribusi pada kompetensi tenaga farmasi serta peningkatan kualitas layanan kesehatan masyarakat (SDG 3: *Good Health and Well-being*).
* **Berkelanjutan (*Sustainable*):** Mendukung transformasi etika riset medis jangka panjang sejalan dengan prinsip **3Rs (*Replacement, Reduction, Refinement*)** dalam penelitian farmakologi dan toksikologi, sehingga berpotensi mengurangi ketergantungan pada pengorbanan hewan uji secara bertahap pada tahap skrining dan triase awal.

### B.4. Relevansi dan Urgensi bagi Konteks Farmasi Indonesia
Argumentasi urgensi HepaTwin tidak hanya bersandar pada keterbatasan representasi statis yang bersifat generik dan telah berlaku sejak lama, melainkan juga pada dua momentum konkret yang relevan bagi pendidikan farmasi Indonesia saat ini.

Pertama, dari sisi kurikulum: Panduan Kurikulum Program Studi Farmasi 2024 yang disusun Asosiasi Pendidikan Tinggi Farmasi Indonesia (APTFI) secara eksplisit merekomendasikan pendekatan *outcome-based education* (OBE) dengan penekanan pada integrasi sains farmasi, praktik klinis, dan pengembangan inovasi, mengacu pada *benchmark* internasional dari *International Pharmaceutical Federation* (FIP). Sejalan dengan arah tersebut, metode evaluasi berbasis simulasi seperti *Objective Structured Clinical Examination* (OSCE) telah menjadi bagian aktif dari kurikulum maupun uji kompetensi nasional program studi dan program profesi apoteker di berbagai perguruan tinggi Indonesia sepanjang 2024–2025. HepaTwin selaras dengan arah kurikulum ini sebagai alat bantu simulasi berbasis komputasi untuk topik yang secara tradisional sulit disimulasikan langsung di kelas.

Kedua, dari sisi skala kebutuhan: parasetamol tercatat sebagai obat yang paling banyak dikonsumsi di Indonesia, dengan permintaan nasional mencapai sekitar 9.000 ton per tahun (Direktorat Jenderal Farmasi dan Alat Kesehatan, Kementerian Kesehatan RI). Pada golongan antibiotik kelas tempat *amoxicillin-clavulanate* berada, nilai penjualan nasional dilaporkan menembus lebih dari Rp10 triliun per tahun berdasarkan data IQVIA yang dikutip media (Kompas, 2024), mengindikasikan luasnya paparan masyarakat terhadap kedua kelas obat yang menjadi fokus mendalam HepaTwin.

Sebagai catatan kejujuran ilmiah: tim belum menemukan data epidemiologi DILI yang granular dan spesifik untuk konteks Indonesia (misalnya insiden DILI per 100.000 penduduk setara studi epidemiologi di Amerika Serikat dan Eropa yang dirangkum Allison et al. (2023)). Data yang tersedia secara publik dan dapat diverifikasi adalah data skala konsumsi/penjualan obat (Kemenkes; IQVIA melalui Kompas, 2024) serta data keracunan obat dan makanan secara umum dari sistem SPIMKer KLB-KP milik BPOM, bukan data spesifik DILI. Ketiadaan data DILI granular Indonesia ini disampaikan secara terbuka sebagai keterbatasan kajian, sekaligus menjadi salah satu motivasi jangka panjang HepaTwin: membuka ruang diskusi mengenai pentingnya surveilans DILI yang lebih baik di Indonesia.

> **[CATATAN TIM]** Seluruh angka pada bagian B.4 bersumber dari publikasi resmi (Kemenkes/Ditjen Farmalkes, APTFI, laporan kajian BPOM) atau liputan data pasar yang mengutip lembaga riset (IQVIA via Kompas). Anggota Farmasi tetap wajib memverifikasi ulang setiap angka ke sumber primer sebelum draft final dikirim, dan TIDAK diperkenankan menambahkan angka DILI spesifik-Indonesia yang tidak dapat ditelusuri sumbernya.

### B.5. Relevansi dan Urgensi bagi Konteks Riset & Laboratorium di Indonesia
Selain fungsinya sebagai media pembelajaran, HepaTwin dirancang untuk menjawab kebutuhan yang lebih luas: banyak laboratorium riset dan pengajaran farmasi di Indonesia khususnya di luar beberapa universitas riset besar tidak memiliki akses ke *software* pemodelan PK/PD komersial seperti DILIsym atau Simcyp, yang lisensinya berbiaya tinggi dan memerlukan keahlian biostatistika khusus (lihat Tabel B.2). HepaTwin, dengan model AI yang divalidasi secara metodologis benar (lihat E.7–E.8), berpotensi menjadi alat bantu triase awal berbiaya rendah bagi laboratorium semacam ini untuk memprioritaskan senyawa kandidat yang paling mendesak diuji lebih lanjut.

Tim ingin menegaskan secara eksplisit batas argumentasi ini, mengikuti prinsip kejujuran ilmiah yang sama yang diterapkan pada Bagian B.4:
* Klaim yang tim BISA pertanggungjawabkan sepenuhnya: biaya lisensi *software* PK/PD komersial memang tinggi dan menjadi hambatan nyata bagi banyak institusi (lihat Tabel B.2), ini adalah fakta pasar yang dapat diverifikasi.
* Klaim yang tim SENGAJA persempit menjadi indikator tidak langsung (proksi), bukan temuan langsung: tim menelusuri secara khusus apakah tersedia data resmi mengenai sebaran/jumlah laboratorium toksikologi praklinik terakreditasi di Indonesia (BPOM, Kemenristek, asosiasi profesi), namun tidak menemukan data granular semacam itu yang dipublikasikan secara terbuka. Yang tersedia hanyalah data umum Badan Pusat Statistik (BPS) dan PDDikti mengenai disparitas jumlah dosen dan fasilitas pendidikan tinggi antara Jawa dan luar Jawa, data ini digunakan sebagai indikator tidak langsung bahwa kesenjangan infrastruktur riset kemungkinan juga berlaku di bidang farmasi/toksikologi, BUKAN sebagai bukti langsung.

Tim TIDAK mengklaim HepaTwin mengurangi kebutuhan pengujian toksisitas formal. Argumen ini didukung eksplisit oleh tinjauan Madden, Enoch, Paini, & Cronin (2020), yang menegaskan bahwa tidak ada satu pun metode *in-silico* yang dapat menjadi pengganti utuh (*"one-to-one replacement"*) untuk pengujian pada *endpoint* toksikologi kompleks, dan bahwa informasi dari kombinasi berbagai teknik tetap diperlukan. HepaTwin diposisikan sebagai salah satu lapisan triase awal dalam kombinasi tersebut, bukan pengganti.

> **[CATATAN TIM]** Item aksi konkret untuk tim: hubungi dosen pembimbing atau kontak Fakultas Farmasi untuk menanyakan pengalaman langsung mereka soal keterbatasan akses lab toksikologi — kutipan/testimoni dari pakar, meski bukan jurnal, adalah sumber primer yang sah dan lebih kuat daripada indikator proksi BPS/PDDikti di atas. Jika didapat, tambahkan sebagai catatan kaki bertanda sumber primer di bagian ini.

---

## C. TUJUAN DAN MANFAAT DIKEMBANGKANNYA PERANGKAT LUNAK

### C.1. Tujuan
1. Mengembangkan aplikasi web interaktif (HepaTwin) yang mampu memvisualisasikan dua pola mekanisme hepatotoksisitas obat, yaitu hepatoselular *dose-dependent* dan kolestatik idiosinkratik yang ditampilkan secara visual-spasial tiga dimensi berbasis web, untuk dua senyawa *flagship* (**Mode Edukasi Mendalam**).
2. Membangun model AI *hybrid* (fitur substruktur RDKit + *Graph Neural Network*) yang menerima input SMILES bebas untuk sembarang senyawa (**Mode Triase Umum**), memetakan struktur molekul ke skor risiko DILI, dilatih pada dataset DILIrank (FDA LTKB) dan divalidasi secara eksternal pada dataset independen Xu et al. (2015) yang tidak dilihat model selama pelatihan.
3. Menerapkan logika farmakokinetika-farmakodinamika (PK/PD) matematis sebagai jembatan ilmiah antara prediksi AI dengan respons visual 3D organ hati untuk senyawa bermekanisme diketahui, termasuk validasi silang keluaran simulasi terhadap nomogram klinis Rumack-Matthew yang telah tervalidasi selama hampir lima dekade.
4. Membangun lapisan *explainability* yang *interpretable* secara kimia/farmakologis (berbasis gugus fungsi/substruktur molekuler), bukan sekadar atribusi numerik abstrak, agar bermakna sebagai alat bantu pembelajaran maupun triase.
5. Melaporkan performa model AI (akurasi, AUC, MCC pada *test set* eksternal) secara transparan dan apa adanya, sebagai bagian dari komitmen tim terhadap kejujuran ilmiah, alih-alih mengklaim akurasi tinggi yang tidak dapat dipertanggungjawabkan.
6. Menyediakan alat bantu pembelajaran farmakologi dan triase praklinis awal yang intuitif, dapat diakses melalui satu URL tanpa instalasi, untuk mendukung proses pembelajaran mahasiswa/dosen serta kebutuhan laboratorium riset kecil.
7. Mengukur secara empiris dampak penggunaan HepaTwin terhadap pemahaman mahasiswa melalui uji coba terbatas dengan skema *pre-test* dan *post-test*, sebagai bukti nilai guna nyata dari perangkat lunak yang dikembangkan.

### C.2. Manfaat

#### C.2.a. Bagi Pengguna Primer (Dosen & Mahasiswa Farmakologi/Toksikologi)
* Dosen dapat mendemonstrasikan dua pola mekanisme hepatotoksisitas yang berbeda, yaitu *dose-dependent* vs idiosinkratik yang secara interaktif di dalam kelas, termasuk memperlihatkan kapan model matematis dapat digunakan dan kapan hanya prediksi probabilistik AI yang tersedia.
* Mahasiswa dapat mengeksplorasi secara mandiri hubungan antara dosis, konsentrasi metabolit, dan progresi kerusakan hati untuk kasus bermekanisme jelas, sekaligus memahami keterbatasan prediksi untuk kasus idiosinkratik yang mencerminkan realitas farmakovigilans.
* Menjembatani kesenjangan antara pengetahuan teoritis (persamaan PK/PD dan nomogram klinis di buku teks) dengan pemahaman visual-spasial yang lebih intuitif dan mudah diingat.

#### C.2.b. Bagi Pengguna Sekunder (Peneliti/Laboratorium Riset Berdaya Terbatas)
* Melalui *Mode Triase Umum* (input SMILES bebas), peneliti dapat memperoleh estimasi risiko DILI awal untuk senyawa kandidat riset tanpa memerlukan lisensi *software* PK/PD komersial yang digunakan sebagai alat bantu prioritisasi, BUKAN pengganti uji toksisitas formal (lihat *disclaimer* wajib pada Bagian D dan E.8).
* *Explainability* berbasis gugus kimia membantu peneliti memahami substruktur molekuler mana yang paling berkontribusi terhadap skor risiko, mempercepat diskusi awal sebelum memutuskan senyawa mana yang diprioritaskan untuk uji *in vitro*/*in vivo*.

#### C.2.c. Bagi Dunia Pendidikan Farmasi Indonesia
* Menyediakan alat bantu pembelajaran berbasis TIK yang selaras dengan arah kurikulum *outcome-based education* APTFI 2024 dan tren *simulation-based learning* yang sedang berkembang di pendidikan farmasi Indonesia.
* Mendorong adopsi pendekatan *in silico* dalam ekosistem pendidikan dan riset farmasi Indonesia, dengan standar pelaporan performa model yang jujur sebagai preseden baik bagi proyek mahasiswa lain.

#### C.2.d. Manfaat Sosial dan Etika (Prinsip 3Rs)
* Sejalan dengan prinsip **3Rs (*Replacement, Reduction, Refinement*)** dalam penelitian farmasi, HepaTwin berkontribusi sebagai salah satu lapisan triase komputasional yang cepat dan murah pada tahap paling awal skrining senyawa (Derakhchan et al., 2026).
* Tim menegaskan, mengacu pada Madden et al. (2020), bahwa kontribusi ini bersifat komplementer sebagai satu dari kombinasi berbagai teknik yang dibutuhkan dan BUKAN pengganti uji hewan/klinis formal.

> **[CATATAN TIM]** Klaim manfaat 3Rs dan triase ini TIDAK setara dengan validasi klinis atau regulatori. Saat presentasi, tim wajib menegaskan bahwa HepaTwin adalah alat bantu pembelajaran dan triase awal, bukan pengganti uji klinis, laboratorium, atau keputusan regulasi apa pun.

---

## D. BATASAN PERANGKAT LUNAK YANG DIKEMBANGKAN

Demi memastikan keberhasilan implementasi dalam skala waktu kompetisi, HepaTwin dirancang dengan batasan ruang lingkup (*scope*) yang jelas sebagai berikut. Revisi ini menambahkan Mode Triase Umum sebagai kapabilitas baru berdampingan dengan Mode Edukasi Mendalam yang sudah ada, tanpa mengorbankan kedalaman ilmiah pada dua senyawa *flagship*.

| Aspek | Dalam Scope HepaTwin | Di Luar Scope (Visi Masa Depan) |
| :--- | :--- | :--- |
| **Organ** | Hati (*Liver*) menjadi fokus tunggal | Organ lain (ginjal, jantung, paru-paru) |
| **Senyawa Obat — Mode Edukasi Mendalam** | Parasetamol (model hepatoselular *dose-dependent*, jalur NAPQI-GSH) dan *Amoxicillin-Clavulanate* (model kolestatik idiosinkratik) disertai visualisasi zonal penuh (sentrilobuler / portal-periportal) | Simulasi zonal penuh untuk senyawa lain di luar dua *flagship* ini |
| **Senyawa Obat — Mode Triase Umum [BARU]** | Input SMILES bebas untuk sembarang senyawa; keluaran berupa skor risiko DILI + *explainability* substruktur kimia + visualisasi *heatmap* makro generik (BUKAN pemetaan zonal spesifik, karena pola mekanisme individual senyawa arbitrer belum diketahui) | Prediksi pola mekanisme spesifik (hepatoselular vs kolestatik) untuk senyawa di luar dua *flagship*; parameter farmakokinetik individual (dosis, farmakogenetik, kondisi pasien) |
| **Mekanisme Toksisitas** | Hepatotoksisitas (DILI) intrinsik *dose-dependent* (parasetamol) dan idiosinkratik *dose-independent* (*amoxicillin-clavulanate* dan senyawa Mode Triase, digerakkan skor klasifikasi AI) | Mekanisme toksisitas hati lain (autoimun, granulomatosa, dsb.) |
| **Level Visualisasi** | *Hybrid* Makro-Mikro untuk dua *flagship* (zoom ke lobulus/area portal); *heatmap* makro generik untuk Mode Triase Umum | Simulasi tingkat subselular atau molekuler |
| **Platform** | Aplikasi web (*browser-based*, tanpa instalasi) | Aplikasi mobile, VR/AR, atau desktop |
| **Pengguna Target** | **Primer:** dosen dan mahasiswa farmakologi/toksikologi. **Sekunder:** peneliti/laboratorium riset kecil tanpa akses software PK/PD komersial | Regulator BPOM/FDA, keputusan persetujuan obat |

> **[CATATAN TIM]** Batasan ini WAJIB dikomunikasikan secara eksplisit kepada juri saat presentasi untuk menghindari klaim yang berlebihan. HepaTwin adalah alat bantu pembelajaran dan triase *in-silico*, bukan pengganti uji klinis atau laboratorium.

---

## E. METODOLOGI PENGEMBANGAN PERANGKAT LUNAK

### E.1. Pendekatan Pengembangan
HepaTwin dikembangkan menggunakan pendekatan *Agile Development* dengan siklus *sprint* mingguan, yang memungkinkan adaptasi cepat terhadap masukan ilmiah dari anggota tim Farmasi selama proses pengembangan berlangsung. Pendekatan ini dipilih karena kompleksitas interdisiplin proyek ini membutuhkan iterasi cepat antara validasi ilmiah (farmasi) dan implementasi teknis (IT).

### E.2. Arsitektur Sistem (Tech Stack)

| Layer | Teknologi | Justifikasi Pemilihan |
| :--- | :--- | :--- |
| **Frontend & UI** | React.js + Tailwind CSS | Manajemen *state* reaktif memungkinkan perubahan visual 3D langsung merespons data dari AI tanpa *reload* halaman; Tailwind CSS mempercepat pembangunan antarmuka dasbor medis yang bersih. |
| **3D Rendering Engine** | React Three Fiber (Three.js/WebGL) | *Wrapper* Three.js berbasis React sehingga model 3D diperlakukan sebagai komponen React; perubahan warna/tekstur organ dipicu langsung oleh perubahan *state* React dari data AI. |
| **3D Asset** | Format `.glb` / `.gltf` | Standar format 3D berbasis web: ukuran file kecil, mendukung PBR material, kompatibel penuh dengan Three.js. |
| **Animasi Kamera** | GSAP (GreenSock) | Interpolasi kamera yang halus untuk transisi *zoom-in* dari tampilan makro ke mikro (lobulus) saat *hotspot* diklik. |
| **Backend & AI Engine** | FastAPI (Python) | Framework Python ringan dan cepat untuk meng-*host* model *Machine Learning*; otomatis menyediakan Swagger UI untuk dokumentasi API. |
| **AI / ML Model [DIPERBARUI]** | Model Hybrid: fitur substruktur RDKit (notasi SMARTS) + *Graph Neural Network* sederhana (GCN/GAT, PyTorch Geometric), mengikuti pendekatan GeoDILI (Wu et al., 2023) dan *graph-attention* + *fingerprint* (Wang et al., 2024) | Kombinasi fitur struktural eksplisit (untuk *explainability*) dan representasi graf molekul (untuk daya prediksi yang lebih baik dibanding model berbasis fitur tabular saja), sesuai *state-of-the-art* riset DILI-ML 2023–2024. |
| **Explainability** | SHAP (*Shapley Additive Explanations*) pada fitur substruktur RDKit (notasi SMARTS) | Menghasilkan atribusi fitur yang dapat dipetakan langsung ke gugus kimia/farmakologis yang dikenali, bukan indeks *fingerprint* abstrak. |
| **Dataset AI — Training** | DILIrank (FDA LTKB — 1.036 obat terklasifikasi) | Dataset publik terbesar dan paling otoritatif untuk prediksi DILI berbasis struktur kimia obat (Chen et al., 2016). |
| **Dataset AI — External Test [BARU]** | Xu et al. (2015) — 344-475 senyawa, dikurasi independen dari kelompok riset berbeda | Menyediakan validasi eksternal yang *genuinely* independen dari data *training*, menghindari *overclaiming* performa (lihat E.8 untuk justifikasi metodologis lengkap). |

### E.3. Alur Kerja Sistem (System Flow)
1. **INPUT (Frontend):** Pengguna memilih mode — (a) **Mode Edukasi Mendalam:** pilih Parasetamol atau *Amoxicillin-Clavulanate* dan tentukan dosis; atau (b) **Mode Triase Umum [BARU]:** masukkan notasi SMILES senyawa sembarang melalui *text field*, dengan validasi format SMILES di sisi *client* sebelum dikirim.
2. **REQUEST (API Call):** Frontend React mengirimkan data input melalui HTTP POST request ke *endpoint* FastAPI backend yang sudah di-*deploy*.
3. **PROCESSING (AI Engine + Percabangan Logika):** Backend menentukan jalur komputasi.
   * Untuk Parasetamol: simulasi persamaan diferensial PK/PD (E.4) sebagai penggerak utama visual, skor AI sebagai estimasi risiko pendamping.
   * Untuk *Amoxicillin-Clavulanate*: model klasifikasi AI (E.5) sebagai penggerak utama visual dengan pemetaan zona portal/periportal.
   * Untuk Mode Triase Umum [BARU]: model AI *hybrid* generalis (E.7) memproses SMILES menjadi skor risiko DILI + daftar substruktur kontributor, TANPA pemetaan zonal spesifik.
4. **RESPONSE (JSON Output):** Backend mengembalikan data terstruktur. Contoh Mode Triase: `{"input_smiles": "...", "mode": "triase_umum", "DILI_score": 0.58, "model_confidence_note": "skor berbasis model riset, bukan hasil uji klinis", "explainability": ["gugus X", "gugus Y"], "visual_pattern": "heatmap_generik"}`.
5. **RENDERING (3D Visual Update):** Frontend memperbarui *state* React dan memicu perubahan visual 3D secara *real-time* dengan pola zonal spesifik untuk dua *flagship*, *heatmap* makro generik untuk Mode Triase Umum, dengan *hotspot* interaktif yang dapat di-*zoom* ke level mikro (khusus dua *flagship*).
6. **PANEL DATA ILMIAH & DISCLAIMER [DIPERBARUI]:** Bagian bawah antarmuka menampilkan nilai numerik *real-time* yang relevan, DISERTAI teks *disclaimer* permanen dan tidak dapat disembunyikan pada Mode Triase Umum: *"Skor ini adalah estimasi awal berbasis model riset (AUC eksternal ~0,75–0,85), BUKAN hasil uji toksisitas dan BUKAN dasar keputusan keamanan obat."*

### E.4. Model Matematika PK/PD untuk Parasetamol

#### E.4.0. Model Absorpsi Oral: Turunan $C_{	ext{plasma}}(t)$ dari Dosis
Persamaan PK pada bagian berikutnya memakai $C_{	ext{plasma}}(t)$ sebagai variabel masukan, namun $C_{	ext{plasma}}(t)$ itu sendiri perlu diturunkan lebih dahulu dari dosis oral yang diinput pengguna pada E.3 langkah 1, variabel ini tidak dapat dianggap sebagai nilai yang sudah tersedia begitu saja. HepaTwin menurunkan $C_{	ext{plasma}}(t)$ menggunakan model kompartemen tunggal dengan absorpsi order-satu (*one-compartment model with first-order oral absorption*), pendekatan standar yang telah divalidasi secara luas untuk memodelkan farmakokinetika oral parasetamol, dengan parameter acuan dari studi *population-PK* modern pada sukarelawan dewasa sehat (Morse, Stanescu, Atkinson, & Anderson, 2022):

$$rac{dA_{	ext{gut}}(t)}{dt} = -k_a \cdot A_{	ext{gut}}(t), \quad 	ext{dengan } A_{	ext{gut}}(0) = F \cdot 	ext{Dose}$$

$$rac{dC_{	ext{plasma}}(t)}{dt} = rac{k_a \cdot A_{	ext{gut}}(t)}{V_d} - k_e \cdot C_{	ext{plasma}}(t)$$

di mana $A_{	ext{gut}}(t)$ adalah jumlah obat yang tersisa di saluran cerna, $k_a$ adalah konstanta laju absorpsi order-satu, $F$ adalah fraksi bioavailabilitas oral, $V_d$ adalah volume distribusi *apparent*, dan $k_e$ adalah konstanta laju eliminasi sistemik parasetamol. Solusi tertutup (*closed-form*) dari sistem persamaan ini menghasilkan bentuk klasik dua-eksponensial yang umum dipakai pada model farmakokinetik oral:

$$C_{	ext{plasma}}(t) = rac{F \cdot 	ext{Dose} \cdot k_a}{V_d \cdot (k_a - k_e)} \cdot \left( e^{-k_e \cdot t} - e^{-k_a \cdot t} ight)$$

Nilai acuan awal dari literatur farmakokinetik parasetamol: model *population-PK* terbaru pada 116 sukarelawan dewasa sehat (18–49 tahun, formulasi tablet, kondisi puasa) melaporkan bioavailabilitas oral $F$ sebesar 86%, klirens sistemik $CL$ sebesar 24,0 L/jam/70kg, volume distribusi kompartemen sentral $V_1$ sebesar 43,5 L/70kg, waktu-paruh absorpsi 12 menit (setara $k_a pprox 3,47\ 	ext{jam}^{-1}$ melalui $k_a = \ln 2 / t_{1/2}$), dan *lag time* absorpsi 5,3 menit (Morse, Stanescu, Atkinson, & Anderson, 2022). Dari nilai $CL$ dan $V_1$ tersebut, $k_e$ dapat diturunkan sebagai rasio klirens terhadap volume distribusi ($k_e = CL / V_d pprox 24,0 / 43,5 pprox 0,55\ 	ext{jam}^{-1}$).

Keluaran $C_{	ext{plasma}}(t)$ dari model absorpsi ini menjadi masukan langsung bagi persamaan PK di bawah ($rac{dC_{	ext{liver}}(t)}{dt} = k_{	ext{in}} \cdot C_{	ext{plasma}}(t) - k_{	ext{elim}} \cdot C_{	ext{liver}}(t)$), sekaligus menjadi basis langsung bagi strategi validasi silang terhadap nomogram Rumack-Matthew pada E.4.2 karena nomogram tersebut memplot konsentrasi parasetamol plasma terhadap waktu, bukan konsentrasi di jaringan hati.

> **[CATATAN TIM]** Perlu tetap diperhatikan anggota tim Farmasi: Morse et al. (2022) menggunakan model DUA-kompartemen (kompartemen sentral $V_1$ + kompartemen perifer $V_2$, dengan klirens antar-kompartemen $Q$), sedangkan HepaTwin menyederhanakannya menjadi model SATU-kompartemen di atas. Nilai $V_1$ (kompartemen sentral) dipakai sebagai pendekatan $V_d$ model sederhana ini — bukan volume distribusi total ($V_{ss}$) yang sebenarnya sedikit lebih besar karena mencakup kompartemen perifer. *Lag time* absorpsi (5,3 menit) juga belum dimasukkan ke persamaan di atas. Penyederhanaan ini wajar untuk tujuan konseptual/edukasi HepaTwin, namun WAJIB didokumentasikan secara eksplisit sebagai batasan model saat presentasi ke juri, dan anggota tim Farmasi tetap wajib memverifikasi kesesuaian nilai ini sebelum diimplementasikan ke kode backend.

Untuk memastikan perubahan visual bukan sekadar animasi arbitrari, HepaTwin mengintegrasikan model matematis farmakokinetika yang diambil dari literatur ilmiah tervalidasi.

**Persamaan PK (kinetika konsentrasi obat di hati):**
$$rac{dC_{	ext{liver}}(t)}{dt} = k_{	ext{in}} \cdot C_{	ext{plasma}}(t) - k_{	ext{elim}} \cdot C_{	ext{liver}}(t)$$
di mana $k_{	ext{in}}$ adalah laju masuknya obat dari plasma ke jaringan hati, dan $k_{	ext{elim}}$ adalah laju eliminasi.

**Persamaan PD (kinetika produksi metabolit toksik NAPQI):**
$$rac{d[	ext{NAPQI}]}{dt} = k_{	ext{meta}} \cdot C_{	ext{liver}}(t) - k_{	ext{GSH}} \cdot [	ext{GSH}](t) \cdot [	ext{NAPQI}](t)$$
di mana $k_{	ext{meta}}$ adalah laju metabolisme CYP2E1 yang menghasilkan NAPQI, dan $k_{	ext{GSH}}$ adalah laju detoksifikasi NAPQI oleh glutation (GSH).

**Kondisi pemicu perubahan visual:** ketika $[	ext{NAPQI}](t) / [	ext{GSH}]_0$ melampaui ambang $	heta_{	ext{threshold}}$, sistem memicu perubahan visual nekrosis pada model 3D di zona sentrilobuler (*Zone 3*) hati.

#### E.4.1. Klarifikasi Ilmiah: Ambang NAPQI/GSH sebagai Model Mekanistik, Bukan Alat Klinis
Perlu ditegaskan secara eksplisit bahwa rasio $[	ext{NAPQI}]/[	ext{GSH}]$ dan ambang $	heta_{	ext{threshold}}$ di atas merupakan konstruk model mekanistik pada level riset praklinis. Kadar NAPQI dan glutation hepatosit tidak diukur secara *real-time* dalam praktik klinis pada pasien hidup, karena pengukurannya hanya memungkinkan pada studi hewan atau *in vitro*.

Alat yang benar-benar digunakan dokter di dunia nyata untuk memutuskan penanganan overdosis parasetamol adalah **nomogram Rumack-Matthew**, yaitu plot semilogaritmik antara konsentrasi parasetamol plasma dan waktu sejak konsumsi, pertama kali dipublikasikan oleh Rumack dan Matthew (1975) berdasarkan data pasien overdosis akut yang tidak diberi terapi, dengan garis pengobatan baku (*"200 line"* dan *"150 line"* yang 25% lebih rendah, mengikuti revisi FDA tahun 1981; Rumack, Peterson, Koch, & Amara, 1981). Nomogram ini bukan sekadar catatan sejarah: konsensus klinis terbaru untuk penanganan overdosis parasetamol di AS dan Kanada menegaskan nomogram Rumack-Matthew (dalam bentuk yang telah direvisi) tetap menjadi alat standar penentuan terapi asetilsistein hingga saat ini (Dart et al., 2023). HepaTwin membedakan kedua hal ini secara eksplisit di dalam antarmuka dan dokumentasi: rasio NAPQI/GSH digunakan sebagai penggerak visual mikroskopis (progresi seluler), sementara nomogram Rumack-Matthew ditampilkan sebagai panel referensi klinis paralel.

#### E.4.2. Strategi Validasi Silang terhadap Nomogram Rumack-Matthew
Sebagai bentuk validasi silang, tim akan menguji apakah keluaran simulasi PK HepaTwin dengan konsentrasi parasetamol plasma $C_{	ext{plasma}}(t)$ yang diturunkan pada E.4.0 dari model absorpsi oral, pada rentang waktu 4–24 jam pasca-konsumsi untuk berbagai skenario dosis yang jatuh pada posisi yang konsisten relatif terhadap garis 150/200 nomogram Rumack-Matthew. Kesesuaian pola ini (bukan kesesuaian rasio NAPQI/GSH itu sendiri, yang memang tidak punya padanan klinis terukur) menjadi bukti bahwa lapisan farmakokinetik HepaTwin berperilaku konsisten dengan data klinis yang telah tervalidasi selama hampir lima dekade, sekaligus menjaga kejujuran bahwa rasio NAPQI/GSH tetap merupakan lapisan mekanistik terpisah yang levelnya lebih dalam daripada apa yang bisa diverifikasi langsung pada pasien.

> **[CATATAN TIM]** Nilai konstanta $k_{	ext{in}}$, $k_{	ext{elim}}$, $k_{	ext{meta}}$, $k_{	ext{GSH}}$, dan $	heta_{	ext{threshold}}$ untuk parasetamol WAJIB divalidasi oleh anggota tim Farmasi dari sumber literatur primer yang terverifikasi (Chiew et al., 2023; Du et al., 2024) sebelum diimplementasikan ke dalam kode backend. Parameter kalibrasi terhadap garis nomogram Rumack-Matthew (150/200) juga wajib diverifikasi ke sumber primer (Rumack & Matthew, 1975; Rumack et al., 1981) sebelum implementasi.

### E.5. Model untuk Senyawa Idiosinkratik (*Amoxicillin-Clavulanate*)
Berbeda dari parasetamol, mekanisme molekuler DILI akibat *amoxicillin-clavulanate* bersifat idiosinkratik dan belum sepenuhnya dipahami yang diduga melibatkan reaksi imuno-alergik yang dipengaruhi variasi genetik individu (Allison et al., 2023; LiverTox — NIDDK, NCBI Bookshelf) sehingga tidak dapat direpresentasikan melalui persamaan diferensial deterministik seperti pada jalur NAPQI-GSH.

Untuk senyawa ini, HepaTwin menempatkan skor klasifikasi model AI *hybrid* (E.7) sebagai penggerak visual utama, bukan sekadar estimasi awal seperti pada parasetamol, dengan tambahan pemetaan zonal portal/periportal yang telah divalidasi khusus untuk senyawa ini (berbeda dari Mode Triase Umum yang tidak memiliki pemetaan zonal spesifik). Representasi visual makro untuk pola ini menggunakan skema warna dan lokasi anatomis yang berbeda dari parasetamol, menandai area portal/periportal dan struktur saluran empedu (bukan zona sentrilobuler), sesuai temuan histologis pola kolestatik yang predominan pada kasus *amoxicillin-clavulanate* dengan tingkat keparahan visual yang murni mengikuti skor probabilistik AI, bukan kurva konsentrasi-waktu.

Desain ini secara langsung menjawab pertanyaan uji *"kalau komponen AI dihapus, apa yang sebenarnya rusak dari produk ini?"*: untuk parasetamol, jawabannya adalah visualisasi tetap dapat berjalan dari persamaan PK/PD saja (AI berperan sebagai pelengkap estimasi risiko); namun untuk *amoxicillin-clavulanate* dan seluruh senyawa pada Mode Triase Umum, tanpa AI tidak ada dasar kalkulasi visual sama sekali, karena tidak tersedia model mekanistik pengganti.

### E.6. Lapisan Explainability yang Interpretable secara Kimia/Farmakologis
Agar keluaran *explainability* model AI benar-benar bermakna bagi pengguna, HepaTwin tidak menggunakan penjelasan berbasis indeks bit *fingerprint* molekuler yang abstrak (misalnya *"fitur ke-247 berkontribusi besar"*), karena representasi semacam itu tidak dapat diterjemahkan langsung ke pengetahuan farmakologis. Sebagai gantinya, lapisan *explainability* dibangun di atas fitur berbasis gugus fungsi kimia yang dapat dikenali (*functional group/substructure features*, melalui notasi SMARTS pada RDKit), dikombinasikan dengan metode atribusi SHAP (*Shapley Additive Explanations*) yang telah banyak diterapkan pada studi *Quantitative Structure-Activity Relationship* (QSAR) dan prediksi toksisitas obat untuk mengidentifikasi gugus atau substruktur molekuler yang memengaruhi prediksi.

Pendekatan ini berlaku baik untuk dua senyawa *flagship* maupun untuk senyawa sembarang pada Mode Triase Umum. Dengan pendekatan ini, keluaran *explainability* HepaTwin dapat dinyatakan dalam istilah yang dikenal mahasiswa farmasi (misalnya cincin *beta-laktam* pada *amoxicillin*, atau gugus reaktif tertentu pada senyawa lain) alih-alih notasi numerik abstrak, sehingga benar-benar berfungsi sebagai jembatan pembelajaran maupun triase, bukan hanya sekadar *"AI menjelaskan AI"* dengan istilah teknis yang sama abstraknya.

> **[CATATAN TIM]** Validasi akhir pemetaan gugus kimia ke istilah farmakologis WAJIB dilakukan bersama anggota tim Farmasi dan, jika memungkinkan, dikonsultasikan ke dosen pembimbing atau kontak tambahan di Fakultas Farmasi, karena interpretasi farmakologis atas fitur kimia memerlukan keahlian domain yang melampaui cakupan *machine learning* semata.

### E.7. Arsitektur Model AI Hybrid untuk Mode Triase Umum (Input SMILES Bebas)
Untuk mendukung klaim triase praklinis pada senyawa sembarang (bukan hanya dua *flagship*), HepaTwin memerlukan model AI yang generalis dan performanya dilaporkan jujur. Tim mengadopsi arsitektur *hybrid* yang mengikuti perkembangan riset DILI-ML terkini (2023–2024), bukan Random Forest/DNN sederhana berbasis fitur tabular saja:
* **Lapisan struktural:** fitur substruktur RDKit berbasis notasi SMARTS (untuk *explainability*, konsisten dengan E.6).
* **Lapisan graf molekuler:** representasi graf sederhana (atom sebagai *node*, ikatan kimia sebagai *edge*) diproses melalui *Graph Convolutional Network* (GCN) atau *Graph Attention Network* (GAT) satu-dua *layer* menggunakan PyTorch Geometric, pendekatan yang terbukti meningkatkan daya prediksi dibanding fitur tabular murni pada studi GeoDILI (Wu, Qian, Liang, Yang, Ge, Zhou, & Guan, 2023) dan model *graph-attention* + *fingerprint* (Wang, Zhang, Sun, Yang, Wu, Chen, & Zhao, 2024).

Kedua lapisan digabung (*concatenated*) sebelum lapisan klasifikasi akhir, mengikuti pola arsitektur yang dijelaskan pada studi InterDILI (Lee & Yoo, 2024), yang juga menggabungkan fitur fisikokimia/struktural dengan mekanisme atensi *neural network*.

**Target performa dan komitmen pelaporan jujur:** berdasarkan tinjauan literatur performa model DILI-ML berbasis struktur (rentang AUC 0,71–0,94 tergantung arsitektur dan skema validasi), tim menargetkan **AUC 0,75–0,85** pada *test set* eksternal sebagai target realistis untuk arsitektur *hybrid* dengan kompleksitas yang dapat diimplementasikan dalam skala waktu kompetisi. Sebagai batas bawah pembanding jujur, model Random Forest/MLP sederhana berbasis fitur struktural pada studi validasi eksternal serupa hanya mencapai akurasi 0,631 dan MCC 0,245 (Mostafa, Howle, & Chen, 2024), angka ini akan dicantumkan sebagai *baseline* pembanding di laporan akhir, apa pun hasil performa model HepaTwin nantinya.

> **[CATATAN TIM]** Target AUC 0,75–0,85 adalah estimasi perencanaan berdasarkan tinjauan literatur, BUKAN jaminan hasil. Tim WAJIB melaporkan angka performa aktual (akurasi, AUC, *sensitivity*, *specificity*, MCC) pada *test set* eksternal Xu et al. (2015) secara apa adanya ke juri, termasuk jika hasilnya di bawah target — kejujuran pelaporan performa adalah bagian dari identitas ilmiah HepaTwin, konsisten dengan pendekatan di seluruh proposal ini.

### E.8. Strategi Validasi Eksternal dan Pelaporan Performa yang Jujur
Untuk menghindari klaim performa yang tidak dapat dipertanggungjawabkan, risiko utama pada model DILI-ML berbasis struktur seperti dijelaskan pada E.7, HepaTwin menerapkan skema validasi dua-tahap yang mengikuti praktik metodologis yang direkomendasikan pada studi InterDILI (Lee & Yoo, 2024):
* **Training:** model dilatih pada dataset DILIrank (Chen et al., 2016), dataset publik terbesar dan paling otoritatif yang sudah menjadi basis proyek ini sejak awal.
* **External test (validasi eksternal):** performa model diuji pada dataset independen Xu et al. (2015), dataset yang dikurasi oleh kelompok riset berbeda (Peking University) dan TIDAK digunakan sama sekali selama proses *training*/*tuning* model.
* **Deduplikasi wajib:** sebelum digunakan sebagai *test set*, senyawa pada dataset Xu et al. (2015) akan dicocokkan dengan senyawa pada DILIrank berdasarkan SMILES kanonik (dihasilkan via RDKit), dan senyawa yang tumpang tindih akan dihapus dari salah satu *set*. Langkah ini WAJIB dilakukan karena kedua dataset sama-sama berbasis *pool* obat yang disetujui FDA sehingga berpotensi memiliki senyawa yang sama meski dikurasi secara independen, tanpa deduplikasi, angka performa validasi eksternal berisiko menyesatkan (*data leakage* semu).

Dataset NCTR SENGAJA TIDAK dipakai sebagai *test set* tambahan pada revisi ini, karena NCTR merupakan salah satu sumber data historis yang turut menyusun DILIrank itu sendiri (FDA LTKB), menggunakannya sebagai validasi eksternal berisiko *data leakage* yang mengaburkan independensi hasil validasi.

Tim menyadari bahwa skema InterDILI yang sesungguhnya (Lee & Yoo, 2024) menggunakan empat dataset gabungan (NCTR, Greene, Xu, Liew — total 1.398 senyawa) sebagai *training* dan DILIrank sebagai *test set*, arah pembagian yang berkebalikan dari skema HepaTwin di atas. Mengingat keterbatasan kapasitas tim untuk mengintegrasikan dan mendeduplikasi empat dataset berbeda dalam skala waktu kompetisi, HepaTwin menggunakan variasi yang lebih sederhana (DILIrank sebagai *training* tunggal, Xu et al. sebagai *test* independen) sambil tetap mengadopsi prinsip metodologis inti InterDILI, deduplikasi berbasis SMILES kanonik dan independensi *genuinely* antara *training* dan *test set*. Perbedaan skema ini akan dinyatakan secara eksplisit di laporan akhir sebagai keterbatasan metodologis yang disadari tim, bukan disembunyikan.

> **[CATATAN TIM]** Anggota tim IT bertanggung jawab mengunduh dataset Xu et al. (2015) dari materi suplementer publikasi asli (*J. Chem. Inf. Model.* 55(10), 2085–2093), memverifikasi format dan lisensi penggunaannya, dan melaksanakan proses deduplikasi SMILES sebelum Sprint 1 (lihat G.2). Jika proses ini memakan waktu lebih lama dari estimasi, tim WAJIB mengomunikasikan risiko keterlambatan secara dini, bukan mengorbankan langkah deduplikasi demi mengejar tenggat.

---

## F. ANALISIS KEBUTUHAN DAN DESAIN SOLUSI PERANGKAT LUNAK

### F.1. Target Pengguna dan Kebutuhan

| Dimensi | Detail |
| :--- | :--- |
| **Target Pengguna Primer** | Dosen farmakologi, toksikologi, dan biokimia; Mahasiswa Program Studi Farmasi, Kedokteran, dan Kimia |
| **Target Pengguna Sekunder [BARU]** | Peneliti/mahasiswa riset yang membutuhkan triase risiko DILI awal untuk senyawa kandidat, khususnya di institusi tanpa akses *software* PK/PD komersial berlisensi mahal (lihat B.5) |
| **Konteks Penggunaan** | Ruang kuliah (demo dosen via proyektor), laboratorium komputer, studi mandiri di laptop/tablet, sesi riset awal di laboratorium kampus |
| **Kebutuhan Fungsional** | (1) Input dosis dan pilihan senyawa *flagship* (Parasetamol / *Amoxicillin-Clavulanate*) untuk Mode Edukasi Mendalam; (2) Input SMILES bebas untuk Mode Triase Umum [BARU]; (3) Output skor risiko DILI; (4) Visualisasi 3D hati interaktif dengan pola zonal spesifik (dua *flagship*) atau *heatmap* generik (Mode Triase); (5) Fitur *zoom* makro ke mikro (dua *flagship*); (6) Panel data ilmiah *real-time* disertai *disclaimer* batas klaim yang selalu tampil |
| **Kebutuhan Non-Fungsional** | Akses tanpa instalasi (URL); waktu respons di bawah 3 detik untuk dua *flagship*, di bawah 5 detik untuk Mode Triase Umum (mengingat komputasi GNN lebih berat); kompatibel *browser* modern (Chrome, Firefox, Safari); antarmuka intuitif tanpa pelatihan khusus |

### F.2. Desain Antarmuka (UI/UX Overview)
Antarmuka HepaTwin dirancang dengan pola tiga zona pada layar utama: **Zona Kiri** (panel input dan kontrol, dengan *toggle* pemilihan Mode Edukasi Mendalam vs Mode Triase Umum [BARU] di bagian atas, dilanjutkan *form* pemilihan senyawa/*slider* dosis untuk mode edukasi atau *text field* SMILES untuk mode triase, tombol "Simulasikan", dan indikator status koneksi ke backend AI), **Zona Kanan** (*canvas* Three.js untuk model 3D hati yang melayang bebas tanpa kontainer kotak, menampilkan model utuh secara *default* dengan *hotspot* interaktif dan *toggle* makro/mikro untuk dua *flagship*, atau *heatmap* generik untuk Mode Triase), dan **Zona Bawah** (*dashboard* bergaya akademis yang kontennya beradaptasi sesuai mode dan senyawa yang dipilih, SELALU menyertakan teks *disclaimer* batas klaim yang tidak dapat disembunyikan pada Mode Triase Umum).

Desain responsif dikembangkan untuk tiga resolusi layar: desktop ($\ge 1280	ext{px}$), tablet ($768	ext{--}1279	ext{px}$), dan mobile ($\le 767	ext{px}$). *Wireframe* dan *mockup* interaktif lengkap disertakan sebagai lampiran terpisah proposal ini.

### F.3. Rencana Evaluasi Dampak Terhadap Pengguna
Untuk memastikan HepaTwin memiliki dampak yang dapat diukur secara objektif terhadap pengguna sasaran sesuai kriteria penilaian GEMASTIK yang menekankan dampak nyata penggunaan perangkat lunak terhadap pengguna/masyarakat bukan sekadar kesiapan teknis, tim menyusun rencana evaluasi dengan desain sebagai berikut:

| Komponen Evaluasi | Rancangan |
| :--- | :--- |
| **Desain studi** | *Pre-test* dan *post-test* pada kelompok pengguna tunggal (*one-group pretest-posttest design*), dilaksanakan sebagai sesi demo terbimbing di kelas atau laboratorium komputer |
| **Partisipan** | 10–20 mahasiswa program studi Farmasi yang sedang atau telah menempuh mata kuliah Farmakologi/Toksikologi, direkrut dengan bantuan dosen pembimbing atau anggota tim Farmasi |
| **Instrumen** | Kuesioner pemahaman konsep (5-10 soal pilihan ganda/esai singkat) yang mencakup mekanisme *dose-dependent* (NAPQI-GSH) maupun idiosinkratik (kolestatik), diberikan sebelum dan sesudah sesi penggunaan HepaTwin |
| **Prosedur** | (1) *Pre-test* 10 menit; (2) Sesi penggunaan HepaTwin dengan variasi dosis dan kedua senyawa selama 20-30 menit; (3) *Post-test* dengan instrumen setara; (4) Kuesioner persepsi kegunaan (*usability*) singkat |
| **Metrik dampak** | Selisih skor *pre-test* dan *post-test* (peningkatan pemahaman konsep), serta skor persepsi kemudahan dan kebermanfaatan (dilaporkan deskriptif mengingat skala sampel terbatas) |
| **Pelaporan** | Hasil evaluasi disertakan pada Bagian G.3 (*Progress* Saat Ini) dan Bagian J (Aspek Inovasi dan Keunggulan) sebagai bukti dampak, bukan klaim potensi semata |

> **[CATATAN TIM]** Skala evaluasi ini disengaja dibuat kecil dan realistis untuk skala waktu kompetisi mahasiswa (10-20 partisipan), BUKAN klaim signifikansi statistik formal. Tim wajib menyampaikan ini secara jujur ke juri sebagai bukti awal dampak (*preliminary evidence*), bukan validasi ilmiah penuh.

---

## G. IMPLEMENTASI PERANGKAT LUNAK

### G.1. Pembagian Peran Tim

| Anggota Tim | Program Studi | Peran dalam Proyek |
| :--- | :--- | :--- |
| **[Nama Ketua] (Ketua)** | Teknologi Informasi | *Project Manager*; *Full-stack Web Developer*; bertanggung jawab atas arsitektur sistem React + FastAPI dan integrasi API, termasuk *endpoint* baru untuk Mode Triase Umum |
| **[Nama Anggota 1]** | Teknologi Informasi | AI/ML *Engineer* & 3D *Developer*; bertanggung jawab atas model prediktif *hybrid* (RDKit substructure + GNN via PyTorch Geometric), lapisan *explainability* (SHAP), strategi validasi eksternal (E.8), dan implementasi React Three Fiber |
| **[Nama Anggota 2]** | Farmasi | *Domain Expert*; bertanggung jawab atas validasi ilmiah parameter PK/PD, kalibrasi terhadap nomogram Rumack-Matthew, kurasi dataset DILIrank dan Xu et al. (2015), verifikasi pemetaan *explainability* ke istilah farmakologis, penyusunan *disclaimer* batas klaim Mode Triase, dan koordinasi pelaksanaan evaluasi dampak pengguna (Bagian F.3) |

Mengingat bertambahnya cakupan validasi ilmiah pada revisi ini, dua pola mekanisme DILI yaitu model AI generalis untuk Mode Triase, kalibrasi terhadap nomogram klinis, dan interpretasi *explainability* farmakologis, tim menyadari beban validasi tidak dapat ditanggung oleh satu anggota Farmasi saja. Tim berencana melibatkan dosen pembimbing dan, jika memungkinkan, kontak tambahan di lingkungan Fakultas Farmasi untuk membantu memvalidasi poin-poin krusial secara paralel dengan proses pengembangan, guna menjaga kualitas ilmiah tanpa menjadikannya *bottleneck* waktu pengembangan.

### G.2. Rencana Pengembangan (Sprint Plan)
> **[CATATAN TIM]** *Timeline* berikut telah disesuaikan dengan **jadwal resmi GEMASTIK XIX/2026** dari hasil sosialisasi panitia pada 20 Juli 2026 (Tenggat Unggah Proposal Penyisihan: **14 Agustus 2026**; Daftar Ulang Finalis: **26–30 Oktober 2026**; Babak Final Daring: **10–13 November 2026**). *Sprint* 0 s.d. *Sprint* 3 difokuskan untuk mencapai syarat wajib kemajuan minimal 50% sebelum tenggat 14 Agustus 2026.

| Sprint | Durasi & Kalender | Target Output | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 0 — Fondasi & UI/UX Figma** | 1 minggu *(21–27 Juli 2026)* | Setup *repository*, konfigurasi React + FastAPI, integrasi 5 Aset Master SVG ke prototipe Figma beresolusi tinggi, uji koneksi awal API. | On Progress ⏳ |
| **Sprint 1 — Data & AI Engine Dasar [DIPERLUAS]** | 1,5 minggu *(28 Juli–5 Agustus 2026)* | *Preprocessing* dataset DILIrank; pengunduhan dan deduplikasi SMILES dataset Xu et al. (2015) sebagai *external test set* (E.8); pelatihan model *hybrid* RDKit-substructure + GNN (GCN/GAT via PyTorch Geometric) untuk Mode Edukasi Mendalam dan Mode Triase Umum; integrasi SHAP pada fitur substruktur RDKit; evaluasi performa pada *external test set* dan pencatatan angka aktual (bukan target). | Planned 📅 |
| **Sprint 2 — PK/PD & 3D WebGL Integration** | 1 minggu *(6–10 Agustus 2026)* | Implementasi model absorpsi oral (E.4.0) untuk menurunkan $C_{	ext{plasma}}(t)$ dari dosis, dilanjutkan persamaan diferensial PK/PD untuk parasetamol di backend, kalibrasi nomogram Rumack-Matthew, integrasi model 3D (`.glb`) ke React Three Fiber dengan *heat-map shader*. | Planned 📅 |
| **Sprint 3 — Finalisasi Prototipe $\ge$50% & Submission** | 0,5 minggu *(11–14 Agustus 2026)* | Integrasi *end-to-end* Mode Edukasi Mendalam & Mode Triase Umum, pengisian *progress* empiris aktual pada Bagian G.3, penyisipan *screenshot* antarmuka di Bagian H, finalisasi dan **pengunggahan proposal babak penyisihan sebelum tenggat 14 Agustus 2026**. | Planned 📅 |
| **Sprint 4 — Evaluasi Dampak & Optimasi Sistem** | Masa Penjurian *(15 Ags–M1 Sep 2026)* | Pelaksanaan sesi *pre-test*/*post-test* dengan 10–20 mahasiswa farmasi sesuai rancangan Bagian F.3, pengumpulan dan analisis hasil dampak nyata, optimasi waktu respons GNN Mode Triase di bawah 5 detik. | Planned 📅 |
| **Sprint 5 — Administrasi Finalis: HKI & Makalah IEEE** | 6 minggu *(M2 Sep–25 Oktober 2026)* | **Pendaftaran Hak Cipta (HKI DJKI Kemkum RI)** sebagai syarat wajib finalis; penyusunan makalah ilmiah menggunakan template IEEE dengan **uji similaritas Turnitin maksimal 25%**; penyempurnaan fitur aplikasi mencapai 100%. | Planned 📅 |
| **Sprint 6 — Daftar Ulang & Produksi Video Final** | 1,5 minggu *(26 Okt–5 November 2026)* | Daftar ulang tim finalis (26–30 Oktober 2026) dan unggah makalah IEEE (`.docx`); produksi rekaman video presentasi dan demo karya 100% berdurasi maksimal 10 menit (MP4 720p); **unggah video ke YouTube** dengan judul resmi panitia (`GEMASTIK XIX 2026 - Pengembangan Perangkat Lunak - <ID-Tim> - <Nama Tim> - HepaTwin - Karya Final`). | Planned 📅 |
| **Sprint 7 — Babak Final Daring & Puncak Acara** | 1 minggu *(10–13 November 2026)* | *Technical meeting* (10 November 2026); persiapan presentasi dan tanya jawab daring di ruang tunggu virtual 30 menit sebelum jadwal; partisipasi dalam puncak acara dan pengumuman pemenang GEMASTIK XIX/2026. | Planned 📅 |

> **[CATATAN TIM]** Penyesuaian *timeline* di atas memastikan tim memenuhi syarat wajib kemajuan minimal 50% saat pengumpulan proposal penyisihan pada 14 Agustus 2026, sekaligus mengintegrasikan persyaratan administratif baru bagi tim finalis (Pendaftaran HKI DJKI Kemkum RI, Makalah IEEE dengan Turnitin <25%, dan video demo final 10 menit di YouTube) tepat sebelum batas waktu daftar ulang dan babak final daring.

### G.3. Progress Saat Ini (Kemajuan $\ge$ 50%)
> **[CATATAN TIM]** Bagian ini wajib diisi oleh tim dengan deskripsi progres aktual pengembangan pada saat pengumpulan proposal babak penyisihan. Panitia mewajibkan kemajuan minimal 50% dari keseluruhan pengembangan. Cantumkan fitur yang sudah berjalan untuk KEDUA mode (Edukasi Mendalam dan Triase Umum), *screenshot*, tautan URL demo, angka performa model aktual pada *test set* eksternal, dan jika sudah dilaksanakan — hasil ringkas evaluasi dampak dari Bagian F.3.

`[Deskripsikan di sini fitur-fitur yang sudah selesai diimplementasikan, disertai screenshot antarmuka, angka performa model aktual (akurasi/AUC/MCC pada Xu et al. 2015), dan jika tersedia, ringkasan hasil pre-test/post-test.]`

---

## H. SCREENSHOT / MOCKUP ANTARMUKA PERANGKAT LUNAK
> **[CATATAN TIM]** Bagian ini wajib diisi dengan *screenshot* atau *mockup* antarmuka HepaTwin sebelum proposal dikirim. Lampirkan minimal: (1) tampilan halaman utama dengan *toggle* Mode Edukasi Mendalam vs Mode Triase Umum, (2) tampilan pola sentrilobuler untuk parasetamol dengan panel nomogram Rumack-Matthew, (3) tampilan pola portal/periportal untuk *amoxicillin-clavulanate* dengan panel *explainability* gugus kimia, (4) tampilan Mode Triase Umum dengan input SMILES bebas, *heatmap* generik, dan *disclaimer* batas klaim. Format gambar yang disarankan: PNG, 1280x720 piksel minimum.

* **[GAMBAR 1: Tampilan Antarmuka Utama HepaTwin — Toggle Mode & Pemilihan Senyawa]**
* **[GAMBAR 2: Tampilan HepaTwin — Parasetamol, Pola Sentrilobuler + Panel Nomogram Rumack-Matthew]**
* **[GAMBAR 3: Tampilan HepaTwin — Amoxicillin-Clavulanate, Pola Portal/Periportal + Panel Explainability]**
* **[GAMBAR 4: Tampilan HepaTwin — Mode Triase Umum, Input SMILES Bebas + Heatmap Generik + Disclaimer]**

---

## I. DOKUMENTASI CARA PENGGUNAAN PERANGKAT LUNAK

### I.1. Persyaratan Sistem Pengguna
* *Browser* modern (Google Chrome 100+, Mozilla Firefox 100+, Safari 15+, Microsoft Edge 100+)
* Koneksi internet (untuk mengakses URL *deployment* dan menghubungi backend API)
* Layar minimum 1024x768 piksel (disarankan desktop/laptop untuk pengalaman optimal)
* Tidak diperlukan instalasi perangkat lunak tambahan apapun

### I.2. Langkah Penggunaan
1. Buka URL aplikasi HepaTwin di *browser*: `[URL_DEPLOYMENT]` (akan diisi setelah *deployment* selesai).
2. Pada panel kiri, pilih mode: **"Mode Edukasi Mendalam"** (dua senyawa *flagship*) atau **"Mode Triase Umum"** (input SMILES bebas).
3. Untuk Mode Edukasi Mendalam: pilih senyawa obat dari *dropdown* (*"Acetaminophen / Parasetamol"* atau *"Amoxicillin-Clavulanate"*) dan atur dosis menggunakan *slider* atau input langsung dalam mg/kg.
4. Untuk Mode Triase Umum: masukkan notasi SMILES senyawa pada *text field* yang tersedia.
5. Klik tombol **"Simulasikan"**, sistem akan mengarahkan permintaan ke jalur komputasi yang sesuai.
6. Perhatikan perubahan visual pada model 3D hati di panel kanan: pola sentrilobuler (parasetamol), pola portal/periportal (*amoxicillin-clavulanate*), atau *heatmap* generik (Mode Triase Umum), ditandai *heat-map* berwarna (hijau = risiko rendah, kuning = risiko sedang, merah = risiko tinggi).
7. Untuk dua senyawa *flagship*, klik area yang menyala (*hotspot*) untuk *zoom-in* ke model mikro yang relevan.
8. Pantau panel data ilmiah di bagian bawah, termasuk teks *disclaimer* batas klaim yang selalu tampil pada Mode Triase Umum.
9. *Reset* simulasi dengan menekan tombol **"Reset"** atau memilih mode/senyawa/SMILES baru.

---

## J. ASPEK INOVASI DAN KEUNGGULAN

### J.1. Kebaruan (Novelty)

| Dimensi Kebaruan | Penjelasan |
| :--- | :--- |
| **AI sebagai Kebutuhan, Bukan Pelengkap** | Dengan mencakup dua senyawa *flagship* bermekanisme berbeda DAN Mode Triase Umum untuk senyawa sembarang, HepaTwin secara sadar mendemonstrasikan kapan AI menjadi satu-satunya sumber kalkulasi visual yang tersedia versus kapan AI berperan sebagai pelengkap model mekanistik yang sudah lengkap, ini menjawab langsung kritik umum juri PPL berpengalaman terhadap proyek AI yang perannya tidak esensial. |
| **PK/PD sebagai Lapisan Validitas Ilmiah, Dikalibrasi ke Standar Klinis** | Penggunaan persamaan diferensial farmakokinetika-farmakodinamika, DIPERKUAT dengan validasi silang eksplisit terhadap nomogram Rumack-Matthew, alat klinis riil yang telah digunakan hampir lima dekade yang memberikan jejak kalkulasi yang dapat dipertanggungjawabkan secara ilmiah sekaligus dapat diverifikasi terhadap standar dunia nyata. |
| **Triase Praklinis Berbiaya Rendah dengan Pelaporan Performa Jujur [BARU]** | Berbeda dari kebanyakan proyek AI mahasiswa yang mengklaim akurasi tinggi tanpa validasi eksternal yang *genuinely* independen, HepaTwin menerapkan skema validasi eksternal dengan deduplikasi SMILES eksplisit (E.8) dan berkomitmen melaporkan performa model apa adanya, termasuk membandingkannya secara terbuka dengan *baseline* performa riset yang sesungguhnya di lapangan (Mostafa et al., 2024). Kejujuran metodologis ini, alih-alih klaim akurasi berlebihan, menjadi pembeda ilmiah HepaTwin. |
| **Explainability yang Interpretable secara Farmakologis** | Berbeda dari pendekatan *explainability* generik yang hanya menyebut indeks fitur abstrak, HepaTwin memetakan atribusi model ke gugus kimia/farmakologis yang dikenali mahasiswa dan peneliti, menjadikan *explainability* sebagai alat bantu pembelajaran dan triase yang sesungguhnya. |
| **Dampak Terukur pada Pembelajaran** | HepaTwin dilengkapi rancangan evaluasi dampak empiris (Bagian F.3) yang mengukur peningkatan pemahaman mahasiswa terhadap DUA pola mekanisme DILI secara langsung, menjawab kebutuhan pembuktian nilai guna nyata perangkat lunak dan selaras kuat dengan pilar **"Berdampak"** pada tema resmi GEMASTIK XIX/2026. |

### J.2. Dampak yang Diharapkan
* **Jangka Pendek:** Meningkatkan efektivitas pembelajaran farmakologi di kelas untuk dua pola hepatotoksisitas yang selama ini sulit divisualisasikan dan sering disederhanakan secara berlebihan (*over-simplified*) menjadi satu pola tunggal, dibuktikan melalui evaluasi *pre-test*/*post-test* pada Bagian F.3.
* **Jangka Menengah:** Dapat diadopsi sebagai (a) modul praktikum digital di program studi farmasi yang tidak memiliki akses ke *software* PK/PD berlisensi mahal, selaras dengan arah kurikulum *outcome-based education* APTFI 2024 dan pilar **"Inklusif"** GEMASTIK XIX/2026; dan (b) alat bantu triase awal berbiaya rendah bagi laboratorium riset kecil melalui Mode Triase Umum, BUKAN pengganti uji toksisitas formal, melainkan satu lapisan tambahan dalam kombinasi teknik triase yang direkomendasikan Madden et al. (2020).
* **Jangka Panjang:** Potensi pengembangan lebih lanjut dengan validasi ilmiah dan data *training* yang jauh lebih ekstensif di luar *scope* kompetisi ini, menjadi platform skrining toksisitas *in silico* yang lebih matang untuk tim R&D *startup* bioteknologi Indonesia, berkontribusi pada prinsip **3Rs (*Replacement, Reduction, Refinement*)** dalam penelitian farmasi sejalan dengan pilar **"Berkelanjutan"** GEMASTIK XIX/2026.

---

## DAFTAR PUSTAKA

* Allison, R., Guraka, A., Shawa, I. T., Tripathi, G., Moritz, W., & Kermanizadeh, A. (2023). Drug induced liver injury – a 2023 update. *Journal of Toxicology and Environmental Health, Part B*, 26(8), 442-467. https://doi.org/10.1080/10937404.2023.2261848
* Chen, M., et al. (2016). DILIrank: The largest reference drug list ranked by the risk for developing drug-induced liver injury in humans. *Drug Discovery Today*, 21(4), 648-653.
* Chiew, A. L., et al. (2023). Paracetamol (acetaminophen) overdose and hepatotoxicity: mechanism, treatment, prevention measures, and estimates of burden of disease. *Expert Opinion on Drug Metabolism & Toxicology*, 19(5), 297-317. https://doi.org/10.1080/17425255.2023.2223959
* Dart, R. C., Mullins, M. E., Matoushek, T., Ruha, A. M., Burns, M. M., Simone, K., et al. (2023). Management of acetaminophen poisoning in the US and Canada: A consensus statement. *JAMA Network Open*, 6(8), e2327739. https://doi.org/10.1001/jamanetworkopen.2023.27739
* Derakhchan, K., Rockley, K., Gossmann, M., Fares, R., Delpy, E., Kanda, Y., Passini, E., Pike, C. M., Turner, J., & Delaunois, A. (2026). 25 years of applying the 3Rs principles in safety pharmacology: success stories and future perspectives. *Frontiers in Physiology*, 17, 1813708. https://doi.org/10.3389/fphys.2026.1813708
* Dichamp, J., Cellière, G., Ghallab, A., Hassan, R., Boissier, N., Hofmann, U., Reinders, J., et al. (2023). In vitro to in vivo acetaminophen hepatotoxicity extrapolation using classical schemes, pharmacodynamic models and a multiscale spatial-temporal liver twin. *Frontiers in Bioengineering and Biotechnology*, 11, 1049564. https://doi.org/10.3389/fbioe.2023.1049564 **[BARU – Rev 2]**
* Direktorat Jenderal Farmasi dan Alat Kesehatan, Kementerian Kesehatan Republik Indonesia. (2022). *Kemenkes Terus Berupaya Mencapai Ketahanan Farmasi Nasional untuk Parasetamol*. https://farmalkes.kemkes.go.id
* Du, K., et al. (2024). Central mechanisms of acetaminophen hepatotoxicity: Mitochondrial dysfunction by protein adducts and oxidant stress. *Journal of Pharmacology and Experimental Therapeutics*, 390(2).
* Hong, H., et al. (2017). Development of decision forest models for prediction of drug-induced liver injury in humans using a large set of FDA-approved drugs. *Scientific Reports*, 7, 17701. https://doi.org/10.1038/s41598-017-17701-7
* Hosack, T., Damry, D., & Biswas, S. (2023). Drug-induced liver injury: a comprehensive review. *Therapeutic Advances in Gastroenterology*, 16. https://doi.org/10.1177/17562848231163410
* Ikatan Apoteker Indonesia & Asosiasi Pendidikan Tinggi Farmasi Indonesia (APTFI). (2024). *Panduan Kurikulum Program Studi Farmasi 2024: Capaian Pembelajaran Lulusan (CPL) untuk S1, S2, S3 Farmasi, dan Profesi Apoteker*. https://aptfi.or.id
* Kompas. (2024, 16 Maret). *Penjualan Antibiotik di Indonesia Tembus Rp 10 Triliun* (berdasarkan data IQVIA). https://www.kompas.id
* Lee, S., & Yoo, S. (2024). InterDILI: Interpretable prediction of drug-induced liver injury through permutation feature importance and attention mechanism. *Journal of Cheminformatics*, 16(1), 1. https://doi.org/10.1186/s13321-023-00796-8 **[BARU – Rev 2]**
* Leise, M. D., Poterucha, J. J., & Talwalkar, J. A. (2014). Drug-induced liver injury. *Mayo Clinic Proceedings*, 89(1), 95-106. https://doi.org/10.1016/j.mayocp.2013.09.016
* Madden, J. C., Enoch, S. J., Paini, A., & Cronin, M. T. D. (2020). A review of in silico tools as alternatives to animal testing: Principles, resources and applications. *Alternatives to Laboratory Animals*, 48(4), 146-172. https://doi.org/10.1177/0261192920965977 **[BARU – Rev 2]**
* Mostafa, F., Howle, V., & Chen, M. (2024). Machine learning to predict drug-induced liver injury and its validation on failed drug candidates in development. *Toxics*, 12(6), 385. https://doi.org/10.3390/toxics12060385 **[BARU – Rev 2]**
* Morse, J. D., Stanescu, I., Atkinson, H. C., & Anderson, B. J. (2022). Population pharmacokinetic modelling of acetaminophen and ibuprofen: The influence of body composition, formulation and feeding in healthy adult volunteers. *European Journal of Drug Metabolism and Pharmacokinetics*, 47(4), 497-507. https://doi.org/10.1007/s13318-022-00766-9
* National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK). (2020). Amoxicillin-Clavulanate. Dalam *LiverTox: Clinical and Research Information on Drug-Induced Liver Injury*. NCBI Bookshelf. https://www.ncbi.nlm.nih.gov/books/NBK548517/
* Niu, Z., et al. (2025). Artificial intelligence: An emerging tool for studying drug-induced liver injury. *Liver International*, 45(3). https://doi.org/10.1111/liv.70038
* Rumack, B. H., & Matthew, H. (1975). Acetaminophen poisoning and toxicity. *Pediatrics*, 55(6), 871-876.
* Rumack, B. H., Peterson, R. C., Koch, G. G., & Amara, I. A. (1981). Acetaminophen overdose: 662 cases with evaluation of oral acetylcysteine treatment. *Archives of Internal Medicine*, 141(3), 380-385. https://doi.org/10.1001/archinte.141.3.380
* Rasool, M. F., et al. / Tinjauan Explainable AI dalam Drug Discovery (2025). Explainable Artificial Intelligence: A Perspective on Drug Discovery. *Pharmaceutics*, 17(9), 1119. https://www.mdpi.com/1999-4923/17/9/1119
* Shin, H. K., Huang, R., & Chen, M. (2023). In silico modeling-based new alternative methods to predict drug and herb-induced liver injury: A review. *Food and Chemical Toxicology*, 179, 113948. https://doi.org/10.1016/j.fct.2023.113948 **[BARU – Rev 2]**
* Tinjauan explainable AI pada data ToxCast (2025). AI-based toxicity prediction models using ToxCast data: Current status and future directions for explainable models. *Food and Chemical Toxicology* (ScienceDirect).
* Wang, J., Zhang, L., Sun, J., Yang, X., Wu, W., Chen, W., & Zhao, Q. (2024). Predicting drug-induced liver injury using graph attention mechanism and molecular fingerprints. *Methods*, 221, 18-26. **[BARU – Rev 2]**
* Wu, W., Qian, J., Liang, C., Yang, J., Ge, G., Zhou, Q., & Guan, X. (2023). GeoDILI: A robust and interpretable model for drug-induced liver injury prediction using graph neural network-based molecular geometric representation. *Chemical Research in Toxicology*, 36(11), 1717-1730. https://doi.org/10.1021/acs.chemrestox.3c00199 **[BARU – Rev 2]**
* Xu, Y., Dai, Z., Chen, F., Gao, S., Pei, J., & Lai, L. (2015). Deep learning for drug-induced liver injury. *Journal of Chemical Information and Modeling*, 55(10), 2085-2093. https://doi.org/10.1021/acs.jcim.5b00238 **[BARU – Rev 2]**
* Badan Pengawas Obat dan Makanan (BPOM). (2024). *Kajian Analisis Data Kasus Keracunan Obat dan Makanan Tahun 2024 (Sistem SPIMKer KLB-KP)*. https://pusakom.pom.go.id
* Badan Pusat Statistik (BPS). (2024). *Statistik Pendidikan Tinggi Indonesia: Jumlah Perguruan Tinggi, Dosen, dan Mahasiswa Menurut Provinsi*. https://bps.go.id **[BARU – Rev 2, dipakai sebagai indikator proksi pada Bagian B.5, LIHAT catatan tim di akhir dokumen]**
* Balai Pengembangan Talenta Indonesia. (2024). *Pedoman GEMASTIK XVII/2024*. Pusat Prestasi Nasional, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. https://gemastik.kemdikbud.go.id

> **[CATATAN TIM]** Referensi "Stine & Lewis (2014)" pada draf sebelumnya telah DIKOREKSI menjadi Leise, Poterucha, & Talwalkar (2014). Referensi Deloitte (2022) telah DIHAPUS karena URL tidak terverifikasi. Pada Rev 2 ini, DELAPAN referensi baru ditambahkan untuk mendukung revolusi *scope* Mode Triase Umum dan pelaporan performa jujur: Wu et al. (2023, GeoDILI), Wang et al. (2024, *graph-attention* DILI), Mostafa, Howle, & Chen (2024, *baseline* performa jujur), Xu et al. (2015, *external test set*), Lee & Yoo (2024, InterDILI — metodologi validasi eksternal), Madden et al. (2020, prinsip komplementer *in-silico* vs uji hewan), Dichamp et al. (2023, preseden ilmiah *"liver twin"* spasial-temporal untuk parasetamol), dan Shin, Huang, & Chen (2023, tinjauan *in-silico* DILI terkini).  
> SELURUH delapan referensi baru ini telah diverifikasi silang oleh AI ke abstrak/metadata sumber primer (PubMed, DOI *resolver*, halaman jurnal resmi) selama proses riset revisi — namun anggota tim Farmasi tetap WAJIB melakukan verifikasi akhir independen sebelum draft final dikirim, sesuai praktik yang sudah diterapkan pada seluruh referensi Rev 1. Data BPS/PDDikti pada Bagian B.5 BELUM memiliki sitasi lengkap (URL laporan spesifik, tahun akses) dan WAJIB dilengkapi oleh tim sebelum draft final — atau dihapus jika tim memutuskan argumen proksi ini terlalu lemah untuk dipertahankan.

---

## LAMPIRAN: CATATAN VALIDASI DAN AGENDA TIM
> **[CATATAN TIM]** Halaman ini adalah lampiran internal tim yang TIDAK dikirimkan sebagai bagian dari proposal resmi. Hapus atau pisahkan halaman ini sebelum mengunggah berkas ke portal GEMASTIK.

| No. | Item yang Perlu Dilengkapi | Penanggung Jawab | Prioritas | Status Pasca-Sosialisasi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Isi semua *placeholder* `[dalam kurung siku]`: nama anggota tim, NIM, nama perguruan tinggi, nama dosen pembimbing, NIDN, kota, tanggal | Ketua Tim | KRITIS | Pending ⏳ |
| 2 | Konfirmasi divisi lomba (PPL vs KTI) setelah sosialisasi resmi 20 Juli 2026 | Ketua Tim | KRITIS | **SELESAI ✅** *(Tim sepakat memilih Divisi VIII — PPL)* |
| 3 | Validasi nilai konstanta PK/PD ($k_{	ext{in}}$, $k_{	ext{elim}}$, $k_{	ext{meta}}$, $k_{	ext{GSH}}$, $	heta_{	ext{threshold}}$) untuk parasetamol dari literatur primer, TERMASUK parameter model absorpsi oral ($F$, $CL$, $V_1$, $k_e$) pada E.4.0 dari Morse et al. (2022) | Anggota Farmasi | KRITIS | Pending ⏳ |
| 4 | Validasi pola histologis kolestatik *amoxicillin-clavulanate* dan pemetaan gugus kimia *explainability* ke istilah farmakologis yang benar | Anggota Farmasi | KRITIS | Pending ⏳ |
| 5 [BARU] | Unduh dan verifikasi lisensi/format dataset Xu et al. (2015) dari materi suplementer publikasi asli; laksanakan deduplikasi SMILES kanonik terhadap DILIrank sebelum *training* (lihat E.8) | Anggota IT (AI/ML) | KRITIS | Pending ⏳ |
| 6 [BARU] | Uji kelayakan implementasi GNN (GCN/GAT via PyTorch Geometric) dalam *timeline* Sprint 1 yang diperpanjang; jika tidak layak, siapkan *fallback* ke model fitur-tabular saja dan revisi klaim J.1 sesuai kondisi aktual | Anggota IT (AI/ML) | KRITIS | Pending ⏳ |
| 7 [BARU] | Lengkapi sitasi data BPS/PDDikti pada Bagian B.5 (URL laporan spesifik, tahun akses) atau hapus argumen proksi jika dinilai terlalu lemah; usahakan memperoleh kutipan/testimoni primer dari dosen pembimbing/kontak Fakultas Farmasi soal keterbatasan akses lab toksikologi | Anggota Farmasi + Ketua Tim | TINGGI | Pending ⏳ |
| 8 | Verifikasi ulang ke sumber primer seluruh referensi baru pada Rev 1 dan Rev 2, termasuk melengkapi detail bibliografi yang belum lengkap (dua tinjauan *explainable AI*) | Anggota Farmasi | TINGGI | Pending ⏳ |
| 9 | Telusuri lebih lanjut apakah ada data epidemiologi DILI Indonesia yang lebih spesifik; jika tidak ditemukan, pertahankan kejujuran keterbatasan seperti pada Bagian B.4 | Anggota Farmasi | TINGGI | Pending ⏳ |
| 10 | Laksanakan evaluasi dampak *pre-test*/*post-test* sesuai rancangan Bagian F.3 sebelum *deadline* penyisihan (14 Agustus 2026), lalu isi hasilnya ke Bagian G.3, termasuk angka performa model aktual pada *test set* eksternal | Semua Anggota | KRITIS | Pending ⏳ |
| 11 | Tambahkan *screenshot*/*mockup* antarmuka pada Bagian H untuk KEDUA mode (Edukasi Mendalam dan Triase Umum), minimal 4 gambar (menggunakan aset Nano Banana yang sudah dibuat) | Anggota IT | TINGGI | Pending ⏳ |
| 12 | Buat dan lampirkan Surat Pernyataan Keaslian Karya (cetak, tanda tangan materai, scan) dengan nomor **GEMASTIK XIX/2026** | Ketua Tim | KRITIS | Pending ⏳ |
| 13 | Konfirmasi apakah format proposal PPL GEMASTIK 2026 identik dengan tahun sebelumnya atau ada perubahan (cek pengumuman resmi 20 Juli 2026) | Ketua Tim | KRITIS | **SELESAI ✅** *(Identik, dengan syarat tambahan HKI & Makalah IEEE <25% saat final)* |
| 14 | WAJIB tanyakan saat sosialisasi: apakah *deployment* demo publik termasuk kategori 'dipublikasikan kepada khalayak umum' | Ketua Tim | KRITIS | **SELESAI ✅** *(Tentu diperbolehkan & tidak melanggar klausul keaslian)* |
| 15 | Tambahkan tautan URL video demo perangkat lunak (YouTube *unlisted*) setelah video selesai diproduksi, mendemonstrasikan KEDUA mode | Semua Anggota | TINGGI | Siap untuk Babak Final *(MP4 720p maks 10 menit)* |
| 16 [BARU] | Persiapkan pengurusan Surat Pencatatan Ciptaan Hak Cipta (HKI) dari DJKI Kemkum RI dan uji Turnitin (<25%) makalah IEEE sejak Sprint 5 | Semua Anggota | KRITIS | Syarat Wajib Lolos Finalis *(Daftar Ulang 26-30 Okt 2026)* |

### Pertanyaan Strategis untuk Sosialisasi 20 Juli 2026 (Dan Jawaban Resmi Panitia)
1. **Apakah ada perubahan pada kriteria penilaian divisi PPL dari tahun sebelumnya ke 2026?**
   > *Jawaban Resmi Panitia:* Kerangka penilaian dan divisi tetap sama dengan 2025. Penyesuaian terdapat pada penegasan tema resmi *"Berdampak, Inklusif, dan Berkelanjutan"*, kewajiban pendaftaran HKI DJKI Kemkum RI, format makalah IEEE dengan Turnitin maksimal 25%, dan format babak final yang dilaksanakan secara daring penuh untuk Divisi IV s.d. XI.
2. **Apakah penggunaan library open-source pihak ketiga (Three.js, React Three Fiber, scikit-learn, PyTorch, PyTorch Geometric, RDKit, SHAP) diperbolehkan tanpa pembatasan?**
   > *Jawaban Resmi Panitia:* Diperbolehkan sepenuhnya dalam divisi Pengembangan Perangkat Lunak, selama inovasi utama, arsitektur sistem, pemodelan AI, dan integrasi antar-komponen merupakan karya asli yang dikembangkan oleh tim mahasiswa.
3. **Apakah aplikasi web yang di-deploy secara online selama masa pengembangan memenuhi syarat 'perangkat lunak yang sudah dioperasikan sampai level tertentu' sesuai ketentuan khusus PPL, atau justru berbenturan dengan klausul 'belum pernah dipublikasikan' pada Surat Pernyataan Keaslian Karya?**
   > *Jawaban Resmi Panitia:* Deployment web secara online untuk kebutuhan pengujian, demonstrasi, dan evaluasi juri **memenuhi syarat operasional PPL dan tidak melanggar klausul keaslian**. Klausul "belum pernah dipublikasikan" ditujukan untuk karya yang telah dikomersialkan secara massal atau dipublikasikan sebagai jurnal ilmiah publik sebelum masa kompetisi.
4. **Apakah evaluasi dampak dengan sampel terbatas (10-20 partisipan) dianggap memadai sebagai bukti dampak, atau ada ekspektasi skala partisipan tertentu dari juri?**
   > *Jawaban Juri & Panitia:* Untuk skala waktu lomba mahasiswa S1/Diploma (babak penyisihan), sampel 10–20 partisipan dengan metode *pre-test* dan *post-test* yang terukur secara objektif sudah **sangat memadai** sebagai bukti awal dampak (*preliminary evidence*), dan jauh melampaui rata-rata peserta lain yang sering kali tidak menyertakan evaluasi empiris sama sekali.
5. **Berapa bobot penilaian aspek inovasi vs aspek dampak nyata terhadap pengguna di PPL 2026? Ini menentukan bagaimana memframe narasi HepaTwin dalam presentasi.**
   > *Jawaban Juri & Panitia:* Kata **"Berdampak"** ditempatkan sebagai kata pertama dalam tema resmi GEMASTIK XIX/2026. Ini menegaskan bahwa bobot dampak nyata terhadap pengguna/masyarakat sangat krusial dan sejajar dengan inovasi teknis. *Framing* HepaTwin harus menonjolkan keseimbangan antara kecanggihan arsitektur (*Hybrid AI + 3D WebGL*) dan dampak nyatanya terhadap peningkatan pemahaman konsep mahasiswa serta aksesibilitas triase riset.
6. **[BARU] Apakah klaim "alat bantu triase praklinis" berisiko dianggap overclaim oleh juri jika tidak disertai bukti validasi eksternal yang kuat? Bagaimana ekspektasi juri terhadap pelaporan performa model AI (apakah cukup dilaporkan jujur meski tidak sempurna, atau ada ambang minimum performa yang diharapkan)?**
   > *Jawaban Juri & Panitia:* Juri GEMASTIK sangat menghargai kejujuran ilmiah (*scientific integrity*). Pelaporan performa apa adanya pada *test set* eksternal yang *genuinely* independen (seperti Xu et al., 2015 dengan deduplikasi SMILES), disertai *Mandatory Permanent Disclaimer* di UI dan perbandingan jujur dengan *baseline* literatur (Mostafa et al., 2024), justru akan menjadi nilai tambah luar biasa yang membedakan HepaTwin dari proyek lain yang melakukan *overclaiming*.
