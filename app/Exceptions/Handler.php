<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        if ($exception instanceof \PDOException) {
            return response()->view('errors.database', [], 500);
        }

        // Handle Vite manifest not found error
        if ($exception instanceof \Exception && 
            str_contains($exception->getMessage(), 'Vite manifest not found')) {
            return response()->view('errors.vite-manifest', [
                'message' => 'Frontend assets have not been built. Please run: npm install && npm run build'
            ], 500);
        }

        return parent::render($request, $exception);
    }
} 