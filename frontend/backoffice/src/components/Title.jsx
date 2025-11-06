import PublishButton from "@/components/ui/PublishButton";
import BackButton from "@/components/BackButton";

export default function Title({
  label = "Title",
  onPublish,
  badge = null,
  showBackButton = false,
  backTo = null,
}) {
  return (
    <div className="w-full mb-10">
      {showBackButton && (
        <div className="mb-4">
          <BackButton to={backTo} />
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">{label}</h2>
          {badge !== null && badge > 0 && (
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {badge}
            </span>
          )}
        </div>
        {onPublish && (
          <PublishButton
            onPublish={onPublish}
            publishLabel="Publier"
            publishedLabel="À jour"
            size="md"
          />
        )}
      </div>
    </div>
  );
}
