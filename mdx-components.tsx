import type { MDXComponents } from 'mdx/types';
import { HelpTip } from '@/components/help/help-tip';
import { HelpImagePlaceholder } from '@/components/help/help-image-placeholder';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    HelpTip,
    HelpImagePlaceholder,
    ...components,
  };
}
