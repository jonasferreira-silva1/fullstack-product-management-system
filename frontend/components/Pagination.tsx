'use client';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginação simples e reutilizável.
 */
export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={btnStyle(page <= 1)}
      >
        ← Anterior
      </button>

      <span style={{ fontSize: '0.875rem', color: '#555' }}>
        Página {page} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={btnStyle(page >= totalPages)}
      >
        Próxima →
      </button>
    </div>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '0.4rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#aaa' : '#1351b4',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
  };
}
