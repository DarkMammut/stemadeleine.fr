import { useEffect, useState } from "react";
import { useAxiosClient } from "../utils/axiosClient";

const useGetOrganization = () => {
  const [settings, setSettings] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchOrganizationSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(
        "/api/public/organization/settings",
      );
      setSettings(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error loading organization settings",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/api/public/organization/info");
      setInfo(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error loading organization information",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrganizationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsResponse, infoResponse] = await Promise.all([
        axiosClient.get("/api/public/organization/settings"),
        axiosClient.get("/api/public/organization/info"),
      ]);

      setSettings(settingsResponse.data);
      setInfo(infoResponse.data);

      return {
        settings: settingsResponse.data,
        info: infoResponse.data,
      };
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error loading organization data",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch all organization data on hook initialization
  useEffect(() => {
    fetchAllOrganizationData();
  }, []);

  return {
    settings,
    info,
    loading,
    error,
    fetchOrganizationSettings,
    fetchOrganizationInfo,
    fetchAllOrganizationData,
  };
};

export default useGetOrganization;
