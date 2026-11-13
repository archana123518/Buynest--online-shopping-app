
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import SearchBar from './SearchBar'
import Auth from './Auth'
import AdminDashboard from './AdminDashboard'

const API = 'http://localhost:5139/api'

const categories = [
  { id: 1, name: 'Shoes', icon: '👟' },
  { id: 2, name: 'Bags', icon: '👜' },
  { id: 3, name: 'Clothes', icon: '👕' },
  { id: 7, name: 'Accessories', icon: '💍' },
  { id: 4, name: 'Electronics', icon: '💻' },
  { id: 8, name: 'Fashion & Apparel', icon: '✨' },
  { id: 9, name: 'Home & Kitchen', icon: '🏡' },
  { id: 10, name: 'Toys', icon: '🧸' },
  { id: 11, name: 'Sports', icon: '⚽' },
  { id: 12, name: 'Beauty', icon: '💄' },
  { id: 13, name: 'Watches', icon: '⌚' }
]

const heroImage =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'

const fallbackImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700'
]

function getProductImage(product, index = 0) {
  if (product?.imageUrl) {
    if (product.imageUrl.startsWith('http')) {
      return product.imageUrl
    }

    return `http://localhost:5139/images/${product.imageUrl}`
  }

  return fallbackImages[index % fallbackImages.length]
}

function getToken() {
  return localStorage.getItem('token') || ''
}

function getIsAdmin(token) {
  try {
    if (!token) return false

    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    return (
      payload.role === 'Admin' ||
      payload.Role === 'Admin' ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin' ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] === 'Admin'
    )
  } catch {
    return false
  }
}

function App() {
  const [products, setProducts] = useState([])

const [showReviewForm, setShowReviewForm] = useState(false)
const [selectedReviewOrder, setSelectedReviewOrder] = useState(null)
const [selectedReviewProduct, setSelectedReviewProduct] = useState(null)
const [reviewName, setReviewName] = useState('')
const [reviewRating, setReviewRating] = useState(5)
const [reviewComment, setReviewComment] = useState('')
const [reviewMessage, setReviewMessage] = useState('')

const [productReviews, setProductReviews] = useState([])
const [reviewsLoading, setReviewsLoading] = useState(false)
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const handleSearch = () => {
  setCurrentPage('shop')
}

const [wishlist, setWishlist] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('buynestWishlist') || '[]')
  } catch {
    return []
  }
})

