<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')->withPivot('assigned_at');
    }

    // Role helper methods
    public function hasRole($role)
    {
        if (is_array($role)) {
            return $this->roles()->whereIn('name', $role)->exists();
        }
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasAnyRole(array $roles)
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    public function assignRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }
        $this->roles()->syncWithoutDetaching([$role->id => ['assigned_at' => now()]]);
        return $this;
    }

    public function removeRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
        }
        if ($role) {
            $this->roles()->detach($role);
        }
        return $this;
    }

    public function syncRoles(array $roles)
    {
        $roleIds = Role::whereIn('name', $roles)->pluck('id')->mapWithKeys(function ($id) {
            return [$id => ['assigned_at' => now()]];
        });
        $this->roles()->sync($roleIds);
        return $this;
    }

    // Permission helper methods
    public function hasPermission($permission)
    {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    public function hasAnyPermission(array $permissions)
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    public function getAllPermissions()
    {
        return $this->roles->flatMap->permissions->unique('id');
    }

    // Shorthand checks
    public function isSuperAdmin()
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin()
    {
        return $this->hasAnyRole(['super_admin', 'admin']);
    }

    public function isStaff()
    {
        return $this->hasAnyRole(['super_admin', 'admin', 'manager', 'support']);
    }

    public function isCustomer()
    {
        return $this->hasRole('customer');
    }

    // Get primary role (first role)
    public function getPrimaryRoleAttribute()
    {
        return $this->roles->first();
    }
}
