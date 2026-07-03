import { useState, useEffect } from 'react';
import { getLooks, createLook, deleteLook, toggleFav } from '@/api';

export function useLooks() {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLooks();
  }, []);

  async function loadLooks() {
    try {
      setLoading(true);
      const data = await getLooks();
      setLooks(data || []);
    } catch (error) {
      console.error('Failed to load looks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveLook(lookData) {
    try {
      const newLook = await createLook(lookData);
      setLooks(prev => [...prev, newLook]);
      return newLook;
    } catch (error) {
      console.error('Failed to save look:', error);
      throw error;
    }
  }

  async function removeLook(id) {
    try {
      await deleteLook(id);
      setLooks(prev => prev.filter(look => look.id !== id));
    } catch (error) {
      console.error('Failed to remove look:', error);
      throw error;
    }
  }

  async function toggleFavorite(id, currentState) {
    try {
      await toggleFav(id, currentState);
      setLooks(prev => prev.map(look => 
        look.id === id ? { ...look, is_favorite: !currentState } : look
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  return {
    looks,
    loading,
    saveLook,
    removeLook,
    toggleFav: toggleFavorite,
    refresh: loadLooks,
  };
}
