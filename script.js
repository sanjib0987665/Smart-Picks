
function filterProducts(category) {
  const products = document.querySelectorAll('.product-card');
  const isMobile = window.innerWidth <= 768;
  
  products.forEach((product) => {
    if (category === 'all' || product.dataset.category === category) {
      product.style.display = 'block';
      if (!isMobile) {
        product.style.animation = `fadeIn 0.4s ease forwards`;
      }
    } else {
      product.style.display = 'none';
    }
  });

  // Update active button
  const buttons = document.querySelectorAll('nav button');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Add ripple effect only on desktop
  if (!isMobile) {
    createRipple(event);
  }
}

function createRipple(event) {
  const button = event.target;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'rgba(255, 255, 255, 0.6)';
  ripple.style.transform = 'scale(0)';
  ripple.style.animation = 'ripple 0.6s linear';
  ripple.style.pointerEvents = 'none';
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  nav button {
    position: relative;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

// Load products from localStorage
function loadProductsFromStorage() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const container = document.getElementById('product-container');
  
  if (products.length === 0) {
    return; // Keep default products if no custom products
  }

  // Clear existing products (keep only dynamically added ones)
  const existingProducts = container.querySelectorAll('.product-card[data-dynamic="true"]');
  existingProducts.forEach(product => product.remove());

  // Add products from localStorage
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = `product-card ${product.featured ? 'featured' : ''}`;
    productCard.setAttribute('data-category', product.category);
    productCard.setAttribute('data-dynamic', 'true');
    
    const buttonEmojis = {
      tech: '🛒 Buy Now',
      fashion: '👑 Shop Now', 
      gifts: '🎁 Order Now'
    };
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'"/>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <a href="${product.link}" target="_blank"><span>${buttonEmojis[product.category] || '🛒 Buy Now'}</span></a>
    `;
    
    container.appendChild(productCard);
  });
}

// Initialize the first button as active when page loads
document.addEventListener('DOMContentLoaded', function() {
  const firstButton = document.querySelector('nav button');
  if (firstButton) {
    firstButton.classList.add('active');
  }
  
  // Load products from localStorage
  loadProductsFromStorage();
  
  // Check for product updates periodically
  setInterval(() => {
    const lastUpdate = localStorage.getItem('productsUpdated');
    const currentCheck = localStorage.getItem('lastProductCheck') || '0';
    
    if (lastUpdate && lastUpdate !== currentCheck) {
      loadProductsFromStorage();
      localStorage.setItem('lastProductCheck', lastUpdate);
    }
  }, 1000);

  // Simplified intersection observer for mobile performance
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeIn 0.6s ease forwards';
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.product-card').forEach(card => {
      observer.observe(card);
      
      // Add simple hover effects only on desktop
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  } else {
    // On mobile, just show cards immediately
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }
  
  // Add smooth scrolling for better UX
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Remove parallax effect on mobile for better performance
  if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelector('header');
      const speed = scrolled * 0.3;
      
      if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
      }
    });
  }
});

// Add click tracking for affiliate links
document.addEventListener('click', function(e) {
  if (e.target.closest('a[href*="amazon"]')) {
    const productName = e.target.closest('.product-card').querySelector('h3').textContent;
    console.log(`Clicked on: ${productName}`);
    // Here you could add analytics tracking
  }
});

// Add search functionality
function addSearchBox() {
  const nav = document.querySelector('nav');
  const searchContainer = document.createElement('div');
  searchContainer.innerHTML = `
    <input type="text" id="product-search" placeholder="🔍 Search products..." 
           style="padding: 1rem 2rem; border: none; border-radius: 50px; 
                  background: rgba(255,255,255,0.9); margin-left: 1rem; 
                  box-shadow: 0 4px 15px rgba(0,0,0,0.1); outline: none;
                  transition: all 0.3s ease;">
  `;
  nav.appendChild(searchContainer);
  
  const searchInput = document.getElementById('product-search');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
      const title = product.querySelector('h3').textContent.toLowerCase();
      const description = product.querySelector('p').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        product.style.display = 'block';
        product.style.animation = 'fadeIn 0.6s ease forwards';
      } else {
        product.style.display = 'none';
      }
    });
  });
}

// Initialize search after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(addSearchBox, 1000);
});
