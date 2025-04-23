<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OIDCServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Socialite::extend('oidc', function ($app) {
            $config = $app['config']['services.oidc'];
            
            return new class($config['client_id'], $config['client_secret'], $config['redirect'], $config) extends AbstractProvider {
                protected $authEndpoint;
                protected $tokenEndpoint;
                protected $userInfoEndpoint;
                protected $scopeSeparator = ' ';

                public function __construct($clientId, $clientSecret, $redirectUrl, $config)
                {
                    parent::__construct(request(), $clientId, $clientSecret, $redirectUrl);
                    $this->authEndpoint = config('services.oidc.auth_endpoint');
                    $this->tokenEndpoint = config('services.oidc.token_endpoint');
                    $this->userInfoEndpoint = config('services.oidc.userinfo_endpoint');
                }

                /**
                 * {@inheritdoc}
                 */
                public function redirect()
                {
                    $state = Str::random(40);
                    
                    request()->session()->put('state', $state);
                    
                    return redirect($this->getAuthUrl($state));
                }

                protected function getAuthUrl($state)
                {
                    $url = $this->authEndpoint;
                    $params = $this->getCodeFields($state);
                    
                    // Log the auth URL and parameters for debugging
                    Log::info('OIDC Auth URL: ' . $url);
                    Log::info('OIDC Auth Params: ', $params);
                    
                    $query = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
                    $url = $url . '?' . $query;
                    
                    Log::info('OIDC Final URL: ' . $url);
                    
                    return $url;
                }

                protected function getTokenUrl()
                {
                    return $this->tokenEndpoint;
                }

                protected function getUserByToken($token)
                {
                    try {
                        $response = $this->getHttpClient()->get($this->userInfoEndpoint, [
                            RequestOptions::HEADERS => [
                                'Authorization' => 'Bearer '.$token,
                                'Accept' => 'application/json',
                            ],
                            RequestOptions::VERIFY => true,
                        ]);

                        return json_decode((string) $response->getBody(), true);
                    } catch (\Exception $e) {
                        Log::error('OIDC User Info Error: ' . $e->getMessage());
                        throw $e;
                    }
                }

                protected function mapUserToObject(array $user)
                {
                    return (new User)->setRaw($user)->map([
                        'id' => $user['sub'] ?? null,
                        'nickname' => $user['preferred_username'] ?? null,
                        'name' => $user['name'] ?? null,
                        'email' => $user['email'] ?? null,
                        'avatar' => $user['picture'] ?? null,
                    ]);
                }

                protected function getCodeFields($state = null)
                {
                    $state = $state ?: Str::random(40);
                    
                    return [
                        'client_id' => $this->clientId,
                        'redirect_uri' => $this->redirectUrl,
                        'response_type' => 'code',
                        'scope' => 'openid profile email',
                        'state' => $state,
                        'nonce' => Str::random(40),
                    ];
                }
            };
        });
    }
} 