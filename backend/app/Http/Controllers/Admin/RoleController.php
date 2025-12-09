<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Get all roles with permissions
    public function index()
    {
        $roles = Role::with('permissions')->withCount('users')->get();
        return response()->json($roles);
    }

    // Get single role with permissions
    public function show(Role $role)
    {
        return response()->json($role->load('permissions'));
    }

    // Create new role
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name|max:50',
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => strtolower(str_replace(' ', '_', $request->name)),
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_system' => false,
        ]);

        if ($request->permissions) {
            $role->permissions()->sync($request->permissions);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role->load('permissions'),
        ], 201);
    }

    // Update role
    public function update(Request $request, Role $role)
    {
        if ($role->is_system && $role->name !== $request->name) {
            return response()->json(['message' => 'Cannot modify system role name'], 403);
        }

        $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update($request->only(['display_name', 'description']));

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role->load('permissions'),
        ]);
    }

    // Delete role
    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Cannot delete system role'], 403);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Cannot delete role with assigned users'], 403);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }

    // Get all permissions grouped
    public function permissions()
    {
        $permissions = Permission::all()->groupBy('group');
        return response()->json($permissions);
    }

    // Assign role to user
    public function assignRoleToUser(Request $request, User $user)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        $user->assignRole($role);

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => $user->load('roles'),
        ]);
    }

    // Remove role from user
    public function removeRoleFromUser(Request $request, User $user)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        $user->removeRole($role);

        return response()->json([
            'message' => 'Role removed successfully',
            'user' => $user->load('roles'),
        ]);
    }

    // Sync all roles for a user
    public function syncUserRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $roleIds = collect($request->roles)->mapWithKeys(function ($id) {
            return [$id => ['assigned_at' => now()]];
        });
        $user->roles()->sync($roleIds);

        return response()->json([
            'message' => 'User roles updated successfully',
            'user' => $user->load('roles'),
        ]);
    }

    // Get staff users (non-customers)
    public function getStaffUsers()
    {
        $staffRoles = ['super_admin', 'admin', 'manager', 'support'];
        $users = User::whereHas('roles', function ($q) use ($staffRoles) {
            $q->whereIn('name', $staffRoles);
        })->with('roles')->get();

        return response()->json($users);
    }

    // Create staff user
    public function createStaff(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
            'status' => 'active',
        ]);

        $role = Role::findOrFail($request->role_id);
        $user->assignRole($role);

        return response()->json([
            'message' => 'Staff user created successfully',
            'user' => $user->load('roles'),
        ], 201);
    }
}
