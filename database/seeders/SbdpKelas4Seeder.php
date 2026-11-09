<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\StudentClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun guru Miss Elvi + materi SBdP Kelas 4 untuk daily test Kamis, 12 November 2026.
 *
 * Email akun: elvi@fithrahinsani.test. Password TIDAK ditulis di sini karena repo publik:
 * isi SEED_ELVI_PASSWORD di .env (lihat .env.example) sebelum menjalankan seeder,
 * lalu minta guru mengganti password lewat menu Pengaturan setelah login pertama.
 *
 * Ringkasan materi hanya berisi kalimat yang tertulis di slide Canva guru:
 *   - Egrang dan Engklek : https://canva.link/dk3sa28icbtztql ("SBdP 2 Kelas 4 26/27")
 *   - Ular Naga Panjang  : https://canva.link/yjip5ijokits1bs ("SBdP 3 Kelas 4")
 * Bagian yang hanya berupa gambar (langkah engklek pola Pesawat/Gunung/Kitiran) dan latihan
 * benar-salah tanpa kunci jawaban sengaja tidak dimasukkan.
 *
 * Jalankan: php artisan db:seed --class=SbdpKelas4Seeder
 */
class SbdpKelas4Seeder extends Seeder
{
    public function run(): void
    {
        $password = env('SEED_ELVI_PASSWORD');
        if (blank($password)) {
            throw new \RuntimeException('Isi SEED_ELVI_PASSWORD di .env sebelum menjalankan SbdpKelas4Seeder.');
        }

        User::firstOrCreate(
            ['email' => 'elvi@fithrahinsani.test'],
            ['name' => 'Miss Elvi', 'password' => Hash::make($password), 'role' => 'guru']
        );

        StudentClass::firstOrCreate(['name' => 'Kelas 4'], ['level' => '4']);

        $sbdp = Subject::firstOrCreate(
            ['name' => 'Seni Budaya dan Prakarya'],
            ['description' => 'SBdP']
        );

        foreach ($this->materials() as $name => $description) {
            Material::updateOrCreate(
                ['subject_id' => $sbdp->id, 'name' => $name],
                ['description' => $description]
            );
        }
    }

