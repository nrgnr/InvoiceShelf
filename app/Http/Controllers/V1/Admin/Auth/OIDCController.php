<?php

namespace App\Http\Controllers\V1\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Exception;

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
                $newUser = User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
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
            Log::error('OIDC Callback Error: ' . $e->getMessage());
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