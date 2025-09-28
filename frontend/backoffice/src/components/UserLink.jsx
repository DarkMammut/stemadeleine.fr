import React from "react";
import Button from "./ui/Button";
import { useRouter } from "next/navigation";

export default function UserLink({ user }) {
  const router = useRouter();
  if (!user) return <span className="text-gray-400">Utilisateur inconnu</span>;
  const label =
    (user.firstname || "") + (user.lastname ? " " + user.lastname : "");
  const displayLabel = label.trim() || "Utilisateur inconnu";
  return (
    <Button
      onClick={() => user.id && router.push(`/users/${user.id}`)}
      variant="ghost"
      disabled={!user.id}
      className="text-white"
    >
      {displayLabel}
    </Button>
  );
}
