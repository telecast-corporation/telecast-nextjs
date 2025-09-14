# Telecast API Documentation

This document provides information about accessing and using the Telecast API documentation.

## 📚 API Documentation Access

The Telecast API documentation is available in Swagger/OpenAPI format and can be accessed through the following URLs:

### Development Environment
- **Interactive Documentation**: `http://localhost:3000/api/docs`
- **OpenAPI Specification**: `http://localhost:3000/api/docs/spec`

### Production Environment
- **Interactive Documentation**: `https://your-domain.com/api/docs`
- **OpenAPI Specification**: `https://your-domain.com/api/docs/spec`

## 🎯 What's Included

The API documentation covers all major endpoints including:

### Authentication & User Management
- User creation and authentication via Auth0
- Profile management (get/update user information)
- Session handling

### Content Search & Discovery
- Unified search across videos, books, music, podcasts, and news
- Autocomplete suggestions
- Trending content discovery
- Content-specific search (books, videos, music, etc.)

### Content Management
- Podcast creation and management
- Episode management
- RSS feed generation
- Content distribution

### Payment & Subscription
- Stripe checkout session creation
- Subscription management
- Free trial activation
- Payment webhook handling

### Support & Contact
- Contact form submission
- Support ticket handling

## 🔧 Features

- **Interactive Testing**: Try out API endpoints directly from the documentation
- **Authentication Support**: Built-in Auth0 authentication testing
- **Request/Response Examples**: Comprehensive examples for all endpoints
- **Schema Validation**: Detailed request/response schemas
- **Error Handling**: Complete error response documentation

## 🚀 Getting Started

1. **Access the Documentation**: Visit `/api/docs` in your browser
2. **Authenticate**: Use the "Authorize" button to authenticate with Auth0
3. **Explore Endpoints**: Browse through different API categories
4. **Test Endpoints**: Use the "Try it out" feature to test API calls
5. **View Responses**: See real-time responses and error handling

## 📋 API Categories

- **Authentication**: User authentication and account management
- **User Profile**: Profile management and settings
- **Search**: Content search and discovery
- **Books**: Book search via Google Books API
- **Videos**: Video search via YouTube API
- **Music**: Music search via Spotify API
- **Podcasts**: Podcast creation and management
- **News**: News search via News API
- **Payment**: Subscription and payment management
- **Contact**: Contact form and support

## 🔐 Authentication

Most endpoints require authentication via Auth0. The documentation includes:

- Bearer token authentication
- Session-based authentication
- User context handling
- Permission-based access control

## 📖 OpenAPI Specification

The complete OpenAPI 3.0.3 specification is available at `/api/docs/spec` and includes:

- Complete endpoint definitions
- Request/response schemas
- Authentication requirements
- Error handling
- Examples and descriptions

## 🛠️ Development

To add new endpoints to the documentation:

1. Update the OpenAPI specification in `src/app/api/docs/spec/route.ts`
2. Add new schemas to the `components.schemas` section
3. Include proper error handling and examples
4. Test the documentation by visiting `/api/docs`

## 📝 Notes

- The documentation is automatically generated from the API specification
- All examples use realistic data for testing
- Error responses include detailed error messages and codes
- The documentation is responsive and works on all devices

## 🔗 External APIs

The Telecast API integrates with several external services:

- **Google Books API**: Book search and details
- **YouTube API**: Video search and metadata
- **Spotify API**: Music search and track information
- **News API**: News article search
- **Podcast Index API**: Podcast discovery
- **Stripe**: Payment processing
- **Auth0**: User authentication

## 📞 Support

For API support or questions:

- Email: support@telecast.ca
- Website: https://telecast.ca
- Documentation: `/api/docs`

---

*Last updated: January 2024*
