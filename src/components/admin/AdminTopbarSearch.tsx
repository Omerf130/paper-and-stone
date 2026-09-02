"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { searchAdminGlobalAction } from "@/app/admin/global-search-actions";
import type { AdminGlobalSearchResult } from "@/lib/admin/admin-global-search";
import styles from "./AdminTopbarSearch.module.scss";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export default function AdminTopbarSearch() {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<AdminGlobalSearchResult>({
    projects: [],
    products: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      const response = await searchAdminGlobalAction(debouncedQuery);
      if (cancelled) {
        return;
      }

      setResult(response.result);
      setError(response.error ?? null);
      setOpen(true);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const shouldSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const hasResults =
    result.projects.length > 0 || result.products.length > 0;
  const showPanel = open && shouldSearch;

  return (
    <div className={styles.root} ref={rootRef}>
      <label className={styles.label} htmlFor={`${listboxId}-input`}>
        חיפוש
      </label>
      <div className={styles.inputWrap}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.25" />
            <path
              d="M10.5 10.5L13.5 13.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          id={`${listboxId}-input`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (shouldSearch) {
              setOpen(true);
            }
          }}
          placeholder="חיפוש מוצרים, פרויקטים..."
          className={styles.input}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listboxId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="תוצאות חיפוש"
          className={styles.panel}
        >
          {isPending ? (
            <p className={styles.state}>טוען...</p>
          ) : error ? (
            <p className={styles.state}>{error}</p>
          ) : !hasResults ? (
            <p className={styles.state}>לא נמצאו תוצאות</p>
          ) : (
            <>
              {result.projects.length > 0 ? (
                <section className={styles.group}>
                  <h3 className={styles.groupTitle}>פרויקטים</h3>
                  <ul className={styles.list}>
                    {result.projects.map((project) => (
                      <li key={project.id}>
                        <button
                          type="button"
                          className={styles.option}
                          role="option"
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}`)
                          }
                        >
                          <span className={styles.optionPrimary}>
                            {project.name}
                          </span>
                          {project.location ? (
                            <span className={styles.optionSecondary}>
                              {project.location}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {result.products.length > 0 ? (
                <section className={styles.group}>
                  <h3 className={styles.groupTitle}>מוצרים</h3>
                  <ul className={styles.list}>
                    {result.products.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          className={styles.option}
                          role="option"
                          onClick={() =>
                            navigate(`/admin/products/${product.id}`)
                          }
                        >
                          <span className={styles.optionPrimary}>
                            {product.nameHe}
                          </span>
                          <span className={styles.optionSecondary} dir="ltr">
                            {product.sku}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
