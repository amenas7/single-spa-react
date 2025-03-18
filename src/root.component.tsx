import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  overview: string;
  genreName?: string;
  isRemoving?: boolean;
}

export default function Root(props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchMovies = useCallback((pageNum = 1) => {
    setLoading(true);
    
    // API key de ejemplo (en producción debería estar en variables de entorno)
    const apiKey = "3fd2be6f0c70a2a598f084ddfb75487c";
    
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=es-ES&page=${pageNum}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al obtener películas");
        }
        return response.json();
      })
      .then(data => {
        // Tomamos 5 películas aleatorias
        const shuffled = data.results.sort(() => 0.5 - Math.random());
        setMovies(shuffled.slice(0, 5));
        setLoading(false);
      })
      .catch(error => {
        setError("Error al cargar las películas");
        setLoading(false);
        console.error("Error:", error);
      });
  }, []);

  // Cargar películas iniciales
  useEffect(() => {
    fetchMovies(page);
  }, [fetchMovies, page]);

  // Verificar si la lista está vacía y cargar nuevas películas
  useEffect(() => {
    if (movies.length === 0 && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [movies.length, loading]);

  const handleRemoveMovie = (id: number) => {
    // First mark the movie as removing to trigger animation
    setMovies(prevMovies => 
      prevMovies.map(movie => 
        movie.id === id ? { ...movie, isRemoving: true } : movie
      )
    );
    
    // Then actually remove it after animation completes
    setTimeout(() => {
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
    }, 500);
  };

  // Función para renderizar estrellas según la calificación
  const renderStarRating = (rating: number) => {
    // Convertir calificación de 0-10 a 0-5 estrellas
    const starCount = Math.round(rating / 2);
    
    return (
      <>
        {[...Array(5)].map((_, index) => (
          <span key={index} className={index < starCount ? "star filled" : "star"}>
            ★
          </span>
        ))}
        <span className="rating-number">({rating.toFixed(1)}/10)</span>
      </>
    );
  };

  if (loading) {
    return <div className="loading">Cargando películas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="series-container">
      <h2 className="react-title"> <span>Hola desde react </span> 
        <img className="img_loco_react" src="logoreact.png" alt=""/>
      </h2>
      <div className="series-list">
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className={`series-item ${movie.isRemoving ? 'removing' : ''}`}
          >
            <div className="series-image-circle">
              <img 
                src={movie.poster_path 
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                  : "https://via.placeholder.com/50?text=No+Image"} 
                alt={movie.title} 
              />
            </div>
            <div className="series-title">
              <h3>{movie.title}</h3>
              <div className="star-rating">
                {renderStarRating(movie.vote_average)}
              </div>
            </div>
            <div className="series-checkbox">
              <input 
                type="checkbox" 
                onChange={() => handleRemoveMovie(movie.id)}
                id={`movie-${movie.id}`}
              />
              <label htmlFor={`movie-${movie.id}`}>Eliminar</label>
            </div>
          </div>
        ))}
      </div>
      {movies.length === 0 && (
        <div className="no-series">No hay películas disponibles</div>
      )}
    </div>
  );
}
