<?php

namespace App\Http\Controllers\V1\Admin\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OIDCSettingController extends Controller
{
    public function getStatus()
    {
        $oidc_enabled = !empty(config('services.oidc.client_id')) &&
                       !empty(config('services.oidc.client_secret')) &&
                       !empty(config('services.oidc.auth_endpoint'));

        \Log::info('OIDC Status Check', [
            'enabled' => $oidc_enabled,
            'config' => [
                'client_id' => !empty(config('services.oidc.client_id')),
                'client_secret' => !empty(config('services.oidc.client_secret')),
                'auth_endpoint' => !empty(config('services.oidc.auth_endpoint'))
            ]
        ]);

        return response()->json([
            'oidc_enabled' => $oidc_enabled
        ]);
    }
} 