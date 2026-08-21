import Image from 'next/image';

const brandAssets = {
  wordmark: {
    src: '/brand/kippora-wordmark.png',
    width: 2172,
    height: 724,
    alt: 'Kippora',
  },
  primary: {
    src: '/brand/kippora-logo-primary-traced.svg',
    width: 2172,
    height: 724,
    alt: 'Kippora Coffee & Tea',
  },
  horizontalFull: {
    src: '/brand/kippora-logo-horizontal-full.png',
    width: 2172,
    height: 724,
    alt: 'Kippora Coffee & Tea',
  },
  stackedFull: {
    src: '/brand/kippora-logo-stacked-full.png',
    width: 1254,
    height: 1254,
    alt: 'Kippora Coffee & Tea - Mỗi ngày một vị vui',
  },
} as const;

export type BrandLogoVariant =
  keyof typeof brandAssets;

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
};

export default function BrandLogo({
  variant = 'primary',
  className,
  priority = false,
  sizes,
  alt,
}: BrandLogoProps) {
  const asset = brandAssets[variant];

  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={alt ?? asset.alt}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
