import React from 'react';
import PropTypes from 'prop-types';

const Button = React.forwardRef((props, ref) => {
  const {
    as,
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    ...restProps
  } = props;

  // Classes de base
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  // Variantes de style
  const variants = {
    // Utiliser les couleurs définies dans tailwind.config.js
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
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Classes finales
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  // Sanitize "as" prop: n'envoyer que des valeurs valides (string ou component)
  let Component = (typeof as === 'string' || typeof as === 'function') ? as : 'button';

  // Sanitize restProps: retirer explicitement les props null/undefined
  const sanitizedRest = Object.fromEntries(
    Object.entries(restProps).filter(([, v]) => v != null),
  );

  const componentProps = {
    className: buttonClasses,
    disabled: disabled || loading,
    onClick,
    ...sanitizedRest,
  };

  // N'ajouter "type" que si on rend un <button>
  if (typeof Component === 'string' && Component === 'button') {
    componentProps.type = type;
  }

  // Détecter un usage courant: Next.js Link sans href
  // Si le composant est Link et qu'il n'y a pas de href, on fait un fallback vers <button>
  // pour éviter l'avertissement PropTypes (href expects string/object but got undefined)
  const compName = typeof Component === 'function' ? (Component.displayName || Component.name) : Component;

  // Si l'appelant a utilisé `to` (pattern React Router) et que `href` est absent,
  // on copie `to` vers `href` (au lieu de supprimer `to`) pour supporter à la fois
  // Next.js `Link` (qui attend `href`) et react-router `Link` (qui attend `to`).
  if (componentProps.to != null && componentProps.href == null) {
    componentProps.href = componentProps.to;
  }

  // Si le composant est Link et qu'il n'y a vraiment pas de href/to, on fait un fallback vers <button>
  if ((compName === 'Link' || compName === 'NextLink') && componentProps.href == null && componentProps.to == null) {
    console.warn('Button: rendu en <button> car Link a été utilisé sans `href`/`to` (éviter d\'appliquer as=Link sans href)');
    Component = 'button';
    // retirer href/to si présents (sécurité)
    delete componentProps.href;
    delete componentProps.to;
  }

  // Sécurité additionnelle : n'envoyer `href` que si c'est un string ou un object (Next.js Link attend string|object)
  if (componentProps.href != null && !(typeof componentProps.href === 'string' || typeof componentProps.href === 'object')) {
    console.warn('Button: suppression de la prop `href` car sa valeur n\'est pas string|object', componentProps.href);
    delete componentProps.href;
  }

  // Nettoyer les props finales pour éviter de passer des valeurs `null`/`undefined`
  const cleanProps = Object.fromEntries(
    Object.entries(componentProps).filter(([, v]) => v != null),
  );

  return (
    <Component ref={ref} {...cleanProps}>
      {loading && (
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
});

Button.displayName = 'Button';

Button.propTypes = {
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

export default Button;
