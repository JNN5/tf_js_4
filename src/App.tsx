import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGenerator } from "./ImageGenerator";
import "./index.css";

import logo from "./logo.svg";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
      </div>
      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-3xl font-bold">Image Super-Resolution</CardTitle>
          <CardDescription>
            Upscale images using Swin2SR models via transformers.js v4 beta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGenerator />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
