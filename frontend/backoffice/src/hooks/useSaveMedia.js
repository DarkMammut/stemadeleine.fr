import { useAxiosClient } from "@/utils/axiosClient";

export default function useSaveMedia(attachToEntity) {
  const client = useAxiosClient();

  const save = async (mediaData) => {
    try {
      const { data } = await client.post("/api/media", mediaData);

      if (attachToEntity) {
        await attachToEntity(data.id);
      }

      return data;
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du media :", err);
      throw err;
    }
  };

  return save;
}
