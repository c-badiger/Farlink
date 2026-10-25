import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingCart, Check, Calendar, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import VerificationBadge from './VerificationBadge';

export const ProductCard = ({ product }) => {
  const { language, t, getLocalized } = useLanguage();
  const { addToCart, items } = useCart();

  const title = getLocalized(product, 'title');
  const subTitle = language === 'kn' ? product.title_en : product.title_kn;
  const categoryName = getLocalized(product, 'category_name') || product.category_slug;

  const isAlreadyInCart = items.some((it) => it.product.id === product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
          alt={title}
          className="product-image"
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-category">{categoryName}</span>
          <span className="badge badge-grade">{product.quality_grade?.split(' ')[0]}</span>
        </div>
      </Link>

      <div className="product-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <Link to={`/products/${product.id}`}>
            <h3 className="product-title">{title}</h3>
          </Link>
          <VerificationBadge status={product.verification_status} />
        </div>

        {subTitle && <div className="product-title-kn">{subTitle}</div>}

        <div className="product-farmer-meta">
          <Link to={`/farmers/${product.farmer_id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
            {product.farm_name || product.farmer_name}
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <MapPin size={13} color="var(--primary)" />
            {product.location_district}, {product.location_taluk}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={13} />
            {new Date(product.harvest_date).toLocaleDateString()}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--accent-earth)', marginBottom: '8px', fontStyle: 'italic' }}>
          • {product.farming_method}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span>{t('min_order')}: <strong>{product.min_order_quantity} {product.unit}</strong></span>
          <span>{t('available_stock')}: <strong>{product.available_quantity} {product.unit}</strong></span>
        </div>

        <div className="product-price-box">
          <div>
            <span className="price-currency">₹{Number(product.price_per_unit).toLocaleString('en-IN')}</span>
            <span className="price-unit"> / {product.unit}</span>
          </div>

          <button
            onClick={handleAdd}
            className={`btn btn-sm ${isAlreadyInCart ? 'btn-secondary' : 'btn-primary'}`}
            style={{ marginLeft: 'auto' }}
            title={isAlreadyInCart ? t('added_to_cart') : t('add_to_cart')}
          >
            {isAlreadyInCart ? (
              <>
                <Check size={14} /> {t('added_to_cart')}
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> {t('add_to_cart')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
