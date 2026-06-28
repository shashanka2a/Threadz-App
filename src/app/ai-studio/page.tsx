"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Wand2, Download } from "lucide-react";
import { toast } from "sonner";

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Design generated successfully!");
    }, 2000);
  };

  const handleUpload = () => {
    toast.info("Upload functionality coming soon!");
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">AI Studio</h1>
          <p className="text-neutral-600 text-base sm:text-lg">
            Create unique designs with AI or upload your own artwork
          </p>
        </div>

        <Tabs defaultValue="ai-generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none">
            <TabsTrigger value="ai-generate" className="rounded-none">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="upload" className="rounded-none">
              <Upload className="h-4 w-4 mr-2" />
              Upload Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-generate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-neutral-200 rounded-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif mb-4">Describe Your Design</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Tell us what you want to create. Be as detailed as possible for best
                    results.
                  </p>

                  <Textarea
                    placeholder="e.g., A minimalist mountain landscape with sunset colors, geometric style..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px] mb-4 rounded-none border-neutral-300"
                  />

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm uppercase tracking-wider mb-2 block">
                        Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {["Minimalist", "Abstract", "Vintage", "Modern", "Retro", "Geometric"].map(
                          (style) => (
                            <Button
                              key={style}
                              variant="outline"
                              size="sm"
                              className="rounded-none border-neutral-300"
                            >
                              {style}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-black text-white hover:bg-neutral-800 rounded-none"
                    >
                      {isGenerating ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Wand2 className="h-5 w-5 mr-2" />
                          Generate Design
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 rounded-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif mb-4">Preview</h3>
                  <div className="aspect-square bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                        <p className="text-sm text-neutral-600">Creating your design...</p>
                      </div>
                    ) : (
                      <p className="text-neutral-400">Your design will appear here</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full rounded-none border-neutral-300"
                      disabled
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Design
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-none border-neutral-300"
                      disabled
                    >
                      Apply to Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="border-neutral-200 rounded-none">
              <CardContent className="p-12 text-center">
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-none p-8 sm:p-16 cursor-pointer hover:border-black transition-colors"
                  onClick={handleUpload}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-xl font-serif mb-2">Upload Your Design</h3>
                  <p className="text-neutral-600 mb-4">
                    Drag and drop your image here or click to browse
                  </p>
                  <p className="text-sm text-neutral-500">Supports PNG, JPG, SVG (Max 10MB)</p>
                </div>

                <div className="mt-8 text-left bg-neutral-50 p-6 border border-neutral-200">
                  <h4 className="text-sm uppercase tracking-wider mb-3">Design Guidelines</h4>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li>• Minimum resolution: 2400 x 2400 pixels</li>
                    <li>• For best results, use vector formats (SVG, AI)</li>
                    <li>• Transparent backgrounds recommended</li>
                    <li>• CMYK color mode for accurate printing</li>
                    <li>• Ensure text is outlined or converted to paths</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-16">
          <h2 className="text-3xl font-serif mb-8 text-center">Design Inspiration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-neutral-200 hover:opacity-75 transition-opacity cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
