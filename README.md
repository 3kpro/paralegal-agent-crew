# 3K Pro Services - Landing Page

Modern, sleek landing page for 3K Pro Services AI-powered content marketing platform.

## Features

- **Modern Design**: Clean, professional UI with smooth animations
- **Responsive**: Optimized for all device sizes
- **Fast Performance**: Built with Next.js and Tailwind CSS
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Contact Form**: Integrated with n8n webhook for lead capture

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Heroicons**: Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**:
   - Push code to GitHub
   - Connect GitHub repo to Vercel
   - Deploy automatically

2. **Custom Domain**:
   - Add `3kpro.services` in Vercel dashboard
   - Update DNS records as instructed

### Environment Variables

Set these in Vercel dashboard or `.env.local`:

```
NEXT_PUBLIC_CONTACT_WEBHOOK_URL=your_n8n_webhook_url
```

## Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    // Your brand colors
  }
}
```

### Content

- **Hero Section**: Edit `app/page.tsx` lines 50-80
- **Services**: Edit the services array in `app/page.tsx`
- **Pricing**: Update pricing tiers in `app/page.tsx`

### Contact Form

Update the webhook URL in `components/ContactForm.tsx` to connect with your n8n workflow.

## Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for Google rankings
- **Image Optimization**: Automatic with Next.js
- **Code Splitting**: Automatic route-based splitting

## SEO Features

- **Meta Tags**: Comprehensive OpenGraph and Twitter cards
- **Sitemap**: Auto-generated
- **Schema Markup**: Structured data for search engines
- **Analytics Ready**: Easy Google Analytics integration

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Private - 3K Pro Services

## Support

For questions or issues, contact: support@3kpro.services
