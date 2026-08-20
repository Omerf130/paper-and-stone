"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildClientProjectsHref } from "@/lib/client-projects/client-project-params";
import Button from "@/components/ui/Button/Button";
import styles from "./ClientProjectsSearch.module.scss";

type ClientProjectsSearchProps = {
  initialQuery: string;
};

export default function ClientProjectsSearch({
  initialQuery,
}: ClientProjectsSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildClientProjectsHref({ query: query.trim() || null }));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="client-projects-search">
        חיפוש לפי שם פרויקט
      </label>
      <div className={styles.controls}>
        <input
          id="client-projects-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={styles.input}
          placeholder="שם פרויקט"
        />
        <Button type="submit" size="sm">
          חיפוש
        </Button>
      </div>
    </form>
  );
}
