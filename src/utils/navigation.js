import { useNavigate, useParams } from 'react-router-dom';

/**
 * Robust navigation hook wrapper.
 */
export function useAppNavigate() {
  try {
    const navigate = useNavigate();
    if (typeof navigate === 'function') {
      return navigate;
    }
  } catch (err) {
    console.warn('Router useNavigate hook fallback active:', err);
  }

  // Fallback for hash routing if hook is called outside router context
  return (to) => {
    if (typeof to === 'string') {
      const cleanPath = to.startsWith('/') ? to : `/${to}`;
      window.location.hash = `#${cleanPath}`;
    }
  };
}

/**
 * Robust params hook wrapper.
 */
export function useAppParams() {
  try {
    const params = useParams();
    if (params && Object.keys(params).length > 0) {
      return params;
    }
  } catch (err) {
    console.warn('Router useParams hook fallback active:', err);
  }

  // Fallback: parse current hash URL
  const hash = window.location.hash || '';
  const parts = hash.replace(/^#\/?/, '').split('/');
  const id = parts[parts.length - 1] || '';
  return { id };
}
