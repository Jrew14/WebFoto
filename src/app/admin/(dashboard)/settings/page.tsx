"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Loader2, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";

export default function AdminSettingsPage() {
  const [fonnteToken, setFonnteToken] = useState("");
  const [tripayApiKey, setTripayApiKey] = useState("");
  const [tripayPrivateKey, setTripayPrivateKey] = useState("");
  const [tripayMerchantCode, setTripayMerchantCode] = useState("");
  const [tripayMode, setTripayMode] = useState("sandbox");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (response.ok) {
        setFonnteToken(data.settings?.fonnteToken || "");
        setTripayApiKey(data.settings?.tripayApiKey || "");
        setTripayPrivateKey(data.settings?.tripayPrivateKey || "");
        setTripayMerchantCode(data.settings?.tripayMerchantCode || "");
        setTripayMode(data.settings?.tripayMode || "sandbox");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fonnteToken: fonnteToken.trim(),
          tripayApiKey: tripayApiKey.trim(),
          tripayPrivateKey: tripayPrivateKey.trim(),
          tripayMerchantCode: tripayMerchantCode.trim(),
          tripayMode: tripayMode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Settings saved successfully! Please restart the server for changes to take effect.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#48CAE4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage application settings and integrations</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Tripay Payment Gateway Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-[#48CAE4]">💳</div>
              <div>
                <CardTitle>Payment Gateway (Tripay)</CardTitle>
                <CardDescription>
                  Configure Tripay API for automatic payment processing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tripay Mode */}
            <div className="space-y-2">
              <Label htmlFor="tripayMode">Environment Mode</Label>
              <select
                id="tripayMode"
                value={tripayMode}
                onChange={(e) => setTripayMode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
              <p className="text-sm text-gray-500">
                Use Sandbox for testing, Production for live transactions
              </p>
            </div>

            {/* Merchant Code */}
            <div className="space-y-2">
              <Label htmlFor="tripayMerchantCode">Merchant Code</Label>
              <Input
                id="tripayMerchantCode"
                type="text"
                value={tripayMerchantCode}
                onChange={(e) => setTripayMerchantCode(e.target.value)}
                placeholder="e.g., T46723"
                className="font-mono"
              />
              <p className="text-sm text-gray-500">
                Your merchant code from Tripay dashboard (e.g., T46723)
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="tripayApiKey">API Key</Label>
              <Input
                id="tripayApiKey"
                type="text"
                value={tripayApiKey}
                onChange={(e) => setTripayApiKey(e.target.value)}
                placeholder="Enter your Tripay API Key"
                className="font-mono"
              />
            </div>

            {/* Private Key */}
            <div className="space-y-2">
              <Label htmlFor="tripayPrivateKey">Private Key</Label>
              <Input
                id="tripayPrivateKey"
                type="password"
                value={tripayPrivateKey}
                onChange={(e) => setTripayPrivateKey(e.target.value)}
                placeholder="Enter your Tripay Private Key"
                className="font-mono"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to get Tripay Credentials:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Go to <a href="https://tripay.co.id" target="_blank" rel="noopener noreferrer" className="underline">tripay.co.id</a></li>
                <li>Login to your merchant dashboard</li>
                <li>Go to Settings → API Credentials</li>
                <li>Copy Merchant Code (e.g., T46723)</li>
                <li>Copy API Key and Private Key</li>
                <li>Paste them above and click Save</li>
              </ol>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Production Mode:</p>
                  <p>T46723 is a production merchant code. Set mode to <strong>Production</strong> to use the production API endpoint.</p>
                  <p className="mt-2">After saving, restart the dev server:</p>
                  <code className="block mt-1 bg-amber-100 px-2 py-1 rounded">bun dev</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fonnte WhatsApp Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#48CAE4]" />
              <div>
                <CardTitle>WhatsApp Notification (Fonnte)</CardTitle>
                <CardDescription>
                  Configure Fonnte API for WhatsApp notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fonnte Token */}
            <div className="space-y-2">
              <Label htmlFor="fonnteToken">Fonnte API Token</Label>
              <Input
                id="fonnteToken"
                type="text"
                value={fonnteToken}
                onChange={(e) => setFonnteToken(e.target.value)}
                placeholder="Enter your Fonnte API token"
                className="font-mono"
              />
              <p className="text-sm text-gray-500">
                Get your API token from{" "}
                <a
                  href="https://fonnte.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#48CAE4] hover:underline"
                >
                  fonnte.com
                </a>
              </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to get Fonnte Token:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Go to <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="underline">fonnte.com</a></li>
                <li>Sign up or login to your account</li>
                <li>Go to Dashboard → API</li>
                <li>Copy your API Token</li>
                <li>Paste it above and click Save</li>
              </ol>
            </div>

            {/* Features Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">WhatsApp Notifications:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✅ Manual payment invoice with transfer instructions</li>
                <li>✅ Automatic payment invoice with checkout link</li>
                <li>✅ Payment success notification (automatic)</li>
                <li>✅ Payment approved notification (manual)</li>
              </ul>
            </div>

            {/* Save Button is at the bottom after all cards */}
          </CardContent>
        </Card>

        {/* Save All Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>

        {/* Important Note */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important:</p>
                <p>
                  After saving settings, you need to restart the development server
                  or redeploy the application for the changes to take effect.
                </p>
                <p className="mt-2 font-mono text-xs bg-amber-100 p-2 rounded">
                  bun dev
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
