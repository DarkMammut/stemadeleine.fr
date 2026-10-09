"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Title from "@/components/ui/Title";
import SceneLayout from "@/components/ui/SceneLayout";
import CardList from "@/components/ui/CardList";
import Card from "@/components/ui/Card";
import {
  BanknotesIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  FolderIcon,
  InboxIcon,
  NewspaperIcon,
  Squares2X2Icon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Money from "@/components/ui/Money";
import { useTranslation } from "@/i18n/I18nContext";

const TypeIcon = ({ kind }) => {
  const cls = "w-6 h-6 text-gray-400";
  if (kind === "user") return <UserIcon className={cls} />;
  if (kind === "payment") return <BanknotesIcon className={cls} />;
  if (kind === "article") return <DocumentTextIcon className={cls} />;
  if (kind === "news") return <DocumentTextIcon className={cls} />;
  if (kind === "section") return <FolderIcon className={cls} />;
  if (kind === "page") return <DocumentDuplicateIcon className={cls} />;
  if (kind === "module") return <Squares2X2Icon className={cls} />;
  if (kind === "contact") return <InboxIcon className={cls} />;
  if (kind === "newsletter") return <NewspaperIcon className={cls} />;
  return <UserIcon className={cls} />;
};

// Map item.type (from API) to icon kind. Accepts french/english/variations.
const mapTypeToKind = (type) => {
  if (!type) return null;
  const t = String(type).toLowerCase();
  if (t.includes("utilis") || t.includes("user") || t.includes("person"))
    return "user";
  if (
    t.includes("pay") ||
    t.includes("payment") ||
    t.includes("paiement") ||
    t.includes("payment")
  )
    return "payment";
  if (t.includes("article") || t.includes("news") || t.includes("post"))
    return "article";
  if (t.includes("actualité") || t.includes("actualit") || t === "news")
    return "news";
  if (t.includes("section") || t.includes("sect")) return "section";
  if (t.includes("page") || t.includes("slug")) return "page";
  if (t.includes("module") || t.includes("module")) return "module";
  if (t.includes("contact") || t.includes("email")) return "contact";
  if (t.includes("newsletter") || t.includes("newsletter")) return "newsletter";
  return null;
};

const getKind = (itemType, fallback) => mapTypeToKind(itemType) || fallback;

export default function Search() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const q = params?.get("q") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`)
      .then((r) => r.json())
      .then((data) => setResults(data))
      .catch(() => setResults({ error: "Fetch failed" }))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <SceneLayout>
      <Title label={t("search.title")} />
      <h2 className="text-lg font-semibold mb-4">
        {t("search.resultsFor")} «{q}»
      </h2>
      {loading ? (
        <div className="space-y-6">
          {[
            { label: t("search.groups.users"), count: 3 },
            {
              label: t("search.groups.payments"),
              count: 2,
            },
            { label: t("search.groups.articles"), count: 2 },
            { label: t("search.groups.sections"), count: 2 },
            { label: t("search.groups.pages"), count: 2 },
            { label: t("search.groups.modules"), count: 2 },
            { label: t("search.groups.contacts"), count: 2 },
            { label: t("search.groups.newsletters"), count: 2 },
          ].map((g) => (
            <section key={g.label}>
              <h3 className="font-medium mb-2">{g.label}</h3>
              <CardList emptyMessage="">
                {Array.from({ length: g.count }).map((_, i) => (
                  <Card key={i} loading />
                ))}
              </CardList>
            </section>
          ))}
        </div>
      ) : (
        !loading &&
        results && (
          <div className="space-y-6">
            {results.users && results.users.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.users")}</h3>
                <CardList emptyMessage={t("search.empty.users")}>
                  {results.users.map((u) => (
                    <Card
                      key={u.id}
                      onClick={() => router.push(u.url || `/users/${u.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(u.kind ?? u.type, "user")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {u.title}
                          </div>
                          {u.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {u.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.payments && results.payments.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.payments")}</h3>
                <CardList emptyMessage={t("search.empty.payments")}>
                  {results.payments.map((p) => (
                    <Card
                      key={p.id}
                      onClick={() => router.push(p.url || `/payments/${p.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(p.kind ?? p.type, "payment")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {p.title}
                          </div>
                          {p.subtitle ? (
                            <div className="text-xs text-gray-500">
                              <Money value={p.subtitle} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.articles && results.articles.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.articles")}</h3>
                <CardList emptyMessage={t("search.empty.articles")}>
                  {results.articles.map((a) => (
                    <Card
                      key={a.id}
                      onClick={() => router.push(a.url || `/news/${a.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(a.kind ?? a.type, "article")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {a.title}
                          </div>
                          {a.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {a.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.news && results.news.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.news")}</h3>
                <CardList emptyMessage={t("search.empty.news")}>
                  {results.news.map((n) => (
                    <Card
                      key={n.id}
                      onClick={() => router.push(n.url || `/news/${n.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(n.kind ?? n.type, "news")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {n.title}
                          </div>
                          {n.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {n.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.sections && results.sections.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.sections")}</h3>
                <CardList emptyMessage={t("search.empty.sections")}>
                  {results.sections.map((s) => (
                    <Card
                      key={s.id}
                      onClick={() => {
                        if (s.url) router.push(s.url);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(s.kind ?? s.type, "section")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {s.title}
                          </div>
                          {s.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {s.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.pages && results.pages.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.pages")}</h3>
                <CardList emptyMessage={t("search.empty.pages")}>
                  {results.pages.map((p) => (
                    <Card
                      key={p.id}
                      onClick={() => router.push(p.url || `/pages/${p.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(p.kind ?? p.type, "page")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {p.title}
                          </div>
                          {p.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {p.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.modules && results.modules.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.modules")}</h3>
                <CardList emptyMessage={t("search.empty.modules")}>
                  {results.modules.map((m) => (
                    <Card
                      key={m.id}
                      onClick={() => router.push(m.url || `/modules/${m.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(m.kind ?? m.type, "module")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {m.title}
                          </div>
                          {m.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {m.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.contacts && results.contacts.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">{t("search.groups.contacts")}</h3>
                <CardList emptyMessage={t("search.empty.contacts")}>
                  {results.contacts.map((c) => (
                    <Card
                      key={c.id}
                      onClick={() => router.push(c.url || `/contacts/${c.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon kind={getKind(c.kind ?? c.type, "contact")} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {c.title}
                          </div>
                          {c.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {c.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {results.newsletters && results.newsletters.length > 0 && (
              <section>
                <h3 className="font-medium mb-2">
                  {t("search.groups.newsletters")}
                </h3>
                <CardList emptyMessage={t("search.empty.newsletters")}>
                  {results.newsletters.map((n) => (
                    <Card
                      key={n.id}
                      onClick={() =>
                        router.push(n.url || `/newsletters/${n.id}`)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon
                          kind={getKind(n.kind ?? n.type, "newsletter")}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {n.title}
                          </div>
                          {n.subtitle ? (
                            <div className="text-xs text-gray-500">
                              {n.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardList>
              </section>
            )}

            {/* nothing found */}
            {!results.users?.length &&
              !results.payments?.length &&
              !results.articles?.length &&
              !results.news?.length &&
              !results.sections?.length &&
              !results.pages?.length &&
              !results.modules?.length &&
              !results.contacts?.length &&
              !results.newsletters?.length && <p>{t("search.empty.none")}</p>}
          </div>
        )
      )}
    </SceneLayout>
  );
}
