<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Silber\Bouncer\Bouncer;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class ScopeBouncer
{
    /**
     * The Bouncer instance.
     *
     * @var \Silber\Bouncer\Bouncer
     */
    protected $bouncer;

    /**
     * Constructor.
     */
    public function __construct(Bouncer $bouncer)
    {
        $this->bouncer = $bouncer;
    }

    /**
     * Set the proper Bouncer scope for the incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            Log::warning('ScopeBouncer: No authenticated user found');
            return $next($request);
        }
        
        try {
            $companyId = $request->header('company');
            
            if (!$companyId) {
                $firstCompany = $user->companies()->first();
                
                if (!$firstCompany) {
                    // This should not happen as CompanyMiddleware should have created a company,
                    // but added as an extra safety measure
                    Log::error('ScopeBouncer: User has no companies', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                    
                    // Continue without setting scope - will likely cause issues but prevents a crash
                    return $next($request);
                }
                
                $companyId = $firstCompany->id;
            }
            
            $this->bouncer->scope()->to($companyId);
            
            Log::debug('ScopeBouncer: Set scope for user', [
                'user_id' => $user->id,
                'company_id' => $companyId
            ]);
            
        } catch (\Exception $e) {
            Log::error('ScopeBouncer: Error setting scope', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $next($request);
    }
}
