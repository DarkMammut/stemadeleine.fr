import React from "react";
import Button from "./ui/Button";
import { useRouter } from "next/navigation";

export default function UserLink({ user }) {
  const router = useRouter();
  if (!user) return <span className="text-gray-400">Emetteur inconnu</span>;
  const label =
    (user.firstname || "") + (user.lastname ? " " + user.lastname : "");
  const displayLabel = label.trim() || "Emetteur inconnu";
  return (
    <Button
      onClick={() => user.id && router.push(`/users/${user.id}`)}
      variant="link"
      disabled={!user.id}
    >
      {displayLabel}
    </Button>
  );
}
