import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const openApiSpec = {
      openapi: "3.0.3",
      info: {
        title: "Telecast API",
        description: `Telecast is a comprehensive media platform that allows users to search, discover, and manage various types of content including videos, books, music, podcasts, and news. The platform also provides premium subscription features, user management, and content distribution capabilities.

## Features
- **Search & Discovery**: Unified search across videos, books, music, podcasts, and news
- **User Management**: Authentication via Auth0, profile management, and subscription handling
- **Content Management**: Create and manage podcasts, episodes, and playlists
- **Premium Features**: Subscription management with Stripe integration
- **Distribution**: Multi-platform content distribution including YouTube and RSS feeds

## Authentication
Most endpoints require authentication via Auth0. Include the session token in your requests.

## Base URL
All API endpoints are relative to your deployment URL (e.g., \`${baseUrl}/api\`)`,
        version: "1.0.0",
        contact: {
          name: "Telecast Support",
          email: "support@telecast.ca",
          url: "https://telecast.ca"
        }
      },
      servers: [
        {
          url: `${baseUrl}/api`,
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
        }
      ],
      security: [{ Auth0: [] }],
      paths: {
        "/auth/create-user": {
          post: {
            tags: ["Authentication"],
            summary: "Create a new user",
            description: "Creates a new user account in the database with Auth0 integration",
            security: [{ Auth0: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["auth0Id", "email", "name"],
                    properties: {
                      auth0Id: { type: "string", example: "auth0|1234567890" },
                      email: { type: "string", format: "email", example: "user@example.com" },
                      name: { type: "string", example: "John Doe" },
                      picture: { type: "string", format: "uri", example: "https://example.com/avatar.jpg" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "User created successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
              "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
              "500": { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/profile": {
          get: {
            tags: ["User Profile"],
            summary: "Get user profile",
            security: [{ Auth0: [] }],
            responses: {
              "200": { description: "User profile", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
              "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          },
          put: {
            tags: ["User Profile"],
            summary: "Update user profile",
            security: [{ Auth0: [] }],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    required: ["name"],
                    properties: {
                      name: { type: "string", example: "John Doe" },
                      bio: { type: "string", example: "Content creator" },
                      imageFile: { type: "string", format: "binary" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Profile updated", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
              "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/contact": {
          post: {
            tags: ["Contact"],
            summary: "Send contact message",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["name", "email", "message"],
                    properties: {
                      name: { type: "string", example: "John Doe" },
                      email: { type: "string", format: "email", example: "john@example.com" },
                      message: { type: "string", example: "I have a question" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Message sent", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
              "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/search": {
          post: {
            tags: ["Search"],
            summary: "Unified search",
            description: "Search across videos, books, music, podcasts, and news",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["query", "types"],
                    properties: {
                      query: { type: "string", example: "technology podcast" },
                      types: { type: "array", items: { type: "string", enum: ["video", "book", "music", "podcast", "news"] }, example: ["podcast", "video"] },
                      maxResults: { type: "integer", default: 50 },
                      trending: { type: "boolean", default: false },
                      page: { type: "integer", default: 1 },
                      limit: { type: "integer", default: 20 }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Search results", content: { "application/json": { schema: { type: "object", properties: { results: { type: "array", items: { $ref: "#/components/schemas/SearchResult" } } } } } } },
              "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/book": {
          get: {
            tags: ["Books"],
            summary: "Search books",
            description: "Search for books using Google Books API",
            parameters: [
              { name: "q", in: "query", required: true, schema: { type: "string" }, description: "Search query" },
              { name: "maxResults", in: "query", schema: { type: "integer", default: 20 }, description: "Max results" },
              { name: "startIndex", in: "query", schema: { type: "integer", default: 0 }, description: "Start index" }
            ],
            responses: {
              "200": { description: "Book results", content: { "application/json": { schema: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/Book" } } } } } } },
              "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/payment/create-checkout-session": {
          post: {
            tags: ["Payment"],
            summary: "Create Stripe checkout session",
            security: [{ Auth0: [] }],
            responses: {
              "200": { description: "Checkout URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } } },
              "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/payment/cancel-subscription": {
          post: {
            tags: ["Payment"],
            summary: "Cancel subscription",
            security: [{ Auth0: [] }],
            responses: {
              "200": { description: "Subscription cancelled", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, canceled: { type: "boolean" } } } } } },
              "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        },
        "/free-trial/activate": {
          post: {
            tags: ["Subscription"],
            summary: "Activate free trial",
            security: [{ Auth0: [] }],
            responses: {
              "200": { description: "Free trial activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
              "400": { description: "Already used", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          Auth0: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Auth0 JWT token"
          }
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              error: { type: "string", example: "Error message" }
            },
            required: ["error"]
          },
          User: {
            type: "object",
            properties: {
              id: { type: "string", example: "user_123" },
              auth0Id: { type: "string", example: "auth0|1234567890" },
              email: { type: "string", format: "email", example: "user@example.com" },
              name: { type: "string", example: "John Doe" },
              image: { type: "string", format: "uri", example: "https://example.com/avatar.jpg" },
              isPremium: { type: "boolean", example: true },
              usedFreeTrial: { type: "boolean", example: false },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            },
            required: ["id", "auth0Id", "email", "name"]
          },
          SearchResult: {
            type: "object",
            properties: {
              id: { type: "string", example: "result_123" },
              title: { type: "string", example: "Content Title" },
              description: { type: "string", example: "Content description" },
              thumbnail: { type: "string", format: "uri", example: "https://example.com/thumb.jpg" },
              url: { type: "string", format: "uri", example: "/content/123" },
              type: { type: "string", enum: ["video", "book", "music", "podcast", "news"], example: "podcast" },
              author: { type: "string", example: "Author Name" },
              source: { type: "string", example: "spotify" },
              sourceUrl: { type: "string", format: "uri", example: "https://spotify.com/123" },
              publishedAt: { type: "string", format: "date-time" },
              category: { type: "string", example: "Technology" },
              tags: { type: "array", items: { type: "string" }, example: ["tech", "news"] }
            },
            required: ["id", "title", "type"]
          },
          Book: {
            type: "object",
            properties: {
              id: { type: "string", example: "book_123" },
              volumeInfo: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Book Title" },
                  authors: { type: "array", items: { type: "string" }, example: ["Author Name"] },
                  description: { type: "string", example: "Book description" },
                  imageLinks: {
                    type: "object",
                    properties: {
                      thumbnail: { type: "string", format: "uri" }
                    }
                  },
                  publishedDate: { type: "string", example: "2008-05-01" },
                  pageCount: { type: "integer", example: 176 },
                  categories: { type: "array", items: { type: "string" } },
                  averageRating: { type: "number", example: 4.5 },
                  previewLink: { type: "string", format: "uri" }
                }
              }
            },
            required: ["id", "volumeInfo"]
          }
        }
      },
      tags: [
        { name: "Authentication", description: "User authentication and account management" },
        { name: "User Profile", description: "User profile management and settings" },
        { name: "Search", description: "Content search and discovery" },
        { name: "Books", description: "Book search and management" },
        { name: "Payment", description: "Subscription and payment management" },
        { name: "Subscription", description: "Subscription management and free trials" },
        { name: "Contact", description: "Contact form and support" }
      ]
    };
    
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    );
  }
}
