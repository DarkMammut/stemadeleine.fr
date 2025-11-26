import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];
type PolymorphicProps<C extends React.ElementType, Props = Record<string, unknown>> = Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
  as?: C;
};

interface OwnProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

type ButtonProps<C extends React.ElementType> = PolymorphicProps<C, OwnProps>;

const ButtonInner = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C>,
  ref: PolymorphicRef<C>,
) => {
  const {
    as: asProp,
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    ...restProps
  } = props as ButtonProps<C> & { as?: React.ElementType };

  // Classes de base
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  // Variantes de style
  const variants: Record<Variant, string> = {
    primary:
      'bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500',
    secondary:
      'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary disabled:bg-gray-300 disabled:text-gray-500',
    outline:
      'border-2 border-primary text-primary bg-transparent hover:bg-primary-50 focus:ring-primary disabled:border-gray-300 disabled:text-gray-300',
    ghost:
      'text-primary bg-transparent hover:bg-primary-50 focus:ring-primary disabled:text-gray-300',
    danger:
      'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500',
  };

  // Tailles
  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Classes finales
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  // Sanitize "as" prop: accept strings or components; fallback to 'button' for invalid values
  let Component: React.ElementType = (asProp as React.ElementType) ?? 'button';
  if (Component == null) Component = 'button';
  if (typeof Component !== 'string' && typeof Component !== 'function') {
    Component = 'button';
  }

  // Sanitize restProps: retirer explicitement les props null/undefined
  const sanitizedRest = Object.fromEntries(
    Object.entries(restProps as Record<string, unknown>).filter(([, v]) => v != null),
  ) as Record<string, unknown>;

  const componentProps: Record<string, unknown> = {
    className: buttonClasses,
    disabled: disabled || loading,
    ...sanitizedRest,
  };

  // N'ajouter "type" que si on rend un <button>
  if (Component === 'button') {
    (componentProps as Record<string, unknown>).type = type;
  }

  // Utiliser un alias typé pour éviter `any` lors d'accès dynamiques
  const compProps = componentProps as Record<string, unknown>;

  // Détecter un usage courant: Next.js Link sans href
  const compName = typeof Component === 'function' ? (Component.displayName || Component.name) : Component;

  // Si l'appelant a utilisé `to` (pattern React Router) et que `href` est absent,
  // on copie `to` vers `href` (au lieu de supprimer `to`) pour supporter à la fois
  // Next.js `Link` (qui attend `href`) et react-router `Link` (qui attend `to`).
  if (compProps['to'] != null && compProps['href'] == null) {
    compProps['href'] = compProps['to'];
  }

  // Si le composant est Link et qu'il n'y a vraiment pas de href/to, on fait un fallback vers <button>
  if ((compName === 'Link' || compName === 'NextLink') && compProps['href'] == null && compProps['to'] == null) {
    console.warn('Button: rendu en <button> car Link a été utilisé sans `href`/`to` (éviter d\'appliquer as=Link sans href)');
    Component = 'button';
    // retirer href/to si présents (sécurité)
    delete compProps['href'];
    delete compProps['to'];
  }

  // Sécurité additionnelle : n'envoyer `href` que si c'est un string ou un object (Next.js Link attend string|object)
  if (compProps['href'] != null && !(['string', 'object'] as Array<string>).includes(typeof compProps['href'])) {
    console.warn('Button: suppression de la prop `href` car sa valeur n\'est pas string|object', compProps['href']);
    delete compProps['href'];
  }

  // Nettoyer les props finales pour éviter de passer des valeurs `null`/`undefined`
  const cleanProps = Object.fromEntries(
    Object.entries(componentProps).filter(([, v]) => v != null),
  ) as Record<string, unknown>;

  // Rendu
  return (
    <Component ref={ref} {...(cleanProps as Record<string, unknown>)}>
      {compProps['loading'] && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </Component>
  );
};

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const Button = React.forwardRef(ButtonInner as unknown as React.ForwardRefRenderFunction<unknown, unknown>) as unknown as ButtonComponent;

Object.defineProperty(Button, 'displayName', { value: 'Button', writable: false });

export default Button;

