import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">Erreur : {error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <h1>Liste des Produits</h1>
      
      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="product-count">
          {filteredProducts.length} produit(s) trouvé(s)
        </span>
      </div>

      {/* Liste des produits */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-description">
                  {product.description.substring(0, 100)}...
                </p>
                <div className="product-footer">
                  <span className="product-price">${product.price}</span>
                  <span className="product-rating">
                    ⭐ {product.rating.rate} ({product.rating.count} avis)
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">
            Aucun produit ne correspond à votre recherche "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductList;