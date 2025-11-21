# Joystick.ee Store & Forum - Project TODO

## Infrastructure
- [x] Subdomain routing logic (store.joystick.ee vs forum.joystick.ee)
- [x] Extend database schema for forum features

## Store Features (store.joystick.ee)
- [x] Database schema for products, categories, cart, orders
- [x] Seed sample gaming products data
- [x] Public storefront homepage with featured products
- [x] Product catalog page with category filtering
- [x] Individual product detail pages
- [x] Shopping cart functionality (add/remove/update quantities)
- [x] Checkout process with order creation
- [ ] User order history page
- [ ] Admin dashboard for managing products
- [ ] Admin order management interface
- [ ] Product image upload and management
- [ ] Search functionality for products

## Forum Features (forum.joystick.ee)
- [ ] Communities/subreddits structure
- [ ] Create, read, update, delete posts
- [ ] Comments on posts with nesting
- [ ] Upvote/downvote system for posts and comments
- [ ] User profiles with post history
- [ ] Community moderation features
- [ ] Search posts and communities
- [x] Lemmy-style UI design
- [ ] Trending/hot posts algorithm
- [ ] User reputation system

## Design & Styling
- [x] Responsive design matching logo colors (blue/orange)
- [x] Store layout and navigation
- [x] Forum layout and navigation
- [x] Landing page with Store/Forum buttons

## Design Updates (In Progress)
- [x] Generate new purple-themed logo
- [x] Update color scheme to dark theme with purple accents
- [x] Update landing page colors
- [x] Update store layout colors
- [x] Update forum layout colors
- [x] Update all buttons and UI elements


## Authentication UI Updates
- [x] Create custom login page with email/password and Discord OAuth
- [x] Create custom signup page with email/password and Discord OAuth
- [x] Add Login/Signup links to store header
- [x] Remove Discord button from forum header
- [x] Keep Discord OAuth only in login/signup pages
- [x] Write and run authentication tests

## Enhancement Tasks
- [ ] Remove header from landing page
- [ ] Enable forum functionality (create posts, comments, voting)
- [ ] Integrate Stripe payment processing
- [ ] Create admin dashboard for products and orders

## Current Work (Completed)
- [x] Redesign store header to match forum header layout (centered search, right-aligned buttons)
- [x] Implement forgot password feature with email verification
- [x] Add password strength indicators to signup page
- [x] Add password validation rules (uppercase, numbers, special chars)
- [x] Create user profile dropdown menu in headers
- [x] Write and run tests for new features (63 tests passing)

## Email Integration & Admin Dashboard (In Progress)
- [ ] Set up email service (SendGrid/Mailgun) credentials
- [ ] Implement password reset email sending
- [ ] Build admin dashboard layout with sidebar navigation
- [ ] Create product management interface (CRUD operations)
- [ ] Create order management interface (view, update status)
- [ ] Add user activity monitoring and analytics
- [ ] Write and run tests for email and admin features

## Simplify to Discord OAuth Only (Completed)
- [x] Remove email/password login page
- [x] Remove email/password signup page
- [x] Remove forgot password and reset password pages
- [x] Remove password strength utilities and validation
- [x] Remove local auth endpoints from backend
- [x] Remove password reset tokens table from database
- [x] Update store and forum headers to show Discord login only
- [x] Clean up authentication routes
- [x] All tests passing (26 tests)

## Store Support Pages (Completed)
- [x] Create Contact Us page with contact form and email (info@joystick.ee)
- [x] Create FAQ page with 10 common questions and answers
- [x] Create Returns page with return policy and process
- [x] Update store footer with links to new pages
- [x] Add routes to App.tsx


## Contact Form Fixes (Completed)
- [x] Fix "Email Us" button in Returns page to redirect to Contact Us
- [x] Implement contact form email sending via Manus notification API
- [x] Add error handling and loading states to contact form
- [x] All tests passing (26 tests)

## Discord OAuth Only & Shopping Without Login (Completed)
- [x] Remove all Manus OAuth references from codebase
- [x] Replace getLoginUrl with getDiscordLoginUrl
- [x] Update all login buttons to use Discord OAuth only
- [x] Make shopping cart work with localStorage (no login required)
- [x] Update ProductDetail to allow adding to cart without auth
- [x] Rewrite ShoppingCart to use localStorage for persistence
- [x] Rewrite Checkout to work without authentication
- [x] Update all error handlers to not redirect to login
- [x] All 77 tests passing


## Contact Form Removal (Completed)
- [x] Remove contact form from /contact page
- [x] Keep contact info cards (email, response time, location)
- [x] All 77 tests passing


## Admin Product Management (Completed)
- [x] Build product management interface in admin panel
- [x] Add create product form with name, price, description, image
- [x] Add edit product functionality
- [x] Add delete product functionality
- [x] Display product list with pagination
- [x] Add inventory management

## Forum Features (Completed)
- [x] Enable post creation in communities
- [x] Enable post editing and deletion
- [x] Enable comments on posts
- [x] Enable comment editing and deletion
- [x] Implement upvote/downvote for posts
- [x] Implement upvote/downvote for comments
- [x] Display post and comment scores
- [ ] Sort posts by trending/hot/new


## Search & Filtering System (Completed)
- [x] Backend: Product search by name and description
- [x] Backend: Product filtering by price range and stock
- [x] Backend: Forum post search by title and content
- [x] Backend: Forum post filtering by community and date
- [x] Backend: Community search by name and description
- [x] Frontend: Product search UI with filters
- [x] Frontend: Forum post search UI with filters
- [x] Frontend: Community search UI
- [x] Tests for search and filtering features


## Autocomplete Search Suggestions (Completed)
- [x] Backend: Product autocomplete suggestions
- [x] Backend: Forum post autocomplete suggestions
- [x] Backend: Community autocomplete suggestions
- [x] Frontend: Autocomplete dropdown component
- [x] Frontend: Integrate autocomplete into product search
- [x] Frontend: Integrate autocomplete into forum search
- [x] Tests for autocomplete features


## Validation Error Handling (Completed)
- [x] Fix post creation validation error display
- [x] Create global error display component
- [x] Add validation error handling to all forms
- [x] Display "too short" errors visibly in UI
- [x] Test validation errors across all features


## Remove Manus OAuth (In Progress)
- [ ] Remove Manus OAuth from backend
- [ ] Remove Manus environment variables
- [ ] Implement JWT-based authentication
- [ ] Create login/register UI
- [ ] Update .env.local template
