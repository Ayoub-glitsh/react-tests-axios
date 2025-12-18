import axios from 'axios';

// Création d'une instance Axios configurée
const api = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 5000,
});

/**
 * Récupère la liste des produits
 * @returns {Promise<Array>} Liste des produits
 */
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    // Gestion d'erreur améliorée
    if (error.response) {
      // Erreur serveur (4xx, 5xx)
      throw new Error(`Erreur ${error.response.status}: ${error.response.data?.message || 'Problème serveur'}`);
    } else if (error.request) {
      // Pas de réponse du serveur
      throw new Error('Serveur inaccessible. Vérifiez votre connexion.');
    } else {
      // Erreur de configuration
      throw new Error('Erreur de configuration de la requête');
    }
  }
};

/**
 * Récupère un produit par son ID
 * @param {number} id - ID du produit
 * @returns {Promise<Object>} Détails du produit
 */
export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Produit ${id} non trouvé`);
  }
};