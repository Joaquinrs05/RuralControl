    <?php

    return [

        'paths' => ['api/*'/* , 'sanctum/csrf-cookie' */],

        'allowed_methods' => ['*'],

        'allowed_origins' => ['http://localhost:4200','https://*.trycloudflare.com',  'http://rural-control.vercel.app'],

        'allowed_origins_patterns' => [ '/https:\/\/.*\.vercel\.app$/'],

        'allowed_headers' => ['*'],

        'exposed_headers' => [],

        'max_age' => 0,

        'supports_credentials' => false,

    ];
