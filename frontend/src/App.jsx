import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import './App.css'

const Product = ({ title, price, image }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "12px",
      width: "220px"
    }}>
      <img
        src={image}
        alt={title}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          borderRadius: "10px"
        }}
      />
      <h3 style={{ margin: "10px 0 5px" }}>{title}</h3>
      <p style={{ color: "#555" }}>${price.toFixed(2)} USD</p>
    </div>
  );
};


const App = () => {
  const [products, setProducts] = useState([]);
  const [color, setColor] = useState("yellow");

  useEffect(() => {
    fetch("http://localhost:3000/productList")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch failed:", err));
  }, []);

  if (products.length === 0) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
    <Swiper
      modules={[Navigation, Scrollbar]}
      navigation
      scrollbar={{ draggable: true, hide: false }}
      spaceBetween={24}
      slidesPerView={4}
      slidesPerGroup={4}          // move 4 at a time with arrows
      loop={false}
      style={{ width: "100%" }}
      breakpoints={{
        0:   { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
        640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
        1024:{ slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 24 }
      }}
    >
      {products.map((p) => (
        <SwiperSlide key={p.name}>
          <div style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 12
          }}>
            <img
              src={p.images?.[color] ?? p.images?.yellow}
              alt={p.name}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12 }}
            />
            <h3 style={{ margin: "10px 0 4px" }}>{p.name}</h3>
            <div style={{ fontWeight: 600 }}>
              ${Number(p.productPrice).toFixed(2)}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              {(p.popularityScore * 5).toFixed(1)}/5
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>

    </div>
  );
};

export default App;
