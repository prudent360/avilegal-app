<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'welcome',
                'name' => 'Welcome Email',
                'subject' => 'Welcome to {{company_name}}!',
                'body' => "# Welcome to {{company_name}}!\n\nDear {{user_name}},\n\nThank you for creating an account with us. We're excited to help you with your business registration and incorporation needs.\n\nWith {{company_name}}, you can:\n- Register your business with CAC\n- Get your business name reserved\n- Obtain tax clearance and other documents\n- Track your application progress in real-time\n\n[Go to Dashboard]({{dashboard_url}})\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\n**{{company_name}} Team**\n\n📧 {{company_email}}\n📞 {{company_phone}}",
                'description' => 'Sent to users when they register an account',
                'variables' => ['user_name', 'company_name', 'company_email', 'company_phone', 'dashboard_url'],
            ],
            [
                'slug' => 'payment_confirmation',
                'name' => 'Payment Confirmation',
                'subject' => 'Payment Confirmed - {{company_name}}',
                'body' => "# Payment Confirmed ✓\n\nDear {{user_name}},\n\nYour payment has been successfully processed.\n\n| Detail | Information |\n|:-------|:------------|\n| Amount | ₦{{amount}} |\n| Reference | {{reference}} |\n| Gateway | {{gateway}} |\n| Date | {{paid_at}} |\n\n**Application Details:**\n- **Service:** {{service_name}}\n- **Company Name:** {{business_name}}\n\nYour application has been submitted and is now being processed.\n\n[View Application]({{dashboard_url}})\n\nThank you for choosing {{company_name}}.\n\nBest regards,\n**{{company_name}} Team**",
                'description' => 'Sent after a successful payment',
                'variables' => ['user_name', 'amount', 'reference', 'gateway', 'paid_at', 'service_name', 'business_name', 'company_name', 'dashboard_url'],
            ],
            [
                'slug' => 'application_status',
                'name' => 'Application Status Update',
                'subject' => 'Application Update - {{business_name}}',
                'body' => "# Application Update\n\nDear {{user_name}},\n\nWe have an update on your application for **{{business_name}}**.\n\n**Current Status:** {{status}}\n\n{{milestone_info}}\n\n{{status_message}}\n\n[View Application]({{dashboard_url}})\n\nIf you have any questions about your application, please don't hesitate to contact us.\n\nBest regards,\n**{{company_name}} Team**",
                'description' => 'Sent when application status or milestone changes',
                'variables' => ['user_name', 'business_name', 'status', 'milestone_info', 'status_message', 'company_name', 'dashboard_url'],
            ],
            [
                'slug' => 'registration_complete',
                'name' => 'Registration Complete',
                'subject' => '🎉 Registration Complete - {{business_name}}',
                'body' => "# 🎉 Congratulations!\n\nDear {{user_name}},\n\nWe are thrilled to inform you that your **{{service_name}}** registration is now **complete**!\n\n**{{business_name}}** has been successfully registered with the Corporate Affairs Commission (CAC).\n\n**Completion Date:** {{completed_at}}\n\n## What's Next?\n\nYou can now:\n- Download your certificate from your dashboard\n- Use your RC number for official purposes\n- Open a corporate bank account\n- Apply for business permits and licenses\n\n[View Certificate]({{dashboard_url}})\n\nThank you for choosing {{company_name}} for your business registration needs. We wish you the best of success!\n\nBest regards,\n**{{company_name}} Team**",
                'description' => 'Sent when CAC registration is complete',
                'variables' => ['user_name', 'business_name', 'service_name', 'completed_at', 'company_name', 'dashboard_url'],
            ],
            [
                'slug' => 'document_approved',
                'name' => 'Document Approved',
                'subject' => 'Document Approved ✓ - {{document_name}}',
                'body' => "# Document Approved ✓\n\nDear {{user_name}},\n\nYour document **{{document_name}}** has been reviewed and **approved**.\n\nNo further action is required for this document.\n\n[View Documents]({{dashboard_url}})\n\nBest regards,\n**{{company_name}} Team**",
                'description' => 'Sent when a document is approved',
                'variables' => ['user_name', 'document_name', 'company_name', 'dashboard_url'],
            ],
            [
                'slug' => 'document_rejected',
                'name' => 'Document Rejected',
                'subject' => 'Document Needs Attention - {{document_name}}',
                'body' => "# Document Needs Attention\n\nDear {{user_name}},\n\nYour document **{{document_name}}** has been reviewed and requires your attention.\n\n**Reason:** {{rejection_reason}}\n\nPlease log in to your account and upload a new document that addresses the above concern.\n\n[Upload New Document]({{dashboard_url}})\n\nIf you have any questions, please contact our support team.\n\nBest regards,\n**{{company_name}} Team**",
                'description' => 'Sent when a document is rejected',
                'variables' => ['user_name', 'document_name', 'rejection_reason', 'company_name', 'dashboard_url'],
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::firstOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
