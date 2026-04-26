import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const separator = basePath.includes("?") ? "&" : "?";

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      <Link
        href={currentPage > 1 ? `${basePath}${separator}page=${currentPage - 1}` : "#"}
        className={`p-2 rounded-lg text-sm transition-colors ${
          currentPage <= 1
            ? "text-surface-300 dark:text-surface-600 cursor-not-allowed pointer-events-none"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
        }`}
        aria-disabled={currentPage <= 1}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </Link>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-surface-400 text-sm">…</span>
        ) : (
          <Link
            key={page}
            href={`${basePath}${separator}page=${page}`}
            className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-primary-600 text-white shadow-sm"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={currentPage < totalPages ? `${basePath}${separator}page=${currentPage + 1}` : "#"}
        className={`p-2 rounded-lg text-sm transition-colors ${
          currentPage >= totalPages
            ? "text-surface-300 dark:text-surface-600 cursor-not-allowed pointer-events-none"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>
    </nav>
  );
}
