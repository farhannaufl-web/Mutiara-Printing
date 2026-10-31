import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { handleWhatsAppClick } from '../lib/whatsapp';
import {
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Send,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [productType, setProductType] = useState('Plakat Resin');
  const [quantity, setQuantity] = useState('10 pcs');
  const [notes, setNotes] = useState('');

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customMessage = `Halo Mutiara Printing! Saya ${name.trim() || 'Pelanggan'}${
      institution ? ` dari ${institution.trim()}` : ''
    }. Saya ingin konsultasi pembuatan *${productType}* perkiraan kuantiti *${quantity}*. ${
      notes ? `Catatan/kebutuhan: ${notes}` : ''
    } Mohon info harga & jadwal pengerjaan.`;

    handleWhatsAppClick({
      source: 'contact_form_inquiry',
      customMessage,
    });
  };

  return (
    <>
      <Helmet>
        <title>Tentang &amp; Kontak Workshop – {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content={`Kunjungi workshop Mutiara Printing di Blok M Square Basement Blok D No. 8 Jakarta Selatan. Hubungi WhatsApp ${SITE_CONFIG.whatsapp.displayNumber} untuk pemesanan custom plakat.`}
        />
        <meta property="og:title" content={`Tentang & Kontak – ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={SITE_CONFIG.shortDescription} />
      </Helmet>

      <div className="min-h-screen bg-[#0B1120] pb-24">
        {/* Header */}
        <section className="border-b border-slate-800 bg-[#0E1626] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Tentang &amp; Workshop Fisik
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Hubungi Mutiara Printing
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Kami siap membantu kebutuhan plakat kenang-kenangan, trophy kejuaraan, dan cinderamata institusi Anda.
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Left 6 cols: Brand Story & Contact Details */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Brand Story */}
              <div className="rounded-2xl border border-slate-800 bg-[#121B2D] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
                    <Award className="h-6 w-6" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-white">
                    Tentang Mutiara Printing
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Berlokasi strategis di pusat percetakan dan pengrajin <strong>Blok M Square Basement</strong>, Mutiara Printing telah dipercaya oleh berbagai kementerian, BUMN, perguruan tinggi terkemuka, perbankan, dan event organizer untuk memproduksi aneka plakat, piala, dan medali berkualitas prima.
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Dengan mengombinasikan teknologi mesin potong laser grafir modern dan ketelitian tangan pengrajin senior, setiap plakat dibuat dengan standar kontrol kualitas tinggi demi menjaga wibawa instansi Anda.
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Garansi hasil presisi &amp; komitmen deadline tepat waktu</span>
                </div>
              </div>

              {/* Direct Workshop Info Cards */}
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-[#111A2B] p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="font-serif text-sm font-bold text-white">Alamat Workshop</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {SITE_CONFIG.location.address}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-4">
                    <a
                      href={SITE_CONFIG.location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <span>Buka Petunjuk Arah Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-[#111A2B] p-5">
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <h4 className="font-serif text-xs font-bold text-white">Jam Operasional</h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      {SITE_CONFIG.location.hours}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#111A2B] p-5">
                    <div className="flex items-center gap-2.5">
                      <Instagram className="h-4 w-4 text-pink-400" />
                      <h4 className="font-serif text-xs font-bold text-white">Instagram Resmi</h4>
                    </div>
                    <a
                      href={SITE_CONFIG.social.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium"
                    >
                      @{SITE_CONFIG.social.instagram}
                    </a>
                  </div>
                </div>

                {/* Direct Big WA button */}
                <button
                  onClick={(e) => handleWhatsAppClick({ source: 'contact_page_button' }, e)}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#C9A227] to-amber-600 py-3.5 px-4 text-sm font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400"
                >
                  <MessageCircle className="h-5 w-5 fill-slate-950" />
                  <span>Chat WhatsApp: {SITE_CONFIG.whatsapp.displayNumber}</span>
                </button>
              </div>

            </div>

            {/* Right 6 cols: Consultation Form + Map View */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Form Consultation */}
              <div className="rounded-2xl border border-slate-800 bg-[#121B2D] p-6 sm:p-8">
                <h3 className="font-serif text-lg font-bold text-white">
                  Formulir Konsultasi &amp; Penawaran Harga
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Isi perkiraan pesanan Anda di bawah. Data otomatis terformat rapi ke WhatsApp workshop kami.
                </p>

                <form onSubmit={handleConsultSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Nama Lengkap / Kontak
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Bpk. Hendra"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Instansi / Perusahaan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Contoh: PT Sumber Makmur"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Jenis Produk yang Diminati
                      </label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="Plakat Resin Crystal">Plakat Resin Crystal</option>
                        <option value="Plakat Akrilik Laser">Plakat Akrilik Laser</option>
                        <option value="Plakat Timah & Logam">Plakat Timah &amp; Logam</option>
                        <option value="Trophy Kristal Optical">Trophy Kristal Optical</option>
                        <option value="Medali Kejuaraan Logam">Medali Kejuaraan Logam</option>
                        <option value="Custom Souvenir / Pin">Custom Souvenir / Pin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Estimasi Kuantiti (Jumlah)
                      </label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Contoh: 1 pcs, 25 pcs, 100 pcs"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Kebutuhan Desain / Deadline Acara
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Butuh plakat dengan logo emas untuk acara tanggal 15 bulan depan..."
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C9A227] py-3 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
                  >
                    <Send className="h-4 w-4" />
                    <span>Kirim Penawaran ke WhatsApp</span>
                  </button>
                </form>
              </div>

              {/* Embedded Map */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Google Maps: Blok M Square Jakarta</span>
                </div>
                <div className="aspect-[16/9] w-full">
                  <iframe
                    title="Peta Lokasi Mutiara Printing"
                    src={SITE_CONFIG.location.mapsEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </>
  );
};
