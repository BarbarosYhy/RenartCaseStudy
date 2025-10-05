import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetch("http://localhost:3000/productList")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="products" style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      padding: "20px"
    }}>
      {products.map((p) => (
        <Product
          key={p.name}
          title={p.name}
          price={Number(p.productPrice)}
          image={p.images.yellow}  // default: yellow gold
        />
      ))}
    </div>
  );
};

export default App;
