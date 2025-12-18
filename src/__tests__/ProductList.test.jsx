import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../components/ProductList';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Création du mock Axios
const mockAxios = new MockAdapter(axios);

describe('ProductList Component', () => {
  // Nettoyage après chaque test
  afterEach(() => {
    mockAxios.reset();
  });

  afterAll(() => {
    mockAxios.restore();
  });

  test('affiche le message de chargement initial', () => {
    mockAxios.onGet('https://fakestoreapi.com/products').reply(200, []);
    
    render(<ProductList />);
    
    expect(screen.getByText(/chargement des produits/i)).toBeInTheDocument();
  });

  test('affiche la liste des produits après chargement réussi', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Produit A Test',
        category: 'electronics',
        description: 'Description du produit A',
        price: 99.99,
        image: 'image1.jpg',
        rating: { rate: 4.5, count: 120 }
      },
      {
        id: 2,
        title: 'Produit B Test',
        category: 'clothing',
        description: 'Description du produit B',
        price: 49.99,
        image: 'image2.jpg',
        rating: { rate: 4.0, count: 80 }
      }
    ];
    
    mockAxios.onGet('https://fakestoreapi.com/products').reply(200, mockProducts);
    
    render(<ProductList />);
    
    // Attendre que les produits apparaissent
    await waitFor(() => {
      expect(screen.getByText('Produit A Test')).toBeInTheDocument();
      expect(screen.getByText('Produit B Test')).toBeInTheDocument();
    });
    
    // Vérifier les détails
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
  });

  test('affiche un message d\'erreur en cas d\'échec API', async () => {
    mockAxios.onGet('https://fakestoreapi.com/products').reply(500, { message: 'Erreur serveur' });
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText(/erreur 500/i)).toBeInTheDocument();
    });
    
    // Vérifier que le bouton de réessay est présent
    expect(screen.getByText(/réessayer/i)).toBeInTheDocument();
  });

  test('affiche un message d\'erreur de connexion', async () => {
    mockAxios.onGet('https://fakestoreapi.com/products').networkError();
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText(/serveur inaccessible/i)).toBeInTheDocument();
    });
  });

  test('filtre les produits par recherche', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Ordinateur Portable',
        category: 'electronics',
        description: 'PC portable puissant',
        price: 999.99,
        image: 'laptop.jpg',
        rating: { rate: 4.7, count: 200 }
      },
      {
        id: 2,
        title: 'T-shirt Homme',
        category: 'clothing',
        description: 'T-shirt en coton',
        price: 19.99,
        image: 'tshirt.jpg',
        rating: { rate: 4.2, count: 150 }
      },
      {
        id: 3,
        title: 'Smartphone',
        category: 'electronics',
        description: 'Smartphone dernière génération',
        price: 799.99,
        image: 'phone.jpg',
        rating: { rate: 4.8, count: 300 }
      }
    ];
    
    mockAxios.onGet('https://fakestoreapi.com/products').reply(200, mockProducts);
    
    render(<ProductList />);
    
    // Attendre le chargement
    await waitFor(() => {
      expect(screen.getByText('Ordinateur Portable')).toBeInTheDocument();
    });
    
    // Récupérer le champ de recherche
    const searchInput = screen.getByPlaceholderText(/rechercher un produit/i);
    
    // Rechercher par titre
    fireEvent.change(searchInput, { target: { value: 'portable' } });
    
    await waitFor(() => {
      expect(screen.getByText('Ordinateur Portable')).toBeInTheDocument();
      expect(screen.queryByText('T-shirt Homme')).not.toBeInTheDocument();
      expect(screen.getByText('1 produit(s) trouvé(s)')).toBeInTheDocument();
    });
    
    // Rechercher par catégorie
    fireEvent.change(searchInput, { target: { value: 'electronics' } });
    
    await waitFor(() => {
      expect(screen.getByText('Ordinateur Portable')).toBeInTheDocument();
      expect(screen.getByText('Smartphone')).toBeInTheDocument();
      expect(screen.queryByText('T-shirt Homme')).not.toBeInTheDocument();
      expect(screen.getByText('2 produit(s) trouvé(s)')).toBeInTheDocument();
    });
    
    // Recherche sans résultat
    fireEvent.change(searchInput, { target: { value: 'inexistant' } });
    
    await waitFor(() => {
      expect(screen.getByText(/aucun produit ne correspond/i)).toBeInTheDocument();
      expect(screen.getByText('0 produit(s) trouvé(s)')).toBeInTheDocument();
    });
  });

  test('affiche le compteur de produits', async () => {
    const mockProducts = [
      { id: 1, title: 'Produit 1', category: 'cat1', description: 'desc1', price: 10, image: 'img1.jpg', rating: { rate: 4, count: 100 } },
      { id: 2, title: 'Produit 2', category: 'cat2', description: 'desc2', price: 20, image: 'img2.jpg', rating: { rate: 3.5, count: 50 } },
      { id: 3, title: 'Produit 3', category: 'cat1', description: 'desc3', price: 30, image: 'img3.jpg', rating: { rate: 5, count: 200 } }
    ];
    
    mockAxios.onGet('https://fakestoreapi.com/products').reply(200, mockProducts);
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('3 produit(s) trouvé(s)')).toBeInTheDocument();
    });
  });

  test('affiche correctement les informations des produits', async () => {
    const mockProduct = [
      {
        id: 1,
        title: 'Produit Test',
        category: 'test-category',
        description: 'Une longue description de test pour vérifier le tronquage',
        price: 123.45,
        image: 'test.jpg',
        rating: { rate: 4.5, count: 99 }
      }
    ];
    
    mockAxios.onGet('https://fakestoreapi.com/products').reply(200, mockProduct);
    
    render(<ProductList />);
    
    await waitFor(() => {
      // Vérifier toutes les informations
      expect(screen.getByText('Produit Test')).toBeInTheDocument();
      expect(screen.getByText('test-category')).toBeInTheDocument();
      expect(screen.getByText(/une longue description de test/i)).toBeInTheDocument();
      expect(screen.getByText('$123.45')).toBeInTheDocument();
      expect(screen.getByText(/⭐ 4.5/i)).toBeInTheDocument();
      expect(screen.getByText('(99 avis)')).toBeInTheDocument();
    });
  });

  test('gère les timeout correctement', async () => {
    // Simuler un timeout
    mockAxios.onGet('https://fakestoreapi.com/products').timeout();
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText(/erreur de configuration/i)).toBeInTheDocument();
    });
  });
});