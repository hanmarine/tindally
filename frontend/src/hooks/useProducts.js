"use client";

import React, { useState, useEffect } from "react";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products in useProducts hook:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, []);
  return { products, loading, error };
}

export function getProductById(productId, allProducts) {
  if (!allProducts) return null;
  return allProducts.find((p) => p.id === productId);
}
