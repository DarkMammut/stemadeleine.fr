"use client";

import Button from "@/components/Button";

export default function Utilities({ actions }) {
  return (
    <div className="flex gap-2 w-full">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Button
            key={idx}
            onClick={action.callback}
            variant="primary"
            size="sm"
          >
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
