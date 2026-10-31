import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { handleWhatsAppClick } from '../../lib/whatsapp';
import { MessageCircle, Award, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  sourceContext?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  sourceContext = 'product_card',
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const coverImage = product.image_urls?.[0] || '';

  const handleCardClick = () => {
    navigate(`/produk/${product.slug}`);
  };

  const handleWAPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleWhatsAppClick(
      {
        productId: product.id,
        productTitle: product.title,
        categoryName: product.category,
        source: sourceContext,
      },
      e
    );
  };

  // Human-readable category label
  const categoryLabel =
    product.category === 'resin'
      ? 'Plakat Resin'
      : product.category === 'akrilik'
      ? 'Plakat Akrilik'
      : product.category === 'timah'
      ? 'Plakat Timah & Logam'
      : product.category === 'kristal'
      ? 'Trophy Kristal'
      : product.category === 'medali'
      ? 'Medali Kejuaraan'
      : product.category || 'Custom Plakat';

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#111A2C] transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    >
      {/* 4:3 Aspect Ratio Image Frame with subtle hover zoom */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        {!imageError && coverImage ? (
          <img
            src={coverImage}
            alt={product.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#1A263D] p-6 text-center text-slate-400">
            <Award className="h-10 w-10 text-amber-400/50 mb-2" />
            <span className="text-xs font-serif text-slate-300">{product.title}</span>
          </div>
        )}

        {/* Subtle top indicator for featured items */}
        {product.is_featured && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-300 backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            <span>Unggulan</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category metadata without generic pills (clean unboxed text with separator) */}
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
          <span className="capitalize">{categoryLabel}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">{product.min_order || 'Min. 1 pcs'}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {/* Material preview */}
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {product.material || product.description}
        </p>

        {/* Bottom CTA Row */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
            Detail Spesifikasi &rarr;
          </span>
          <button
            onClick={handleWAPress}
            aria-label={`Tanya ${product.title} via WhatsApp`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A227] px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 active:scale-95 whitespace-nowrap"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-slate-950" />
            <span>Tanya WA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
