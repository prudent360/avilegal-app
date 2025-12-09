<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Service;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // First, seed roles and permissions
        $this->call(RolePermissionSeeder::class);

        // Create super admin user
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@avilegal.com',
            'phone' => '+234 800 000 0001',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $superAdmin->assignRole('super_admin');

        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@avilegal.com',
            'phone' => '+234 800 000 0000',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $admin->assignRole('admin');

        // Create manager user
        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@avilegal.com',
            'phone' => '+234 800 000 0002',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $manager->assignRole('manager');

        // Create support user
        $support = User::create([
            'name' => 'Support Staff',
            'email' => 'support@avilegal.com',
            'phone' => '+234 800 000 0003',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $support->assignRole('support');

        // Create test customer
        $customer = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+234 800 123 4567',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $customer->assignRole('customer');

        // Create services
        $services = [
            [
                'name' => 'Company Registration',
                'slug' => 'company-registration',
                'description' => 'Register your Private Limited Company (Ltd) with the Corporate Affairs Commission (CAC). Includes name reservation, statutory documents, and CAC certificate.',
                'price' => 85000,
                'duration' => '7 days',
            ],
            [
                'name' => 'Business Name Registration',
                'slug' => 'business-name',
                'description' => 'Register your business name with CAC. Perfect for sole proprietors and small businesses.',
                'price' => 25000,
                'duration' => '3 days',
            ],
            [
                'name' => 'Trademark Registration',
                'slug' => 'trademark',
                'description' => 'Protect your brand with trademark registration. Includes trademark search, application, and certificate.',
                'price' => 150000,
                'duration' => '14 days',
            ],
            [
                'name' => 'SCUML Registration',
                'slug' => 'scuml',
                'description' => 'Special Control Unit against Money Laundering registration for designated non-financial businesses and professions.',
                'price' => 45000,
                'duration' => '5 days',
            ],
            [
                'name' => 'CAC Annual Returns',
                'slug' => 'annual-returns',
                'description' => 'File your annual returns with CAC to maintain your company\'s good standing.',
                'price' => 35000,
                'duration' => '5 days',
            ],
            [
                'name' => 'Company Name Change',
                'slug' => 'name-change',
                'description' => 'Change your registered company name with CAC.',
                'price' => 60000,
                'duration' => '10 days',
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
