<?php

return [

    'paths' => ['api/*', 'register', 'login', 'auth/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:4200','http://92.112.127.238','https://rural-control.vercel.app', ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
