import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Link, MagicWand, X, CaretDown as ChevronDown, Image as ImageIcon } from "@phosphor-icons/react";
import { ProductDetails } from '../types';
import React from 'react';
import Image from 'next/image';

interface ProductSectionProps {
  product: ProductDetails | undefined;
  onChange: (product: ProductDetails) => void;
  onGenerateDescription: () => Promise<string>;
  onGenerateImage?: (platform: string, style: string) => Promise<string>;
}

export default function ProductSection({ 
  product, 
  onChange, 
  onGenerateDescription,
  onGenerateImage 
}: ProductSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Expanded by default
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');

  const focusPointOptions = [
    { id: 'quality', label: 'Quality' },
    { id: 'value', label: 'Value' },
    { id: 'innovation', label: 'Innovation' },
    { id: 'reliability', label: 'Reliability' },
    { id: 'sustainability', label: 'Sustainability' },
  ] as const;

  const presentationStyles = [
    { id: 'benefits', label: 'Benefits-focused' },
    { id: 'features', label: 'Feature-focused' },
    { id: 'story', label: 'Story-telling' },
    { id: 'technical', label: 'Technical Details' },
  ] as const;

  const handleInputChange = (field: keyof ProductDetails, value: any) => {
    onChange({
      ...product || {
        name: '',
        presentationStyle: 'benefits',
        highlightPrice: false,
        includeTestimonials: false,
        focusPoints: ['quality'],
      },
      [field]: value,
    });
  };

  const handleGenerateDescription = async () => {
    if (!product?.name) return;
    
    setIsGenerating(true);
    try {
      const description = await onGenerateDescription();
      handleInputChange('generatedDescription', description);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!product?.name || !onGenerateImage || !selectedPlatform) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await onGenerateImage(selectedPlatform, selectedStyle);
      const newImage = {
        url: imageUrl,
        alt: `Campaign image for ${product.name}`,
        platform: selectedPlatform,
        style: selectedStyle
      };
      
      handleInputChange('campaignImages', [
        ...(product.campaignImages || []),
        newImage
      ]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const toggleFocusPoint = (point: ProductDetails['focusPoints'][0]) => {
    if (!product) return;
    
    const newPoints = product.focusPoints.includes(point)
      ? product.focusPoints.filter(p => p !== point)
      : [...product.focusPoints, point];
    
    handleInputChange('focusPoints', newPoints);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl p-6"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-label="Toggle product details section"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tron-cyan/10 rounded-xl">
            <Package className="w-6 h-6 text-tron-cyan" aria-hidden="true" weight="duotone" />
          </div>
          <h3 className="text-lg font-semibold text-tron-text">
            Product Details
          </h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-tron-text-muted transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
          weight="duotone"
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6 pt-4"
        >
          {/* Product Name & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="product-name" className="block text-sm font-medium text-tron-text-muted">
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                value={product?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all"
                placeholder="e.g., Premium Wireless Headphones"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="product-url" className="block text-sm font-medium text-tron-text-muted">
                Product URL (optional)
              </label>
              <div className="relative">
                <input
                  id="product-url"
                  type="text"
                  value={product?.url || ''}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all"
                  placeholder="https://..."
                />
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tron-text-muted" weight="duotone" />
              </div>
            </div>
          </div>

          {/* Presentation Style */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-tron-text-muted">
              Presentation Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {presentationStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleInputChange('presentationStyle', style.id)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    product?.presentationStyle === style.id
                      ? 'bg-tron-cyan/20 border-tron-cyan text-tron-cyan'
                      : 'border-tron-grid hover:border-tron-cyan/50 text-tron-text-muted'
                  }`}
                  aria-label={`Set presentation style to ${style.label}`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Points */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-tron-text-muted">
              Focus Points (select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {focusPointOptions.map((point) => (
                <button
                  key={point.id}
                  onClick={() => toggleFocusPoint(point.id)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    product?.focusPoints?.includes(point.id)
                      ? 'bg-tron-cyan/20 border-tron-cyan text-tron-cyan'
                      : 'border-tron-grid hover:border-tron-cyan/50 text-tron-text-muted'
                  }`}
                  aria-label={`${product?.focusPoints?.includes(point.id) ? 'Remove' : 'Add'} ${point.label} focus point`}
                >
                  {point.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product?.highlightPrice || false}
                onChange={(e) => handleInputChange('highlightPrice', e.target.checked)}
                className="form-checkbox text-tron-cyan rounded border-tron-cyan/30 bg-transparent focus:ring-tron-cyan/20"
              />
              <span className="text-sm text-tron-text">Highlight Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product?.includeTestimonials || false}
                onChange={(e) => handleInputChange('includeTestimonials', e.target.checked)}
                className="form-checkbox text-tron-cyan rounded border-tron-cyan/30 bg-transparent focus:ring-tron-cyan/20"
              />
              <span className="text-sm text-tron-text">Include Testimonials</span>
            </label>
          </div>

          {/* Custom Description */}
          <div className="space-y-3">
            <label htmlFor="custom-description" className="block text-sm font-medium text-tron-text-muted">
              Custom Description (optional)
            </label>
            <textarea
              id="custom-description"
              value={product?.customDescription || ''}
              onChange={(e) => handleInputChange('customDescription', e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all resize-y"
              placeholder="Add your own product description..."
            />
          </div>

          {/* Generated Description */}
          {product?.name && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-tron-text-muted">
                  AI-Generated Description
                </label>
                <button
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-xl border-2 border-tron-cyan flex items-center gap-2 text-sm ${
                    isGenerating
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-tron-cyan/10'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <MagicWand className="w-4 h-4" weight="duotone" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <MagicWand className="w-4 h-4" weight="duotone" />
                      Generate Description
                    </>
                  )}
                </button>
              </div>
              
              {product.generatedDescription && (
                <div className="relative p-4 bg-tron-grid/20 border border-tron-cyan/30 rounded-xl">
                  <p className="text-tron-text whitespace-pre-wrap">
                    {product.generatedDescription}
                  </p>
                  <button
                    onClick={() => handleInputChange('generatedDescription', undefined)}
                    className="absolute top-2 right-2 p-1 text-tron-text-muted hover:text-tron-cyan"
                    title="Clear generated description"
                    aria-label="Clear generated description"
                  >
                    <X className="w-4 h-4" weight="duotone" />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Image Generation Section */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6 mt-6 border-t-2 border-tron-grid pt-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-tron-text">
              Campaign Images
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-tron-text-muted">
                Platform
              </label>
              <select
                id="platform-select"
                name="platform"
                aria-label="Select social media platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all"
              >
                <option value="">Select platform</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-tron-text-muted">
                Style
              </label>
              <select
                id="style-select"
                name="style"
                aria-label="Select image style"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-2 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all"
              >
                <option value="">Select style</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
                <option value="playful">Playful</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !selectedPlatform || !selectedStyle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${
                isGeneratingImage || !selectedPlatform || !selectedStyle
                  ? 'opacity-50 cursor-not-allowed border-tron-grid text-tron-text-muted'
                  : 'border-tron-cyan hover:bg-tron-cyan/10 text-tron-text'
              }`}
            >
              {isGeneratingImage ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ImageIcon className="w-4 h-4" weight="duotone" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" weight="duotone" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Generated Images Gallery */}
          {product?.campaignImages && product.campaignImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.campaignImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl bg-tron-dark/50">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-tron-text-muted">
                    <span className="capitalize">{image.platform}</span>
                    <span className="capitalize">{image.style}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}