<?php

namespace App\Http\Controllers\V1\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Exception;
use Silber\Bouncer\BouncerFacade;

class OIDCController extends Controller
{
    public function redirect()
    {
        try {
            return Socialite::driver('oidc')->redirect();
        } catch (Exception $e) {
            Log::error('OIDC Redirect Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'redirect_failed',
                'message' => 'Failed to generate authorization URL: ' . $e->getMessage()
            ], 500);
        }
    }

    public function callback(Request $request)
    {
        Log::info('OIDC Callback Request: ', $request->all());
        
        if ($request->has('error')) {
            Log::error('OIDC Error Response: ', [
                'error' => $request->get('error'),
                'error_description' => $request->get('error_description')
            ]);
            return response()->json([
                'error' => $request->get('error'),
                'message' => $request->get('error_description')
            ], 400);
        }

        try {
            $user = Socialite::driver('oidc')->stateless()->user();
            Log::info('OIDC User Data: ', ['email' => $user->email, 'name' => $user->name]);

            // Find or create user
            $existingUser = User::where('email', $user->email)->first();

            if ($existingUser) {
                Auth::login($existingUser);
                Log::info('OIDC User Logged In: ' . $user->email);
            } else {
                // Create new user
                $newUser = User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                ]);

                // Find a company to associate with the user
                $company = Company::first();
                
                // If no company exists, create a default one
                if (!$company) {
                    $company = Company::create([
                        'name' => 'Default Company',
                        'slug' => 'default-company',
                        'owner_id' => $newUser->id,
                    ]);
                    
                    // Set up default company settings
                    $company->setupDefaultData();
                    
                    Log::info('Created Default Company for OIDC User: ' . $user->email);
                }
                
                // Associate user with company
                $newUser->companies()->attach($company->id);
                
                // Set up Bouncer scope for the company
                BouncerFacade::scope()->to($company->id);
                
                // Instead of assigning admin role, give specific permissions
                // Map the requested permissions to Bouncer abilities format
                
                // Invoice permissions
                BouncerFacade::allow($newUser)->to('view-invoice');      // invoice.view_own
                BouncerFacade::allow($newUser)->to('create-invoice');    // invoice.create
                BouncerFacade::allow($newUser)->to('edit-invoice');      // invoice.edit_own
                BouncerFacade::allow($newUser)->to('delete-invoice');    // invoice.delete_own
                
                // Customer permissions (client)
                BouncerFacade::allow($newUser)->to('view-customer');     // client.view_own
                BouncerFacade::allow($newUser)->to('create-customer');   // client.create
                BouncerFacade::allow($newUser)->to('edit-customer');     // client.edit_own
                
                // Payment permissions
                BouncerFacade::allow($newUser)->to('create-payment');    // payment.record
                BouncerFacade::allow($newUser)->to('view-payment');      // payment.view_own
                
                // Additional required abilities for these operations
                BouncerFacade::allow($newUser)->to('view-item');         // Required for invoice operations
                BouncerFacade::allow($newUser)->to('view-tax-type');     // Required for invoice operations
                BouncerFacade::allow($newUser)->to('view-custom-field'); // Required for most operations
                BouncerFacade::allow($newUser)->to('dashboard');         // Required for dashboard access
                BouncerFacade::allow($newUser)->to('send-invoice');      // Required for invoice operations
                BouncerFacade::allow($newUser)->to('send-payment');      // Required for payment operations
                
                Log::info('Specific permissions assigned to new OIDC user: ' . $user->email);
                
                // Set user settings (language, etc.)
                $newUser->setSettings([
                    'language' => CompanySetting::getSetting('language', $company->id) ?? 'en',
                ]);
                
                Log::info('OIDC New User Created and Associated with Company: ', [
                    'user' => $user->email, 
                    'company' => $company->name
                ]);

                Auth::login($newUser);
                Log::info('OIDC New User Created and Logged In: ' . $user->email);
            }

            return redirect('/admin/dashboard');

        } catch (InvalidStateException $e) {
            Log::error('OIDC Invalid State Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'invalid_state',
                'message' => 'OIDC authentication failed: Invalid state'
            ], 400);
        } catch (Exception $e) {
            Log::error('OIDC Callback Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'callback_failed',
                'message' => 'OIDC authentication failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        
        if (config('services.oidc.logout_endpoint')) {
            return redirect(config('services.oidc.logout_endpoint'));
        }

        return redirect('/login');
    }
} 