import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create HTML page with Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telecast API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-16x16.png" sizes="16x16" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #2c3e50;
        }
        .swagger-ui .topbar .download-url-wrapper {
            display: none;
        }
        .custom-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .custom-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 300;
        }
        .custom-header p {
            margin: 10px 0 0 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .api-info {
            background: white;
            margin: 20px;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .api-info h2 {
            color: #2c3e50;
            margin-top: 0;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .feature-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .feature-item h4 {
            margin: 0 0 8px 0;
            color: #2c3e50;
        }
        .feature-item p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="custom-header">
        <h1>🎙️ Telecast API</h1>
        <p>Comprehensive Media Platform API Documentation</p>
    </div>
    
    <div class="api-info">
        <h2>About Telecast API</h2>
        <p>Telecast is a comprehensive media platform that allows users to search, discover, and manage various types of content including videos, books, music, podcasts, and news. The platform also provides premium subscription features, user management, and content distribution capabilities.</p>
        
        <h3>Key Features</h3>
        <div class="feature-list">
            <div class="feature-item">
                <h4>🔍 Unified Search</h4>
                <p>Search across videos, books, music, podcasts, and news with a single API</p>
            </div>
            <div class="feature-item">
                <h4>👤 User Management</h4>
                <p>Auth0 authentication, profile management, and subscription handling</p>
            </div>
            <div class="feature-item">
                <h4>🎧 Content Creation</h4>
                <p>Create and manage podcasts, episodes, and playlists</p>
            </div>
            <div class="feature-item">
                <h4>💳 Premium Features</h4>
                <p>Subscription management with Stripe integration</p>
            </div>
            <div class="feature-item">
                <h4>📡 Distribution</h4>
                <p>Multi-platform content distribution including YouTube and RSS feeds</p>
            </div>
            <div class="feature-item">
                <h4>📈 Trending Content</h4>
                <p>Discover trending content across all media types</p>
            </div>
        </div>
        
        <h3>Authentication</h3>
        <p>Most endpoints require authentication via Auth0. Include the session token in your requests. Use the "Authorize" button below to authenticate.</p>
        
        <h3>Base URL</h3>
        <p>All API endpoints are relative to your deployment URL. For development: <code>http://localhost:3000/api</code></p>
    </div>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/docs/spec',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: (request) => {
                    // Add any custom request headers here
                    return request;
                },
                responseInterceptor: (response) => {
                    // Handle responses here
                    return response;
                },
                onComplete: () => {
                    console.log('Swagger UI loaded successfully');
                },
                onFailure: (error) => {
                    console.error('Failed to load Swagger UI:', error);
                }
            });
        };
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating API docs:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}
