<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\RoleController;
use App\Models\Service;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user()->load('roles'),
        ]);
    });

    // Customer routes
    Route::prefix('customer')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', function (Request $request) {
            $user = $request->user();
            return response()->json([
                'total_applications' => $user->applications()->count(),
                'pending' => $user->applications()->where('status', 'pending')->count(),
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
            return response()->json($request->user()->applications()->with('service')->latest()->get());
        });

        Route::post('/applications', function (Request $request) {
            $request->validate([
                'service_id' => 'required|exists:services,id',
                'company_name' => 'required|string|max:255',
                'business_type' => 'nullable|string|max:100',
                'details' => 'nullable|array',
            ]);

            $application = $request->user()->applications()->create([
                'service_id' => $request->service_id,
                'company_name' => $request->company_name,
                'business_type' => $request->business_type,
                'details' => $request->details,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            return response()->json(['message' => 'Application submitted', 'application' => $application->load('service')], 201);
        });

        Route::get('/applications/{application}', function (Request $request, $id) {
            $application = $request->user()->applications()->with(['service', 'documents', 'payments'])->find($id);
            if (!$application) {
                return response()->json(['message' => 'Application not found'], 404);
            }
            return response()->json($application);
        });

        // Documents
        Route::get('/documents', function (Request $request) {
            return response()->json($request->user()->documents()->latest()->get());
        });

        // Payments
        Route::get('/payments/history', function (Request $request) {
            return response()->json($request->user()->payments()->with('application')->latest()->get());
        });
    });

    // Admin routes - require staff role
    Route::prefix('admin')->middleware('role:super_admin,admin,manager,support')->group(function () {
        // Dashboard - view_reports permission
        Route::get('/dashboard/stats', function (Request $request) {
            return response()->json([
                'total_users' => \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'customer'))->count(),
                'total_applications' => \App\Models\Application::count(),
                'pending_applications' => \App\Models\Application::where('status', 'pending')->count(),
                'total_revenue' => \App\Models\Payment::where('status', 'success')->sum('amount'),
            ]);
        })->middleware('permission:view_reports');

        // Users - require manage_users permission
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

        // Applications - require manage_applications permission
        Route::middleware('permission:view_applications')->group(function () {
            Route::get('/applications', function () {
                return response()->json(\App\Models\Application::with(['user', 'service'])->latest()->get());
            });

            Route::get('/applications/{id}', function ($id) {
                return response()->json(\App\Models\Application::with(['user', 'service', 'documents', 'payments'])->findOrFail($id));
            });
        });

        Route::middleware('permission:approve_applications')->group(function () {
            Route::post('/applications/{id}/approve', function ($id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update(['status' => 'processing']);
                return response()->json(['message' => 'Application approved', 'application' => $application]);
            });

            Route::post('/applications/{id}/complete', function ($id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update(['status' => 'completed', 'completed_at' => now()]);
                return response()->json(['message' => 'Application completed', 'application' => $application]);
            });

            Route::post('/applications/{id}/reject', function (Request $request, $id) {
                $application = \App\Models\Application::findOrFail($id);
                $application->update([
                    'status' => 'rejected',
                    'admin_notes' => $request->reason,
                ]);
                return response()->json(['message' => 'Application rejected', 'application' => $application]);
            });
        });

        // Documents - require manage_documents permission
        Route::middleware('permission:view_documents')->group(function () {
            Route::get('/documents', function () {
                return response()->json(\App\Models\Document::with('user')->latest()->get());
            });
        });

        Route::middleware('permission:verify_documents')->group(function () {
            Route::post('/documents/{id}/approve', function ($id) {
                $document = \App\Models\Document::findOrFail($id);
                $document->update(['status' => 'approved']);
                return response()->json(['message' => 'Document approved', 'document' => $document]);
            });

            Route::post('/documents/{id}/reject', function (Request $request, $id) {
                $document = \App\Models\Document::findOrFail($id);
                $document->update(['status' => 'rejected', 'rejection_reason' => $request->reason]);
                return response()->json(['message' => 'Document rejected', 'document' => $document]);
            });
        });

        // Payments - require view_payments permission
        Route::middleware('permission:view_payments')->group(function () {
            Route::get('/payments', function () {
                return response()->json(\App\Models\Payment::with(['user', 'application'])->latest()->get());
            });
        });

        // Roles & Permissions - require manage_roles permission
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
    });
});