const [recentlyViewed, setRecentlyViewed] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem('buynestRecentlyViewed') || '[]'
    )
  } catch {
    return []
  }
})
useEffect(() => {
  localStorage.setItem(
    'buynestRecentlyViewed',
    JSON.stringify(recentlyViewed)
  )
}, [recentlyViewed])

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  function openProduct(product) {
  setSelectedProduct(product)
  setCurrentPage('productDetails')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [minPrice, setMinPrice] = useState(0)
const [maxPrice, setMaxPrice] = useState(100000)

 
 const [token, setToken] = useState(getToken)
 const [profile, setProfile] = useState({
  fullName: '',
  email: '',
  phoneNumber: '',
  address: ''
})

const [profileLoading, setProfileLoading] = useState(false)
useEffect(() => {
  if (!token) return

  const loadProfile = async () => {
    setProfileLoading(true)

    try {
      const response = await fetch(`${API}/Auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Unable to load profile')
      }

      const data = await response.json()

      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || ''
      })
    } catch (error) {
      console.error('Profile loading error:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  loadProfile()
}, [token])
const [profileEditing, setProfileEditing] = useState(false)
console.log('PROFILE EDITING:', profileEditing)
  
  const [isAdmin, setIsAdmin] = useState(() => getIsAdmin(getToken()))
  
  const [checkoutData, setCheckoutData] = useState({
  fullName: '',
  phoneNumber: '',
  houseNumber: '',
  street: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  instructions: ''
})

  const [placingOrder, setPlacingOrder] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  const [showLatestOrderOnly, setShowLatestOrderOnly] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('details')
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // LOAD PRODUCTS
  useEffect(() => {
    fetchProducts()
  }, [])

  // LOAD CART AND ORDERS AFTER LOGIN
  useEffect(() => {
    if (token) {
      fetchCart()
      fetchOrders()
    } else {
      setCart([])
      setOrders([])
    }
  }, [token])

  // SAVE WISHLIST
  useEffect(() => {
    localStorage.setItem('buynestWishlist', JSON.stringify(wishlist))
  }, [wishlist])
// SAVE RECENTLY VIEWED PRODUCTS
useEffect(() => {
  localStorage.setItem(
    'buynestRecentlyViewed',
    JSON.stringify(recentlyViewed)
  )
}, [recentlyViewed])

// ADD PRODUCT TO RECENTLY VIEWED WHENEVER DETAILS PAGE OPENS
useEffect(() => {
  if (currentPage !== 'productDetails' || !selectedProduct?.id) {
    return
  }

  setRecentlyViewed(prev => {
    console.log('BEFORE SAVE:', recentlyViewed)

    const updated = [
      selectedProduct,
      ...prev.filter(item => String(item.id) !== String(selectedProduct.id))
    ]

    return updated.slice(0, 8)
  })
}, [currentPage, selectedProduct?.id])
  async function fetchProducts() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API}/Products`)

      if (!response.ok) {
        throw new Error('Unable to load products')
      }

      const data = await response.json()
      console.log('TOTAL PRODUCTS FROM API:', data.length)
console.log('PRODUCTS DATA:', data)
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

// LOAD REVIEWS FOR PRODUCT DETAILS
useEffect(() => {
  if (currentPage !== 'productDetails' || !selectedProduct?.id) {
    return
  }

  const fetchProductReviews = async () => {
    try {
      setReviewsLoading(true)

      const response = await fetch(
        `${API}/ProductReviews/product/${selectedProduct.id}`
      )

      if (!response.ok) {
        throw new Error('Unable to load reviews')
      }

      const data = await response.json()
      setProductReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Product details review error:', error)
      setProductReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  fetchProductReviews()
}, [currentPage, selectedProduct?.id])
  // LOAD CART
  async function fetchCart() {
    if (!token) {
      setCart([])
      return
    }

    try {
      const response = await fetch(`${API}/Cart`, {
        headers: authHeaders
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Unable to load cart')
      }

      const data = await response.json()

      const items = Array.isArray(data)
        ? data
        : data.cartItems || data.items || []

      setCart(items)
    } catch (err) {
      console.error('Cart loading error:', err)
      showMessage(err.message)
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch(`${API}/Orders`, {
        headers: authHeaders
      })

      if (!response.ok) return

      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Orders loading error:', err)
    }
  }
 

async function cancelOrder(orderId) {
  const confirmCancel = window.confirm(
    'Are you sure you want to cancel this order?'
  )

  if (!confirmCancel) return

  try {
    const response = await fetch(
      `${API}/Orders/${orderId}/cancel`,
      {
        method: 'PUT',
        headers: authHeaders
      }
    )

    const message = await response.text()

    if (!response.ok) {
      alert(message || 'Unable to cancel order')
      return
    }

    alert('Order cancelled successfully!')
    await fetchOrders()
  } catch (err) {
    console.error('Cancel order error:', err)
    alert('Something went wrong. Please try again.')
  }
}


async function deleteOrder(orderId) {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this cancelled order?'
  )

  if (!confirmDelete) return

  try {
    const response = await fetch(
      `${API}/Orders/${orderId}`,
      {
        method: 'DELETE',
        headers: authHeaders
      }
    )

    const message = await response.text()

    if (!response.ok) {
      alert(message || 'Unable to delete order')
      return
    }

    alert('Order deleted successfully!')
    await fetchOrders()
  } catch (err) {
    console.error('Delete order error:', err)
    alert('Something went wrong. Please try again.')
  }
}



  function showMessage(text) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 3000)
  }

  function goHome() {
    setCurrentPage('home')
    setSelectedCategory(null)
    setSelectedProduct(null)
    setSearchTerm('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openCategory(category) {
    setSelectedCategory(category)
    setCurrentPage('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // LOGIN SUCCESS
  function handleLogin(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setIsAdmin(getIsAdmin(newToken))
    console.log('LOGIN TOKEN ROLE:', JSON.parse(atob(newToken.split('.')[1])).role)
    setCurrentPage('home')
    showMessage('Welcome to Buynest!')
  }
  const handleProfileUpdate = async (e) => {
  e.preventDefault()

  try {
    const response = await fetch(`${API}/Auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        address: profile.address
      })
    })

    if (!response.ok) {
      throw new Error('Profile update failed')
    }

    setProfileEditing(false)
    showMessage('Profile updated successfully!')
  } catch (error) {
    console.error('Profile update error:', error)
    showMessage('Unable to update profile. Please try again.')
  }
}

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem('token')
    setToken('')
    setIsAdmin(false)
    setCart([])
    setOrders([])
    setShowLatestOrderOnly(false)
    setSelectedProduct(null)
    setCurrentPage('home')
    showMessage('You have been logged out')
  }

  // ADD TO CART
  async function addToCart(product) {
    if (!token) {
      setCurrentPage('login')
      showMessage('Please login to add products to cart')
      return false
    }

    try {
      const response = await fetch(`${API}/Cart/add`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      if (!response.ok) {
  const errorText = await response.text()
  console.error('Profile update failed:', response.status, errorText)
  throw new Error(errorText || 'Profile update failed')
}

      await fetchCart()
      showMessage('Product added to your cart!')
      return true
    } catch (err) {
      showMessage(err.message)
      console.error('Add to cart error:', err)
      return false
    }
  }

  // BUY NOW - OPEN PRODUCT DETAILS PAGE
  function buyNow(product) {
  console.log('BUY NOW CLICKED:', product)
setRecentlyViewed(prev => {
  const updated = [
    product,
    ...prev.filter(item => item.id !== product.id)
  ]

  return updated.slice(0, 8)
})
  setSelectedProduct(product)
  setCurrentPage('productDetails')

  window.scrollTo({ top: 0, behavior: 'smooth' })
}
  // BUY NOW FROM PRODUCT DETAILS - DIRECT CHECKOUT
 
async function buyNowFromDetails() {
  console.log('BUY NOW FROM DETAILS CLICKED')
  console.log('Selected Product:', selectedProduct)
  console.log('Token:', token ? 'Available' : 'Missing')

  if (!selectedProduct) {
    showMessage('Please select a product')
    return
  }

  if (!token) {
    setCurrentPage('login')
    showMessage('Please login before buying')
    return
  }

  const added = await addToCart(selectedProduct)

  console.log('Product added:', added)

  if (added) {
    setCheckoutStep('details')
    setCurrentPage('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function submitReview() {
  if (!reviewComment.trim()) {
    alert('Please enter your review')
    return
  }

  if (!selectedReviewProduct || !selectedReviewOrder) {
    alert('Please select a product and order')
    return
  }

  if (!token) {
    alert('Please login again')
    return
  }

  try {
    const response = await fetch(`${API}/ProductReviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: selectedReviewProduct.id,
        orderId: selectedReviewOrder.id,
        reviewerName: reviewName || 'Customer',
        rating: Number(reviewRating),
        comment: reviewComment.trim()
      })
    })

    const responseText = await response.text()

    let data = {}

    try {
      data = JSON.parse(responseText)
    } catch {
      data = {}
    }

    console.log(
      'REVIEW API RESPONSE:',
      response.status,
      responseText
    )

    if (!response.ok) {
      alert(
        data.message ||
        data.title ||
        responseText ||
        'Unable to submit review'
      )
      return
    }

   alert('Review submitted successfully!')

window.dispatchEvent(new Event('buynest-review-added'))

const reviewedProduct = products.find(
  item => String(item.id) === String(selectedReviewProduct.id)
)

setSelectedProduct(reviewedProduct || selectedReviewProduct)

setShowReviewForm(false)
setSelectedReviewOrder(null)
setSelectedReviewProduct(null)
setReviewComment('')
setReviewRating(5)
setReviewMessage('')

setCurrentPage('productDetails')
window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Review submission error:', error)
    alert('Something went wrong while submitting review')
  }
}

  // WISHLIST
  function toggleWishlist(product) {
    const exists = wishlist.some(item => item.id === product.id)

    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id))
      showMessage('Removed from wishlist')
    } else {
      setWishlist(prev => [...prev, product])
      showMessage('Added to wishlist ❤️')
    }
  }

  // REMOVE FROM CART
  async function removeFromCart(item) {
    const id = item.cartItemId || item.id

    try {
      const response = await fetch(`${API}/Cart/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      })

      if (!response.ok) throw new Error('Unable to remove item')

      await fetchCart()
      showMessage('Item removed from cart')
    } catch (err) {
      showMessage(err.message)
    }
  }

  // UPDATE QUANTITY
  async function updateQuantity(item, quantity) {
    if (quantity < 1) {
      await removeFromCart(item)
      return
    }

    const id = item.cartItemId || item.id

    try {
      const response = await fetch(`${API}/Cart/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
  productId: item.productId,
  quantity: quantity
})
      })

      if (!response.ok) throw new Error('Unable to update quantity')

      await fetchCart()
    } catch (err) {
      showMessage(err.message)
    }
  }

  // CART HELPERS
  function getCartProduct(item) {
    return item.product || item
  }

  function getCartPrice(item) {
    return Number(getCartProduct(item).price || item.price || 0)
  }

  function getCartQuantity(item) {
    return Number(item.quantity || 1)
  }

  const cartTotal = cart.reduce(
    (total, item) => total + getCartPrice(item) * getCartQuantity(item),
    0
  )

  const cartCount = cart.reduce(
    (total, item) => total + getCartQuantity(item),
    0
  )

  // FILTER PRODUCTS
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory) {
      result = result.filter(
        product =>
          Number(product.categoryId) === Number(selectedCategory.id)
      )
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()

      result = result.filter(product =>
        `${product.name} ${product.description || ''}`
          .toLowerCase()
          .includes(search)
      )
    }

  
