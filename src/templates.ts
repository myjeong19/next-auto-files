/**
 * Default file templates for Next.js components
 */
export const defaultTemplates: Record<string, string> = {
  'page.tsx': `

export default function Page() {
  return (
    <></>
  );
}
`,
  'layout.tsx': `


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
  <>
    {children}
  </>);
}
`,
  'loading.tsx': `

export default function Loading() {
  return <></>;
}
`,
  'error.tsx': `

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <></>
  );
}
`,
};

/**
 * Processes a template string by replacing variables
 * @param template The template string
 * @param variables Variables to replace in the template
 * @returns Processed template
 */
export function processTemplate(template: string, variables: Record<string, string>): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Converts a string to PascalCase
 * @param str The input string
 * @returns The PascalCase string
 */
export function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
