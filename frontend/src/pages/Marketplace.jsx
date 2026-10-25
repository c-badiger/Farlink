import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, MapPin, Wheat, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export const Marketplace = () => {
  const { t, getLocalized } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [qualityGrade, setQualityGrade] = useState(searchParams.get('grade') || '');
  const [farmingMethod, setFarmingMethod] = useState(searchParams.get('method') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load Categories & Districts once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          api.getCategories(),
          api.getDistricts()
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (distRes.success) setDistricts(distRes.districts || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search,
          category: selectedCategory,
          district: selectedDistrict,
          qualityGrade,
          farmingMethod,
          sort,
          minPrice,
          maxPrice
        };

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch marketplace products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Update URL query params
    const newParams = {};
    if (search) newParams.search = search;
    if (selectedCategory) newParams.category = selectedCategory;
    if (selectedDistrict) newParams.district = selectedDistrict;
    if (qualityGrade) newParams.grade = qualityGrade;
    if (farmingMethod) newParams.method = farmingMethod;
    if (sort !== 'newest') newParams.sort = sort;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    setSearchParams(newParams);
  }, [search, selectedCategory, selectedDistrict, qualityGrade, farmingMethod, sort, minPrice, maxPrice]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDistrict('');
    setQualityGrade('');
    setFarmingMethod('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = !!(search || selectedCategory || selectedDistrict || qualityGrade || farmingMethod || minPrice || maxPrice);

  return (
    <div style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Header with Search and Mobile Filter Toggle */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {t('marketplace')} • ಕರ್ನಾಟಕ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Direct agricultural marketplace connecting verified Karnataka growers with consumers, retailers, and bulk buyers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-select"
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="newest">{t('sort_newest')}</option>
                <option value="price_asc">{t('sort_price_low')}</option>
                <option value="price_desc">{t('sort_price_high')}</option>
                <option value="harvest_date">{t('sort_harvest')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar Filter Panel */}
          <aside className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}
                >
                  {t('clear_filters')}
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label className="form-label">{t('featured_categories')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">{t('all_categories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {getLocalized(c, 'name')} ({c.product_count || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="form-group">
              <label className="form-label">{t('filter_by_district')}</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="form-select"
              >
                <option value="">{t('all_districts')}</option>
                {districts.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district} ({d.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Grade Filter */}
            <div className="form-group">
              <label className="form-label">{t('quality_grade')}</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="form-select"
              >
                <option value="">{t('all_grades')}</option>
                <option value="Grade A (Premium)">Grade A (Premium)</option>
                <option value="Grade B (Standard)">Grade B (Standard)</option>
                <option value="Grade C (Fair)">Grade C (Fair)</option>
              </select>
            </div>

            {/* Farming Method Filter */}
            <div className="form-group">
              <label className="form-label">{t('farming_method')}</label>
              <select
                value={farmingMethod}
                onChange={(e) => setFarmingMethod(e.target.value)}
                className="form-select"
              >
                <option value="">{t('all_methods')}</option>
                <option value="Seller-Declared Organic">Seller-Declared Organic</option>
                <option value="Natural / ZBNF">Natural / ZBNF</option>
                <option value="Traditional Conventional">Traditional Conventional</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('price_range')} (₹)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </aside>

          {/* Product Listings Main Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div>
                <strong>{totalCount}</strong> {t('products_found')}
              </div>
              {hasActiveFilters && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedDistrict && (
                    <span className="badge badge-district" style={{ cursor: 'pointer' }} onClick={() => setSelectedDistrict('')}>
                      {selectedDistrict} ✕
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="badge badge-category" style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('')}>
                      {selectedCategory} ✕
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Loading fresh listings from Karnataka farmers...
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Wheat size={48} color="var(--border-subtle)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {t('no_products_found')}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                  {t('try_different_filter')}
                </p>
                <button type="button" onClick={clearAllFilters} className="btn btn-outline">
                  {t('clear_filters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
