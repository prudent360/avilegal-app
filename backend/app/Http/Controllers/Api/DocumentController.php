<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Get document types
     */
    public function types()
    {
        return response()->json([
            ['id' => 'passport', 'name' => 'International Passport', 'description' => 'Valid international passport'],
            ['id' => 'nin', 'name' => 'NIN Slip/Card', 'description' => 'National Identification Number'],
            ['id' => 'photo', 'name' => 'Passport Photograph', 'description' => 'Recent passport photograph'],
            ['id' => 'signature', 'name' => 'Signature', 'description' => 'Your signature (upload or draw)'],
        ]);
    }

    /**
     * Get user's documents
     */
    public function index(Request $request)
    {
        $documents = $request->user()
            ->documents()
            ->latest()
            ->get();

        return response()->json($documents);
    }

    /**
     * Upload a document
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            'type' => 'required|in:passport,nin,photo,signature',
            'application_id' => 'nullable|exists:applications,id',
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('documents/' . $request->user()->id, $filename, 'public');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'application_id' => $request->application_id,
            'name' => $this->getDocumentName($request->type),
            'type' => $request->type,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document,
        ], 201);
    }

    /**
     * Upload signature (base64 image from canvas)
     */
    public function uploadSignature(Request $request)
    {
        $request->validate([
            'signature' => 'required|string', // Base64 image data
            'application_id' => 'nullable|exists:applications,id',
        ]);

        // Decode base64 image
        $imageData = $request->signature;
        if (strpos($imageData, 'base64,') !== false) {
            $imageData = explode('base64,', $imageData)[1];
        }
        $imageData = base64_decode($imageData);

        $filename = Str::uuid() . '.png';
        $path = 'documents/' . $request->user()->id . '/' . $filename;
        Storage::disk('public')->put($path, $imageData);

        $document = Document::create([
            'user_id' => $request->user()->id,
            'application_id' => $request->application_id,
            'name' => 'Signature',
            'type' => 'signature',
            'file_path' => $path,
            'file_name' => 'signature.png',
            'file_size' => strlen($imageData),
            'mime_type' => 'image/png',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Signature saved successfully',
            'document' => $document,
        ], 201);
    }

    /**
     * Delete a document
     */
    public function destroy(Request $request, $id)
    {
        $document = $request->user()->documents()->findOrFail($id);
        
        if ($document->status === 'approved') {
            return response()->json(['message' => 'Cannot delete approved document'], 400);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    /**
     * Admin: Approve document
     */
    public function approve($id)
    {
        $document = Document::findOrFail($id);
        $document->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Document approved',
            'document' => $document,
        ]);
    }

    /**
     * Admin: Reject document
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $document = Document::findOrFail($id);
        $document->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Document rejected',
            'document' => $document,
        ]);
    }

    private function getDocumentName($type): string
    {
        return match($type) {
            'passport' => 'International Passport',
            'nin' => 'NIN Slip/Card',
            'photo' => 'Passport Photograph',
            'signature' => 'Signature',
            default => 'Document',
        };
    }
}
