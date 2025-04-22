<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Connection Error</title>
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
        .help-text {
            color: #4a5568;
            margin-bottom: 1.5rem;
        }
        .checklist {
            list-style: none;
            padding-left: 0;
        }
        .checklist li {
            margin-bottom: 0.75rem;
            padding-left: 1.5rem;
            position: relative;
        }
        .checklist li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #4299e1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Database Connection Error</h1>
        
        <div class="alert">
            We're having trouble connecting to the database.
        </div>

        <div class="help-text">
            Please check the following:
        </div>

        <ul class="checklist">
            <li>Database server is running and accessible</li>
            <li>Database credentials in .env file are correct</li>
            <li>Database exists and is properly configured</li>
            <li>Database user has proper permissions</li>
            <li>Network connectivity between application and database</li>
        </ul>

        <div class="help-text">
            If you're the system administrator, please check the logs for more detailed information.
        </div>
    </div>
</body>
</html> 