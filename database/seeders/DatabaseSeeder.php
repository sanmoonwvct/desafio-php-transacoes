<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = tenant('id');
        $codigo = substr($tenantId, 0, 4);

        User::create([
            'name' => 'Admin ' . $codigo,
            'email' => 'admin-' . $codigo . '@teste.com',
            'password' => bcrypt('password'),
        ]);
    }
}