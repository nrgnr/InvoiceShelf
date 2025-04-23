<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Company;
use Illuminate\Support\Facades\Log;
use Silber\Bouncer\BouncerFacade;

class CompanyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Schema::hasTable('user_company')) {
            $user = $request->user();

            if (!$user) {
                return $next($request);
            }

            // Check if user has any companies
            $userCompaniesCount = $user->companies()->count();
            
            if ($userCompaniesCount === 0) {
                // User has no companies - create a default one
                Log::warning('User has no associated companies. Creating a default company.', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                
                $company = Company::create([
                    'name' => 'Default Company',
                    'slug' => 'default-company-' . $user->id,
                    'owner_id' => $user->id,
                ]);
                
                // Associate user with company
                $user->companies()->attach($company->id);
                
                // Set up Bouncer scope
                BouncerFacade::scope()->to($company->id);
                
                // Instead of assigning admin role, give specific permissions
                // Invoice permissions
                BouncerFacade::allow($user)->to('view-invoice');      // invoice.view_own
                BouncerFacade::allow($user)->to('create-invoice');    // invoice.create
                BouncerFacade::allow($user)->to('edit-invoice');      // invoice.edit_own
                BouncerFacade::allow($user)->to('delete-invoice');    // invoice.delete_own
                
                // Customer permissions (client)
                BouncerFacade::allow($user)->to('view-customer');     // client.view_own
                BouncerFacade::allow($user)->to('create-customer');   // client.create
                BouncerFacade::allow($user)->to('edit-customer');     // client.edit_own
                
                // Payment permissions
                BouncerFacade::allow($user)->to('create-payment');    // payment.record
                BouncerFacade::allow($user)->to('view-payment');      // payment.view_own
                
                // Additional required abilities for these operations
                BouncerFacade::allow($user)->to('view-item');         // Required for invoice operations
                BouncerFacade::allow($user)->to('view-tax-type');     // Required for invoice operations
                BouncerFacade::allow($user)->to('view-custom-field'); // Required for most operations
                BouncerFacade::allow($user)->to('dashboard');         // Required for dashboard access
                BouncerFacade::allow($user)->to('send-invoice');      // Required for invoice operations
                BouncerFacade::allow($user)->to('send-payment');      // Required for payment operations
                
                Log::info('Specific permissions assigned to user in middleware', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                
                // Set up default company settings
                $company->setupDefaultData();
                
                // Set the company in the request header
                $request->headers->set('company', $company->id);
                
                Log::info('Created default company for user', [
                    'user_id' => $user->id,
                    'company_id' => $company->id
                ]);
            } else if ((!$request->header('company')) || (!$user->hasCompany($request->header('company')))) {
                // User has companies but none selected or invalid selection
                $firstCompany = $user->companies()->first();
                
                if ($firstCompany) {
                    $request->headers->set('company', $firstCompany->id);
                }
            }
        }

        return $next($request);
    }
}