result = result.filter(product => {
  const price = Number(product.price)
  return price >= minPrice && price <= maxPrice
})


    if (sortBy === 'low') {
      result.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === 'high') {
      result.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [products, selectedCategory, searchTerm, sortBy, minPrice, maxPrice])


// PRODUCT CARD
function ProductCard({ product, index }) {
  const [reviews, setReviews] = useState([])

  const originalPrice = Number(product.price || 0)

  const discount = Number(
    product.discountPercentage ?? product.DiscountPercentage ?? 0
  )

  const finalPrice = originalPrice - (originalPrice * discount / 100)

  const isWishlisted = wishlist.some(item => item.id === product.id)
console.log('DISPLAY PRODUCT ID:', product.id)
   useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API}/ProductReviews/product/${product.id}`
        )

        if (!response.ok) {
          throw new Error('Unable to load reviews')
        }

        const data = await response.json()
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Review error:', error)
      }
    }

    fetchReviews()

    const handleReviewAdded = () => {
      fetchReviews()
    }

    window.addEventListener('buynest-review-added', handleReviewAdded)

    return () => {
      window.removeEventListener('buynest-review-added', handleReviewAdded)
    }
  }, [product.id])
  const averageRating = reviews.length > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0
  

  return (
    <article
  className="home-product-card"
  onClick={() => openProduct(product)}
>
      <div className="home-product-image">
        <img
          src={getProductImage(product, index)}
          alt={product.name}
          onError={event => {
            event.currentTarget.src =
              fallbackImages[index % fallbackImages.length]
          }}
        />

        <span className="home-image-tag">BUYNEST COLLECTION</span>

        {discount > 0 && (
          <span className="product-discount-badge">
            {discount}% OFF
          </span>
        )}

        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
          title="Add to wishlist"
        >
          {isWishlisted ? '♥' : '♡'}
   
        </button>
      </div>

      <div className="home-product-info">
        <h3>{product.name}</h3>

        <p>
          {product.description || 'Discover quality and style with Buynest.'}
        </p>

        
        {/* PRODUCT RATING */}
<div className="product-rating">
  <span className="rating-stars">
   {'★'.repeat(Math.round(averageRating))}
    {'☆'.repeat(5 - Math.round(averageRating || 5))}
  </span>

  <span className="rating-number">
    {(averageRating || 5).toFixed(1)}
  </span>

  <span className="rating-label">
     {reviews.length === 0
  ? 'No ratings yet'
  : averageRating >= 4.5
    ? 'Excellent'
    : averageRating >= 4
      ? 'Very Good'
      : averageRating >= 3
        ? 'Good'
        : averageRating >= 2
          ? 'Average'
          : 'Poor'}
  </span>

  <span className="review-count">
    ({reviews.length} reviews)
  </span>
</div>

        {/* PRICE */}
        <div className="home-product-bottom">
          {discount > 0 ? (
            <div className="product-price-details">
              <strong>
                ₹{Math.round(finalPrice).toLocaleString('en-IN')}
              </strong>

              <span className="original-price">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <strong>
              ₹{originalPrice.toLocaleString('en-IN')}
            </strong>
          )}

          <span>
            {Number(product.stockQuantity) > 0
              ? `${product.stockQuantity} available`
              : 'Out of stock'}
          </span>
        </div>

       



        {/* CUSTOMER REVIEW PREVIEW */}
        {reviews.slice(0, 2).map(review => (
          <div className="product-review-preview" key={review.id}>
            
          </div>
        ))}

        <div className="home-product-actions">
          <button
            className="add-cart-btn"
            disabled={Number(product.stockQuantity) <= 0}
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>

          <button
            className="buy-now-btn"
            disabled={Number(product.stockQuantity) <= 0}
            onClick={() => buyNow(product)}
          >
            Buy Now
          </button>

       
        </div>
      </div>
    </article>
  )
}

function WishlistPage({ wishlist, onBack }) {
  return (
    <div className="wishlist-page">
      <h2>My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="product-grid">
          {wishlist.map((product, index) => (
            <ProductCard
              key={product.id || index}
              product={product}
              index={index}
            />
          ))}
        </div>
      )}

      <button onClick={onBack}>Continue Shopping</button>
    </div>
  )
}
  
function HomePage() {
  const trendingProducts = products.slice(0, 4)

  return (
    <>
      <section className="luxury-hero">
        <div className="luxury-hero-content">
          <span className="luxury-eyebrow">
            THE ART OF EVERYDAY SHOPPING
          </span>

          <h1>
            Discover More.
            <br />
            Shop <span>Better.</span>
          </h1>

          <p>
            “Everything You Need, All in One Place. Discover your style with Buynest.”
          </p>

          <button
            className="luxury-shop-btn"
            onClick={() => {
              setSelectedCategory(null)
              setCurrentPage('products')
            }}
          >
            Explore Collection <span>→</span>
          </button>

          <div className="luxury-hero-note">
            <div className="luxury-note-line"></div>
            <span>STYLE · QUALITY · EVERYDAY VALUE</span>
          </div>
        </div>

        <div className="luxury-hero-image">
          <img src={heroImage} alt="Buynest shopping collection" />

          <div className="luxury-image-caption">
            <span>NEW SEASON</span>
            <strong>Everyday, Elevated.</strong>
          </div>
        </div>
      </section>
      {/* TRENDING COLLECTIONS */}
      {trendingProducts.length > 0 && (
        <section className="home-shop-section trending-collections-section">
          <div className="home-shop-heading">
            <div>
              <span className="section-label">POPULAR PICKS</span>
              <h2>
                Trending <span>Collections</span>
              </h2>
              <p>Explore products worth discovering at Buynest.</p>
            </div>
          </div>

         <div className="home-product-grid recently-viewed-grid">
            {trendingProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      <section className="luxury-benefits">
        <div className="luxury-benefit">
          <div className="luxury-benefit-icon">✦</div>
          <div>
            <h3>Curated Collections</h3>
            <p>Products selected for your lifestyle</p>
          </div>
        </div>

        <div className="luxury-benefit">
          <div className="luxury-benefit-icon">♡</div>
          <div>
            <h3>Easy Shopping</h3>
            <p>A simple and comfortable experience</p>
          </div>
        </div>

        <div className="luxury-benefit">
          <div className="luxury-benefit-icon">✓</div>
          <div>
            <h3>Secure Checkout</h3>
            <p>Convenient order management</p>
          </div>
        </div>
      </section>

      <section className="home-shop-section" id="categories">
        <div className="home-shop-heading">
          <div>
            <span className="section-label">EXPLORE BUYNEST</span>
            <h2>Shop <span>Products</span></h2>
            <p>Find something special in every collection.</p>
          </div>

          <button
            className="home-view-all"
            onClick={() => {
              setSelectedCategory(null)
              setSearchTerm('')
              setMinPrice(0)
              setMaxPrice(100000)
              setSortBy('default')
            }}
          >
            
          </button>
        </div>

        <div className="home-shop-layout">

     {/* LEFT SIDE FILTERS */}
<aside className="price-filter">
  <h3>Filter Products</h3>

  {/* CATEGORIES - FIRST */}
  <div className="home-sidebar-categories">
    <h4>Categories</h4>

    {categories.map(category => (
      <button
        key={category.id}
        className="home-category-link"
        onClick={() => setSelectedCategory(category)}
      >
        <span>{category.icon} {category.name}</span>
        <span>→</span>
      </button>
    ))}
  </div>

  {/* PRICE RANGE - BELOW CATEGORIES */}
  <h4>Price Range</h4>

  <div className="price-range-options">
    {[
      { label: 'All Prices', min: 0, max: Infinity },
      { label: 'Under ₹500', min: 0, max: 499 },
      { label: '₹500 - ₹1,000', min: 500, max: 1000 },
      { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
      { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
      { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
      { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
      { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
      { label: 'Above ₹50,000', min: 50001, max: Infinity }
    ].map((range, index) => (
      <button
        key={index}
        type="button"
        className={
          minPrice === range.min && maxPrice === range.max
            ? 'price-option active'
            : 'price-option'
        }
        onClick={() => {
          setMinPrice(range.min)
          setMaxPrice(range.max)
        }}
      >
        {range.label}
      </button>
    ))}
  </div>
</aside>

          {/* RIGHT SIDE PRODUCTS */}
          <div className="home-products-area">
            <div className="home-products-topline">
              <span>{filteredProducts.length} PRODUCTS FOUND</span>

              <button
                className="home-view-all"
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchTerm('')
                  setMinPrice(0)
                  setMaxPrice(Infinity)
                  setSortBy('default')
                }}
              >
                Clear Filters
              </button>
            </div>

            {loading ? (
              <p className="loading-message">
                Loading products...
              </p>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={fetchProducts}>Retry</button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-products">
                <div>🔍</div>
                <h3>No products found</h3>
                <p>
                  Try another search or select a different price range.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory(null)
                    setMinPrice(0)
                    setMaxPrice(100000)
                    setSortBy('default')
                  }}
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="home-product-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      

      {/* RECENTLY VIEWED PRODUCTS */}
{recentlyViewed.length > 0 && (
  <section className="home-shop-section recently-viewed-section">
    <div className="home-shop-heading">
      <div>
        <span className="section-label">YOUR BROWSING HISTORY</span>
        <h2>Recently <span>Viewed</span></h2>
        <p>Continue exploring the products you viewed earlier.</p>
      </div>
    </div>

    <div className="home-product-grid">
      {recentlyViewed.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
     
              />
            ))}
          </div>
        </section>
      )}
    </>
    
  )
}



    // PRODUCTS PAGE
  function ProductsPage() {
    return (
      <main className="collection-page">

        <section className="collection-banner">
          <div className="collection-banner-content">
            <span className="section-label">
              DISCOVER SOMETHING NEW
            </span>

            <h1>
              {selectedCategory
                ? selectedCategory.name
                : 'Our Collection'}
            </h1>

            <p>
              Explore our products and find the right choice for you.
            </p>

            <button
              className="back-collection-btn"
              onClick={goHome}
            >
              ← Back to Home
            </button>
          </div>
        </section>

        {/* FILTER + PRODUCTS LAYOUT */}
        <div className="collection-layout">

          {/* LEFT SIDE PRICE FILTER */}
          <aside className="price-filter">

            <h3>Filter Products</h3>

            <h4>Price Range</h4>

            <div className="price-range-options">

              {[
                { label: 'All Prices', min: 0, max: 100000 },
                { label: 'Under ₹500', min: 0, max: 499 },
                { label: '₹500 - ₹1,000', min: 500, max: 1000 },
                { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
                { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
                { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
                { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
                { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
                { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 }
              ].map((range, index) => (

                <button
                  key={index}
                  type="button"
                  className={
                    minPrice === range.min && maxPrice === range.max
                      ? 'price-option active'
                      : 'price-option'
                  }
                  onClick={() => {
                    setMinPrice(range.min)
                    setMaxPrice(range.max)
                  }}
                >
                  {range.label}
                </button>

              ))}

            </div>

          </aside>

          {/* RIGHT SIDE PRODUCTS */}
          <section className="collection-content">

            <div className="collection-heading">
              <div>
                <h2>
                  {selectedCategory
                    ? `${selectedCategory.name} Products`
                    : 'All Products'}
                </h2>

                <p>Discover your next favourite.</p>
              </div>
            </div>

            <div className="home-products-topline">

              <span>
                {filteredProducts.length} PRODUCTS FOUND
              </span>

              <button
                className="home-view-all"
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchTerm('')
                  setMinPrice(0)
                  setMaxPrice(100000)
                  setSortBy('default')
                }}
              >
                Clear Filters
              </button>

            </div>

            {loading ? (

              <p className="loading-message">
                Loading products...
              </p>

            ) : error ? (

              <div className="error-message">
                {error}
                <button onClick={fetchProducts}>
                  Retry
                </button>
              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="empty-products">
                <div>🔍</div>

                <h3>No products found</h3>

                <p>
                  Try another search or select a different price range.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory(null)
                    setMinPrice(0)
                    setMaxPrice(100000)
                    setSortBy('default')
                  }}
                >
                  Show All Products
                </button>
              </div>

            ) : (

              <div className="product-grid">

                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}

              </div>

            )}

          </section>

        </div>

      </main>
    )
  }
  // PRODUCT DETAILS PAGE
  function ProductDetailsPage() {
    if (!selectedProduct) {
      return (
        <main className="collection-page">
          <section className="collection-content">
            <div className="empty-products">
              <h3>Product not found</h3>
              <button onClick={() => setCurrentPage('products')}>
                Back to Products
              </button>
            </div>
          </section>
        </main>
      )
    }

    const product = selectedProduct
    const outOfStock = Number(product.stockQuantity) <= 0
    const averageProductRating = productReviews.length
  ? productReviews.reduce(
      (total, review) => total + Number(review.rating || 0),
      0
    ) / productReviews.length
  : 0

    return (
      <main className="product-details-page">
        <section className="product-details-container">

          <button
            className="back-collection-btn details-back-btn"
            onClick={() => setCurrentPage('products')}
          >
            ← Back to Products
          </button>

          <div className="product-details-card">

            <div className="details-image-box">
              <img
                src={getProductImage(product)}
                alt={product.name}
                onError={event => {
                  event.currentTarget.src = fallbackImages[0]
                }}
              />
              <span className="details-image-label">
                BUYNEST EXCLUSIVE
              </span>
            </div>

            <div className="details-info">

              <span className="section-label">
                BUYNEST COLLECTION
              </span>

              <h1>{product.name}</h1>

              <div className="details-price">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </div>

              <div className="details-divider"></div>

              <p className="details-description">
                {product.description ||
                  'Discover quality and style with Buynest.'}
              </p>

              <div className="details-stock">
                <span>Availability</span>
                <strong className={outOfStock ? 'out-stock' : 'in-stock'}>
                  {outOfStock
                    ? 'Out of Stock'
                    : `${product.stockQuantity} items available`}
                </strong>
              </div>

              <div className="details-product-id">
                Product ID: #{product.id}
              </div>

              <div className="details-actions">

                <button
                  className="details-add-btn"
                  disabled={outOfStock}
                  onClick={async () => {
                    const added = await addToCart(product)

                    if (added) {
                      showMessage('Product successfully added to cart!')
                    }
                  }}
                >
                  Add to Cart
                </button>

                <button
                  className="details-buy-btn"
                  disabled={outOfStock}
                  onClick={buyNowFromDetails}
                >
                  Buy Now <span>→</span>
                </button>

              </div>

              <div className="details-footer">
                <span>✓ Quality Products</span>
                <span>✓ Secure Checkout</span>
              </div>

            </div>
          </div>
          <div className="product-reviews-section">
  <div className="product-reviews-heading">
    <span>CUSTOMER FEEDBACK</span>
    <h2>Customer Reviews</h2>
    <p>What customers say about this product</p>
  </div>

  {reviewsLoading ? (
    <p>Loading reviews...</p>
  ) : productReviews.length === 0 ? (
    <p className="no-product-reviews">
      No reviews yet. Be the first to share your experience.
    </p>
  ) : (
    <>
      <div className="product-reviews-summary">
        <strong>{averageProductRating.toFixed(1)}</strong>

        <span className="review-stars">
          {'★'.repeat(Math.round(averageProductRating))}
          {'☆'.repeat(5 - Math.round(averageProductRating))}
        </span>

        <p>{productReviews.length} customer review(s)</p>
      </div>

      <div className="product-reviews-list">
        {productReviews.map((review, index) => (
          <article
            className="product-review-card"
            key={review.id || index}
          >
            <div className="product-review-card-top">
              <strong>{review.reviewerName || 'Customer'}</strong>

              <span className="review-stars">
                {'★'.repeat(Number(review.rating || 0))}
                {'☆'.repeat(5 - Number(review.rating || 0))}
              </span>
            </div>

            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </>
  )}
</div>
        </section>
      </main>
    )
  }

  // CART PAGE
  function CartPage() {
    return (
      <main className="cart-page">
        <section className="cart-header">
          <span className="section-label">YOUR SHOPPING BAG</span>
          <h1>My Cart</h1>
          <p>Review your selected products before checkout.</p>
        </section>

        <section className="cart-content">
          <div className="cart-section-heading">
            <h2>Shopping Items</h2>
            <p>{cartCount} items in your cart</p>
          </div>

          {cart.length === 0 ? (
            <div className="empty-products">
              <div>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Explore our collection and add your favourite products.</p>
              <button onClick={() => setCurrentPage('products')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-list">
                {cart.map((item, index) => {
                  const product = getCartProduct(item)
                  const quantity = getCartQuantity(item)

                  return (
                    <article
                      className="cart-item-card"
                      key={item.cartItemId || item.id || index}
                    >
                      <div className="cart-item-image">
                        <img
                          src={getProductImage(product, index)}
                          alt={product.name}
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <span className="cart-item-label">BUYNEST ITEM</span>
                            <h3>{product.name}</h3>
                            <p className="cart-unit-price">
                              ₹{getCartPrice(item).toLocaleString('en-IN')}
                              <span> / unit</span>
                            </p>
                          </div>

                          <button
                            className="cart-remove-icon"
                            onClick={() => removeFromCart(item)}
                          >
                            ×
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          <div>
                            <span className="cart-control-label">QUANTITY</span>
                            <div className="cart-quantity-controls">
                              <button
                                onClick={() => updateQuantity(item, quantity - 1)}
                              >
                                −
                              </button>
                              <strong>{quantity}</strong>
                              <button
                                onClick={() => updateQuantity(item, quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="cart-item-total">
                            <span>ITEM TOTAL</span>
                            <strong>
                              ₹{(getCartPrice(item) * quantity).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>

                        <button
                          className="cart-remove-text"
                          onClick={() => removeFromCart(item)}
                        >
                          Remove item
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              <aside className="cart-summary">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <strong className="free-delivery">
                    {cartTotal >= 999 ? 'FREE' : '₹50'}
                  </strong>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-grand-total">
                  <strong>Total</strong>
                  <strong>
                    ₹{(cartTotal + (cartTotal >= 999 ? 0 : 50)).toLocaleString('en-IN')}
                  </strong>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => {
                    setCheckoutStep('details')
                    setCurrentPage('checkout')
                  }}
                >
                  PROCEED TO CHECKOUT →
                </button>

                <p className="secure-checkout">
                  🔒 Secure checkout experience
                </p>
              </aside>
            </div>
          )}
        </section>
      </main>
    )
  }

  // CHECKOUT PAGE
  function CheckoutPage() {
    const deliveryCharge = cartTotal >= 999 ? 0 : 50
    const finalTotal = cartTotal + deliveryCharge

    function handleFieldChange(event) {
      const { name, value } = event.target

      setCheckoutData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    function placeOrder(event) {
      event.preventDefault()

      if (!token) {
        setCurrentPage('login')
        return
      }

      if (cart.length === 0) {
        showMessage('Your cart is empty')
        return
      }

      setCheckoutStep('payment')
    }

    async function confirmOrder() {
      if (!token) {
        setCurrentPage('login')
        return
      }

      if (cart.length === 0) {
        showMessage('Your cart is empty')
        return
      }

      try {
        setPlacingOrder(true)

        

        const orderResponse = await fetch(`${API}/Orders`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
  fullName: checkoutData.fullName,
  phoneNumber: checkoutData.phoneNumber,
  houseNumber: checkoutData.houseNumber,
  street: checkoutData.street,
  city: checkoutData.city,
  state: checkoutData.state,
  pincode: checkoutData.postalCode,
  deliveryInstructions: checkoutData.instructions
})
        })

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json().catch(() => ({}))
          throw new Error(
            errorData.message || errorData.title || 'Order could not be placed'
          )
        }

        const orderData = await orderResponse.json()
        const orderId = orderData.id || orderData.orderId

        const newOrder = {
          ...orderData,
          id: orderId,
          totalAmount: orderData.totalAmount ?? finalTotal
        }

        setLastOrder(newOrder)

        if (orderId) {
          try {
            const paymentResponse = await fetch(`${API}/Payments/create`, {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                orderId,
                amount: orderData.totalAmount ?? finalTotal,
                paymentMethod
              })
            })

            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json()

              if (paymentData.id) {
                const statusResponse = await fetch(
                  `${API}/Payments/${paymentData.id}/status`,
                  {
                    method: 'PUT',
                    headers: authHeaders,
                   body: JSON.stringify(
  paymentMethod === 'Cash on Delivery'
    ? 'Pending'
    : 'Success'
)
                  }
                )

                if (!statusResponse.ok) {
                  console.error('Unable to update payment status')
                }
              }
            } else {
              console.error('Payment creation failed')
            }
          } catch (paymentError) {
            console.error('Test payment error:', paymentError)
          }
        }

        setCart([])
        await fetchOrders()
        setShowLatestOrderOnly(true)
        setCurrentPage('success')
      } catch (err) {
        showMessage(err.message)
        console.error('Order placement error:', err)
      } finally {
        setPlacingOrder(false)
      }
    }

    if (checkoutStep === 'payment') {
      return (
        <main className="checkout-pro-page">
          <div className="checkout-pro-container">
            <header className="checkout-pro-header">
              <span className="checkout-pro-eyebrow">BUYNEST CHECKOUT</span>
              <h1>Select Payment Method</h1>
              <p>Choose how you would like to pay.</p>
              <div className="checkout-pro-steps">
  <div className="checkout-step completed">
    <span>✓</span> Address
  </div>

  <div className="checkout-step-line active"></div>

  <div className="checkout-step active">
    <span>2</span> Order
  </div>

  <div className="checkout-step-line"></div>

  <div className="checkout-step">
    <span>3</span> Complete
  </div>
</div>
            </header>

            <div className="checkout-pro-card">
              <h2>Payment Options</h2>

              {[
  {
    method: 'UPI',
    description: 'Pay instantly and securely using your preferred UPI app.'
  },
  {
    method: 'Credit / Debit Card',
    description: 'Make a secure payment using your credit or debit card.'
  },
  {
    method: 'Cash on Delivery',
    description: 'Pay only when your order arrives at your doorstep.'
  }
].map(({ method, description }) => (
  <label key={method} className="payment-method-option">
    <input
      type="radio"
      name="paymentMethod"
      value={method}
      checked={paymentMethod === method}
      onChange={event => setPaymentMethod(event.target.value)}
    />

    <div className="payment-method-content">
      <strong>{method}</strong>
      <p>{description}</p>
    </div>
  </label>
))}
              <h2>Total: ₹{finalTotal.toLocaleString('en-IN')}</h2>

              <button
                type="button"
                className="checkout-pro-place-btn"
                onClick={confirmOrder}
                disabled={placingOrder}
              >
                {placingOrder ? 'PROCESSING...' : 'PLACE ORDER →'}
              </button>

              <button
                type="button"
                className="checkout-pro-back-btn"
                onClick={() => setCheckoutStep('details')}
              >
                ← Back to Delivery Details
              </button>
            </div>
          </div>
        </main>
      )
    }

    return (
      <main className="checkout-pro-page">
        <div className="checkout-pro-container">
          <header className="checkout-pro-header">
            <span className="checkout-pro-eyebrow">BUYNEST CHECKOUT</span>
            <h1>Complete Your Order</h1>
            <p>Just a few details before your order is confirmed.</p>
<div className="checkout-pro-steps">
  <div className="checkout-step active">
    <span>1</span> Address
  </div>

  <div className="checkout-step-line"></div>

  <div className="checkout-step">
    <span>2</span> Order
  </div>

  <div className="checkout-step-line"></div>

  <div className="checkout-step">
    <span>3</span> Complete
  </div>
</div>
          </header>

          <div className="checkout-pro-layout">
            <div className="checkout-pro-main">
              <form className="checkout-pro-card" onSubmit={placeOrder}>
                <div className="checkout-pro-card-heading">
                  <div className="checkout-pro-heading-icon">01</div>
                  <div>
                    <h2>Delivery Information</h2>
                    <p>Enter the details for your order.</p>
                  </div>
                </div>

                <div className="checkout-pro-form">
                  <div className="checkout-pro-field">
                    <label>Full Name *</label>
                    <input
                      name="fullName"
                      value={checkoutData.fullName}
                      onChange={handleFieldChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="checkout-pro-field">
                    <label>Phone Number *</label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={checkoutData.phoneNumber}
                      onChange={handleFieldChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                    
                    <div className="checkout-pro-field">
  <label>House / Door Number *</label>
  <input
    name="houseNumber"
    value={checkoutData.houseNumber}
    onChange={handleFieldChange}
    placeholder="Enter house or door number"
    required
  />
</div>

<div className="checkout-pro-field">
  <label>Street / Area *</label>
  <input
    name="street"
    value={checkoutData.street}
    onChange={handleFieldChange}
    placeholder="Enter street or area"
    required
  />
</div>
                  <div className="checkout-pro-field">
                    <label>City *</label>
                    <input
                      name="city"
                      value={checkoutData.city}
                      onChange={handleFieldChange}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="checkout-pro-field">
                    <label>State *</label>
                    <input
                      name="state"
                      value={checkoutData.state}
                      onChange={handleFieldChange}
                      placeholder="State"
                      required
                    />
                  </div>

                  <div className="checkout-pro-field">
                    <label>Country *</label>
                    <input
                      name="country"
                      value={checkoutData.country}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>

                  <div className="checkout-pro-field">
                    <label>Postal Code *</label>
                    <input
                      name="postalCode"
                      value={checkoutData.postalCode}
                      onChange={handleFieldChange}
                      placeholder="PIN code"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>

                  <div className="checkout-pro-field checkout-pro-instructions">
                    <label>
                      Delivery Instructions <span>(Optional)</span>
                    </label>
                    <textarea
                      name="instructions"
                      value={checkoutData.instructions}
                      onChange={handleFieldChange}
                      placeholder="Any special instructions?"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="checkout-pro-security">
                  <span>✓</span>
                  Your information is used for this demonstration checkout.
                </div>

                <button
                  className="checkout-pro-place-btn"
                  type="submit"
                  disabled={placingOrder}
                >
                  Continue →
                </button>

                <button
                  className="checkout-pro-back-btn"
                  type="button"
                  onClick={() => setCurrentPage('cart')}
                >
                  ← Back to Cart
                </button>
              </form>
            </div>

            <aside className="checkout-pro-summary">
              <div className="checkout-pro-card">
                <h2>Order Summary</h2>

                <div className="checkout-pro-items">
                  {cart.map((item, index) => {
                    const product = getCartProduct(item)

                    return (
                      <div
                        className="checkout-pro-item"
                        key={item.cartItemId || item.id || index}
                      >
                        <div className="checkout-pro-item-details">
                          <strong>{product.name}</strong>
                          <span>Quantity: {getCartQuantity(item)}</span>
                        </div>
                        <strong>
                          ₹{(
                            getCartPrice(item) * getCartQuantity(item)
                          ).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    )
                  })}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <strong>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </strong>
                </div>

                <div className="checkout-pro-total">
                  <strong>Total Amount</strong>
                  <strong>₹{finalTotal.toLocaleString('en-IN')}</strong>
                </div>

                <div className="checkout-pro-payment-note">
                  <span>🔒</span>
                  <div>
                    <strong>Demo Payment</strong>
                    <p>Test-mode payment confirmation.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    )
  }

  // SUCCESS PAGE
  function SuccessPage() {
    return (
      <main className="success-page">
        <div className="success-container">
          <div className="success-icon">✓</div>

<div className="checkout-pro-steps">
  <div className="checkout-step completed">
    <span>✓</span> Address
  </div>

  <div className="checkout-step-line active"></div>

  <div className="checkout-step completed">
    <span>✓</span> Order
  </div>

  <div className="checkout-step-line active"></div>

  <div className="checkout-step completed">
    <span>✓</span> Complete
  </div>
</div>
          <span className="section-label">ORDER CONFIRMED</span>

          <h1>Thank You for Shopping!</h1>

          <p>
            Your order has been placed successfully. Thank you for choosing
            Buynest.
          </p>

          <div className="success-order-details">
            <div>
              <span>ORDER ID</span>
              <strong>#{lastOrder?.id || 'Confirmed'}</strong>
            </div>

            <div>
              <span>ORDER TOTAL</span>
              <strong>
                ₹{Number(lastOrder?.totalAmount || 0).toLocaleString('en-IN')}
              </strong>
            </div>

            <div>
              <span>PAYMENT</span>
              <strong className="payment-success">Test Mode</strong>
            </div>
          </div>

          <button
            className="success-home-btn"
            onClick={async () => {
              await fetchOrders()
              setShowLatestOrderOnly(true)
              setCurrentPage('orders')
            }}
          >
            VIEW THIS ORDER →
          </button>

          <button className="checkout-back-btn" onClick={goHome}>
            CONTINUE SHOPPING
          </button>
        </div>
      </main>
    )
  }

 
  // ORDERS PAGE
  function OrdersPage() {
    const displayedOrders = showLatestOrderOnly && lastOrder?.id
      ? orders.filter(order => String(order.id) === String(lastOrder.id))
      : orders

    return (
      <main className="orders-page">
        <section className="orders-header">
          <span className="section-label">YOUR PURCHASE HISTORY</span>
          <h1>My Orders</h1>
          <p>Track and review your Buynest purchases.</p>
        </section>

        <section className="orders-content">
          <div className="orders-section-heading">
            <h2>{showLatestOrderOnly ? 'Your Order' : 'Order History'}</h2>
            <p>Your recent orders are displayed here.</p>

            {showLatestOrderOnly && (
              <button
                onClick={() => setShowLatestOrderOnly(false)}
                className="home-view-all"
              >
                View All Orders
              </button>
            )}
          </div>

          {displayedOrders.length === 0 ? (
            <div className="empty-products">
              <div>📦</div>
              <h3>No orders yet</h3>
              <p>Your placed orders will appear here.</p>
              <button onClick={() => setCurrentPage('products')}>
                Explore Products
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {[...displayedOrders]
                .sort(
                  (a, b) =>
                    new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
                )
                .map(order => {
                  const orderItems = Array.isArray(order.orderItems)
                    ? order.orderItems
                    : Array.isArray(order.items)
                      ? order.items
                      : []

                  const trackingSteps = [
                    'Pending',
                    'Confirmed',
                    'Ordered',
                    'Packed',
                    'Shipped',
                    'Out for Delivery',
                    'Delivered'
                  ]

                  const currentStep = trackingSteps.indexOf(
                    order.status || 'Pending'
                  )

                  const status = (order.status || 'Pending')
                    .toLowerCase()
                    .replace(/\s+/g, '-')

                  const expectedDate =
                    order.expectedDeliveryDate ||
                    order.ExpectedDeliveryDate

                  return (
                    <article className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-label">ORDER NUMBER</span>
                          <h3>#{order.id}</h3>
                        </div>

                        <span className={`order-status ${status}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>

                      <div className="order-meta">
                        <div>
                          <span>Order Date</span>
                          <strong>
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString('en-IN')
                              : 'Not available'}
                          </strong>
                        </div>

                        <div>
                          <span>Order Total</span>
                          <strong>
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <div>
                          <span>Payment</span>
                          <strong>{order.paymentStatus || 'Demo'}</strong>
                        </div>

                        <div>
                          <span>Items</span>
                          <strong>{orderItems.length}</strong>
                        </div>
                      </div>

                      <div className="order-items">
                        <h4>Order Items</h4>

                        <div className="order-tracking">
                          <div className="tracking-heading">
                            <h4>Order Tracking</h4>
                            <span>{order.status || 'Pending'}</span>
                          </div>

                          <div className="tracking-timeline">
                            {trackingSteps.map((step, index) => (
                              <div
                                className={`tracking-step ${
                                  currentStep >= index ? 'completed' : ''
                                }`}
                                key={step}
                              >
                                <div className="tracking-circle">
                                  {currentStep > index ? '✓' : index + 1}
                                </div>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>

                          <div className="expected-delivery">
                            <span>Expected Delivery</span>
                            <strong>
                              {expectedDate
                                ? new Date(expectedDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : 'Date not yet announced'}
                            </strong>
                          </div>
                        </div>

                        {orderItems.length === 0 ? (
                          <p>Order item details are not available.</p>
                        ) : (
                          orderItems.map((item, index) => {
                            const productId =
                              item.productId || item.product?.id

                            const productName =
                              item.product?.name ||
                              item.productName ||
                              item.name ||
                              'Product'

                            return (
                              <div
                                className="order-item-row"
                                key={item.id || index}
                              >
                                <div className="order-item-info">
                                  <strong>{productName}</strong>
                                  <span>
                                    Quantity: {item.quantity || 1}
                                  </span>

                                  {order.status?.toLowerCase() === 'delivered' &&
                                    productId && (
                                      <button
                                        type="button"
                                        className="review-button"
                                        onClick={() => {
                                          setSelectedReviewOrder(order)

                                          setSelectedReviewProduct({
                                            id: productId,
                                            name: productName
                                          })

                                          setReviewMessage('')
                                          setReviewName('')
                                          setReviewRating(5)
                                          setReviewComment('')
                                          setShowReviewForm(true)
                                        }}
                                      >
                                        Write a Review
                                      </button>
                                    )}
                                </div>

                                <strong>
                                  ₹{Number(
                                    item.price || item.unitPrice || 0
                                  ).toLocaleString('en-IN')}
                                </strong>
                              </div>
                            )
                          })
                        )}
                      </div>

                      <div className="order-card-footer">
                        <span>Thank you for shopping with Buynest.</span>
                        <strong>
                          Total: ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </strong>
        
{order.status?.toLowerCase() !== 'cancelled' &&
 order.status?.toLowerCase() !== 'delivered' && (
  <button
    type="button"
    className="cancel-order-btn"
    onClick={() => cancelOrder(order.id)}
  >
    Cancel Order
  </button>
)}

{order.status?.toLowerCase() === 'cancelled' && (
  <button
    type="button"
    className="delete-order-btn"
    onClick={() => deleteOrder(order.id)}
  >
    Delete Order
  </button>
)}

                      </div>

                      {showReviewForm &&
                        selectedReviewOrder?.id === order.id &&
                        selectedReviewProduct && (
                          <div className="review-form">
                            <h3>Write a Review</h3>

                            <p>
                              Product:{' '}
                              <strong>{selectedReviewProduct.name}</strong>
                            </p>

                            <label>How would you rate this product?</label>

                            <div className="review-star-rating">
                              <div className="stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={star <= reviewRating ? 'active' : ''}
                                    onClick={() => setReviewRating(star)}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>

                              <span className="rating-text">
                                {[
                                  'Poor',
                                  'Fair',
                                  'Good',
                                  'Very Good',
                                  'Excellent'
                                ][reviewRating - 1]}
                              </span>
                            </div>

                            <label>Your Review</label>

                            <textarea
                              value={reviewComment}
                              onChange={e => setReviewComment(e.target.value)}
                              placeholder="Share your experience..."
                              rows={4}
                            />

                            <button
                              type="button"
                              onClick={submitReview}
                            >
                              Submit Review
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShowReviewForm(false)
                                setSelectedReviewOrder(null)
                                setSelectedReviewProduct(null)
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                    </article>
                  )
                })}
            </div>
          )}
        </section>
      </main>
    )
  }

  // AUTH PAGE
  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <Auth
        key={currentPage}
        initialIsRegister={currentPage === 'register'}
        onLogin={handleLogin}
        onBack={goHome}
      />
    )
  }

  // ADMIN PAGE
  if (currentPage === 'admin' && isAdmin) {
    return <AdminDashboard onBack={goHome} />
  }

  return (
    <div className="app">
      <header className="navbar">
        <h2 className="logo" onClick={goHome}>
          Buy<span>nest.</span>
        </h2>

        <nav>
          <a
            href="#home"
            onClick={event => {
              event.preventDefault()
              goHome()
            }}
          >
            Home
          </a>

          <a
            href="#shop"
            onClick={event => {
              event.preventDefault()
              setSelectedCategory(null)
              setCurrentPage('products')
            }}
          >
            Shop
          </a>

          <a
            href="#categories"
            onClick={event => {
              event.preventDefault()
              goHome()
              window.setTimeout(() => {
                document.getElementById('categories')?.scrollIntoView({
                  behavior: 'smooth'
                })
              }, 100)
            }}
          >
            Categories
          </a>
        </nav>

  <SearchBar
  search={search}
  setSearch={setSearch}
  onSearch={handleSearch}
  products={products}
  onProductClick={openProduct}
/>

        <div className="nav-actions">
          <a
            href="#orders"
            onClick={event => {
              event.preventDefault()
              if (!token) {
                setCurrentPage('login')
              } else {
                setShowLatestOrderOnly(false)
                setCurrentPage('orders')
                fetchOrders()
              }
            }}
          >
            My Orders
          </a>

          <a
            href="#wishlist"
            onClick={event => {
              event.preventDefault()
              setCurrentPage('wishlist')
            }}
          >
            ♡ wishlist
          </a>

          <a
            href="#cart"
            onClick={event => {
              event.preventDefault()
              if (!token) {
                setCurrentPage('login')
              } else {
                setCurrentPage('cart')
                fetchCart()
              }
            }}
          >
            Cart
          </a>

          {token ? (
            <>
              {isAdmin && (
                
                <a
                  href="#admin"
                  onClick={event => {
                    event.preventDefault()
                    setCurrentPage('admin')
                  }}
                >
                  Admin
                </a>
              )}
              <a
  href="#profile"
  onClick={event => {
    event.preventDefault()

    if (!token) {
      setCurrentPage('login')
    } else {
      setCurrentPage('profile')
    }
  }}
>
  👤 My Profile
</a>

              <a
                href="#logout"
                onClick={event => {
                  event.preventDefault()
                  handleLogout()
                }}
              >
                Logout
              </a>
            </>
          ) : (
            <>
              <a
                href="#login"
                onClick={event => {
                  event.preventDefault()
                  setCurrentPage('login')
                }}
              >
                Sign In
              </a>

              <a
                href="#register"
                onClick={event => {
                  event.preventDefault()
                  setCurrentPage('register')
                }}
              >
                Register
              </a>
            </>
          )}
        </div>
      </header>

      {message && <div className="cart-message">{message}</div>}

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'productDetails' && <ProductDetailsPage />}
   
      {currentPage === 'wishlist' && (
  <WishlistPage
    wishlist={wishlist}
    onBack={() => setCurrentPage('home')}
  />
)}
      {currentPage === 'cart' && <CartPage />}
      {currentPage === 'checkout' && <CheckoutPage />}
      {currentPage === 'success' && <SuccessPage />}
     {currentPage === 'orders' && OrdersPage()}

      <footer>
        <h2>Buy<span>nest.</span></h2>
        <p>Discover more. Shop better. Live better.</p>
        <p>Thoughtfully selected products for everyday living.</p>
        <p className="copyright">
          © 2026 Buynest. All rights reserved.
        </p>
        {currentPage === 'profile' && (
  <main className="profile-page">
    <div className="profile-container">

      <button
        className="back-collection-btn"
        onClick={() => setCurrentPage('home')}
      >
        ← Back to Home
      </button>

      <div className="profile-heading">
        <span className="section-label">MY ACCOUNT</span>
        <h1>My <span>Profile</span></h1>
        <p>Manage your personal information and account details.</p>
      </div>

      <form
        className="profile-card"
        onSubmit={handleProfileUpdate}
      >
        <div className="profile-avatar">
          {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <h2>{profile.fullName || 'Your Profile'}</h2>
        <p className="profile-email">{profile.email}</p>

        {profileLoading ? (
          <p>Loading profile...</p>
        ) : (
          <div className="profile-form-fields">

            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                disabled={false}
                onChange={e =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber}
                disabled={!profileEditing}
                onChange={e =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            <div className="profile-field">
              <label>Address</label>
              <textarea
                value={profile.address}
                disabled={!profileEditing}
                onChange={e =>
                  setProfile({ ...profile, address: e.target.value })
                }
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <div className="profile-actions">
              <p style={{ color: 'red' }}>{String(profileEditing)}</p>
              {profileEditing ? (
                <>
                  <button type="submit" className="profile-save-btn">
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={() => {
                      setProfileEditing(false)
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
               <button
  type="button"
  className="profile-edit-btn"
  onClick={() => setProfileEditing(true)}
>
  Edit Profile
</button>
              )}
            </div>

          </div>
        )}
      </form>
    </div>
  </main>
)}
      </footer>
    </div>
  )
}

export default App
