import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { pipeline, env, RawImage } from "@huggingface/transformers";

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  scale: string;
}

// ACTUAL WORKING MODELS for transformers.js image-to-image pipeline
// These are super-resolution models, NOT generative AI
const MODELS: ModelConfig[] = [
  {
    id: "Xenova/swin2SR-classical-sr-x2-64",
    name: "Super-Resolution 2x",
    description: "Double image resolution (classical images)",
    scale: "2x"
  },
  {
    id: "Xenova/swin2SR-classical-sr-x4-64",
    name: "Super-Resolution 4x",
    description: "Quadruple image resolution (classical images)",
    scale: "4x"
  },
  {
    id: "Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr",
    name: "Real-World 4x Upscale",
    description: "Enhance real-world photos (4x)",
    scale: "4x"
  },
  {
    id: "Xenova/swin2SR-compressed-sr-x4-48",
    name: "Compressed Image Enhancer",
    description: "Restore compressed/JPEG images (4x)",
    scale: "4x"
  },
  {
    id: "Xenova/4x_APISR_GRL_GAN_generator-onnx",
    name: "Anime/Image Upscaler",
    description: "GAN-based 4x upscaling for anime/illustrations",
    scale: "4x"
  }
];

export function ImageGenerator() {
  const [model, setModel] = useState<ModelConfig>(MODELS[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [modelLoadStatus, setModelLoadStatus] = useState("");
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{width: number, height: number} | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  
  const pipelineRef = useRef<any>(null);

  useEffect(() => {
    initializePipeline();
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pipelineRef.current) {
      pipelineRef.current = null;
    }
    initializePipeline();
  }, [model.id]);

  const initializePipeline = async () => {
    setIsModelLoading(true);
    setModelLoadProgress(0);
    setModelLoadStatus("Checking cache...");
    setErrorMessage("");
    
    try {
      console.log(`Initializing image-to-image pipeline for ${model.name}`);
      
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      
      const progressCallback = (progressInfo: any) => {
        console.log('Progress:', progressInfo);
        if (progressInfo.status === 'download') {
          setModelLoadStatus(`Downloading ${progressInfo.file || 'model files'}...`);
          if (progressInfo.progress !== undefined) {
            setModelLoadProgress(Math.round(progressInfo.progress * 100));
          } else if (progressInfo.loaded && progressInfo.total) {
            const percent = (progressInfo.loaded / progressInfo.total) * 100;
            setModelLoadProgress(Math.round(percent));
          }
        } else if (progressInfo.status === 'done') {
          setModelLoadStatus("Model ready!");
          setModelLoadProgress(100);
        } else if (progressInfo.status === 'initiate') {
          setModelLoadStatus(`Loading ${progressInfo.file}...`);
        }
      };
      
      pipelineRef.current = await pipeline(
        'image-to-image',
        model.id,
        {
          device: "webgpu",
          dtype: 'fp32',  // Full precision for best quality
          progress_callback: progressCallback
        }
      );
      
      console.log(`Pipeline initialized for ${model.name}`);
      setModelLoadStatus("Model loaded from cache");
      
    } catch (error) {
      console.error("Error initializing pipeline:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Failed to load model: ${errorMsg}`);
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({width: img.width, height: img.height});
      };
      img.src = URL.createObjectURL(file);
      
      setImageFile(file);
      objectUrlRef.current = URL.createObjectURL(file);
      setOutputImage(null);
      setOutputDimensions(null);
      setErrorMessage("");
    }
  };

  const handleProcess = async () => {
    if (!imageFile) {
      setErrorMessage("Please select an image.");
      return;
    }

    if (!pipelineRef.current) {
      setErrorMessage("Model is still loading. Please wait.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setErrorMessage("");
    setProcessingTime("");

    try {
      const startTime = performance.now();

      // Process the image
      const imageUrl = objectUrlRef.current!;
      
      // Call the pipeline - it returns a RawImage
      const output: RawImage = await pipelineRef.current(imageUrl);

      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      setProcessingTime(`${timeTaken}s`);

      // Convert RawImage to displayable URL
      // RawImage has: data (Uint8Array), width, height, channels
      const blob = await rawImageToBlob(output);
      const objectUrl = URL.createObjectURL(blob);
      
      setOutputImage(objectUrl);
      setOutputDimensions({width: output.width, height: output.height});
      setLoading(false);
      setProgress(100);

    } catch (error) {
      console.error("Processing error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Processing failed: ${errorMsg}`);
      setLoading(false);
      setProgress(0);
    }
  };

  const rawImageToBlob = async (rawImage: RawImage): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = rawImage.width;
        canvas.height = rawImage.height;
        const ctx = canvas.getContext('2d')!;
        
        // Create ImageData from RawImage
        const imageData = new ImageData(
          new Uint8ClampedArray(rawImage.data),
          rawImage.width,
          rawImage.height
        );
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        reject(error);
      }
    });
  };

  const resetAll = () => {
    setImageFile(null);
    setOutputImage(null);
    setOriginalDimensions(null);
    setOutputDimensions(null);
    setLoading(false);
    setProgress(0);
    setProcessingTime("");
    setErrorMessage("");
    
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const downloadImage = () => {
    if (!outputImage) return;
    
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `upscaled-${model.scale}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Image Super-Resolution</h1>
        <p className="text-slate-600">
          Upscale and enhance images using AI (Swin2SR models)
        </p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> The transformers.js image-to-image pipeline supports 
          <strong> super-resolution</strong> (upscaling) using Swin2SR models. 
          This enhances existing images but does NOT generate new images like Stable Diffusion or FLUX.
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model" className="block text-sm font-medium text-slate-900">
          Upscaling Model
        </Label>
        <Select value={model.id} onValueChange={(id) => setModel(MODELS.find(m => m.id === id)!)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent align="start">
            {MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Loading Status */}
      {isModelLoading && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-800">
              <span>{modelLoadStatus}</span>
              {modelLoadProgress > 0 && <span>{modelLoadProgress}%</span>}
            </div>
            {modelLoadProgress > 0 && (
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${modelLoadProgress}%` }}
                />
              </div>
            )}
            <p className="text-xs text-blue-600">
              First-time download may take 1-2 minutes. Models are cached for future use.
            </p>
          </div>
        </div>
      )}

      {!isModelLoading && modelLoadStatus === "Model loaded from cache" && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
          ✓ {model.name} ready (cached)
        </div>
      )}

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="image-upload" className="block text-sm font-medium text-slate-900">
          Input Image *
        </Label>
        <div className="flex gap-2">
          <input
            ref={imageInputRef}
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
          >
            {imageFile ? "Change Image" : "Select Image"}
          </Button>
          {imageFile && (
            <Button
              variant="destructive"
              onClick={resetAll}
              disabled={loading}
            >
              Remove
            </Button>
          )}
        </div>
        {imageFile && objectUrlRef.current && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg">
            <img
              src={objectUrlRef.current}
              alt="Input preview"
              className="w-full max-w-[300px] h-auto object-contain rounded"
            />
            {originalDimensions && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Original: {originalDimensions.width} × {originalDimensions.height} px
              </p>
            )}
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleProcess}
          disabled={!imageFile || loading || isModelLoading || !pipelineRef.current}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Upscaling... {progress}%
            </span>
          ) : (
            `Upscale with ${model.name}`
          )}
        </Button>
        
        {processingTime && !loading && (
          <div className="text-sm text-slate-500 text-center">
            Upscaling completed in {processingTime}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Output Image */}
      {outputImage && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Upscaled Result</h3>
          <div className="relative inline-block">
            <img
              src={outputImage}
              alt="Upscaled"
              className="w-full max-w-[600px] h-auto object-contain rounded-lg shadow-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={downloadImage}
              >
                Download
              </Button>
            </div>
          </div>
          {outputDimensions && (
            <p className="text-sm text-slate-600 text-center">
              Output: {outputDimensions.width} × {outputDimensions.height} px ({model.scale})
            </p>
          )}
        </div>
      )}
    </div>
  );
}