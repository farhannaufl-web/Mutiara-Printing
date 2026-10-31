/**
 * Mutiara Printing - Site & Business Configuration
 * Centralized business constants, editable content, contact details, and FAQs.
 */

export const SITE_CONFIG = {
  name: 'Mutiara Printing',
  tagline: 'Spesialis Custom Plakat, Trophy & Medali Berkualitas di Jakarta',
  shortDescription:
    'Pengrajin plakat resin, akrilik, timah/logam, trophy kristal, dan medali kejuaraan di Blok M Square Jakarta Selatan. Hasil presisi, material premium, dan pengerjaan tepat waktu.',
  
  // WhatsApp Configuration (Format 62 without +)
  whatsapp: {
    number: '628128557441',
    displayNumber: '+62 812-8557-441',
    defaultMessage: 'Halo Mutiara Printing, saya mau konsultasi dan tanya soal pembuatan plakat / trophy.',
  },

  // Address & Workshop Location
  location: {
    address: 'Blok M Square, Basement Blok D No. 8, Jl. Melawai 5, Melawai, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160',
    shortAddress: 'Blok M Square, Basement Blok D No. 8, Jakarta Selatan',
    hours: '10.00 WIB - 20.00 WIB (Setiap Hari)',
    mapsUrl: 'https://maps.google.com/?q=Blok+M+Square+Jakarta',
    // Embedded Google Maps iframe for Blok M Square
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.264259850117!2d106.7960350757912!3d-6.244304893744031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f16e10825c9b%3A0xe96c21e6498a44b8!2sBlok%20M%20Square!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid',
  },

  // Social & Online presence
  social: {
    instagram: 'mutiaraprinting.id',
    instagramUrl: 'https://instagram.com/mutiaraprinting.id',
    email: 'info@mutiaraprinting.com',
  },

  // Product categories
  categories: [
    {
      id: 'resin',
      name: 'Plakat Resin',
      slug: 'resin',
      description: 'Tampilan 3D eksklusif dengan kejernihan resin polimer premium dan ornamen logam terpatri rapi.',
      badgeText: 'Paling Populer',
    },
    {
      id: 'akrilik',
      name: 'Plakat Akrilik',
      slug: 'akrilik',
      description: 'Potongan laser presisi tinggi dengan hasil bening kristal, grafir halus, atau cetak UV warna tajam.',
      badgeText: 'Pengerjaan Cepat',
    },
    {
      id: 'timah',
      name: 'Plakat Timah & Logam',
      slug: 'timah',
      description: 'Kesan mewah dan berbobot dengan sepuhan emas, perak, atau perunggu bertekstur relief timbul elegan.',
      badgeText: 'Resmi & Formal',
    },
    {
      id: 'kristal',
      name: 'Trophy Kristal',
      slug: 'kristal',
      description: 'Refleksi cahaya mewah dengan potongan bevel prisma optical crystal untuk penghargaan eksekutif.',
      badgeText: 'Executive Choice',
    },
    {
      id: 'medali',
      name: 'Medali Kejuaraan',
      slug: 'medali',
      description: 'Medali logam cor atau kuningan dengan tali lanyard custom untuk kompetisi, wisuda, dan event olahraga.',
      badgeText: 'Pesanan Massal',
    },
    {
      id: 'lainnya',
      name: 'Custom Souvenir',
      slug: 'lainnya',
      description: 'Pin enamel, nametag magnet, gantungan kunci akrilik, dan plakat kayu kombinasi plat logam.',
      badgeText: 'Bisa Request',
    },
  ],

  // Trust Strip Points (Editable constants)
  trustPoints: [
    {
      title: 'Workshop Fisik Terpercaya',
      description: 'Bisa kunjungi & cek sampel langsung di Blok M Square Basement Blok D No. 8',
    },
    {
      title: 'Pengerjaan Cepat & Presisi',
      description: 'Didukung mesin laser CNC dan finishing pengrajin berpengalaman belasan tahun',
    },
    {
      title: 'Custom Desain Tanpa Batas',
      description: 'Bantu olah logo institusi, siluet gedung, atau konsep khusus sesuai kebutuhan',
    },
    {
      title: 'Kirim Aman Seluruh Indonesia',
      description: 'Packing kayu dan bubble wrap tebal berlapis anti pecah hingga lokasi tujuan',
    },
  ],

  // 4-Step Order Process
  orderSteps: [
    {
      number: '01',
      title: 'Pilih / Kirim Desain',
      description: 'Pilih model dari katalog kami atau kirimkan sketsa/konsep logo yang ingin dibuatkan plakat.',
    },
    {
      number: '02',
      title: 'Konsultasi via WhatsApp',
      description: 'Diskusikan estimasi budget, spesifikasi ukuran, material, dan mockup digital preview.',
    },
    {
      number: '03',
      title: 'Konfirmasi & DP',
      description: 'Setelah preview desain disetujui, pembayaran uang muka (DP) dilakukan untuk memulai proses produksi.',
    },
    {
      number: '04',
      title: 'Produksi & Pengiriman',
      description: 'Pesanan dikerjakan dengan quality control ketat, siap diambil di Blok M Square atau dikirim ke alamat Anda.',
    },
  ],

  // Why choose us points
  whyChooseUs: [
    {
      title: 'Kualitas Material Grade A',
      desc: 'Hanya menggunakan resin bening jernih anti-menguning, akrilik murni, dan logam cor padat berspesifikasi tinggi.',
    },
    {
      title: 'Free Digital Mockup Preview',
      desc: 'Dapatkan visualisasi layout plakat sebelum naik cetak agar hasil akhir 100% sesuai ekspektasi Anda.',
    },
    {
      title: 'Fleksibel untuk Satuan Maupun Ribuan',
      desc: 'Melayani pesanan personal untuk kenang-kenangan pensiun/pembicara hingga tender ribuan medali kejuaraan.',
    },
    {
      title: 'Garansi Ketepatan Waktu',
      desc: 'Kami memahami deadline acara sangat sakral. Komitmen tanggal serah terima menjadi prioritas nomor satu.',
    },
  ],

  // FAQ Accordion
  faqs: [
    {
      question: 'Berapa minimal order pemesanan di Mutiara Printing?',
      answer:
        'Untuk plakat resin dan akrilik, Anda bisa memesan mulai dari 1 pcs (satuan) untuk kebutuhan cenderamata VIP atau pembicara seminar. Untuk medali dan souvenir tertentu, kami memberikan harga khusus grosir untuk kuantiti di atas 20 pcs.',
    },
    {
      question: 'Berapa lama estimasi waktu pengerjaan?',
      answer:
        'Pengerjaan standar memakan waktu 2 hingga 5 hari kerja tergantung tingkat kerumitan desain dan antrean workshop. Untuk pesanan mendesak (express/sameday untuk model akrilik standar), silakan hubungi tim kami di WhatsApp untuk konfirmasi slot kilat.',
    },
    {
      question: 'Apakah bisa dibuatkan desain jika belum memiliki gambar jadi?',
      answer:
        'Tentu bisa! Tim kami siap membantu membuatkan layout dan mockup digital gratis. Anda cukup mengirimkan logo perusahaan/kampus, susunan tulisan, dan preferensi bentuk plakat.',
    },
    {
      question: 'Apakah bisa kirim ke luar kota atau luar pulau?',
      answer:
        'Bisa banget. Kami rutin mengirim pesanan ke seluruh penjuru Indonesia (Sumatera, Kalimantan, Sulawesi, Bali, Papua) menggunakan ekspedisi kargo atau kurir kilat dengan proteksi bubble wrap dan opsi packing kayu agar aman tiba di tujuan.',
    },
    {
      question: 'Bagaimana prosedur pembayaran?',
      answer:
        'Pembayaran dapat dilakukan melalui transfer bank resmi kami. Biasanya diawali dengan DP 50% setelah desain disetujui, dan pelunasan 50% dilakukan saat pesanan selesai diproduksi sebelum dikirim atau saat diambil di toko.',
    },
  ],
};
