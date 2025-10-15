import PublishButton from "@/components/ui/PublishButton";

export default function Title({ label = "Title", onPublish }) {
  return (
    <div className="w-full flex justify-between items-center mb-10">
      <h2 className="text-2xl font-semibold mb-4">{label}</h2>
      {onPublish && (
        <PublishButton
          onPublish={onPublish}
          publishLabel="Publier"
          publishedLabel="À jour"
          size="md"
        />
      )}
    </div>
  );
}
