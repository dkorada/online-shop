import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container section">
      <EmptyState
        icon={<Compass size={28} aria-hidden />}
        title="Page not found"
        action={
          <Link to="/" className="btn btn--primary">
            Back to the shop
          </Link>
        }
      >
        The page you’re looking for doesn’t exist or has moved.
      </EmptyState>
    </div>
  );
}
