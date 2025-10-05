import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import "./App.css";

function useProducts(api = "/api/productList") {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(api, { signal: ac.signal });
        const data = await r.json();
        setProducts(Array.isArray(data) ? data : []);
        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fetch failed:", e);
          setStatus("error");
        }
      }
    })();
    return () => ac.abort();
  }, [api]);

  return { products, status };
}


function useSelectedColors() {
  const [map, setMap] = useState({});

  const get = (key) => map[key] ?? "yellow";
  const set = (key, color) => setMap((m) => ({ ...m, [key]: color }));

  return { get, set };
}


function StarRating({ score = 0 }) {
  const pct = Math.max(0, Math.min(100, (score / 5) * 100)); 

  return (
    <div className="star-rating" aria-label={`${score.toFixed(1)} out of 5`}>
      <span className="stars-wrap">
        <span className="stars-base">★★★★★</span>
        <span className="stars-fill" style={{ width: `${pct}%` }}>★★★★★</span>
      </span>
      <span className="score-text">{score.toFixed(1)}/5</span>
    </div>
  );
}



function ProductCard({ product, color, onPickColor }) {
  const img =
    product.images?.[color] ??
    product.images?.yellow ??
    Object.values(product.images || {})[0];

  const price = Number(product.productPrice ?? product.price ?? 0);
  const popularity = Number(((product.popularityScore ?? 0) * 5).toFixed(1));

  return (

    <div className="product-card">
      <div className="img-wrap">
        <img className="product-img" src={img} alt={product.name} />
      </div>

      <h3 className="product-title">{product.name}</h3>
      <div className="product-price">${price.toFixed(2)} USD</div>

      <div className="color-row">
        {["yellow", "rose", "white"]
          .filter((k) => product.images?.[k])
          .map((k) => (
            <button
              key={k}
              className={`color-dot ${k} ${color === k ? "active" : ""}`}
              onClick={() => onPickColor(k)}
              aria-label={`Select ${k}`}
              title={k}
              type="button"
            />
          ))}
      </div>

      <div className="metal-label">
        {color === "yellow" ? "Yellow Gold" : color === "rose" ? "Rose Gold" : "White Gold"}
      </div>

      <div className="product-pop"><StarRating score={popularity} /></div>
    </div>
  );
}


export default function App() {
  const { products, status } = useProducts("/api/productList");
  const colors = useSelectedColors();

  if (status === "loading") return <p className="loading">Loading…</p>;
  if (status === "error") return <p className="loading">Failed to load.</p>;
  if (products.length === 0) return <p className="loading">No products.</p>;

  return (
    <main className="page">
      <header className="hero">
        <div className="title-row">
          <h1 className="title">Product List</h1>
        </div>
      </header>
      <div className="container">
        <Swiper
          modules={[Navigation, Scrollbar]}
          navigation
          scrollbar={{ draggable: true, hide: false, dragSize:250}}
          spaceBetween={140}
          slidesPerView={4}
          slidesPerGroup={4}
          loop={false}
          breakpoints={{
            0:    { slidesPerView: 1.2, slidesPerGroup: 1, spaceBetween: 16 },
            480:  { slidesPerView: 2,   slidesPerGroup: 2, spaceBetween: 20 },
            768:  { slidesPerView: 3,   slidesPerGroup: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4,   slidesPerGroup: 4, spaceBetween: 28 },
            1440: { slidesPerView: 5,   slidesPerGroup: 5, spaceBetween: 32 },
          }}
        >
          {products.map((p) => {
            const key = p.id ?? p.name; 
            const color = colors.get(key);

            return (
              <SwiperSlide key={key}>
                <ProductCard
                  product={p}
                  color={color}
                  onPickColor={(c) => colors.set(key, c)}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </main>
  );
}
