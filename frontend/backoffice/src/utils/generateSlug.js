export default function generateSlug(parentSlug = "", name = "") {
  if (!name) return "";

  const slugifiedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // espaces → tirets
    .replace(/[^a-z0-9-]/g, ""); // supprimer caractères spéciaux

  return parentSlug ? `${parentSlug}/${slugifiedName}` : slugifiedName;
}
