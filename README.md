# Browser AI Image Generator

A browser-based image-to-image generation application using transformers.js v4 beta with Qwen-Image and FLUX.2 models.

## Features

- **Client-side Inference**: All AI processing happens directly in the browser
- **Multiple Models**: Qwen-Image (fast, excellent text rendering) and FLUX.2-dev (high quality)
- **Image-to-Image Generation**: Transform existing images using text prompts
- **Progressive Enhancement**: WebGPU acceleration with WASM fallback
- **GitHub Pages Ready**: Static hosting compatible

## Technology Stack

- **Bun**: Runtime and package manager
- **React 19**: Frontend framework
- **Tailwind CSS**: Styling
- **transformers.js v4.0.0-next.2**: AI model inference
- **WebGPU**: GPU acceleration (Chrome/Safari)
- **WebAssembly**: CPU fallback

## Models Supported

### Qwen-Image
- **Type**: 7B parameter model
- **Strengths**: Excellent text rendering, fast generation
- **Best for**: Text-heavy images, precise editing
- **Size**: ~2GB (4-bit quantized)
- **Speed**: 15-30 seconds per generation

### FLUX.2-dev
- **Type**: 32B parameter model
- **Strengths**: Superior image quality, photorealistic
- **Best for**: High-end creative work, complex scenes
- **Size**: ~8GB (4-bit quantized)
- **Speed**: 30-60 seconds per generation

## Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Usage

1. **Select Model**: Choose between Qwen-Image and FLUX.2-dev
2. **Upload Image**: Select an image to transform
3. **Enter Prompt**: Describe what you want to generate
4. **Generate**: Click "Generate Image" to start processing
5. **Download**: Save the generated image

## Browser Requirements

### Recommended:
- **Chrome 113+** (WebGPU support)
- **Safari 17+** (WebGPU support)

### Fallbacks:
- **WebGL**: For browsers without WebGPU
- **WASM**: CPU-only execution

## Performance Considerations

- **Memory Usage**: Models require significant RAM (4-8GB)
- **Generation Time**: Varies by model and hardware
- **Browser Limits**: Some browsers limit memory usage

## Development

### Project Structure
```
src/
├── components/
│   └── ui/          # Reusable UI components
├── ImageGenerator.tsx  # Main application component
├── App.tsx            # Root component
├── frontend.tsx       # React entry point
├── loader.ts          # WebGPU detection and setup
└── index.html         # HTML template
```

### Key Components
- **ImageGenerator**: Main application logic
- **Model Selection**: Choose between AI models
- **Image Processing**: Upload, preprocess, and postprocess
- **Progress Tracking**: Real-time generation status

## Deployment

### GitHub Pages
1. Build the application: `bun run build`
2. Deploy to GitHub Pages using GitHub Actions
3. Ensure proper routing configuration

### Static Hosting
- Compatible with any static hosting service
- No server-side dependencies required
- CDN-friendly asset structure

## Troubleshooting

### Common Issues

1. **Model Not Loading**: Check browser console for errors
2. **Slow Performance**: Ensure WebGPU is enabled
3. **Memory Issues**: Close other browser tabs
4. **Generation Fails**: Check image size and prompt format

### Debug Mode
Enable browser console logging to see detailed error messages and performance metrics.

## License

This project uses open-source models and libraries. Please review individual model licenses for commercial use restrictions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Acknowledgments

- **Hugging Face**: transformers.js library
- **Black Forest Labs**: FLUX.2 model
- **Alibaba**: Qwen-Image model
- **Bun**: Runtime and tooling
