// underdev.js

// === Inject CSS into the page ===
const style = document.createElement("style");
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background: #fdf3e6;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .underdev-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fdf3e6;
    width: 100%;
    height: 100vh;
  }

  .underdev-box {
    background: #c2b5a7;
    padding: 60px 80px;
    border-radius: 12px;
    text-align: center;
    color: #2e2e2e;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    max-width: 700px;
    width: 90%;
    animation: fadeIn 0.8s ease forwards;
    opacity: 0;
  }

  .underdev-box h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #2c1810;
  }

  .underdev-box p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #3d3d3d;
    margin-bottom: 30px;
  }

  #goHomeBtn {
    background: #2c1810;
    color: #fff;
    border: none;
    padding: 12px 28px;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  #goHomeBtn:hover {
    background: #6b4226;
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// === Inject HTML structure ===
const container = document.createElement("div");
container.classList.add("underdev-container");
container.innerHTML = `
  <div class="underdev-box">
    <h1>This Website is Still Under Development</h1>
    <p>Some features might not work yet. Thank you for your understanding!</p>
    <button id="goHomeBtn">Go to Homepage</button>
  </div>
`;
document.body.appendChild(container);

// === Add button redirect logic ===
document.getElementById("goHomeBtn").addEventListener("click", () => {
  window.location.href = "/";
});
