import axios from "axios";

export const deletePage = async (id) => {
  try {
    await axios.delete(`/api/pages/${id}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la page :", error);
    throw error;
  }
};