    private function materials(): array
    {
        return [
            'Permainan Egrang' => <<<'TXT'
Kisi-kisi:
1. Mengetahui permainan egrang dan cara memainkannya.
2. Mengetahui ragam penyebutan egrang di berbagai wilayah di Indonesia.

Ringkasan materi (Kelas 4, Week 1, 21-25 September):
- Awalnya permainan egrang dilakukan oleh anak laki-laki saja, tapi lambat laun anak perempuan juga ikut memainkannya.
- Cara bermain egrang ada dua: individu dan kelompok kecil. Kelompok kecil terdiri dari adu kecepatan dan saling menjatuhkan.
- Adu kecepatan: perlombaan dilakukan oleh 2-5 orang, bergerak dari garis start ke finish, untuk anak-anak usia 7-11 tahun.
- Saling menjatuhkan: adu keseimbangan, saling menjatuhkan dengan cara memukulkan (tackle) kaki bambu egrang lawan, untuk anak-anak usia 11-13 tahun.
- Bagian egrang: tumpuan tangan dan tumpuan kaki. Pada gambar, tinggi bambu 2,5 m dan tumpuan kaki berada 0,5 m dari bawah.
- Bambu yang biasa dipakai untuk permainan ini adalah bambu apus atau bambu wulung. Di Indonesia banyak jenis bambu lain, tapi jarang digunakan untuk membuat egrang karena mudah patah.
- Egrang dimainkan ketika memeriahkan peringatan hari kemerdekaan Indonesia pada bulan Agustus dan ketika festival kebudayaan daerah di Surakarta, Jawa Tengah.
- Fun fact: pada zaman dahulu, tukang pos mengantarkan surat-surat menggunakan egrang.

Ragam sebutan egrang di berbagai daerah di Indonesia:
- Sumatera Barat: tengkak-tengkak (tengkak artinya pincang).
- Sumatera Utara: jangkungan (istilah ini diperkirakan berasal dari orang Jawa yang berada di Sumatera Utara).
- Bengkulu: ingkau (yang berarti sepatu bambu).
- Jawa Tengah: jangkungan (berasal dari nama burung berkaki panjang).
- Jawa Barat: jajangkungan (yang berarti alat untuk membuat tinggi).
- Kalimantan Selatan: batungkau (berasal dari Bahasa Banjar).
- Suku Kaili, Sulawesi Tengah: tilako.
TXT,
            'Permainan Engklek' => <<<'TXT'
Kisi-kisi:
3. Mengetahui permainan engklek dan cara memainkannya.
4. Mengetahui ragam penyebutan engklek di berbagai wilayah di Indonesia.

Ringkasan materi (Kelas 4, Week 2, 28 September-2 Oktober):
- Engklek merupakan permainan melintasi pola yang sudah digambar di tanah dengan cara melompat.
- Permainan engklek membutuhkan gacuk atau beti yang dibuat dari pecahan genting sebagai properti yang digunakan untuk menandakan tempat yang tidak boleh dilompati.
- Gacuk harus memiliki bentuk berbeda antara satu anak dengan anak yang lain agar tidak tertukar.
- Pola lintasan engklek yang dicontohkan di materi: pola Pesawat, pola Gunung, dan pola Kitiran/Baling-baling.

Ragam sebutan engklek di berbagai daerah di Indonesia:
- istatak, setatak (Pekanbaru)
- gedrek (Belitang, Sumatera Selatan)
- engkek-engkek (Kalimantan Barat)
- cak lingking, tago (Bangka)
- ingkak ingking (Belitung)
- ingkling (Yogyakarta)
- dampu bulan (Betawi)
- dengkleng (Bali)
- gili-gili (Merauke)
- gedrik (Banyuwangi)
- sondah (Kulon Progo)
- cengkah-cengkah (Sumatera Utara)
- mpaa gopa (Dompu)
- cenge-cenge (Maluku Utara)
TXT,
            'Fabel Ular Naga Si Banyak Kawan' => <<<'TXT'
Kisi-kisi:
5. Memahami cerita fabel Ular Naga Si Banyak Kawan dan pesan moralnya.

Ringkasan cerita:
- Di sebuah hutan yang sangat lebat hiduplah seekor Ular Naga yang panjang dan besar sekali. Kulit tubuhnya berwarna hijau keemasan dan sisik-sisiknya tampak berujung tajam. Di bagian kepala ada jambul atau mahkota yang dilengkapi dua tanduk runcing, dan lidahnya menjulur panjang. Ular Naga terlihat menyeramkan, meski hatinya sebenarnya sangat baik.
- Karena penampilannya, hewan lain di hutan takut, menjauh, dan tidak mau berteman dengan Ular Naga. Hal ini membuatnya sangat sedih.
- Suatu hari, segerombolan Rusa (bapak, ibu, dan anak-anak Rusa) sedang bermain. Salah satu anak Rusa terperosok ke jurang yang cukup dalam. Bapak dan ibu Rusa bingung lalu berteriak mencari pertolongan, dan suaranya terdengar oleh Ular Naga.
- Keluarga Rusa awalnya takut, tetapi rasa takut mereda saat Ular Naga bertanya apa yang terjadi. Ular Naga menjulurkan kepalanya ke dasar jurang, mempersilakan anak Rusa naik ke jambul atau mahkota di kepalanya, lalu mengangkat kepalanya dan menurunkan anak Rusa di dekat bapak dan ibu Rusa.
- Keluarga Rusa berterima kasih dan meminta maaf karena selama ini berburuk sangka. Ular Naga memaafkan mereka dan meminta diizinkan bermain bersama keluarga Rusa dan hewan lainnya. Sejak itu Ular Naga selalu bermain dengan seluruh hewan di hutan, semua hidup rukun dan bahagia.
- Permainan yang sering dimainkan adalah Ular Naga Panjang, permainan berupa barisan panjang yang meliuk-liuk seperti Ular Naga.
- Sifat Ular Naga: baik hati dan pemaaf, karena ia senang menolong dan tidak dendam meski sempat dijauhi hewan lain.

Pesan moral:
- Tidak boleh menilai seseorang hanya dari penampilan fisiknya saja.
- Memiliki sikap suka menolong dan tidak dendam.
TXT,
            'Permainan Ular Naga Panjang' => <<<'TXT'
Kisi-kisi:
6. Mengetahui cara bermain permainan Ular Naga Panjang.
7. Memahami contoh desain kelompok dan desain lantai pada permainan Ular Naga Panjang.

Cara bermain Ular Naga Panjang:
1. Dua orang menjadi gerbang, sisanya menjadi ular naga.
2. Ular naga berjalan mengelilingi gerbang dengan pola lantai lingkaran.
3. Gerbang dan ular naga menyanyikan syair lagu.
4. Ketika lagu habis, orang yang berada di gerbang ditangkap.
5. Orang yang tertangkap harus memilih antara dua pilihan. Pilihan tersebut menentukan ia berdiri di gerbang yang satu atau yang satunya lagi.
6. Ketika semua pemain telah tertangkap dan berdiri di depan gerbang masing-masing, gerbang menjadi kepala naga dan pemain paling belakang menjadi ekor naga.
7. Kepala naga saling berusaha merebut ekor naga lawan sambil mempertahankan ekor naga milik sendiri.
- Pemain tidak boleh terputus pegangannya dengan pemain lain; hal ini melatih kerja sama.

Lirik lagu Ular Naga: "Ular naga panjangnya bukan kepalang, menjalar-jalar selalu kian kemari, umpan yang lezat itulah yang dicari, ini dianya yang terbelakang."

Elemen komposisi tari: desain gerak, desain kelompok, desain lantai, desain dramatik, desain musik, dinamika, serta kostum, tata rias, dan tata panggung.

Desain kelompok: gerakan yang dilakukan oleh lebih dari satu penari secara selaras. Dalam permainan Ular Naga:
- Unison (kompak): pemain/penari bergerak bersamaan mengelilingi gerbang sambil memegang pundak kawan.
- Canon (berurutan): gerakan menunduk secara bergantian setiap kali penari melewati gerbang.

Desain lantai (pola lantai): garis imajiner yang dilalui penari saat berpindah tempat dalam gerak tari. Dalam permainan Ular Naga:
- Lingkaran: ketika penari mengelilingi gerbang.
- Lurus atau diagonal: ketika tahap akhir kepala naga saling menangkap ekor naga lawan.
- Pola lantai permainan ular naga sarat nilai kebersamaan, kekompakan, dan tanggung jawab.
TXT,
        ];
    }
}
