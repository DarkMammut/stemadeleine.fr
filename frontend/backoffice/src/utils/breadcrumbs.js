// Utility functions to build breadcrumbs for different contexts

export const buildPageBreadcrumbs = (page, section = null, module = null) => {
  const breadcrumbs = [{ name: "Pages", href: "/pages" }];

  if (page) {
    breadcrumbs.push({
      name: page.name || "Page sans nom",
      href: `/pages/${page.id}`,
      current: !section && !module,
    });

    if (section) {
      breadcrumbs.push({
        name: "Sections",
        href: `/pages/${page.id}/sections`,
        current: false,
      });

      breadcrumbs.push({
        name: section.name || "Section sans nom",
        href: `/pages/${page.id}/sections/${section.id}`,
        current: !module,
      });

      if (module) {
        breadcrumbs.push({
          name: module.name || "Module sans nom",
          href: `/pages/${page.id}/sections/${section.id}/modules/${module.id}`,
          current: true,
        });
      }
    }
  }

  return breadcrumbs;
};

export const buildContactBreadcrumbs = (contact) => {
  const breadcrumbs = [{ name: "Contacts", href: "/contacts" }];

  if (contact) {
    const contactName =
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Contact";

    breadcrumbs.push({
      name: contactName,
      href: `/contacts/${contact.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};

export const buildUserBreadcrumbs = (user) => {
  const breadcrumbs = [{ name: "Utilisateurs", href: "/users" }];

  if (user) {
    const userName =
      [user.firstname, user.lastname].filter(Boolean).join(" ") ||
      "Utilisateur";

    breadcrumbs.push({
      name: userName,
      href: `/users/${user.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};

export const buildPaymentBreadcrumbs = (payment) => {
  const breadcrumbs = [{ name: "Paiements", href: "/payments" }];

  if (payment) {
    const paymentName = payment.label || `Paiement #${payment.id}`;

    breadcrumbs.push({
      name: paymentName,
      href: `/payments/${payment.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};

export const buildNewsBreadcrumbs = (news) => {
  const breadcrumbs = [{ name: "Actualités", href: "/news" }];

  if (news) {
    breadcrumbs.push({
      name: news.title || "Actualité",
      href: `/news/${news.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};

export const buildNewsletterBreadcrumbs = (newsletter) => {
  const breadcrumbs = [{ name: "Newsletters", href: "/newsletters" }];

  if (newsletter) {
    breadcrumbs.push({
      name: newsletter.title || "Newsletter",
      href: `/newsletters/${newsletter.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};
