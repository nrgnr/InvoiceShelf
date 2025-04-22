<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend Assets Not Built</title>
    <style>
        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            background: #f8fafc;
            color: #1a202c;
        }
        .container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        h1 {
            color: #2d3748;
            margin-bottom: 1rem;
        }
        .alert {
            background: #fff5f5;
            color: #c53030;
            padding: 1rem;
            border-radius: 0.25rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid #fc8181;
        }
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.25rem;
            font-family: monospace;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Frontend Assets Not Built</h1>
        
        <div class="alert">
            The application's frontend assets have not been built.
        </div>

        <p>
            This typically happens when deploying to production without building the frontend assets.
            To fix this, run the following commands in your deployment process:
        </p>

        <div class="code">
            npm install<br>
            npm run build
        </div>

        <p>
            These commands will install the necessary Node.js dependencies and build the frontend assets
            required for the application to run properly.
        </p>
    </div>
</body>
</html> 