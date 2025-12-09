<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User management
            ['name' => 'view_users', 'display_name' => 'View Users', 'group' => 'users'],
            ['name' => 'manage_users', 'display_name' => 'Manage Users', 'group' => 'users'],
            ['name' => 'suspend_users', 'display_name' => 'Suspend Users', 'group' => 'users'],

            // Application management
            ['name' => 'view_applications', 'display_name' => 'View Applications', 'group' => 'applications'],
            ['name' => 'manage_applications', 'display_name' => 'Manage Applications', 'group' => 'applications'],
            ['name' => 'approve_applications', 'display_name' => 'Approve/Reject Applications', 'group' => 'applications'],
            ['name' => 'update_progress', 'display_name' => 'Update Application Progress', 'group' => 'applications'],

            // Document management
            ['name' => 'view_documents', 'display_name' => 'View Documents', 'group' => 'documents'],
            ['name' => 'manage_documents', 'display_name' => 'Manage Documents', 'group' => 'documents'],
            ['name' => 'verify_documents', 'display_name' => 'Verify Documents', 'group' => 'documents'],

            // Payment management
            ['name' => 'view_payments', 'display_name' => 'View Payments', 'group' => 'payments'],
            ['name' => 'manage_payments', 'display_name' => 'Manage Payments', 'group' => 'payments'],
            ['name' => 'process_refunds', 'display_name' => 'Process Refunds', 'group' => 'payments'],

            // Service management
            ['name' => 'view_services', 'display_name' => 'View Services', 'group' => 'services'],
            ['name' => 'manage_services', 'display_name' => 'Manage Services', 'group' => 'services'],

            // Role management
            ['name' => 'view_roles', 'display_name' => 'View Roles', 'group' => 'roles'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles', 'group' => 'roles'],
            ['name' => 'assign_roles', 'display_name' => 'Assign Roles to Users', 'group' => 'roles'],

            // Settings
            ['name' => 'view_settings', 'display_name' => 'View Settings', 'group' => 'settings'],
            ['name' => 'manage_settings', 'display_name' => 'Manage Settings', 'group' => 'settings'],

            // Reports
            ['name' => 'view_reports', 'display_name' => 'View Reports', 'group' => 'reports'],
            ['name' => 'export_reports', 'display_name' => 'Export Reports', 'group' => 'reports'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // Create roles
        $roles = [
            [
                'name' => 'super_admin',
                'display_name' => 'Super Administrator',
                'description' => 'Full system access with all permissions',
                'is_system' => true,
                'permissions' => Permission::pluck('name')->toArray(), // All permissions
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Administrative access for day-to-day operations',
                'is_system' => true,
                'permissions' => [
                    'view_users', 'manage_users', 'suspend_users',
                    'view_applications', 'manage_applications', 'approve_applications', 'update_progress',
                    'view_documents', 'manage_documents', 'verify_documents',
                    'view_payments', 'manage_payments',
                    'view_services', 'manage_services',
                    'view_roles',
                    'view_settings', 'manage_settings',
                    'view_reports', 'export_reports',
                ],
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Manages applications and documents',
                'is_system' => true,
                'permissions' => [
                    'view_users',
                    'view_applications', 'manage_applications', 'approve_applications', 'update_progress',
                    'view_documents', 'manage_documents', 'verify_documents',
                    'view_payments',
                    'view_services',
                    'view_reports',
                ],
            ],
            [
                'name' => 'support',
                'display_name' => 'Support Staff',
                'description' => 'Customer support with limited access',
                'is_system' => true,
                'permissions' => [
                    'view_users',
                    'view_applications', 'update_progress',
                    'view_documents',
                    'view_payments',
                    'view_services',
                ],
            ],
            [
                'name' => 'customer',
                'display_name' => 'Customer',
                'description' => 'Regular customer account',
                'is_system' => true,
                'permissions' => [], // Customers don't need admin permissions
            ],
        ];

        foreach ($roles as $roleData) {
            $permissions = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::firstOrCreate(['name' => $roleData['name']], $roleData);
            
            if (!empty($permissions)) {
                $permissionIds = Permission::whereIn('name', $permissions)->pluck('id');
                $role->permissions()->sync($permissionIds);
            }
        }
    }
}
