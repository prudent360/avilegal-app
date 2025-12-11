<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\DocumentController;
use Illuminate\Support\Facades\Hash;
use App\Models\Service;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Forgot Password (simple implementation - just returns success for now)
Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    
    $user = \App\Models\User::where('email', $request->email)->first();
    if ($user) {
        // Generate a simple token and store it
        $token = \Illuminate\Support\Str::random(60);
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );
        
        // In production, you would send this via email
        // For now, we just return success
    }
    
    // Always return success to prevent email enumeration
    return response()->json([
        'message' => 'If an account exists with this email, you will receive a password reset link.'
    ]);
});

// Get services (public)
Route::get('/services', function () {
    return response()->json(Service::where('is_active', true)->get());
});

Route::get('/services/{slug}', function ($slug) {
    $service = Service::where('slug', $slug)->where('is_active', true)->first();
    if (!$service) {
        return response()->json(['message' => 'Service not found'], 404);
    }
    return response()->json($service);
});

// Public logos endpoint
Route::get('/logos', function () {
    $logos = \App\Models\Setting::whereIn('key', ['header_logo', 'footer_logo', 'dashboard_logo'])
        ->pluck('value', 'key');
    return response()->json([
        'header_logo' => $logos['header_logo'] ?? null,
        'footer_logo' => $logos['footer_logo'] ?? null,
        'dashboard_logo' => $logos['dashboard_logo'] ?? null,
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user()->load('roles'),
        ]);
    });

    // Profile Update
    Route::put('/user/profile', function (Request $request) {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'phone' => 'sometimes|nullable|string|max:20',
        ]);
        
        $request->user()->update($request->only(['name', 'email', 'phone']));
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $request->user()->fresh()->load('roles'),
        ]);
    });

    // Password Update
    Route::put('/user/password', function (Request $request) {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);
        
        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }
        
        $request->user()->update(['password' => Hash::make($request->new_password)]);
        
        return response()->json(['message' => 'Password updated successfully']);
    });

    // Customer routes
    Route::prefix('customer')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', function (Request $request) {
            $user = $request->user();
            return response()->json([
                'total_applications' => $user->applications()->count(),
                'pending' => $user->applications()->whereIn('status', ['pending', 'pending_payment'])->count(),
                'processing' => $user->applications()->where('status', 'processing')->count(),
                'completed' => $user->applications()->where('status', 'completed')->count(),
            ]);
        });

        // Profile
        Route::get('/profile', function (Request $request) {
            return response()->json($request->user()->load('roles'));
        });

        Route::put('/profile', function (Request $request) {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
            ]);
            $request->user()->update($request->only(['name', 'phone']));
            return response()->json(['message' => 'Profile updated', 'user' => $request->user()]);
        });

        // Applications
        Route::get('/applications', function (Request $request) {
            return response()->json($request->user()->applications()->with(['service', 'milestones'])->latest()->get());
        });

        Route::get('/applications/{id}', function (Request $request, $id) {
            $application = $request->user()->applications()->with(['service', 'documents', 'payments', 'milestones'])->find($id);
            if (!$application) {
                return response()->json(['message' => 'Application not found'], 404);
            }
            return response()->json($application);
        });

        // Update unsubmitted application
        Route::put('/applications/{id}', function (Request $request, $id) {
            $application = $request->user()->applications()->find($id);
            if (!$application) {
                return response()->json(['message' => 'Application not found'], 404);
            }
            if ($application->status !== 'pending_payment') {
                return response()->json(['message' => 'Cannot edit submitted applications'], 400);
            }
            $request->validate([
                'company_name' => 'sometimes|string|max:255',
                'business_type' => 'sometimes|string|max:100',
                'details' => 'sometimes|array',
            ]);
            $application->update($request->only(['company_name', 'business_type', 'details']));
            return response()->json(['message' => 'Application updated', 'application' => $application]);
        });

        // Delete unsubmitted application
        Route::delete('/applications/{id}', function (Request $request, $id) {
            $application = $request->user()->applications()->find($id);
            if (!$application) {
                return response()->json(['message' => 'Application not found'], 404);
            }
            if ($application->status !== 'pending_payment') {
                return response()->json(['message' => 'Cannot delete submitted applications'], 400);
            }
            // Delete related pending payments
            $application->payments()->where('status', 'pending')->delete();
            $application->delete();
            return response()->json(['message' => 'Application deleted']);
        });

        // Payments
        Route::get('/payments/config', [PaymentController::class, 'getConfig']);
        Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
        Route::post('/payments/verify', [PaymentController::class, 'verify']);
        Route::get('/payments/history', [PaymentController::class, 'history']);

        // Documents
        Route::get('/documents/types', [DocumentController::class, 'types']);
        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents/upload', [DocumentController::class, 'upload']);
        Route::post('/documents/signature', [DocumentController::class, 'uploadSignature']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    });

    // Admin routes - require staff role
    Route::prefix('admin')->middleware('role:super_admin,admin,manager,support')->group(function () {
        // Dashboard - view_reports permission
        Route::get('/dashboard/stats', function () {
            return response()->json([
                'total_users' => \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'customer'))->count(),
                'total_applications' => \App\Models\Application::count(),
                'pending_applications' => \App\Models\Application::where('status', 'pending')->count(),
                'total_revenue' => \App\Models\Payment::where('status', 'success')->sum('amount'),
            ]);
        })->middleware('permission:view_reports');

        // Users
        Route::middleware('permission:view_users')->group(function () {
            Route::get('/users', function () {
                return response()->json(\App\Models\User::with('roles')->latest()->get());
            });
            Route::get('/users/{user}', function (\App\Models\User $user) {
                return response()->json($user->load('roles'));
            });
        });

        Route::middleware('permission:manage_users')->group(function () {
            Route::patch('/users/{user}/status', function (Request $request, \App\Models\User $user) {
                $request->validate(['status' => 'required|in:active,suspended']);
                $user->update(['status' => $request->status]);
                return response()->json(['message' => 'User status updated', 'user' => $user]);
            });
        });

        Route::middleware('permission:delete_users')->group(function () {
            Route::delete('/users/{user}', function (\App\Models\User $user) {
                // Prevent deleting super admins
                if ($user->hasRole('super_admin')) {
                    return response()->json(['message' => 'Cannot delete super admin'], 403);
                }
                // Delete user's data
                $user->applications()->delete();
                $user->documents()->delete();
                $user->payments()->delete();
                $user->delete();
                return response()->json(['message' => 'User deleted successfully']);
            });
        });

        // Applications
        Route::middleware('permission:view_applications')->group(function () {
            Route::get('/applications', function () {
                return response()->json(\App\Models\Application::with(['user', 'service', 'milestones'])->latest()->get());
            });
            Route::get('/applications/{id}', function ($id) {
                return response()->json(\App\Models\Application::with(['user', 'service', 'documents', 'payments', 'milestones'])->findOrFail($id));
            });
        });

        Route::middleware('permission:approve_applications')->group(function () {
            Route::post('/applications/{id}/approve', function ($id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update(['status' => 'processing']);
                // Update milestone
                $milestone = $application->milestones()->where('order', 2)->first();
                if ($milestone) $milestone->markInProgress();
                return response()->json(['message' => 'Application approved', 'application' => $application->load('milestones')]);
            });

            Route::post('/applications/{id}/update-milestone', function (Request $request, $id) {
                $request->validate(['milestone_id' => 'required|exists:milestones,id']);
                $application = \App\Models\Application::findOrFail($id);
                $milestone = $application->milestones()->findOrFail($request->milestone_id);
                $milestone->markComplete();
                // Mark next milestone in progress
                $next = $application->milestones()->where('order', '>', $milestone->order)->first();
                if ($next) $next->markInProgress();
                return response()->json(['message' => 'Milestone updated', 'application' => $application->load('milestones')]);
            });

            Route::post('/applications/{id}/complete', function ($id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update(['status' => 'completed', 'completed_at' => now()]);
                $application->milestones()->update(['status' => 'completed', 'completed_at' => now()]);
                return response()->json(['message' => 'Application completed', 'application' => $application]);
            });

            Route::post('/applications/{id}/reject', function (Request $request, $id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update(['status' => 'rejected', 'admin_notes' => $request->reason]);
                return response()->json(['message' => 'Application rejected', 'application' => $application]);
            });

            // Admin upload documents for customer (CAC Certificate, TIN, Status Report, etc.)
            Route::post('/applications/{id}/documents', function (Request $request, $id) {
                $request->validate([
                    'file' => 'required|file|max:10240',
                    'type' => 'required|string|max:100',
                    'name' => 'sometimes|string|max:255',
                ]);

                $application = \App\Models\Application::findOrFail($id);
                $file = $request->file('file');
                $path = $file->store('admin-documents', 'public');

                $document = $application->documents()->create([
                    'user_id' => $application->user_id,
                    'name' => $request->name ?? $request->type,
                    'type' => $request->type,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'url' => '/storage/' . $path,
                    'status' => 'approved',
                    'uploaded_by_admin' => true,
                ]);

                return response()->json([
                    'message' => 'Document uploaded successfully',
                    'document' => $document
                ]);
            });
        });

        // Documents
        Route::middleware('permission:view_documents')->group(function () {
            Route::get('/documents', function () {
                return response()->json(\App\Models\Document::with('user')->latest()->get());
            });
        });

        Route::middleware('permission:verify_documents')->group(function () {
            Route::post('/documents/{id}/approve', [DocumentController::class, 'approve']);
            Route::post('/documents/{id}/reject', [DocumentController::class, 'reject']);
        });

        // Payments
        Route::middleware('permission:view_payments')->group(function () {
            Route::get('/payments', function () {
                return response()->json(\App\Models\Payment::with(['user', 'application.service'])->latest()->get());
            });
        });

        // Roles & Permissions
        Route::middleware('permission:view_roles')->group(function () {
            Route::get('/roles', [RoleController::class, 'index']);
            Route::get('/roles/{role}', [RoleController::class, 'show']);
            Route::get('/permissions', [RoleController::class, 'permissions']);
            Route::get('/staff', [RoleController::class, 'getStaffUsers']);
        });

        Route::middleware('permission:manage_roles')->group(function () {
            Route::post('/roles', [RoleController::class, 'store']);
            Route::put('/roles/{role}', [RoleController::class, 'update']);
            Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
        });

        Route::middleware('permission:assign_roles')->group(function () {
            Route::post('/users/{user}/roles', [RoleController::class, 'syncUserRoles']);
            Route::post('/staff', [RoleController::class, 'createStaff']);
        });

        // Services Management
        Route::middleware('permission:manage_settings')->group(function () {
            Route::get('/services', function () {
                return response()->json(Service::all());
            });
            Route::get('/services/{id}', function ($id) {
                return response()->json(Service::findOrFail($id));
            });
            Route::post('/services', function (Request $request) {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'price' => 'required|numeric|min:0',
                    'slug' => 'sometimes|string|max:100',
                    'description' => 'nullable|string',
                    'processing_time' => 'nullable|string',
                    'is_active' => 'boolean',
                ]);
                $data = $request->all();
                if (!isset($data['slug']) || !$data['slug']) {
                    $data['slug'] = \Illuminate\Support\Str::slug($request->name);
                }
                return response()->json(Service::create($data), 201);
            });
            Route::put('/services/{id}', function (Request $request, $id) {
                $service = Service::findOrFail($id);
                $request->validate([
                    'name' => 'sometimes|string|max:255',
                    'price' => 'sometimes|numeric|min:0',
                    'slug' => 'sometimes|string|max:100',
                    'description' => 'nullable|string',
                    'processing_time' => 'nullable|string',
                    'is_active' => 'boolean',
                ]);
                $service->update($request->all());
                return response()->json($service);
            });
            Route::delete('/services/{id}', function ($id) {
                Service::findOrFail($id)->delete();
                return response()->json(['message' => 'Service deleted']);
            });
        });

        // Settings - require manage_settings permission (super_admin only)
        Route::middleware('permission:manage_settings')->group(function () {
            Route::get('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'index']);
            Route::put('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'update']);
            Route::post('/settings/test-email', [\App\Http\Controllers\Api\SettingsController::class, 'testEmail']);
            
            // Logo upload
            Route::post('/settings/logo', function (Request $request) {
                $request->validate([
                    'logo' => 'required|image|max:2048',
                    'type' => 'required|in:header,footer,dashboard'
                ]);
                
                $type = $request->type;
                $key = $type . '_logo';
                
                // Delete old logo if exists
                $oldSetting = \App\Models\Setting::where('key', $key)->first();
                if ($oldSetting && $oldSetting->value) {
                    $oldPath = str_replace('/storage/', '', $oldSetting->value);
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                }
                
                $file = $request->file('logo');
                $path = $file->store('logos', 'public');
                
                // Save logo path to settings
                $setting = \App\Models\Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => '/storage/' . $path]
                );
                
                return response()->json([
                    'message' => ucfirst($type) . ' logo uploaded successfully',
                    'logo_url' => '/storage/' . $path,
                    'type' => $type
                ]);
            });
            
            Route::delete('/settings/logo/{type}', function ($type) {
                if (!in_array($type, ['header', 'footer', 'dashboard'])) {
                    return response()->json(['message' => 'Invalid logo type'], 422);
                }
                
                $key = $type . '_logo';
                $setting = \App\Models\Setting::where('key', $key)->first();
                if ($setting && $setting->value) {
                    // Delete old file
                    $path = str_replace('/storage/', '', $setting->value);
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
                    $setting->delete();
                }
                return response()->json(['message' => ucfirst($type) . ' logo removed']);
            });

            // Email Templates
            Route::get('/email-templates', [\App\Http\Controllers\Api\EmailTemplateController::class, 'index']);
            Route::get('/email-templates/{id}', [\App\Http\Controllers\Api\EmailTemplateController::class, 'show']);
            Route::put('/email-templates/{id}', [\App\Http\Controllers\Api\EmailTemplateController::class, 'update']);
            Route::post('/email-templates/{id}/reset', [\App\Http\Controllers\Api\EmailTemplateController::class, 'reset']);
            Route::post('/email-templates/{id}/test', [\App\Http\Controllers\Api\EmailTemplateController::class, 'test']);
        });
    });
});
