import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * Hook pour protéger les pages qui nécessitent que l'utilisateur ait payé
 * Vérifie l'authentification ET le statut de paiement (has_purchased)
 * Redirige vers CTAPAYWALL si l'utilisateur n'a pas payé
 */
export function useRequirePayment() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthAndPayment();
  }, []);

  const checkAuthAndPayment = async () => {
    try {
      // 1. Vérifier d'abord l'authentification
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      // 2. Récupérer l'utilisateur
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);

      // 3. Vérifier le statut de paiement
      if (!currentUser?.has_purchased) {
        // Rediriger vers la page de paiement si pas encore payé
        navigate('/CTAPAYWALL');
        return;
      }

      setHasPurchased(true);
    } catch (error) {
      console.error('Error checking auth and payment:', error);
      base44.auth.redirectToLogin(window.location.href);
    } finally {
      setIsLoading(false);
    }
  };

  return { isAuthenticated, hasPurchased, isLoading, user };
}
