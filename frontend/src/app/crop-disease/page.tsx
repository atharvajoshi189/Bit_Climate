"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CropDiseasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null); // Nayi file select hone par purana result hata dein
      setError(null);
      
      // Image preview ke liye
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult("Analyzing...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Backend API ko call karein
      const res = await fetch("http://127.0.0.1:8000/predict_crop_disease", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Prediction failed. Please try again.");
      }
      // Result ko behtar format me dikhaye
      setResult(data.predicted_disease.replace(/___/g, " - ").replace(/_/g, " "));
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">🌿 Crop Disease Detector</CardTitle>
          <CardDescription>Upload a leaf image to identify the disease using AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaf-image">Upload Leaf Image</Label>
            <Input id="leaf-image" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {preview && (
            <div className="flex justify-center border rounded-lg p-2 bg-gray-50">
              <img src={preview} alt="Selected Leaf" className="max-h-60 rounded-md" />
            </div>
          )}

          <Button onClick={handlePredict} disabled={loading || !file} className="w-full">
            {loading ? "Analyzing..." : "Analyze Leaf"}
          </Button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          {result && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-center font-semibold text-lg">Prediction Result:</h3>
              <p className="text-center text-xl text-blue-600 font-bold">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
